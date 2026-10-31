import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportTargetType } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({ enum: ReportTargetType, description: 'Tipo do recurso denunciado' })
  @IsEnum(ReportTargetType)
  @IsNotEmpty()
  targetType: ReportTargetType;

  @ApiProperty({ description: 'ID do recurso denunciado (animal, usuário, ONG ou mensagem)' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ description: 'Motivo da denúncia', example: 'Venda ilegal de filhotes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  reason: string;

  @ApiPropertyOptional({ description: 'Detalhes adicionais e observações' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}

export class ResolveReportDto {
  @ApiProperty({
    enum: ['ACCOUNT_SUSPENDED', 'ANIMAL_REMOVED', 'WARNING_ISSUED', 'DISMISSED'],
    description: 'Ação disciplinar executada',
  })
  @IsString()
  @IsNotEmpty()
  action: 'ACCOUNT_SUSPENDED' | 'ANIMAL_REMOVED' | 'WARNING_ISSUED' | 'DISMISSED';

  @ApiProperty({
    enum: ['INVESTIGATING', 'RESOLVED', 'DISMISSED'],
    description: 'Novo status da denúncia',
  })
  @IsString()
  @IsNotEmpty()
  status: 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

  @ApiPropertyOptional({ description: 'Notas internas do moderador' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
