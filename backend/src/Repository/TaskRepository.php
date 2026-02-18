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

        $statusCounts = $conn->executeQuery(
            'SELECT status, COUNT(*) as count FROM tasks GROUP BY status'
        )->fetchAllAssociative();

        $priorityCounts = $conn->executeQuery(
            'SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority'
        )->fetchAllAssociative();

        $lineCounts = $conn->executeQuery(
            'SELECT production_line, COUNT(*) as count FROM tasks GROUP BY production_line'
        )->fetchAllAssociative();

        return [
            'byStatus' => $statusCounts,
            'byPriority' => $priorityCounts,
            'byProductionLine' => $lineCounts,
            'total' => $this->count([]),
        ];
    }
}
