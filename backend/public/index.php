<?php

use App\Kernel;

// #region agent log
@file_put_contents(
    '/workspace-root/debug-3fd26b.log',
    json_encode([
        'sessionId' => '3fd26b',
        'runId' => 'pre-fix',
        'hypothesisId' => 'H4',
        'location' => 'backend/public/index.php',
        'message' => 'About to require autoload_runtime.php',
        'data' => [
            'phpVersion' => PHP_VERSION,
            'requestUri' => $_SERVER['REQUEST_URI'] ?? null,
            'requestMethod' => $_SERVER['REQUEST_METHOD'] ?? null,
            'autoloadRuntimeExists' => is_file(dirname(__DIR__).'/vendor/autoload_runtime.php'),
            'platformCheckExists' => is_file(dirname(__DIR__).'/vendor/composer/platform_check.php'),
        ],
        'timestamp' => (int) round(microtime(true) * 1000),
    ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND
);
// #endregion

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    // #region agent log
    @file_put_contents(
        '/workspace-root/debug-3fd26b.log',
        json_encode([
            'sessionId' => '3fd26b',
            'runId' => 'pre-fix',
            'hypothesisId' => 'H3',
            'location' => 'backend/public/index.php',
            'message' => 'HTTP kernel bootstrap request context',
            'data' => [
                'requestUri' => $_SERVER['REQUEST_URI'] ?? null,
                'requestMethod' => $_SERVER['REQUEST_METHOD'] ?? null,
                'appEnv' => $context['APP_ENV'] ?? 'missing',
                'appDebug' => isset($context['APP_DEBUG']) ? (string) $context['APP_DEBUG'] : 'missing',
            ],
            'timestamp' => (int) round(microtime(true) * 1000),
        ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND
    );
    // #endregion

    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
