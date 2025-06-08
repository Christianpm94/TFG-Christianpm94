<?php

namespace App\Service;

use App\Repository\FootballMatchRepository;
use Doctrine\ORM\EntityManagerInterface;

class MatchCleanupService
{
    private FootballMatchRepository $matchRepository;
    private EntityManagerInterface $em;

    public function __construct(FootballMatchRepository $matchRepository, EntityManagerInterface $em)
    {
        $this->matchRepository = $matchRepository;
        $this->em = $em;
    }

    /**
     * Elimina todos los partidos cuya fecha ya ha pasado (expirados).
     */
    public function deleteExpiredMatches(): void
    {
        $now = new \DateTimeImmutable(); // Fecha y hora actual

        // Buscar todos los partidos con fecha anterior a ahora
        $expiredMatches = $this->matchRepository->createQueryBuilder('m')
            ->where('m.date < :now')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        foreach ($expiredMatches as $match) {
            $this->em->remove($match); // Marca el partido para eliminarlo
        }

        $this->em->flush(); // Ejecuta la eliminación en base de datos
    }
}
