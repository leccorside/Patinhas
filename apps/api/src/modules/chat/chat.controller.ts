import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

@ApiTags('Chat e Mensagens')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly storageService: StorageService,
  ) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Iniciar ou obter conversa para um animal específico' })
  getOrCreateConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    return this.chatService.getOrCreateConversation(req.user.id, dto.animalId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar todas as conversas ativas do usuário' })
  findUserConversations(@Req() req: any) {
    return this.chatService.findUserConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obter histórico de mensagens de uma conversa' })
  getConversationMessages(@Req() req: any, @Param('id') id: string) {
    return this.chatService.getConversationMessages(id, req.user.id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Enviar mensagem de texto ou anexo via REST (fallback)' })
  sendMessage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.saveMessage(
      req.user.id,
      id,
      dto.content,
      dto.attachmentUrl,
    );
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Marcar mensagens da conversa como lidas' })
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.chatService.markAsRead(id, req.user.id);
  }

  @Post('upload-attachment')
  @ApiOperation({ summary: 'Fazer upload de anexo de foto/documento para a conversa' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile(file, 'chat');
  }
}

