<?php

namespace App\Entity;

use App\Repository\EquipmentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: EquipmentRepository::class)]
#[ORM\Table(name: 'equipment')]
class Equipment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['equipment:read', 'task:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 120)]
    #[Assert\NotBlank]
    #[Groups(['equipment:read', 'equipment:write', 'task:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 60, unique: true)]
    #[Assert\NotBlank]
    #[Groups(['equipment:read', 'equipment:write', 'task:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['machine', 'robot', 'conveyor', 'sensor', 'tooling'])]
    #[Groups(['equipment:read', 'equipment:write', 'task:read'])]
    private ?string $type = null;

    #[ORM\Column(length: 30)]
    #[Assert\Choice(choices: ['available', 'in_use', 'maintenance', 'offline'])]
    #[Groups(['equipment:read', 'equipment:write', 'task:read'])]
    private ?string $status = 'available';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['equipment:read', 'equipment:write', 'task:read'])]
    private ?string $productionLine = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['equipment:read', 'equipment:write'])]
    private ?\DateTimeInterface $lastMaintenanceAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['equipment:read', 'equipment:write'])]
    private ?\DateTimeInterface $nextMaintenanceAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['equipment:read', 'equipment:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['equipment:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['equipment:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'equipment')]
    private Collection $tasks;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getProductionLine(): ?string
    {
        return $this->productionLine;
    }

    public function setProductionLine(string $productionLine): static
    {
        $this->productionLine = $productionLine;
        return $this;
    }

    public function getLastMaintenanceAt(): ?\DateTimeInterface
    {
        return $this->lastMaintenanceAt;
    }

    public function setLastMaintenanceAt(?\DateTimeInterface $lastMaintenanceAt): static
    {
        $this->lastMaintenanceAt = $lastMaintenanceAt;
        return $this;
    }

    public function getNextMaintenanceAt(): ?\DateTimeInterface
    {
        return $this->nextMaintenanceAt;
    }

    public function setNextMaintenanceAt(?\DateTimeInterface $nextMaintenanceAt): static
    {
        $this->nextMaintenanceAt = $nextMaintenanceAt;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, Task>
     */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }
}
