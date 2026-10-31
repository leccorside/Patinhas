import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        animal: {
          include: {
            photos: {
              orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
            },
            traits: true,
            healthRecord: true,
            organization: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verifiedStatus: true,
              },
            },
            protector: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return favorites.map((fav) => ({
      favoriteId: fav.id,
      favoritedAt: fav.createdAt,
      ...fav.animal,
    }));
  }

  async addFavorite(userId: string, animalId: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException('Animal não encontrado.');
    }

    const favorite = await this.prisma.favorite.upsert({
      where: {
        userId_animalId: {
          userId,
          animalId,
        },
      },
      create: {
        userId,
        animalId,
      },
      update: {},
    });

    return {
      success: true,
      message: `${animal.name} adicionado aos favoritos! ❤️`,
      favorite,
    };
  }

  async removeFavorite(userId: string, animalId: string) {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        animalId,
      },
    });

    return {
      success: true,
      message: 'Removido dos favoritos.',
    };
  }

  async getFavoriteIds(userId: string): Promise<string[]> {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      select: { animalId: true },
    });
    return favs.map((f) => f.animalId);
  }
}

