<?php

namespace App\Tests\Entity;

use App\Entity\Equipment;
use PHPUnit\Framework\TestCase;

class EquipmentEntityTest extends TestCase
{
    public function testDefaultValuesAreInitialized(): void
    {
        $equipment = new Equipment();

        $this->assertSame('available', $equipment->getStatus());
        $this->assertInstanceOf(\DateTimeInterface::class, $equipment->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $equipment->getUpdatedAt());
    }
}
