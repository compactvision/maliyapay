<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class Advice
{
    public function __construct(
        public readonly string $id,
        public readonly string $title,
        public readonly string $summary,
        public readonly ?string $content,
        public readonly string $category,
        public readonly string $status = 'draft',
        public readonly bool $featured = false,
        public readonly ?string $videoUrl = null,
        public readonly ?string $authorName = null,
        public readonly int $readingTimeMinutes = 5,
        public readonly array $images = [],
        public readonly ?\DateTimeInterface $publishedAt = null,
        public readonly \DateTimeInterface $createdAt = new \DateTime(),
        public readonly \DateTimeInterface $updatedAt = new \DateTime(),
    ) {}
}
