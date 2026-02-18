<?php

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserEntityTest extends TestCase
{
    public function testRoleUserIsAlwaysPresent(): void
    {
        $user = new User();

        $user->setRoles(['ROLE_ADMIN']);

        $roles = $user->getRoles();

        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }
}
