import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto, RegisterDonationDto } from './dto/campaign.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Criar Campanha de Arrecadação
  async create(userId: string, userRole: UserRole, dto: CreateCampaignDto) {
    if (userRole !== UserRole.MASTER_ADMIN) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: dto.organizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Apenas membros da organização podem criar campanhas de doação.');
      }
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        organizationId: dto.organizationId,
        title: dto.title,
        description: dto.description,
        goalAmountBrl: dto.goalAmountBrl,
        raisedAmountBrl: 0,
        pixKey: dto.pixKey,
        imageUrl: dto.imageUrl,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CAMPAIGN_CREATED',
        resourceType: 'CAMPAIGN',
        resourceId: campaign.id,
        metadataJson: JSON.stringify({
          title: campaign.title,
          goal: campaign.goalAmountBrl,
          orgId: campaign.organizationId,
        }),
      },
    });

    return campaign;
  }

  // 2. Listar Campanhas
  async findAll(activeOnly: boolean = true) {
    const where: any = {};
    if (activeOnly) where.isActive = true;

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verifiedStatus: true,
            addressCity: true,
            addressState: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    return campaigns.map((c) => {
      const progressPercent = Math.min(
        100,
        Math.round((c.raisedAmountBrl / c.goalAmountBrl) * 100),
      );
      return {
        ...c,
        progressPercent,
      };
    });
  }

  // 3. Obter Detalhes da Campanha
  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            logoUrl: true,
            phone: true,
            whatsapp: true,
            verifiedStatus: true,
            addressCity: true,
            addressState: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha de doação não encontrada.');
    }

    const progressPercent = Math.min(
      100,
      Math.round((campaign.raisedAmountBrl / campaign.goalAmountBrl) * 100),
    );

    return {
      ...campaign,
      progressPercent,
    };
  }

  // 4. Registrar Contribuição / Doação
  async registerDonation(campaignId: string, dto: RegisterDonationDto, userId?: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        raisedAmountBrl: { increment: dto.amount },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: 'DONATION_REGISTERED',
        resourceType: 'CAMPAIGN',
        resourceId: campaignId,
        metadataJson: JSON.stringify({
          amount: dto.amount,
          donor: dto.donorName || 'Anônimo',
          newTotal: updated.raisedAmountBrl,
        }),
      },
    });

    return {
      message: '🎉 Muito obrigado pela sua doação! Cada contribuição salva vidas.',
      campaign: {
        ...updated,
        progressPercent: Math.min(100, Math.round((updated.raisedAmountBrl / updated.goalAmountBrl) * 100)),
      },
    };
  }

  // 5. Alternar status (Ativar / Pausar)
  async toggleStatus(campaignId: string, userId: string, userRole: UserRole) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');

    if (userRole !== UserRole.MASTER_ADMIN) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: campaign.organizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Apenas membros da organização podem pausar esta campanha.');
      }
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { isActive: !campaign.isActive },
    });

    return {
      message: updated.isActive ? 'Campanha ativada!' : 'Campanha pausada!',
      campaign: updated,
    };
  }

  // 6. Remover Campanha
  async remove(campaignId: string, userId: string, userRole: UserRole) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');

    if (userRole !== UserRole.MASTER_ADMIN) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: campaign.organizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Apenas membros da organização podem excluir esta campanha.');
      }
    }

    await this.prisma.campaign.delete({ where: { id: campaignId } });

    return { message: 'Campanha excluída com sucesso.' };
  }
}
