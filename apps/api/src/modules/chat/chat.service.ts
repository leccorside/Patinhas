import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inicia ou retorna a conversa existente para o adotante e o pet
   */
  async getOrCreateConversation(adopterId: string, animalId: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              take: 1,
            },
          },
        },
        protector: true,
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado.');
    }

    // Identificar o anfitrião responsável (host): protetor ou proprietário da ONG
    let hostUserId = animal.protectorId;
    if (!hostUserId && animal.organization?.members?.[0]) {
      hostUserId = animal.organization.members[0].userId;
    }

    if (!hostUserId) {
      // Fallback para o primeiro membro da ONG caso não haja protetor direto
      const anyMember = await this.prisma.organizationMember.findFirst({
        where: { organizationId: animal.organizationId || '' },
      });
      hostUserId = anyMember?.userId || null;
    }

    if (!hostUserId) {
      throw new BadRequestException('Não foi possível identificar o responsável por este animal para abrir o chat.');
    }

    if (adopterId === hostUserId) {
      throw new BadRequestException('Você é o responsável pelo cadastro deste animal.');
    }

    // Busca conversa existente
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        animalId_adopterId: {
          animalId,
          adopterId,
        },
      },
      include: {
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' }, take: 1 },
            organization: true,
          },
        },
        adopter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        host: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          animalId,
          adopterId,
          hostUserId,
        },
        include: {
          animal: {
            include: {
              photos: { orderBy: { isCover: 'desc' }, take: 1 },
              organization: true,
            },
          },
          adopter: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          host: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });
    }

    return conversation;
  }

  /**
   * Listar todas as conversas ativas do usuário (como adotante ou como host)
   */
  async findUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ adopterId: userId }, { hostUserId: userId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' }, take: 1 },
            organization: true,
          },
        },
        adopter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        host: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Obter histórico de mensagens de uma conversa com marcação de leitura automática
   */
  async getConversationMessages(conversationId: string, userId: string, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' }, take: 1 },
            organization: true,
          },
        },
        adopter: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        host: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    if (conversation.adopterId !== userId && conversation.hostUserId !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta conversa.');
    }

    // Marca mensagens recebidas como lidas
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        attachments: true,
      },
    });

    return {
      conversation,
      messages,
    };
  }

  /**
   * Salvar e persistir uma nova mensagem no banco
   */
  async saveMessage(senderId: string, conversationId: string, content: string, attachmentUrl?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    if (conversation.adopterId !== senderId && conversation.hostUserId !== senderId) {
      throw new ForbiddenException('Você não pertence a esta conversa.');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
          attachmentUrl,
          attachments: attachmentUrl
            ? {
                create: {
                  url: attachmentUrl,
                  fileType: 'IMAGE',
                },
              }
            : undefined,
        },
        include: {
          sender: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          attachments: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
        },
      });

      return msg;
    });

    return message;
  }

  /**
   * Marcar mensagens como lidas
   */
  async markAsRead(conversationId: string, userId: string) {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
