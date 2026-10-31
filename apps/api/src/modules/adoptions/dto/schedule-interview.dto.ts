import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleInterviewDto {
  @ApiProperty({ description: 'Data e horário da entrevista (ISO 8601)', example: '2026-11-05T15:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  interviewDate: string;

  @ApiPropertyOptional({ description: 'Orientações, link da videochamada ou local presencial' })
  @IsOptional()
  @IsString()
  observation?: string;
}

export class CompleteAdoptionDto {
  @ApiPropertyOptional({ description: 'Observações finais da adoção' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'URL do termo de responsabilidade assinado' })
  @IsOptional()
  @IsString()
  termsDocumentUrl?: string;
}

