import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface ConversationSummary {
  id: string;
  animalId: string;
  adopterId: string;
  hostUserId: string;
  lastMessageAt: string;
  createdAt: string;
  animal: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    photos: Array<{ id: string; url: string; isCover: boolean }>;
    organization?: {
      id: string;
      name: string;
      phone?: string | null;
      whatsapp?: string | null;
    } | null;
  };
  adopter: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
  host: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
  messages?: ChatMessage[];
}

let socket: Socket | null = null;

export const chatService = {
  /**
   * Inicializa o cliente Socket.IO sob o namespace /ws
   */
  getSocket(): Socket {
    if (!socket) {
      socket = io('/ws', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('[Socket.IO] Conectado ao chat em tempo real:', socket?.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Desconectado:', reason);
      });
    }
    return socket;
  },

  /**
   * Iniciar ou recuperar conversa para um animal
   */
  async getOrCreateConversation(animalId: string): Promise<ConversationSummary> {
    const res = await fetch('/api/v1/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ animalId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao iniciar conversa.');
    }
    return data;
  },

  /**
   * Listar todas as conversas do usuário logado
   */
  async getUserConversations(): Promise<ConversationSummary[]> {
    const res = await fetch('/api/v1/chat/conversations', {
      credentials: 'include',
    });

    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  /**
   * Obter histórico de mensagens de uma conversa
   */
  async getConversationMessages(conversationId: string): Promise<{
    conversation: ConversationSummary;
    messages: ChatMessage[];
  }> {
    const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao buscar mensagens da conversa.');
    }
    return data;
  },

  /**
   * Enviar mensagem via REST (garantia de fallback offline)
   */
  async sendMessageRest(
    conversationId: string,
    content: string,
    attachmentUrl?: string,
  ): Promise<ChatMessage> {
    const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, attachmentUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao enviar mensagem.');
    }
    return data;
  },

  /**
   * Upload de anexo de foto para o MinIO
   */
  async uploadAttachment(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/v1/chat/upload-attachment', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao fazer upload da imagem.');
    }
    return data;
  },

  /**
   * Entrar na sala WebSocket da conversa
   */
  joinRoom(conversationId: string) {
    const s = this.getSocket();
    s.emit('join_conversation', { conversationId });
  },

  /**
   * Sair da sala WebSocket da conversa
   */
  leaveRoom(conversationId: string) {
    const s = this.getSocket();
    s.emit('leave_conversation', { conversationId });
  },

  /**
   * Emitir indicador de digitação
   */
  emitTypingStart(conversationId: string, userName: string) {
    const s = this.getSocket();
    s.emit('typing_start', { conversationId, userName });
  },

  emitTypingStop(conversationId: string) {
    const s = this.getSocket();
    s.emit('typing_stop', { conversationId });
  },
};

