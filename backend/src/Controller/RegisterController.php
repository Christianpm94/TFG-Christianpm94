<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class RegisterController extends AbstractController
{
    #[Route('/api/register', name: 'user_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validaciones básicas
        if (!isset($data['email'], $data['password'], $data['name'], $data['position'], $data['level'])) {
            return new JsonResponse(['message' => 'Faltan campos obligatorios'], 400);
        }

        // Verificar si ya existe el usuario
        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['message' => 'El correo ya está registrado'], 409);
        }

        // Crear nuevo usuario
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        $user->setPosition($data['position']);
        $user->setLevel((int)$data['level']);
        $user->setRoles(['ROLE_USER']);

        // Codificar contraseña
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Guardar en la base de datos
        $entityManager->persist($user);
        $entityManager->flush();

        // Generar token JWT
        $token = $jwtManager->create($user);

        return new JsonResponse(['token' => $token]);
    }
}
