<?php

namespace App\Repository;

use App\Entity\Equipment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Equipment>
 */
class EquipmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Equipment::class);
    }

    /**
     * @return Equipment[]
     */
    public function findByFilters(
        ?string $status = null,
        ?string $type = null,
        ?string $productionLine = null
    ): array {
        $qb = $this->createQueryBuilder('e')
            ->orderBy('e.createdAt', 'DESC');

        if ($status) {
            $qb->andWhere('e.status = :status')
                ->setParameter('status', $status);
        }

        if ($type) {
            $qb->andWhere('e.type = :type')
                ->setParameter('type', $type);
        }

        if ($productionLine) {
            $qb->andWhere('e.productionLine = :line')
                ->setParameter('line', $productionLine);
        }

        return $qb->getQuery()->getResult();
    }

    public function getStatistics(): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $params = $conn->getParams();

        // #region agent log
        @file_put_contents(
            '/workspace-root/debug-3fd26b.log',
            json_encode([
                'sessionId' => '3fd26b',
                'runId' => 'pre-fix',
                'hypothesisId' => 'H2',
                'location' => 'backend/src/Repository/EquipmentRepository.php::getStatistics',
                'message' => 'Equipment statistics query starting',
                'data' => [
                    'driver' => $params['driver'] ?? null,
                    'host' => $params['host'] ?? null,
                    'port' => $params['port'] ?? null,
                    'dbname' => $params['dbname'] ?? null,
                    'pdoSqlsrvLoaded' => extension_loaded('pdo_sqlsrv'),
                    'sqlsrvLoaded' => extension_loaded('sqlsrv'),
                ],
                'timestamp' => (int) round(microtime(true) * 1000),
            ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
            FILE_APPEND
        );
        // #endregion

        try {
            $statusCounts = $conn->executeQuery(
                'SELECT status, COUNT(*) as count FROM equipment GROUP BY status'
            )->fetchAllAssociative();

            $typeCounts = $conn->executeQuery(
                'SELECT type, COUNT(*) as count FROM equipment GROUP BY type'
            )->fetchAllAssociative();

            $lineCounts = $conn->executeQuery(
                'SELECT production_line, COUNT(*) as count FROM equipment GROUP BY production_line'
            )->fetchAllAssociative();

            $result = [
                'byStatus' => $statusCounts,
                'byType' => $typeCounts,
                'byProductionLine' => $lineCounts,
                'total' => $this->count([]),
            ];

            // #region agent log
            @file_put_contents(
                '/workspace-root/debug-3fd26b.log',
                json_encode([
                    'sessionId' => '3fd26b',
                    'runId' => 'pre-fix',
                    'hypothesisId' => 'H2',
                    'location' => 'backend/src/Repository/EquipmentRepository.php::getStatistics',
                    'message' => 'Equipment statistics query completed',
                    'data' => [
                        'statusRows' => count($statusCounts),
                        'typeRows' => count($typeCounts),
                        'lineRows' => count($lineCounts),
                        'total' => $result['total'],
                    ],
                    'timestamp' => (int) round(microtime(true) * 1000),
                ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
                FILE_APPEND
            );
            // #endregion

            return $result;
        } catch (\Throwable $exception) {
            // #region agent log
            @file_put_contents(
                '/workspace-root/debug-3fd26b.log',
                json_encode([
                    'sessionId' => '3fd26b',
                    'runId' => 'pre-fix',
                    'hypothesisId' => 'H2',
                    'location' => 'backend/src/Repository/EquipmentRepository.php::getStatistics',
                    'message' => 'Equipment statistics query failed',
                    'data' => [
                        'exceptionClass' => get_class($exception),
                        'exceptionMessage' => $exception->getMessage(),
                    ],
                    'timestamp' => (int) round(microtime(true) * 1000),
                ], JSON_UNESCAPED_SLASHES) . PHP_EOL,
                FILE_APPEND
            );
            // #endregion

            throw $exception;
        }
    }
}
