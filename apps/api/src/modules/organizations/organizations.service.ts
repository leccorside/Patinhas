import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { OrganizationMemberRole, OrganizationVerificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, dto.cnpj ? { cnpj: dto.cnpj } : {}],
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma organização cadastrada com este e-mail ou CNPJ.');
    }

    const { latitude, longitude, ...restData } = dto;

    const organization = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          ...restData,
          email: dto.email.toLowerCase(),
          latitude,
          longitude,
          verifiedStatus: OrganizationVerificationStatus.UNVERIFIED,
          members: {
            create: {
              userId,
              role: OrganizationMemberRole.OWNER,
            },
          },
        },
      });

      // Atualiza o papel do criador para SHELTER_MEMBER se for ADOPTER
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.SHELTER_MEMBER },
      });

      return org;
    });

    // Atualiza coordenada PostGIS
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await this.prisma.$executeRawUnsafe(`
        UPDATE organizations
        SET location_geom = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = '${organization.id}';
      `);
    }

    return {
      message: 'Organização cadastrada com sucesso! Ela passará por verificação institucional.',
      organization,
    };
  }

  async findAll(city?: string, state?: string, verifiedOnly?: boolean) {
    return this.prisma.organization.findMany({
      where: {
        deletedAt: null,
        addressCity: city ? { contains: city, mode: 'insensitive' } : undefined,
        addressState: state ? { equals: state.toUpperCase() } : undefined,
        verifiedStatus: verifiedOnly ? OrganizationVerificationStatus.VERIFIED : undefined,
      },
      include: {
        _count: {
          select: {
            animals: { where: { status: 'AVAILABLE' } },
            events: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: { fullName: true, avatarUrl: true },
                },
              },
            },
          },
        },
        animals: {
          where: { status: 'AVAILABLE' },
          include: { photos: { where: { isCover: true }, take: 1 } },
          take: 6,
        },
        events: {
          where: { eventDate: { gte: new Date() } },
          take: 3,
        },
      },
    });

    if (!org || org.deletedAt) {
      throw new NotFoundException('Organização não encontrada');
    }

    return org;
  }

  async update(orgId: string, userId: string, userRole: UserRole, dto: UpdateOrganizationDto) {
    await this.checkUserPermission(orgId, userId, userRole);

    const { latitude, longitude, ...restData } = dto;

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...restData,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      },
    });

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await this.prisma.$executeRawUnsafe(`
        UPDATE organizations
        SET location_geom = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = '${orgId}';
      `);
    }

    return {
      message: 'Informações da organização atualizadas com sucesso!',
      organization: updated,
    };
  }

  async uploadLogo(orgId: string, userId: string, userRole: UserRole, file: Express.Multer.File) {
    await this.checkUserPermission(orgId, userId, userRole);

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (org?.logoUrl) {
      await this.storageService.deleteFile(org.logoUrl);
    }

    const logoUrl = await this.storageService.uploadFile(file, 'organizations/logos');

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: { logoUrl },
    });

    return {
      message: 'Logotipo atualizado com sucesso!',
      logoUrl: updated.logoUrl,
    };
  }

  async addMember(orgId: string, userId: string, userRole: UserRole, dto: AddMemberDto) {
    await this.checkUserPermission(orgId, userId, userRole);

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!targetUser) {
      throw new NotFoundException(`Nenhum usuário cadastrado com o e-mail '${dto.email}'`);
    }

    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('Este usuário já faz parte da equipe desta organização.');
    }

    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: targetUser.id,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    return {
      message: 'Membro adicionado à equipe com sucesso!',
      member,
    };
  }

  async removeMember(orgId: string, targetUserId: string, userId: string, userRole: UserRole) {
    await this.checkUserPermission(orgId, userId, userRole);

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado nesta organização');
    }

    if (member.role === OrganizationMemberRole.OWNER) {
      throw new BadRequestException('Não é possível remover o proprietário da organização.');
    }

    await this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: targetUserId,
        },
      },
    });

    return { message: 'Membro removido da equipe com sucesso.' };
  }

  // Obter organizações vinculadas ao usuário logado
  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                animals: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      organization: m.organization,
      myRole: m.role,
      joinedAt: m.createdAt,
    }));
  }

  // Obter métricas consolidadas do Dashboard da ONG
  async getDashboard(orgId: string, userId: string, userRole: UserRole) {
    // Permissão: qualquer membro ativo da ONG ou MASTER_ADMIN
    if (userRole !== UserRole.MASTER_ADMIN) {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId,
          },
        },
      });

      if (!member) {
        throw new ForbiddenException('Acesso não autorizado aos dados operacionais desta organização.');
      }
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: { fullName: true, avatarUrl: true, phone: true },
                },
              },
            },
          },
        },
      },
    });

    if (!org || org.deletedAt) {
      throw new NotFoundException('Organização não encontrada');
    }

    // 1. Estatísticas dos Animais
    const animalsStats = await this.prisma.animal.groupBy({
      by: ['status'],
      where: { organizationId: orgId, deletedAt: null },
      _count: { _all: true },
    });

    let totalAnimals = 0;
    let availableAnimals = 0;
    let inAdoptionAnimals = 0;
    let adoptedAnimals = 0;
    let specialCareAnimals = 0;

    for (const stat of animalsStats) {
      totalAnimals += stat._count._all;
      if (stat.status === 'AVAILABLE') availableAnimals += stat._count._all;
      else if (stat.status === 'IN_ADOPTION') inAdoptionAnimals += stat._count._all;
      else if (stat.status === 'ADOPTED') adoptedAnimals += stat._count._all;
      else if (stat.status === 'UNAVAILABLE' || stat.status === 'PENDING_REVIEW') {
        specialCareAnimals += stat._count._all;
      }
    }

    // 2. Estatísticas das Candidaturas de Adoção
    const applicationsStats = await this.prisma.adoptionApplication.groupBy({
      by: ['currentStatus'],
      where: {
        animal: {
          organizationId: orgId,
        },
      },
      _count: { _all: true },
    });

    let totalApplications = 0;
    let pendingApplications = 0;
    let interviewApplications = 0;
    let approvedApplications = 0;
    let completedApplications = 0;
    let rejectedApplications = 0;

    for (const stat of applicationsStats) {
      totalApplications += stat._count._all;
      if (stat.currentStatus === 'SUBMITTED' || stat.currentStatus === 'UNDER_REVIEW') {
        pendingApplications += stat._count._all;
      } else if (stat.currentStatus === 'INTERVIEW_SCHEDULED') {
        interviewApplications += stat._count._all;
      } else if (stat.currentStatus === 'APPROVED') {
        approvedApplications += stat._count._all;
      } else if (stat.currentStatus === 'COMPLETED') {
        completedApplications += stat._count._all;
      } else if (stat.currentStatus === 'REJECTED') {
        rejectedApplications += stat._count._all;
      }
    }

    // Taxa de conversão: completadas sobre total finalizadas (completas + rejeitadas)
    const finalized = completedApplications + rejectedApplications;
    const conversionRate = finalized > 0 ? Math.round((completedApplications / finalized) * 100) : 100;

    // 3. Candidaturas Recentes que demandam atenção imediata (SUBMITTED, UNDER_REVIEW, INTERVIEW_SCHEDULED)
    const pendingActions = await this.prisma.adoptionApplication.findMany({
      where: {
        animal: { organizationId: orgId },
        currentStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'] },
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photos: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
        adopter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                addressCity: true,
                addressState: true,
                phone: true,
              },
            },
          },
        },
        questionnaire: {
          select: {
            housingType: true,
            hasNettingScreens: true,
            hasOtherPets: true,
            monthlyBudgetBrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // 4. Animais mais recentes sob cuidado da ONG
    const recentAnimals = await this.prisma.animal.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        photos: { where: { isCover: true }, take: 1, select: { url: true } },
        _count: {
          select: {
            adoptionApplications: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return {
      organization: {
        id: org.id,
        name: org.name,
        tradeName: org.tradeName,
        logoUrl: org.logoUrl,
        verifiedStatus: org.verifiedStatus,
        city: org.addressCity,
        state: org.addressState,
        membersCount: org.members.length,
      },
      metrics: {
        totalAnimals,
        availableAnimals,
        inAdoptionAnimals,
        adoptedAnimals,
        specialCareAnimals,
        totalApplications,
        pendingApplications,
        interviewApplications,
        approvedApplications,
        completedApplications,
        conversionRate,
      },
      pendingActions,
      recentAnimals,
      members: org.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        fullName: m.user.profile?.fullName || m.user.email,
        email: m.user.email,
        avatarUrl: m.user.profile?.avatarUrl,
        phone: m.user.profile?.phone,
        joinedAt: m.createdAt,
      })),
    };
  }

  // Validador de permissão (Master Admin ou Membro Owner/Admin da ONG)
  private async checkUserPermission(orgId: string, userId: string, userRole: UserRole) {
    if (userRole === UserRole.MASTER_ADMIN) {
      return true;
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (!member || (member.role !== OrganizationMemberRole.OWNER && member.role !== OrganizationMemberRole.ADMIN)) {
      throw new ForbiddenException('Apenas proprietários ou administradores da ONG podem realizar esta ação.');
    }

    return true;
  }
}

