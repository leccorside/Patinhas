import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LostFoundType, AnimalSpecies, LostFoundStatus } from '@prisma/client';

export class CreateLostFoundDto {
  @ApiProperty({ enum: LostFoundType, description: 'LOST (Perdi meu pet) ou FOUND (Encontrei um pet)' })
  @IsEnum(LostFoundType)
  @IsNotEmpty()
  type: LostFoundType;

  @ApiPropertyOptional({ description: 'Nome do pet (se souber)', example: 'Thor' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  petName?: string;

  @ApiProperty({ enum: AnimalSpecies, description: 'Espécie do animal' })
  @IsEnum(AnimalSpecies)
  @IsNotEmpty()
  species: AnimalSpecies;

  @ApiPropertyOptional({ description: 'Raça aproximada', example: 'Labrador' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  breed?: string;

  @ApiProperty({ description: 'Cor predominante e secundária', example: 'Preto com manchas brancas no peito' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  color: string;

  @ApiPropertyOptional({ description: 'Marcas distintivas ou características únicas', example: 'Cicatriz na orelha direita, coleira azul' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  distinctiveMarks?: string;

  @ApiProperty({ description: 'URL da foto do animal' })
  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @ApiProperty({ description: 'Data e hora em que foi visto pela última vez', example: '2026-10-31T14:30:00Z' })
  @IsDateString()
  @IsNotEmpty()
  lastSeenDate: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @ApiPropertyOptional({ description: 'Referência de endereço ou bairro', example: 'Próximo ao Parque Ibirapuera' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  addressRef?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: -23.5505 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: -46.6333 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Telefone ou WhatsApp de contato', example: '(11) 98765-4321' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Informações sobre recompensa (opcional)', example: 'Recompensa de R$ 500' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  rewardDetails?: string;
}

export class QueryLostFoundDto {
  @ApiPropertyOptional({ enum: LostFoundType })
  @IsOptional()
  @IsEnum(LostFoundType)
  type?: LostFoundType;

  @ApiPropertyOptional({ enum: AnimalSpecies })
  @IsOptional()
  @IsEnum(AnimalSpecies)
  species?: AnimalSpecies;

  @ApiPropertyOptional({ enum: LostFoundStatus })
  @IsOptional()
  @IsEnum(LostFoundStatus)
  status?: LostFoundStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Raio de busca em km', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;
}
