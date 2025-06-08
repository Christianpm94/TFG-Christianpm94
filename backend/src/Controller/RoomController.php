<?php

// Controlador para crear salas
namespace App\Controller;

use App\Entity\Room;
use App\Entity\FootballMatch;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class RoomController extends AbstractController
{
    #[Route('/api/matches/{id}/create-room', name: 'create_room', methods: ['POST'])]
    public function createRoom(FootballMatch $match, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // Verifica si el usuario es el creador del partido
        if ($user->getId() !== $match->getCreatedBy()->getId()) {
            return new JsonResponse(['message' => 'No autorizado'], 403);
        }

        $room = new Room();
        $room->setMatch($match);
        $room->setCreator($user); // El creador del partido se asocia con la sala

        $em->persist($room);
        $em->flush();

        return new JsonResponse(['message' => 'Sala creada correctamente'], 201);
    }
}
