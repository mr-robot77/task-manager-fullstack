<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ApiRootController extends AbstractController
{
    #[Route('/api', name: 'api_root', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Task and Equipment Manager API',
            'status' => 'ok',
            'availablePublicEndpoints' => [
                '/api',
                '/api/login_check',
                '/api/register',
                '/api/tasks/statistics',
                '/api/equipment/statistics',
            ],
        ]);
    }
}
