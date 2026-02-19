<?php

// #region agent log
@file_put_contents(
    '/workspace-root/debug-3fd26b.log',
    json_encode([
        'sessionId' => '3fd26b',
        'runId' => 'pre-fix',
        'hypothesisId' => 'H1',
        'location' => 'backend/config/bundles.php',
        'message' => 'Bundle registration context evaluated',
        'data' => [
            'appEnv' => $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'unknown',
            'appDebug' => $_SERVER['APP_DEBUG'] ?? $_ENV['APP_DEBUG'] ?? getenv('APP_DEBUG') ?: 'unknown',
            'makerBundleClassExists' => class_exists('Symfony\\Bundle\\MakerBundle\\MakerBundle'),
            'pdoSqlsrvLoaded' => extension_loaded('pdo_sqlsrv'),
            'sqlsrvLoaded' => extension_loaded('sqlsrv'),
            'dbHost' => $_SERVER['DB_HOST'] ?? $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: null,
            'dbPort' => $_SERVER['DB_PORT'] ?? $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: null,
        ],
        'timestamp' => (int) round(microtime(true) * 1000),
    ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND
);
// #endregion

$bundles = [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    Nelmio\CorsBundle\NelmioCorsBundle::class => ['all' => true],
    Lexik\Bundle\JWTAuthenticationBundle\LexikJWTAuthenticationBundle::class => ['all' => true],
];

if (class_exists(Symfony\Bundle\MakerBundle\MakerBundle::class)) {
    $bundles[Symfony\Bundle\MakerBundle\MakerBundle::class] = ['dev' => true, 'test' => true];
}

return $bundles;
