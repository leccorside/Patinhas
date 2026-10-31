import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  UserRole,
  UserStatus,
  OrganizationVerificationStatus,
} from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Visão Geral e Métricas Globais da Plataforma
  async getOverview() {
    // Usuários
    const [
      totalUsers,
      adoptersCount,
      shelterMembersCount,
      protectorsCount,
      activeUsersCount,
      suspendedUsersCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: UserRole.ADOPTER, deletedAt: null } }),
      this.prisma.user.count({ where: { role: UserRole.SHELTER_MEMBER, deletedAt: null } }),
      this.prisma.user.count({ where: { role: UserRole.PROTECTOR, deletedAt: null } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE, deletedAt: null } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED, deletedAt: null } }),
    ]);

    // Organizações (ONGs)
    const [
      totalOrgs,
      verifiedOrgsCount,
      pendingApprovalOrgsCount,
      unverifiedOrgsCount,
    ] = await Promise.all([
      this.prisma.organization.count({ where: { deletedAt: null } }),
      this.prisma.organization.count({
        where: { verifiedStatus: OrganizationVerificationStatus.VERIFIED, deletedAt: null },
      }),
      this.prisma.organization.count({
        where: { verifiedStatus: OrganizationVerificationStatus.PENDING_APPROVAL, deletedAt: null },
      }),
      this.prisma.organization.count({
        where: { verifiedStatus: OrganizationVerificationStatus.UNVERIFIED, deletedAt: null },
      }),
    ]);

    // Animais
    const [
      totalAnimals,
      availableAnimalsCount,
      inAdoptionAnimalsCount,
      adoptedAnimalsCount,
    ] = await Promise.all([
      this.prisma.animal.count({ where: { deletedAt: null } }),
      this.prisma.animal.count({ where: { status: 'AVAILABLE', deletedAt: null } }),
      this.prisma.animal.count({ where: { status: 'IN_ADOPTION', deletedAt: null } }),
      this.prisma.animal.count({ where: { status: 'ADOPTED', deletedAt: null } }),
    ]);

    // Processos de Adoção
    const [
      totalApplications,
      completedAdoptionsCount,
      pendingApplicationsCount,
    ] = await Promise.all([
      this.prisma.adoptionApplication.count(),
      this.prisma.adoptionApplication.count({ where: { currentStatus: 'COMPLETED' } }),
      this.prisma.adoptionApplication.count({
        where: { currentStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'] } },
      }),
    ]);

    // Denúncias
    const [
      totalReports,
      pendingReportsCount,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        adopters: adoptersCount,
        shelterMembers: shelterMembersCount,
        protectors: protectorsCount,
        active: activeUsersCount,
        suspended: suspendedUsersCount,
      },
      organizations: {
        total: totalOrgs,
        verified: verifiedOrgsCount,
        pendingApproval: pendingApprovalOrgsCount,
        unverified: unverifiedOrgsCount,
      },
      animals: {
        total: totalAnimals,
        available: availableAnimalsCount,
        inAdoption: inAdoptionAnimalsCount,
        adopted: adoptedAnimalsCount,
      },
      adoptions: {
        total: totalApplications,
        completed: completedAdoptionsCount,
        pending: pendingApplicationsCount,
      },
      reports: {
        total: totalReports,
        pending: pendingReportsCount,
      },
    };
  }

  // 2. Listagem de ONGs com filtros e busca
  async getOrganizations(status?: OrganizationVerificationStatus, search?: string) {
    const where: any = { deletedAt: null };

    if (status) {
      where.verifiedStatus = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { addressCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    const organizations = await this.prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            animals: true,
            members: true,
          },
        },
        members: {
          where: { role: 'OWNER' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, phone: true } },
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      tradeName: org.tradeName,
      cnpj: org.cnpj,
      email: org.email,
      phone: org.phone,
      whatsapp: org.whatsapp,
      logoUrl: org.logoUrl,
      verifiedStatus: org.verifiedStatus,
      verifiedAt: org.verifiedAt,
      city: org.addressCity,
      state: org.addressState,
      totalAnimals: org._count.animals,
      totalMembers: org._count.members,
      owner: org.members[0]?.user
        ? {
            id: org.members[0].user.id,
            email: org.members[0].user.email,
            name: org.members[0].user.profile?.fullName || org.members[0].user.email,
            phone: org.members[0].user.profile?.phone,
          }
        : null,
      createdAt: org.createdAt,
    }));
  }

  // 3. Verificação Manual de ONG (Aprovação / Rejeição)
  async updateOrganizationVerification(
    orgId: string,
    status: OrganizationVerificationStatus,
    adminUserId: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        verifiedStatus: status,
        verifiedAt: status === OrganizationVerificationStatus.VERIFIED ? new Date() : null,
      },
    });

    // Registra na auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `ORGANIZATION_VERIFICATION_${status}`,
        resourceType: 'ORGANIZATION',
        resourceId: orgId,
        metadataJson: JSON.stringify({
          previousStatus: org.verifiedStatus,
          newStatus: status,
          orgName: org.name,
        }),
      },
    });

    return {
      message: `Status da organização atualizado para ${status}`,
      organization: updated,
    };
  }

  // 4. Listagem e Moderação de Usuários
  async getUsers(search?: string, role?: UserRole, status?: UserStatus) {
    const where: any = { deletedAt: null };

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerifiedAt: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
            addressCity: true,
            addressState: true,
            phone: true,
          },
        },
        _count: {
          select: {
            animalsProtected: true,
            adoptionApplications: true,
            reportsSubmitted: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      fullName: u.profile?.fullName || u.email.split('@')[0],
      avatarUrl: u.profile?.avatarUrl,
      city: u.profile?.addressCity,
      state: u.profile?.addressState,
      phone: u.profile?.phone,
      isEmailVerified: Boolean(u.emailVerifiedAt),
      animalsCount: u._count.animalsProtected,
      applicationsCount: u._count.adoptionApplications,
      reportsCount: u._count.reportsSubmitted,
      createdAt: u.createdAt,
    }));
  }

  // 5. Atualizar Status do Usuário (Ativar / Suspender)
  async updateUserStatus(
    userId: string,
    status: UserStatus,
    adminUserId: string,
    reason?: string,
  ) {
    if (userId === adminUserId) {
      throw new BadRequestException('Um administrador não pode alterar o próprio status de conta.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Se suspenso, revoga todas as sessões ativas imediatamente
    if (status === UserStatus.SUSPENDED) {
      await this.prisma.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Registra na auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `USER_STATUS_${status}`,
        resourceType: 'USER',
        resourceId: userId,
        metadataJson: JSON.stringify({
          previousStatus: targetUser.status,
          newStatus: status,
          reason,
        }),
      },
    });

    return {
      message: `Status do usuário atualizado para ${status}`,
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    };
  }

  // 6. Consultar Logs de Auditoria
  async getAuditLogs(limit: number = 30) {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadataJson ? JSON.parse(log.metadataJson) : null,
      createdAt: log.createdAt,
      executor: log.user
        ? {
            id: log.user.id,
            email: log.user.email,
            name: log.user.profile?.fullName || log.user.email,
            role: log.user.role,
          }
        : null,
    }));
  }
}
