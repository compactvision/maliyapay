<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\ValueObjects;

use DateTimeImmutable;

class TimeRange
{
    public function __construct(
        private ?DateTimeImmutable $start,
        private ?DateTimeImmutable $end
    ) {
        if ($this->start && $this->end && $this->start >= $this->end) {
            throw new \InvalidArgumentException('Start time must be before end time');
        }
    }

    public static function create(?string $start, ?string $end): self
    {
        $startTime = $start ? new DateTimeImmutable($start) : null;
        $endTime = $end ? new DateTimeImmutable($end) : null;

        return new self($startTime, $endTime);
    }

    public function start(): ?DateTimeImmutable
    {
        return $this->start;
    }

    public function end(): ?DateTimeImmutable
    {
        return $this->end;
    }

    public function hasTimeRange(): bool
    {
        return $this->start !== null && $this->end !== null;
    }

    public function formatStart(): ?string
    {
        return $this->start?->format('H:i');
    }

    public function formatEnd(): ?string
    {
        return $this->end?->format('H:i');
    }

    public function toString(): string
    {
        if (!$this->hasTimeRange()) {
            return '';
        }

        return sprintf('%s - %s', $this->formatStart(), $this->formatEnd());
    }
}
