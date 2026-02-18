<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tasks')]
class TaskController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'task_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $tasks = $this->taskRepository->findByFilters(
            $request->query->get('status'),
            $request->query->get('priority'),
            $request->query->get('productionLine'),
        );

        $json = $this->serializer->serialize($tasks, 'json', [
            'groups' => ['task:read'],
        ]);

        return new JsonResponse($json, 200, [], true);
    }

    #[Route('/statistics', name: 'task_statistics', methods: ['GET'])]
    public function statistics(): JsonResponse
    {
        return $this->json($this->taskRepository->getStatistics());
    }

    #[Route('/{id}', name: 'task_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        $json = $this->serializer->serialize($task, 'json', [
            'groups' => ['task:read'],
        ]);

        return new JsonResponse($json, 200, [], true);
    }

    #[Route('', name: 'task_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['title'], $data['productionLine'])) {
            return $this->json(['error' => 'Missing required fields: title, productionLine'], 400);
        }

        $task = new Task();
        $task->setTitle($data['title']);
        $task->setDescription($data['description'] ?? null);
        $task->setStatus($data['status'] ?? 'todo');
        $task->setPriority($data['priority'] ?? 'medium');
        $task->setProductionLine($data['productionLine']);

        if (isset($data['dueDate'])) {
            $task->setDueDate(new \DateTime($data['dueDate']));
        }

        $assignedToId = $data['assignedTo'] ?? null;
        if ($assignedToId) {
            $user = $this->entityManager->getRepository(User::class)->find($assignedToId);
            if (!$user) {
                return $this->json(['error' => 'Assigned user not found'], 404);
            }
            $task->setAssignedTo($user);
        } else {
            $task->setAssignedTo($this->getUser());
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json(['message' => 'Task created', 'id' => $task->getId()], 201);
    }

    #[Route('/{id}', name: 'task_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }
        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }
        if (isset($data['productionLine'])) {
            $task->setProductionLine($data['productionLine']);
        }
        if (isset($data['dueDate'])) {
            $task->setDueDate(new \DateTime($data['dueDate']));
        }
        if (isset($data['assignedTo'])) {
            $user = $this->entityManager->getRepository(User::class)->find($data['assignedTo']);
            if ($user) {
                $task->setAssignedTo($user);
            }
        }

        $task->setUpdatedAt(new \DateTime());

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Task updated']);
    }

    #[Route('/{id}', name: 'task_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json(['message' => 'Task deleted']);
    }
}
