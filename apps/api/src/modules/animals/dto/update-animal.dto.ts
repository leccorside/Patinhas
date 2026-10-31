import { PartialType } from '@nestjs/swagger';
import { CreateAnimalDto } from './create-animal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AnimalStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @ApiPropertyOptional({ enum: AnimalStatus })
  @IsOptional()
  @IsEnum(AnimalStatus)
  status?: AnimalStatus;
}

