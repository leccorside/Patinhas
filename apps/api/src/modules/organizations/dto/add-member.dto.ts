import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationMemberRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ example: 'voluntario@exemplo.com', description: 'E-mail do usuário a ser adicionado à equipe' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @ApiProperty({ enum: OrganizationMemberRole, default: OrganizationMemberRole.VOLUNTEER })
  @IsEnum(OrganizationMemberRole, { message: 'Papel do membro inválido' })
  role: OrganizationMemberRole;
}

