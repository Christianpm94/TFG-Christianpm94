<?php

namespace App\Repository;

use App\Entity\FootballMatch;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FootballMatch>
 *
 * @method FootballMatch|null find($id, $lockMode = null, $lockVersion = null)
 * @method FootballMatch|null findOneBy(array $criteria, array $orderBy = null)
 * @method FootballMatch[]    findAll()
 * @method FootballMatch[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FootballMatchRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FootballMatch::class);
    }

//    /**
//     * @return FootballMatch[] Returns an array of FootballMatch objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('f')
//            ->andWhere('f.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('f.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?FootballMatch
//    {
//        return $this->createQueryBuilder('f')
//            ->andWhere('f.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
