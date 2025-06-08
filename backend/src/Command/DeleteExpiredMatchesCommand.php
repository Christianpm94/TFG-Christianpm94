<?php

namespace App\Command;

use App\Repository\FootballMatchRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:delete-expired-matches',
    description: 'Elimina partidos cuya fecha ya ha pasado',
)]
class DeleteExpiredMatchesCommand extends Command
{
    private FootballMatchRepository $matchRepository;
    private EntityManagerInterface $em;

    public function __construct(FootballMatchRepository $matchRepository, EntityManagerInterface $em)
    {
        parent::__construct();
        $this->matchRepository = $matchRepository;
        $this->em = $em;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = new \DateTime();
        $matches = $this->matchRepository->findExpiredMatches($now);

        if (count($matches) === 0) {
            $output->writeln('No hay partidos expirados para eliminar.');
            return Command::SUCCESS;
        }

        foreach ($matches as $match) {
            $this->em->remove($match);
        }

        $this->em->flush();

        $output->writeln(count($matches) . ' partidos eliminados.');
        return Command::SUCCESS;
    }
}
