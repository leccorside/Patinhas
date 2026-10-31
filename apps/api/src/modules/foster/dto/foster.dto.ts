import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveFosterProfileDto {
  @ApiProperty({ description: 'Capacidade máxima de pets para acolhimento simultâneo', default: 1 })
  @IsInt()
  @Min(1)
  capacityPets: number;

  @ApiProperty({ description: 'Espécies aceitas separadas por vírgula', example: 'DOG,CAT' })
  @IsString()
  @IsNotEmpty()
  acceptedSpecies: string;

  @ApiProperty({ description: 'Possui cômodo isolado para quarentena ou recuperação pós-operatória', default: false })
  @IsBoolean()
  hasQuarantineSpace: boolean;

  @ApiProperty({ description: 'Disponibilidade ativa no momento para receber pets', default: true })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({ description: 'Experiência prévia com cuidados, medicação ou reabilitação' })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  experienceDetails?: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;
}

export class CreateFosterRequestDto {
  @ApiProperty({ description: 'ID do perfil de lar temporário escolhido' })
  @IsString()
  @IsNotEmpty()
  fosterProfileId: string;

  @ApiProperty({ description: 'ID da organização solicitante' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Detalhes do animal a ser acolhido (nome, espécie, condição de saúde)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  petDetails: string;

  @ApiProperty({ description: 'Data de início prevista para o acolhimento' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Estimativa de dias de acolhimento', example: 30 })
  @IsInt()
  @Min(1)
  estimatedDays: number;
}

