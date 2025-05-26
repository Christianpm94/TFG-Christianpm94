<?php

namespace App\Repository;

use App\Entity\MatchPlayer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MatchPlayer>
 *
 * @method MatchPlayer|null find($id, $lockMode = null, $lockVersion = null)
 * @method MatchPlayer|null findOneBy(array $criteria, array $orderBy = null)
 * @method MatchPlayer[]    findAll()
 * @method MatchPlayer[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MatchPlayerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MatchPlayer::class);
    }

//    /**
//     * @return MatchPlayer[] Returns an array of MatchPlayer objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('m')
//            ->andWhere('m.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('m.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?MatchPlayer
//    {
//        return $this->createQueryBuilder('m')
//            ->andWhere('m.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
