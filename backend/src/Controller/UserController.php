<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api')] // Prefijo para todas las rutas de este controlador
class UserController extends AbstractController
{
    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Datos no válidos.'], 400);
        }

        // Crear nuevo usuario
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        $user->setPosition($data['position']);
        $user->setLevel((int) $data['level']);
        $user->setRoles(['ROLE_USER']);

        // Hashear contraseña
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Guardar en base de datos
        $em->persist($user);
        $em->flush();

        return new JsonResponse(['message' => 'Usuario registrado con éxito'], 201);
    }

    #[Route('/users/me', name: 'user_me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')] // Protegida por JWT
    public function getCurrentUser(UserInterface $user): JsonResponse
    {
        // Retornar datos del usuario autenticado
        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'position' => $user->getPosition(),
            'level' => $user->getLevel(),
            'roles' => $user->getRoles(),
        ]);
    }
}
