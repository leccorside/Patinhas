import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token_de_recuperacao_recebido_por_email' })
  @IsString()
  @IsNotEmpty({ message: 'Token de recuperação é obrigatório' })
  token: string;

  @ApiProperty({ example: 'NovaSenhaSegura@2026', description: 'Nova senha' })
  @IsString()
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres' })
  newPassword: string;
}

