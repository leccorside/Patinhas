import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SaveFosterProfileDto, CreateFosterRequestDto } from './dto/foster.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FosterService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Obter meu perfil de lar temporário
  async getMyProfile(userId: string) {
    const profile = await this.prisma.fosterProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { fosterRequests: true },
        },
      },
    });

    return profile;
  }

  // 2. Salvar ou atualizar meu perfil de voluntário de Lar Temporário
  async saveProfile(userId: string, dto: SaveFosterProfileDto) {
    const profile = await this.prisma.fosterProfile.upsert({
      where: { userId },
      create: {
        userId,
        capacityPets: dto.capacityPets,
        acceptedSpecies: dto.acceptedSpecies,
        hasQuarantineSpace: dto.hasQuarantineSpace,
        isAvailable: dto.isAvailable,
        experienceDetails: dto.experienceDetails,
        city: dto.city,
        state: dto.state.toUpperCase(),
      },
      update: {
        capacityPets: dto.capacityPets,
        acceptedSpecies: dto.acceptedSpecies,
        hasQuarantineSpace: dto.hasQuarantineSpace,
        isAvailable: dto.isAvailable,
        experienceDetails: dto.experienceDetails,
        city: dto.city,
        state: dto.state.toUpperCase(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'FOSTER_PROFILE_UPDATED',
        resourceType: 'FOSTER_PROFILE',
        resourceId: profile.id,
        metadataJson: JSON.stringify({
          capacity: profile.capacityPets,
          isAvailable: profile.isAvailable,
          city: profile.city,
        }),
      },
    });

    return {
      message: 'Perfil de Lar Temporário salvo com sucesso! Obrigado pela sua dedicação voluntária. 🐾',
      profile,
    };
  }

  // 3. Buscar Lares Temporários disponíveis por cidade/espécie
  async getAvailableFosterHomes(city?: string, state?: string, species?: string) {
    const where: any = { isAvailable: true };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state.toUpperCase();
    if (species) where.acceptedSpecies = { contains: species };

    const homes = await this.prisma.fosterProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    return homes.map((h) => ({
      id: h.id,
      userId: h.userId,
      capacityPets: h.capacityPets,
      acceptedSpecies: h.acceptedSpecies.split(','),
      hasQuarantineSpace: h.hasQuarantineSpace,
      experienceDetails: h.experienceDetails,
      city: h.city,
      state: h.state,
      volunteerName: h.user.profile?.fullName || h.user.email.split('@')[0],
      volunteerAvatar: h.user.profile?.avatarUrl,
      contactPhone: h.user.profile?.phone || null,
      createdAt: h.createdAt,
    }));
  }

  // 4. Solicitar acolhimento temporário para uma ONG
  async createRequest(userId: string, userRole: UserRole, dto: CreateFosterRequestDto) {
    // Valida se o usuário é membro da ONG solicitante ou Master Admin
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
        throw new ForbiddenException('Apenas membros da organização podem solicitar acolhimento temporário.');
      }
    }

    const fosterProfile = await this.prisma.fosterProfile.findUnique({
      where: { id: dto.fosterProfileId },
    });

    if (!fosterProfile) {
      throw new NotFoundException('Perfil de Lar Temporário não encontrado.');
    }

    const request = await this.prisma.fosterRequest.create({
      data: {
        fosterProfileId: dto.fosterProfileId,
        organizationId: dto.organizationId,
        petDetails: dto.petDetails,
        startDate: new Date(dto.startDate),
        estimatedDays: dto.estimatedDays,
        status: 'PENDING',
      },
      include: {
        organization: { select: { id: true, name: true, logoUrl: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'FOSTER_REQUEST_SENT',
        resourceType: 'FOSTER_REQUEST',
        resourceId: request.id,
        metadataJson: JSON.stringify({
          fosterProfileId: dto.fosterProfileId,
          orgId: dto.organizationId,
          days: dto.estimatedDays,
        }),
      },
    });

    return {
      message: 'Solicitação de acolhimento temporário enviada ao voluntário!',
      request,
    };
  }

  // 5. Listar solicitações recebidas pelo voluntário de Lar Temporário
  async getMyRequests(userId: string) {
    const profile = await this.prisma.fosterProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    const requests = await this.prisma.fosterRequest.findMany({
      where: { fosterProfileId: profile.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            phone: true,
            addressCity: true,
            addressState: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  // 6. Responder a uma solicitação (Aceitar ou Recusar)
  async respondRequest(requestId: string, userId: string, status: 'ACCEPTED' | 'DECLINED') {
    const request = await this.prisma.fosterRequest.findUnique({
      where: { id: requestId },
      include: { fosterProfile: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitação de acolhimento não encontrada.');
    }

    if (request.fosterProfile.userId !== userId) {
      throw new ForbiddenException('Apenas o voluntário destinatário pode responder a esta solicitação.');
    }

    const updated = await this.prisma.fosterRequest.update({
      where: { id: requestId },
      data: { status },
    });

    return {
      message:
        status === 'ACCEPTED'
          ? '🎉 Acolhimento temporário aceito com sucesso! A ONG entrará em contato.'
          : 'Solicitação de acolhimento recusada.',
      request: updated,
    };
  }
}

