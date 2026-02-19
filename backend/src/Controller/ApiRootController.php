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
        // #region agent log
        @file_put_contents(
            '/workspace-root/debug-3fd26b.log',
            json_encode([
                'sessionId' => '3fd26b',
                'runId' => 'post-fix',
                'hypothesisId' => 'H3',
                'location' => 'backend/src/Controller/ApiRootController.php::index',
                'message' => 'API root route resolved',
                'data' => [
                    'requestUri' => $_SERVER['REQUEST_URI'] ?? null,
                    'requestMethod' => $_SERVER['REQUEST_METHOD'] ?? null,
                ],
                'timestamp' => (int) round(microtime(true) * 1000),
            ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
            FILE_APPEND
        );
        // #endregion

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
