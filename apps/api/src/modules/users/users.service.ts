import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                tradeName: true,
                verifiedStatus: true,
                logoUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
            adoptionApplications: true,
            animalsProtected: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: Boolean(user.emailVerifiedAt),
      createdAt: user.createdAt,
      profile: user.profile,
      organizations: user.memberships.map((m) => ({
        ...m.organization,
        role: m.role,
      })),
      stats: {
        favoritesCount: user._count.favorites,
        applicationsCount: user._count.adoptionApplications,
        protectedAnimalsCount: user._count.animalsProtected,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { birthDate, latitude, longitude, ...restData } = dto;

    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...restData,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      },
      create: {
        userId,
        fullName: dto.fullName || user.email.split('@')[0],
        ...restData,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      },
    });

    // Se coordenadas foram fornecidas, atualiza o campo geométrico PostGIS
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await this.prisma.$executeRawUnsafe(`
        UPDATE user_profiles
        SET location_geom = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE user_id = '${userId}';
      `);
    }

    return {
      message: 'Perfil atualizado com sucesso!',
      profile: updatedProfile,
    };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    // Se já havia um avatar anterior no MinIO, remove para liberar espaço
    if (profile?.avatarUrl) {
      await this.storageService.deleteFile(profile.avatarUrl);
    }

    // Faz upload seguro para a pasta avatars no MinIO
    const avatarUrl = await this.storageService.uploadFile(file, 'avatars');

    const updated = await this.prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl },
    });

    return {
      message: 'Foto de perfil atualizada com sucesso!',
      avatarUrl: updated.avatarUrl,
    };
  }
}

