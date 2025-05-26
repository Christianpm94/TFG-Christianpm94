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

#[Route('/matches')]
class MatchController extends AbstractController
{
    #[Route('', name: 'create_match', methods: ['POST'])]
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
        $match->setJoinCode($data['isPrivate'] ? bin2hex(random_bytes(4)) : null);
        $match->setCreatedBy($this->getUser());

        $em->persist($match);
        $em->flush();

        return $this->json([
            'message' => 'Partido creado correctamente',
            'id' => $match->getId(),
            'joinCode' => $match->getJoinCode()
        ], 201);
    }

    #[Route('', name: 'list_matches', methods: ['GET'])]
    public function list(FootballMatchRepository $repository): JsonResponse
    {
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
                'canJoin' => !$match->isPrivate() || ($user && $match->getCreatedBy() === $user)
            ];
        }, $matches);

        return $this->json($result);
    }

    #[Route('/{id}/join', name: 'join_match', methods: ['POST'])]
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

        // Validar clave si es privado
        if ($match->isPrivate()) {
            $data = json_decode($request->getContent(), true);
            if (!isset($data['joinCode']) || $data['joinCode'] !== $match->getJoinCode()) {
                return $this->json(['error' => 'Código inválido para partido privado'], Response::HTTP_FORBIDDEN);
            }
        }

        // Verificar si ya está inscrito
        foreach ($match->getMatchPlayers() as $mp) {
            if ($mp->getPlayer() === $user) {
                return $this->json(['error' => 'Ya estás inscrito en este partido'], Response::HTTP_CONFLICT);
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

    #[Route('/{id}/players', name: 'match_players', methods: ['GET'])]
public function players(int $id, FootballMatchRepository $matchRepo): JsonResponse
{
    $match = $matchRepo->find($id);

    if (!$match) {
        return $this->json(['error' => 'Partido no encontrado'], 404);
    }

    $players = $match->getMatchPlayers()->map(function ($matchPlayer) {
        $user = $matchPlayer->getPlayer();
        return [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'position' => $user->getPosition(),
            'level' => $user->getLevel(),
        ];
    });

    return $this->json($players);
}

#[Route('/{id}/generate-teams', name: 'generate_teams', methods: ['GET'])]
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

    // Mezclar jugadores para mayor aleatoriedad
    shuffle($players);

    // Inicializar equipos
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

}
