<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class KernelBootTest extends KernelTestCase
{
    private function debugLog(string $hypothesisId, string $message, array $data = []): void
    {
        $payload = [
            'sessionId' => '3fd26b',
            'runId' => 'coverage-pre',
            'hypothesisId' => $hypothesisId,
            'location' => 'backend/tests/KernelBootTest.php',
            'message' => $message,
            'data' => $data,
            'timestamp' => (int) round(microtime(true) * 1000),
        ];

        file_put_contents(
            dirname(__DIR__, 2).'/debug-3fd26b.log',
            json_encode($payload, JSON_UNESCAPED_SLASHES).PHP_EOL,
            FILE_APPEND
        );
    }

    public function testKernelBootsAndContainerIsAvailable(): void
    {
        // #region agent log
        $this->debugLog('H2', 'Backend kernel test started');
        // #endregion

        self::bootKernel();

        $container = static::getContainer();

        // #region agent log
        $this->debugLog('H2', 'Backend kernel container resolved', [
            'hasRouter' => $container->has('router'),
        ]);
        // #endregion

        $this->assertTrue($container->has('router'));
    }
}
