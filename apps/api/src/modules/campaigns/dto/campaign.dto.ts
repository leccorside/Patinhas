import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ description: 'ID da organização responsável pela campanha' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Título da campanha', example: 'Cirurgia e Tratamento do Cãozinho Bob' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ description: 'História e destinação dos recursos', example: 'Bob foi resgatado com fratura na pata traseira e precisa de cirurgia ortopédica urgente.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Meta de arrecadação em Reais (BRL)', example: 3500 })
  @IsNumber()
  @Min(50)
  goalAmountBrl: number;

  @ApiPropertyOptional({ description: 'Chave PIX da organização', example: 'contato@patinhasdeluz.org' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pixKey?: string;

  @ApiPropertyOptional({ description: 'URL da foto da campanha' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class RegisterDonationDto {
  @ApiProperty({ description: 'Valor da contribuição em Reais', example: 50 })
  @IsNumber()
  @Min(5)
  amount: number;

  @ApiPropertyOptional({ description: 'Nome do doador (ou anônimo)', example: 'Lucas Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  donorName?: string;
}
