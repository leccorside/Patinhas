import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitFollowUpFeedbackDto {
  @ApiPropertyOptional({ description: 'ID da adoção associada' })
  @IsOptional()
  @IsString()
  adoptionId?: string;

  @ApiProperty({ description: 'Período do acompanhamento', example: '15_DAYS', enum: ['15_DAYS', '30_DAYS', '90_DAYS', '6_MONTHS'] })
  @IsNotEmpty()
  @IsString()
  period: string;

  @ApiProperty({ description: 'Como está a adaptação do pet', example: 'Super tranquilo, já aprendeu onde fazer as necessidades e ama brincar de bolinha!' })
  @IsNotEmpty()
  @IsString()
  adaptationReport: string;

  @ApiPropertyOptional({ description: 'URL da foto atual do pet em seu novo lar' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Dificuldades ou dúvidas encontradas' })
  @IsOptional()
  @IsString()
  challenges?: string;
}

