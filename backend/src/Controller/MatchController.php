<?php

namespace App\Controller;

use App\Entity\FootballMatch;
use App\Entity\MatchPlayer;
use App\Repository\FootballMatchRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Service\MatchCleanupService;

#[Route('/api', name: 'api_')]
class MatchController extends AbstractController
{
    /**
     * 🆕 Crear un nuevo partido
     */
    #[Route('/matches', name: 'api_create_match', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['type'], $data['location'], $data['date'], $data['isPrivate'])) {
            return $this->json(['error' => 'Faltan campos obligatorios'], 400);
        }

        $match = new FootballMatch();
        $match->setType($data['type']);
        $match->setLocation($data['location']);
        $match->setDate(new \DateTimeImmutable($data['date']));
        $match->setIsPrivate($data['isPrivate']);
        $match->setJoinCode($data['isPrivate'] ? ($data['code'] ?? bin2hex(random_bytes(4))) : null);
        $match->setCreatedBy($this->getUser());

        $em->persist($match);
        $em->flush();

        return $this->json([
            'message' => 'Partido creado correctamente',
            'id' => $match->getId(),
            'joinCode' => $match->getJoinCode()
        ], 201);
    }

    /**
     *  Listar todos los partidos disponibles (excepto los expirados)
     */
    #[Route('/matches', name: 'api_list_matches', methods: ['GET'])]
    public function list(FootballMatchRepository $repository, MatchCleanupService $cleanupService): JsonResponse
    {
        $cleanupService->deleteExpiredMatches(); // Limpieza automática de partidos expirados

        $user = $this->getUser();
        $matches = $repository->findAll();

        $result = array_map(function (FootballMatch $match) use ($user) {
            return [
                'id' => $match->getId(),
                'type' => $match->getType(),
                'location' => $match->getLocation(),
                'date' => $match->getDate()->format('Y-m-d H:i'),
                'isPrivate' => $match->isPrivate(),
                'createdBy' => $match->getCreatedBy()->getEmail(),
                'canJoin' => !$match->isPrivate() || ($user && $match->getCreatedBy() === $user),
                'players' => $match->getMatchPlayers()->map(function ($mp) {
                    return [
                        'id' => $mp->getPlayer()->getId(),
                        'name' => $mp->getPlayer()->getName()
                    ];
                })->toArray()
            ];
        }, $matches);

        return $this->json($result);
    }

    /**
     *  Obtener detalles de un partido
     * Incluye si el usuario está unido y si es el creador
     */
    #[Route('/matches/{id}', name: 'api_get_match', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getMatch(
        int $id,
        FootballMatchRepository $matchRepo
    ): JsonResponse {
        $match = $matchRepo->find($id);

        if (!$match) {
            return $this->json(['error' => 'Partido no encontrado'], 404);
        }

        $user = $this->getUser();
        $isJoined = false;

        // Verifica si el usuario está en la lista de jugadores
        foreach ($match->getMatchPlayers() as $mp) {
            if ($mp->getPlayer() === $user) {
                $isJoined = true;
                break;
            }
        }

        return $this->json([
            'id' => $match->getId(),
            'type' => $match->getType(),
            'location' => $match->getLocation(),
            'date' => $match->getDate()->format('Y-m-d H:i'),
            'isPrivate' => $match->isPrivate(),
            'creatorId' => $match->getCreatedBy()->getId(),
            'joined' => $isJoined,
            'currentUserId' => $user?->getId(),
        ]);
    }

    /**
     *  Unirse a un partido
     */
    #[Route('/matches/{id}/players', name: 'api_join_match', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function join(
        int $id,
        Request $request,
        FootballMatchRepository $matchRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        $match = $matchRepository->find($id);

        if (!$match) {
            return $this->json(['error' => 'Partido no encontrado'], 404);
        }

        // Si el partido es privado, comprobamos el código
        if ($match->isPrivate()) {
            $data = json_decode($request->getContent(), true);
            if (!isset($data['joinCode']) || $data['joinCode'] !== $match->getJoinCode()) {
                return $this->json(['error' => 'Código inválido'], 403);
            }
        }

        // Si ya está unido, evitamos duplicar
        foreach ($match->getMatchPlayers() as $mp) {
            if ($mp->getPlayer() === $user) {
                return $this->json(['error' => 'Ya estás inscrito'], 409);
            }
        }

        $matchPlayer = new MatchPlayer();
        $matchPlayer->setPlayer($user);
        $matchPlayer->setMatch($match);
        $matchPlayer->setJoinedAt(new \DateTimeImmutable());

        $em->persist($matchPlayer);
        $em->flush();

        return $this->json(['message' => 'Te has unido al partido']);
    }

    /**
     *  Generar equipos equilibrados
     */
    #[Route('/matches/{id}/generate-teams', name: 'generate_teams', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function generateTeams(int $id, FootballMatchRepository $matchRepo): JsonResponse
    {
        $match = $matchRepo->find($id);

        if (!$match) {
            return $this->json(['error' => 'Partido no encontrado'], 404);
        }

        $players = [];

        foreach ($match->getMatchPlayers() as $mp) {
            $user = $mp->getPlayer();
            $players[] = [
                'name' => $user->getName(),
                'position' => $user->getPosition(),
                'level' => $user->getLevel(),
            ];
        }

        shuffle($players); // mezcla para mayor aleatoriedad

        $teamA = [];
        $teamB = [];
        $levelSumA = 0;
        $levelSumB = 0;

        foreach ($players as $p) {
            if ($levelSumA <= $levelSumB) {
                $teamA[] = $p;
                $levelSumA += $p['level'];
            } else {
                $teamB[] = $p;
                $levelSumB += $p['level'];
            }
        }

        return $this->json([
            'teamA' => $teamA,
            'teamB' => $teamB
        ]);
    }

    /**
     *  Eliminar un partido (solo el creador puede)
     */
    #[Route('/matches/{id}', name: 'api_delete_match', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(int $id, FootballMatchRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $match = $repo->find($id);

        if (!$match) {
            return $this->json(['error' => 'Partido no encontrado'], 404);
        }

        if ($match->getCreatedBy() !== $this->getUser()) {
            return $this->json(['error' => 'No autorizado'], 403);
        }

        $em->remove($match);
        $em->flush();

        return $this->json(['message' => 'Partido eliminado correctamente']);
    }

    #[Route('/matches/{id}/add-dummy-players', name: 'api_add_dummy_players', methods: ['POST'])]
#[IsGranted('ROLE_USER')]
public function addDummyPlayers(
    int $id,
    FootballMatchRepository $matchRepo,
    EntityManagerInterface $em
): JsonResponse {
    $match = $matchRepo->find($id);

    if (!$match) {
        return $this->json(['error' => 'Partido no encontrado'], 404);
    }

    // Lista de nombres ficticios
    $dummyNames = ['Carlos', 'Lucía', 'Pedro', 'María', 'Juan', 'Ana', 'Sergio', 'Elena', 'Javier', 'Laura'];
    $positions = ['Delantero', 'Defensa', 'Portero', 'Centrocampista'];

    foreach ($dummyNames as $index => $name) {
        $user = new \App\Entity\User();
        $user->setName($name);
        $user->setEmail("dummy{$index}@mail.com");
        $user->setPassword('dummy'); // No se usará para login
        $user->setPosition($positions[array_rand($positions)]);
        $user->setLevel(rand(1, 10));
        $user->setRoles(['ROLE_USER']);

        $em->persist($user);

        $matchPlayer = new MatchPlayer();
        $matchPlayer->setPlayer($user);
        $matchPlayer->setMatch($match);
        $matchPlayer->setJoinedAt(new \DateTimeImmutable());

        $em->persist($matchPlayer);
    }

    $em->flush();

    return $this->json(['message' => 'Jugadores ficticios añadidos al partido']);
}
}
