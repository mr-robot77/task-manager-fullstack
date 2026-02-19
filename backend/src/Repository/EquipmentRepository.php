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
        $statusCounts = $conn->executeQuery(
            'SELECT status, COUNT(*) as count FROM equipment GROUP BY status'
        )->fetchAllAssociative();

        $typeCounts = $conn->executeQuery(
            'SELECT type, COUNT(*) as count FROM equipment GROUP BY type'
        )->fetchAllAssociative();

        $lineCounts = $conn->executeQuery(
            'SELECT production_line, COUNT(*) as count FROM equipment GROUP BY production_line'
        )->fetchAllAssociative();

        return [
            'byStatus' => $statusCounts,
            'byType' => $typeCounts,
            'byProductionLine' => $lineCounts,
            'total' => $this->count([]),
        ];
    }
}
