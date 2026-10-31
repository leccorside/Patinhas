import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const user = this.authenticateSocket(socket);
      if (!user) {
        this.logger.warn(`Conexão WebSocket rejeitada: token ausente ou inválido (${socket.id})`);
        socket.disconnect();
        return;
      }

      socket.data.user = user;
      this.logger.log(`Cliente WebSocket autenticado: ${user.email} (${socket.id})`);
    } catch (err: any) {
      this.logger.error(`Erro ao autenticar socket: ${err.message}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Cliente WebSocket desconectado: ${socket.id}`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const room = `conv_${data.conversationId}`;
    socket.join(room);
    this.logger.log(`Usuário ${socket.data.user?.email || socket.id} entrou na sala ${room}`);
    return { event: 'joined', conversationId: data.conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const room = `conv_${data.conversationId}`;
    socket.leave(room);
    this.logger.log(`Usuário ${socket.data.user?.email || socket.id} saiu da sala ${room}`);
    return { event: 'left', conversationId: data.conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      attachmentUrl?: string;
    },
  ) {
    const userId = socket.data.user?.sub || socket.data.user?.id;
    if (!userId) {
      return { error: 'Não autenticado' };
    }

    try {
      const message = await this.chatService.saveMessage(
        userId,
        data.conversationId,
        data.content,
        data.attachmentUrl,
      );

      const room = `conv_${data.conversationId}`;
      this.server.to(room).emit('receive_message', message);

      return { status: 'sent', messageId: message.id };
    } catch (err: any) {
      return { error: err.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string; userName: string },
  ) {
    const room = `conv_${data.conversationId}`;
    socket.to(room).emit('user_typing_start', {
      conversationId: data.conversationId,
      userId: socket.data.user?.sub,
      userName: data.userName,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const room = `conv_${data.conversationId}`;
    socket.to(room).emit('user_typing_stop', {
      conversationId: data.conversationId,
      userId: socket.data.user?.sub,
    });
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = socket.data.user?.sub || socket.data.user?.id;
    if (userId) {
      await this.chatService.markAsRead(data.conversationId, userId);
      const room = `conv_${data.conversationId}`;
      socket.to(room).emit('messages_read', {
        conversationId: data.conversationId,
        readByUserId: userId,
      });
    }
  }

  /**
   * Helper para extrair e validar JWT dos cookies ou headers de conexão
   */
  private authenticateSocket(socket: Socket): any {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    // Se não encontrou no header, busca no cookie
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie
        .split(';')
        .map((c) => c.trim())
        .reduce((acc: any, curr) => {
          const [key, val] = curr.split('=');
          acc[key] = val;
          return acc;
        }, {});
      token = cookies['access_token'];
    }

    if (!token) return null;

    try {
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_access_key_change_in_production_min32chars';
      return this.jwtService.verify(token, { secret });
    } catch {
      return null;
    }
  }
}
