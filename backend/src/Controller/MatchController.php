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
     *  Crear un nuevo partido
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
     * 📋 Obtener todos los partidos (filtrando los expirados)
     */
    #[Route('/matches', name: 'api_list_matches', methods: ['GET'])]
    public function list(FootballMatchRepository $repository, MatchCleanupService $cleanupService): JsonResponse
    {
        $cleanupService->deleteExpiredMatches(); // elimina partidos pasados

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
            return $this->json(['error' => 'Partido no encontrado'], Response::HTTP_NOT_FOUND);
        }

        // Validar código si es privado
        if ($match->isPrivate()) {
            $data = json_decode($request->getContent(), true);
            if (!isset($data['joinCode']) || $data['joinCode'] !== $match->getJoinCode()) {
                return $this->json(['error' => 'Código inválido'], Response::HTTP_FORBIDDEN);
            }
        }

        // Verifica si ya está unido
        foreach ($match->getMatchPlayers() as $mp) {
            if ($mp->getPlayer() === $user) {
                return $this->json(['error' => 'Ya estás inscrito'], Response::HTTP_CONFLICT);
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

        shuffle($players); // mezcla para aleatoriedad

        // Equipos y suma de niveles
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
     *  Eliminar partido
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
}
