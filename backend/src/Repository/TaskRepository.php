<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * @return Task[]
     */
    public function findByFilters(
        ?string $status = null,
        ?string $priority = null,
        ?string $productionLine = null
    ): array {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.assignedTo', 'u')
            ->addSelect('u')
            ->orderBy('t.createdAt', 'DESC');

        if ($status) {
            $qb->andWhere('t.status = :status')
               ->setParameter('status', $status);
        }

        if ($priority) {
            $qb->andWhere('t.priority = :priority')
               ->setParameter('priority', $priority);
        }

        if ($productionLine) {
            $qb->andWhere('t.productionLine = :line')
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
                'location' => 'backend/src/Repository/TaskRepository.php::getStatistics',
                'message' => 'Task statistics query starting',
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
                'SELECT status, COUNT(*) as count FROM tasks GROUP BY status'
            )->fetchAllAssociative();

            $priorityCounts = $conn->executeQuery(
                'SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority'
            )->fetchAllAssociative();

            $lineCounts = $conn->executeQuery(
                'SELECT production_line, COUNT(*) as count FROM tasks GROUP BY production_line'
            )->fetchAllAssociative();

            $result = [
                'byStatus' => $statusCounts,
                'byPriority' => $priorityCounts,
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
                    'location' => 'backend/src/Repository/TaskRepository.php::getStatistics',
                    'message' => 'Task statistics query completed',
                    'data' => [
                        'statusRows' => count($statusCounts),
                        'priorityRows' => count($priorityCounts),
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
                    'location' => 'backend/src/Repository/TaskRepository.php::getStatistics',
                    'message' => 'Task statistics query failed',
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
