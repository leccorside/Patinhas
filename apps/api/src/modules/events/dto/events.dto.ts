import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'ID da organização promotora do evento' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Título da feira ou evento', example: '1ª Mega Feira de Adoção de Filhotes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ description: 'Descrição e atrações do evento', example: 'Venha conhecer mais de 40 cães e gatos vacinados aguardando um lar!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Data do evento (ISO string)', example: '2026-11-15T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @ApiProperty({ description: 'Horário de início', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  startTime: string;

  @ApiProperty({ description: 'Horário de término', example: '17:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  endTime: string;

  @ApiProperty({ description: 'Nome do local ou estabelecimento parceiro', example: 'Shopping Villa Lobos - Estacionamento Coberto' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  locationName: string;

  @ApiProperty({ description: 'Endereço completo', example: 'Av. das Nações Unidas, 4777 - Alto de Pinheiros' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressStreet: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado (UF)', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @ApiPropertyOptional({ description: 'Latitude', example: -23.5489 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: -46.7234 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'URL do banner ou cartaz da feira' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
