<?php

namespace App\Tests\Entity;

use App\Entity\Task;
use PHPUnit\Framework\TestCase;

class TaskEntityTest extends TestCase
{
    public function testDefaultValuesAreInitialized(): void
    {
        $task = new Task();

        $this->assertSame('todo', $task->getStatus());
        $this->assertSame('medium', $task->getPriority());
        $this->assertInstanceOf(\DateTimeInterface::class, $task->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $task->getUpdatedAt());
    }
}
