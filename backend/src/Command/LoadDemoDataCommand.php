<?php

namespace App\Command;

use App\Entity\Equipment;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:load-demo-data',
    description: 'Load demo tasks and equipment for showcasing the application.',
)]
class LoadDemoDataCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Overwrite existing demo user and add more data');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => 'demo@example.com']);

        if (!$user) {
            $user = new User();
            $user->setEmail('demo@example.com');
            $user->setFullName('Demo Operator');
            $user->setRoles(['ROLE_USER']);
            $user->setPassword($this->passwordHasher->hashPassword($user, 'demodemo'));
            $this->em->persist($user);
            $this->em->flush();
            $io->success('Created demo user: demo@example.com / demodemo');
        } else {
            $io->note('Demo user already exists. Use --force to add more demo data.');
            if (!$input->getOption('force')) {
                return Command::SUCCESS;
            }
        }

        $equipmentData = [
            ['name' => 'Wafer Handler Robot #1', 'code' => 'WH-ROB-001', 'type' => 'robot', 'status' => 'in_use', 'line' => 'Line A'],
            ['name' => 'Lithography Stepper', 'code' => 'LITH-STEP-01', 'type' => 'machine', 'status' => 'in_use', 'line' => 'Line A'],
            ['name' => 'Conveyor Belt A', 'code' => 'CONV-A-01', 'type' => 'conveyor', 'status' => 'available', 'line' => 'Line A'],
            ['name' => 'Temperature Sensor Bank', 'code' => 'TEMP-SNS-01', 'type' => 'sensor', 'status' => 'available', 'line' => 'Line B'],
            ['name' => 'Etching Tool Set', 'code' => 'ETCH-TL-001', 'type' => 'tooling', 'status' => 'maintenance', 'line' => 'Line B'],
            ['name' => 'Inspection Robot', 'code' => 'INSP-ROB-01', 'type' => 'robot', 'status' => 'available', 'line' => 'Line C'],
            ['name' => 'Deposition Chamber', 'code' => 'DEP-CH-01', 'type' => 'machine', 'status' => 'offline', 'line' => 'Line C'],
        ];

        $existingCodes = [];
        foreach ($this->em->getRepository(Equipment::class)->findAll() as $e) {
            $existingCodes[$e->getCode()] = $e;
        }

        foreach ($equipmentData as $eq) {
            if (isset($existingCodes[$eq['code']])) {
                continue;
            }
            $equip = new Equipment();
            $equip->setName($eq['name']);
            $equip->setCode($eq['code']);
            $equip->setType($eq['type']);
            $equip->setStatus($eq['status']);
            $equip->setProductionLine($eq['line']);
            $this->em->persist($equip);
            $existingCodes[$eq['code']] = $equip;
        }
        $this->em->flush();

        $equipByCode = [];
        foreach ($this->em->getRepository(Equipment::class)->findAll() as $e) {
            $equipByCode[$e->getCode()] = $e;
        }

        $taskData = [
            ['title' => 'Calibrate wafer handler sensors', 'status' => 'in_progress', 'priority' => 'high', 'line' => 'Line A', 'equip' => 'WH-ROB-001'],
            ['title' => 'Quarterly lithography alignment', 'status' => 'review', 'priority' => 'critical', 'line' => 'Line A', 'equip' => 'LITH-STEP-01'],
            ['title' => 'Conveyor belt speed optimization', 'status' => 'todo', 'priority' => 'medium', 'line' => 'Line A', 'equip' => 'CONV-A-01'],
            ['title' => 'Temperature drift analysis', 'status' => 'done', 'priority' => 'low', 'line' => 'Line B', 'equip' => 'TEMP-SNS-01'],
            ['title' => 'Replace etching chamber filters', 'status' => 'in_progress', 'priority' => 'high', 'line' => 'Line B', 'equip' => 'ETCH-TL-001'],
            ['title' => 'Inspection robot recalibration', 'status' => 'todo', 'priority' => 'medium', 'line' => 'Line C', 'equip' => 'INSP-ROB-01'],
            ['title' => 'Deposition chamber leak test', 'status' => 'todo', 'priority' => 'critical', 'line' => 'Line C', 'equip' => 'DEP-CH-01'],
            ['title' => 'Document SOP for Line A startup', 'status' => 'review', 'priority' => 'medium', 'line' => 'Line A', 'equip' => null],
            ['title' => 'Backup production logs', 'status' => 'done', 'priority' => 'low', 'line' => 'General', 'equip' => null],
        ];

        $existingTasks = $this->em->getRepository(Task::class)->count([]);
        $added = 0;

        foreach ($taskData as $t) {
            if ($existingTasks >= 15) {
                break;
            }
            $task = new Task();
            $task->setTitle($t['title']);
            $task->setStatus($t['status']);
            $task->setPriority($t['priority']);
            $task->setProductionLine($t['line']);
            $task->setAssignedTo($user);
            $task->setDescription('Demo task for production line management.');
            if ($t['equip'] && isset($equipByCode[$t['equip']])) {
                $task->setEquipment($equipByCode[$t['equip']]);
            }
            $this->em->persist($task);
            $existingTasks++;
            $added++;
        }
        $this->em->flush();

        $io->success(sprintf('Loaded demo data (%d tasks). Login: demo@example.com / demodemo', $added));
        return Command::SUCCESS;
    }
}
