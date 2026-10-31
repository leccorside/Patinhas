import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdoptionApplicationStatus } from '@prisma/client';

export class UpdateAdoptionStatusDto {
  @ApiProperty({ enum: AdoptionApplicationStatus })
  @IsEnum(AdoptionApplicationStatus)
  status: AdoptionApplicationStatus;

  @ApiPropertyOptional({ description: 'Observação explicativa sobre a transição de status' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({ description: 'Motivo detalhado em caso de rejeição' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

