import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'ID do animal sobre o qual a conversa será iniciada' })
  @IsString()
  @IsNotEmpty()
  animalId: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Conteúdo textual da mensagem' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'URL de imagem anexa (comprovante de residência, fotos do quintal, etc.)' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

