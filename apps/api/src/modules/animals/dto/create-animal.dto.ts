import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnimalSpecies, AnimalSex, AnimalSize, AnimalAgeUnit, EnergyLevel } from '@prisma/client';

export class CreateAnimalHealthRecordDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVaccinated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vaccinationDetails?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDewormed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalNotes?: string;
}

export class CreateAnimalPhotoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class CreateAnimalDto {
  @ApiProperty({ example: 'Charlie' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AnimalSpecies, default: AnimalSpecies.DOG })
  @IsEnum(AnimalSpecies)
  species: AnimalSpecies;

  @ApiPropertyOptional({ example: 'Beagle Mix' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  ageApproximate: number;

  @ApiProperty({ enum: AnimalAgeUnit, default: AnimalAgeUnit.YEARS })
  @IsEnum(AnimalAgeUnit)
  ageUnit: AnimalAgeUnit;

  @ApiProperty({ enum: AnimalSex, default: AnimalSex.MALE })
  @IsEnum(AnimalSex)
  sex: AnimalSex;

  @ApiProperty({ enum: AnimalSize, default: AnimalSize.MEDIUM })
  @IsEnum(AnimalSize)
  size: AnimalSize;

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({ example: 'Tricolor (marrom, preto e branco)' })
  @IsOptional()
  @IsString()
  coatColor?: string;

  @ApiProperty({ example: 'Charlie é um cãozinho alegre e muito dócil...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Apartamento com telas de proteção ou casa murada' })
  @IsOptional()
  @IsString()
  adoptionRequirements?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSpecialNeeds?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialNeedsDescription?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  compatibilityDogs?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  compatibilityCats?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  compatibilityChildren?: boolean;

  @ApiPropertyOptional({ enum: EnergyLevel, default: EnergyLevel.MODERATE })
  @IsOptional()
  @IsEnum(EnergyLevel)
  energyLevel?: EnergyLevel;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: -23.5505 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'ID da ONG se o animal pertencer a um abrigo' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ type: CreateAnimalHealthRecordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAnimalHealthRecordDto)
  healthRecord?: CreateAnimalHealthRecordDto;

  @ApiPropertyOptional({ type: [String], example: ['Dócil', 'Brincalhão', 'Sociável com cães'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  traits?: string[];

  @ApiPropertyOptional({ type: [CreateAnimalPhotoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnimalPhotoDto)
  photos?: CreateAnimalPhotoDto[];
}

