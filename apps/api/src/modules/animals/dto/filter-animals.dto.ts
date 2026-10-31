import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus, EnergyLevel } from '@prisma/client';

export class FilterAnimalsDto {
  @ApiPropertyOptional({ description: 'Termo de busca textual no nome, raça ou descrição' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AnimalSpecies })
  @IsOptional()
  @IsEnum(AnimalSpecies)
  species?: AnimalSpecies;

  @ApiPropertyOptional({ enum: AnimalSex })
  @IsOptional()
  @IsEnum(AnimalSex)
  sex?: AnimalSex;

  @ApiPropertyOptional({ enum: AnimalSize })
  @IsOptional()
  @IsEnum(AnimalSize)
  size?: AnimalSize;

  @ApiPropertyOptional({ enum: AnimalStatus, default: AnimalStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(AnimalStatus)
  status?: AnimalStatus;

  @ApiPropertyOptional({ enum: EnergyLevel })
  @IsOptional()
  @IsEnum(EnergyLevel)
  energyLevel?: EnergyLevel;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSpecialNeeds?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  compatibilityDogs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  compatibilityCats?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  compatibilityChildren?: boolean;

  @ApiPropertyOptional({ description: 'ID da organização' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Latitude do usuário para ordenação por proximidade' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLat?: number;

  @ApiPropertyOptional({ description: 'Longitude do usuário para ordenação por proximidade' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLon?: number;

  @ApiPropertyOptional({ description: 'Distância máxima em quilômetros' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDistanceKm?: number;

  @ApiPropertyOptional({ description: 'Apenas animais vacinados' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVaccinated?: boolean;

  @ApiPropertyOptional({ description: 'Apenas animais castrados' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isNeutered?: boolean;

  @ApiPropertyOptional({ description: 'Apenas casos urgentes ou lar temporário' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar filhotes' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPuppy?: boolean;
}

