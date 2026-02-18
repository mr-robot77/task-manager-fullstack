<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['fullName'])) {
            return $this->json(['error' => 'Missing required fields: email, password, fullName'], 400);
        }

        $existing = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return $this->json(['error' => 'A user with this email already exists'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFullName($data['fullName']);
        $user->setRoles(['ROLE_USER']);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'User registered successfully',
            'id' => $user->getId(),
        ], 201);
    }

    #[Route('/login_check', name: 'api_login_check', methods: ['POST'])]
    public function loginCheck(): JsonResponse
    {
        // Handled by lexik/jwt-authentication-bundle via security.yaml
        throw new \LogicException('This should never be reached.');
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
        ]);
    }
}
