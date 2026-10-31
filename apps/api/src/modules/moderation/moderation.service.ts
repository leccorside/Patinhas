import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReportDto, ResolveReportDto } from './dto/moderation.dto';
import {
  ReportStatus,
  ReportTargetType,
  UserStatus,
} from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Submeter Denúncia
  async createReport(reporterId: string, dto: CreateReportDto) {
    // Valida se o recurso denunciado existe
    if (dto.targetType === ReportTargetType.ANIMAL) {
      const animal = await this.prisma.animal.findUnique({ where: { id: dto.targetId } });
      if (!animal) throw new NotFoundException('Animal denunciado não encontrado');
    } else if (dto.targetType === ReportTargetType.USER) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.targetId } });
      if (!user) throw new NotFoundException('Usuário denunciado não encontrado');
      if (user.id === reporterId) throw new BadRequestException('Você não pode denunciar sua própria conta');
    } else if (dto.targetType === ReportTargetType.ORGANIZATION) {
      const org = await this.prisma.organization.findUnique({ where: { id: dto.targetId } });
      if (!org) throw new NotFoundException('Organização denunciada não encontrada');
    }

    // Cria a denúncia
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details,
        status: ReportStatus.PENDING,
      },
    });

    // Auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: reporterId,
        action: 'REPORT_SUBMITTED',
        resourceType: dto.targetType,
        resourceId: dto.targetId,
        metadataJson: JSON.stringify({
          reason: dto.reason,
          reportId: report.id,
        }),
      },
    });

    // Antifraude Preventivo Automático:
    // Se o alvo for um ANIMAL e atingir 3 ou mais denúncias pendentes, suspende o anúncio temporariamente
    let autoSuspended = false;
    if (dto.targetType === ReportTargetType.ANIMAL) {
      const pendingCount = await this.prisma.report.count({
        where: {
          targetType: ReportTargetType.ANIMAL,
          targetId: dto.targetId,
          status: ReportStatus.PENDING,
        },
      });

      if (pendingCount >= 3) {
        await this.prisma.animal.update({
          where: { id: dto.targetId },
          data: { status: 'UNAVAILABLE' },
        });

        autoSuspended = true;

        await this.prisma.auditLog.create({
          data: {
            userId: reporterId,
            action: 'ANIMAL_AUTO_SUSPENDED_ANTIFRAUD',
            resourceType: 'ANIMAL',
            resourceId: dto.targetId,
            metadataJson: JSON.stringify({
              reason: 'Limite de 3 denúncias atingido. Anúncio pausado para revisão humana.',
              pendingReportsCount: pendingCount,
            }),
          },
        });
      }
    }

    return {
      message: 'Denúncia recebida com sucesso. Nossa equipe de moderação irá avaliar com sigilo.',
      reportId: report.id,
      autoSuspended,
    };
  }

  // 2. Listar Denúncias para Moderação
  async getReports(status?: ReportStatus, targetType?: ReportTargetType) {
    const where: any = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        actions: {
          include: {
            moderator: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Enriquece com dados do alvo denunciado
    const enriched = await Promise.all(
      reports.map(async (r) => {
        let targetSummary: any = null;
        if (r.targetType === ReportTargetType.ANIMAL) {
          const a = await this.prisma.animal.findUnique({
            where: { id: r.targetId },
            select: { id: true, name: true, species: true, status: true },
          });
          targetSummary = a ? { name: a.name, species: a.species, status: a.status } : null;
        } else if (r.targetType === ReportTargetType.USER) {
          const u = await this.prisma.user.findUnique({
            where: { id: r.targetId },
            select: { id: true, email: true, status: true, profile: { select: { fullName: true } } },
          });
          targetSummary = u ? { name: u.profile?.fullName || u.email, email: u.email, status: u.status } : null;
        } else if (r.targetType === ReportTargetType.ORGANIZATION) {
          const o = await this.prisma.organization.findUnique({
            where: { id: r.targetId },
            select: { id: true, name: true, verifiedStatus: true },
          });
          targetSummary = o ? { name: o.name, verifiedStatus: o.verifiedStatus } : null;
        }

        return {
          id: r.id,
          targetType: r.targetType,
          targetId: r.targetId,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt,
          reporter: {
            id: r.reporter.id,
            email: r.reporter.email,
            name: r.reporter.profile?.fullName || r.reporter.email,
          },
          targetSummary,
          actions: r.actions.map((act) => ({
            id: act.id,
            actionTaken: act.actionTaken,
            notes: act.notes,
            createdAt: act.createdAt,
            moderatorName: act.moderator.profile?.fullName || act.moderator.email,
          })),
        };
      }),
    );

    return enriched;
  }

  // 3. Resolver Denúncia com Ação Disciplinar
  async resolveReport(reportId: string, moderatorId: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Denúncia não encontrada');

    // Registra ação do moderador
    await this.prisma.moderationAction.create({
      data: {
        reportId: report.id,
        moderatorId,
        actionTaken: dto.action,
        notes: dto.notes,
      },
    });

    // Atualiza status da denúncia
    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: dto.status as ReportStatus },
    });

    // Executa penalidade se aplicável
    if (dto.action === 'ACCOUNT_SUSPENDED') {
      let targetUserId = report.targetType === ReportTargetType.USER ? report.targetId : null;

      if (report.targetType === ReportTargetType.ANIMAL) {
        const animal = await this.prisma.animal.findUnique({
          where: { id: report.targetId },
          select: { protectorId: true },
        });
        if (animal?.protectorId) targetUserId = animal.protectorId;
      }

      if (targetUserId) {
        await this.prisma.user.update({
          where: { id: targetUserId },
          data: { status: UserStatus.SUSPENDED },
        });

        // Revoga sessões ativas do infrator
        await this.prisma.userSession.updateMany({
          where: { userId: targetUserId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } else if (dto.action === 'ANIMAL_REMOVED') {
      if (report.targetType === ReportTargetType.ANIMAL) {
        await this.prisma.animal.update({
          where: { id: report.targetId },
          data: { status: 'UNAVAILABLE' },
        });
      }
    }

    // Auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: `MODERATION_ACTION_${dto.action}`,
        resourceType: report.targetType,
        resourceId: report.targetId,
        metadataJson: JSON.stringify({
          reportId: report.id,
          action: dto.action,
          status: dto.status,
          notes: dto.notes,
        }),
      },
    });

    return {
      message: 'Denúncia resolvida e ação disciplinar registrada com sucesso.',
      report: updatedReport,
    };
  }

  // 4. Histórico de Ações Disciplinares
  async getModerationActions(limit: number = 30) {
    const actions = await this.prisma.moderationAction.findMany({
      include: {
        moderator: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        report: {
          select: {
            id: true,
            targetType: true,
            targetId: true,
            reason: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
    });

    return actions.map((act) => ({
      id: act.id,
      actionTaken: act.actionTaken,
      notes: act.notes,
      createdAt: act.createdAt,
      moderator: {
        id: act.moderator.id,
        email: act.moderator.email,
        name: act.moderator.profile?.fullName || act.moderator.email,
      },
      report: act.report,
    }));
  }
}

