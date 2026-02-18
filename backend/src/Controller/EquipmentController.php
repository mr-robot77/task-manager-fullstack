<?php

namespace App\Controller;

use App\Entity\Equipment;
use App\Repository\EquipmentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/equipment')]
class EquipmentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private EquipmentRepository $equipmentRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'equipment_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $equipment = $this->equipmentRepository->findByFilters(
            $request->query->get('status'),
            $request->query->get('type'),
            $request->query->get('productionLine'),
        );

        $json = $this->serializer->serialize($equipment, 'json', [
            'groups' => ['equipment:read'],
        ]);

        return new JsonResponse($json, 200, [], true);
    }

    #[Route('/statistics', name: 'equipment_statistics', methods: ['GET'])]
    public function statistics(): JsonResponse
    {
        return $this->json($this->equipmentRepository->getStatistics());
    }

    #[Route('/{id}', name: 'equipment_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $equipment = $this->equipmentRepository->find($id);
        if (! $equipment) {
            return $this->json(['error' => 'Equipment not found'], 404);
        }

        $json = $this->serializer->serialize($equipment, 'json', [
            'groups' => ['equipment:read'],
        ]);

        return new JsonResponse($json, 200, [], true);
    }

    #[Route('', name: 'equipment_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (! is_array($data) || ! isset($data['name'], $data['code'], $data['type'], $data['productionLine'])) {
            return $this->json(['error' => 'Missing required fields: name, code, type, productionLine'], 400);
        }

        $equipment = new Equipment();
        $equipment->setName($data['name']);
        $equipment->setCode($data['code']);
        $equipment->setType($data['type']);
        $equipment->setStatus($data['status'] ?? 'available');
        $equipment->setProductionLine($data['productionLine']);
        $equipment->setNotes($data['notes'] ?? null);

        if (! empty($data['lastMaintenanceAt'])) {
            $equipment->setLastMaintenanceAt(new \DateTime($data['lastMaintenanceAt']));
        }

        if (! empty($data['nextMaintenanceAt'])) {
            $equipment->setNextMaintenanceAt(new \DateTime($data['nextMaintenanceAt']));
        }

        $errors = $this->validator->validate($equipment);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->persist($equipment);
        $this->entityManager->flush();

        return $this->json(['message' => 'Equipment created', 'id' => $equipment->getId()], 201);
    }

    #[Route('/{id}', name: 'equipment_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $equipment = $this->equipmentRepository->find($id);
        if (! $equipment) {
            return $this->json(['error' => 'Equipment not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (! is_array($data)) {
            return $this->json(['error' => 'Invalid JSON body'], 400);
        }

        if (isset($data['name'])) {
            $equipment->setName($data['name']);
        }
        if (isset($data['code'])) {
            $equipment->setCode($data['code']);
        }
        if (isset($data['type'])) {
            $equipment->setType($data['type']);
        }
        if (isset($data['status'])) {
            $equipment->setStatus($data['status']);
        }
        if (isset($data['productionLine'])) {
            $equipment->setProductionLine($data['productionLine']);
        }
        if (array_key_exists('notes', $data)) {
            $equipment->setNotes($data['notes']);
        }
        if (array_key_exists('lastMaintenanceAt', $data)) {
            $equipment->setLastMaintenanceAt(
                $data['lastMaintenanceAt'] ? new \DateTime($data['lastMaintenanceAt']) : null
            );
        }
        if (array_key_exists('nextMaintenanceAt', $data)) {
            $equipment->setNextMaintenanceAt(
                $data['nextMaintenanceAt'] ? new \DateTime($data['nextMaintenanceAt']) : null
            );
        }

        $equipment->setUpdatedAt(new \DateTime());

        $errors = $this->validator->validate($equipment);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Equipment updated']);
    }

    #[Route('/{id}', name: 'equipment_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $equipment = $this->equipmentRepository->find($id);
        if (! $equipment) {
            return $this->json(['error' => 'Equipment not found'], 404);
        }

        $this->entityManager->remove($equipment);
        $this->entityManager->flush();

        return $this->json(['message' => 'Equipment deleted']);
    }
}
