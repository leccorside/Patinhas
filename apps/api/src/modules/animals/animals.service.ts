import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { FilterAnimalsDto } from './dto/filter-animals.dto';
import { AnimalStatus, Prisma } from '@prisma/client';

@Injectable()
export class AnimalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Aplica um ruído de privacidade (~200 a 400 metros) às coordenadas para proteger o endereço exato do animal.
   */
  private applyLocationJitter(coord: number): number {
    const jitter = (Math.random() - 0.5) * 0.004; // ~ ±200m
    return Number((coord + jitter).toFixed(6));
  }

  async create(userId: string, dto: CreateAnimalDto) {
    // Se for associado a uma organização, valida se o usuário é membro dela
    if (dto.organizationId) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: dto.organizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'Você não tem permissão para cadastrar animais nesta organização.',
        );
      }
    }

    const approximateLat = dto.latitude ? this.applyLocationJitter(dto.latitude) : null;
    const approximateLon = dto.longitude ? this.applyLocationJitter(dto.longitude) : null;

    const animal = await this.prisma.$transaction(async (tx) => {
      const created = await tx.animal.create({
        data: {
          name: dto.name,
          species: dto.species,
          breed: dto.breed,
          ageApproximate: dto.ageApproximate,
          ageUnit: dto.ageUnit,
          sex: dto.sex,
          size: dto.size,
          weightKg: dto.weightKg,
          coatColor: dto.coatColor,
          description: dto.description,
          adoptionRequirements: dto.adoptionRequirements,
          isSpecialNeeds: dto.isSpecialNeeds ?? false,
          specialNeedsDescription: dto.specialNeedsDescription,
          compatibilityDogs: dto.compatibilityDogs ?? true,
          compatibilityCats: dto.compatibilityCats ?? true,
          compatibilityChildren: dto.compatibilityChildren ?? true,
          energyLevel: dto.energyLevel,
          city: dto.city,
          state: dto.state,
          latitude: approximateLat,
          longitude: approximateLon,
          protectorId: userId,
          organizationId: dto.organizationId,
          status: AnimalStatus.AVAILABLE,
          healthRecord: dto.healthRecord
            ? {
                create: {
                  isVaccinated: dto.healthRecord.isVaccinated ?? false,
                  vaccinationDetails: dto.healthRecord.vaccinationDetails,
                  isNeutered: dto.healthRecord.isNeutered ?? false,
                  isDewormed: dto.healthRecord.isDewormed ?? false,
                  medicalNotes: dto.healthRecord.medicalNotes,
                },
              }
            : undefined,
          traits: dto.traits?.length
            ? {
                createMany: {
                  data: dto.traits.map((name) => ({ name })),
                },
              }
            : undefined,
          photos: dto.photos?.length
            ? {
                createMany: {
                  data: dto.photos.map((p, idx) => ({
                    url: p.url,
                    thumbnailUrl: p.thumbnailUrl || p.url,
                    displayOrder: p.displayOrder ?? idx,
                    isCover: p.isCover ?? idx === 0,
                  })),
                },
              }
            : undefined,
        },
        include: {
          healthRecord: true,
          traits: true,
          photos: true,
          organization: {
            select: {
              id: true,
              name: true,
              verifiedStatus: true,
              logoUrl: true,
            },
          },
        },
      });

      // Atualiza a geometria PostGIS
      if (approximateLat && approximateLon) {
        await tx.$executeRawUnsafe(
          `UPDATE animals 
           SET location_geom = ST_SetSRID(ST_MakePoint($1, $2), 4326) 
           WHERE id = $3`,
          approximateLon,
          approximateLat,
          created.id,
        );
      }

      return created;
    });

    return animal;
  }

  async findAll(filter: FilterAnimalsDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AnimalWhereInput = {
      deletedAt: null,
      status: filter.status || AnimalStatus.AVAILABLE,
    };

    if (filter.species) where.species = filter.species;
    if (filter.sex) where.sex = filter.sex;
    if (filter.size) where.size = filter.size;
    if (filter.energyLevel) where.energyLevel = filter.energyLevel;
    if (filter.organizationId) where.organizationId = filter.organizationId;

    if (filter.city) {
      where.city = { contains: filter.city, mode: 'insensitive' };
    }
    if (filter.state) {
      where.state = { equals: filter.state, mode: 'insensitive' };
    }
    if (filter.isSpecialNeeds !== undefined) {
      where.isSpecialNeeds = filter.isSpecialNeeds;
    }
    if (filter.compatibilityDogs !== undefined) {
      where.compatibilityDogs = filter.compatibilityDogs;
    }
    if (filter.compatibilityCats !== undefined) {
      where.compatibilityCats = filter.compatibilityCats;
    }
    if (filter.compatibilityChildren !== undefined) {
      where.compatibilityChildren = filter.compatibilityChildren;
    }

    if (filter.isPuppy) {
      where.OR = [
        { ageUnit: 'MONTHS' },
        { ageApproximate: { lte: 1 }, ageUnit: 'YEARS' },
      ];
    }

    if (filter.isVaccinated !== undefined || filter.isNeutered !== undefined) {
      where.healthRecord = {};
      if (filter.isVaccinated !== undefined) {
        where.healthRecord.isVaccinated = filter.isVaccinated;
      }
      if (filter.isNeutered !== undefined) {
        where.healthRecord.isNeutered = filter.isNeutered;
      }
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { breed: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { city: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [total, animals] = await Promise.all([
      this.prisma.animal.count({ where }),
      this.prisma.animal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);

    // Se coordenadas do usuário foram fornecidas, calcula distância em km
    let items = animals.map((animal) => {
      let distanceKm: number | null = null;
      if (
        filter.userLat &&
        filter.userLon &&
        animal.latitude &&
        animal.longitude
      ) {
        distanceKm = this.calculateDistanceKm(
          filter.userLat,
          filter.userLon,
          animal.latitude,
          animal.longitude,
        );
      }

      return {
        ...animal,
        distanceKm,
      };
    });

    if (filter.maxDistanceKm && filter.userLat && filter.userLon) {
      items = items.filter(
        (item) => item.distanceKm !== null && item.distanceKm <= filter.maxDistanceKm!,
      );
    }

    return {
      data: items,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  async getSuccessStories() {
    return [
      {
        id: 'story-1',
        petName: 'Frederico',
        breed: 'Terrier Mix',
        adopterName: 'Carlos Mendonça',
        city: 'São Paulo - SP',
        daysAgo: 21,
        testimonial:
          'Depois de 6 meses no abrigo, o Frederico agora tem uma cama quentinha e corre no parque todo sábado comigo!',
        photoBefore:
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        photoAfter:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'story-2',
        petName: 'Barthô',
        breed: 'Vira-Lata Caramelo',
        adopterName: 'Mariana & Roberto',
        city: 'Campinas - SP',
        daysAgo: 45,
        testimonial:
          'O Barthô foi resgatado de uma rodovia assustado. Hoje é o rei do sofá e melhor amigo da nossa filha.',
        photoBefore:
          'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80',
        photoAfter:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'story-3',
        petName: 'Mia',
        breed: 'Gata Sialata',
        adopterName: 'Juliana Costa',
        city: 'São Bernardo do Campo - SP',
        daysAgo: 14,
        testimonial:
          'Adotei a Mia pelo app Patinhas em menos de uma semana. O processo foi transparente, ético e cheio de carinho.',
        photoBefore:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        photoAfter:
          'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
      },
    ];
  }

  async findOne(id: string, userLat?: number, userLon?: number) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
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
            tradeName: true,
            email: true,
            phone: true,
            whatsapp: true,
            bio: true,
            logoUrl: true,
            verifiedStatus: true,
            addressCity: true,
            addressState: true,
          },
        },
        protector: {
          select: {
            id: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                phone: true,
                addressCity: true,
                addressState: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
            adoptionApplications: true,
          },
        },
      },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException('Animal não encontrado.');
    }

    // Incrementa contagem de visualizações de forma assíncrona
    this.prisma.animal
      .update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    let distanceKm: number | null = null;
    if (userLat && userLon && animal.latitude && animal.longitude) {
      distanceKm = this.calculateDistanceKm(
        userLat,
        userLon,
        animal.latitude,
        animal.longitude,
      );
    }

    return {
      ...animal,
      distanceKm,
    };
  }

  async update(id: string, userId: string, dto: UpdateAnimalDto) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException('Animal não encontrado.');
    }

    // Verifica permissão (tutor direto ou admin da organização)
    await this.checkPermission(animal, userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.animal.update({
        where: { id },
        data: {
          name: dto.name,
          species: dto.species,
          breed: dto.breed,
          ageApproximate: dto.ageApproximate,
          ageUnit: dto.ageUnit,
          sex: dto.sex,
          size: dto.size,
          weightKg: dto.weightKg,
          coatColor: dto.coatColor,
          description: dto.description,
          adoptionRequirements: dto.adoptionRequirements,
          isSpecialNeeds: dto.isSpecialNeeds,
          specialNeedsDescription: dto.specialNeedsDescription,
          compatibilityDogs: dto.compatibilityDogs,
          compatibilityCats: dto.compatibilityCats,
          compatibilityChildren: dto.compatibilityChildren,
          energyLevel: dto.energyLevel,
          city: dto.city,
          state: dto.state,
          status: dto.status,
          healthRecord: dto.healthRecord
            ? {
                upsert: {
                  create: {
                    isVaccinated: dto.healthRecord.isVaccinated ?? false,
                    vaccinationDetails: dto.healthRecord.vaccinationDetails,
                    isNeutered: dto.healthRecord.isNeutered ?? false,
                    isDewormed: dto.healthRecord.isDewormed ?? false,
                    medicalNotes: dto.healthRecord.medicalNotes,
                  },
                  update: {
                    isVaccinated: dto.healthRecord.isVaccinated,
                    vaccinationDetails: dto.healthRecord.vaccinationDetails,
                    isNeutered: dto.healthRecord.isNeutered,
                    isDewormed: dto.healthRecord.isDewormed,
                    medicalNotes: dto.healthRecord.medicalNotes,
                  },
                },
              }
            : undefined,
        },
        include: {
          photos: true,
          healthRecord: true,
          traits: true,
        },
      });

      if (dto.latitude && dto.longitude) {
        const approximateLat = this.applyLocationJitter(dto.latitude);
        const approximateLon = this.applyLocationJitter(dto.longitude);
        await tx.$executeRawUnsafe(
          `UPDATE animals 
           SET location_geom = ST_SetSRID(ST_MakePoint($1, $2), 4326),
               latitude = $3,
               longitude = $4
           WHERE id = $5`,
          approximateLon,
          approximateLat,
          approximateLat,
          approximateLon,
          id,
        );
      }

      return result;
    });

    return updated;
  }

  async uploadPhotos(id: string, userId: string, files: Express.Multer.File[]) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException('Animal não encontrado.');
    }

    await this.checkPermission(animal, userId);

    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const currentPhotosCount = await this.prisma.animalPhoto.count({
      where: { animalId: id },
    });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await this.storage.uploadFile(file, `animals/${id}`);
      uploadedUrls.push(url);

      await this.prisma.animalPhoto.create({
        data: {
          animalId: id,
          url,
          thumbnailUrl: url,
          displayOrder: currentPhotosCount + i,
          isCover: currentPhotosCount === 0 && i === 0,
        },
      });
    }

    return this.prisma.animalPhoto.findMany({
      where: { animalId: id },
      orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
    });
  }

  async remove(id: string, userId: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException('Animal não encontrado.');
    }

    await this.checkPermission(animal, userId);

    await this.prisma.animal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: AnimalStatus.UNAVAILABLE,
      },
    });

    return { message: 'Animal removido com sucesso.' };
  }

  private async checkPermission(animal: any, userId: string) {
    if (animal.protectorId === userId) return true;

    if (animal.organizationId) {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: animal.organizationId,
            userId,
          },
        },
      });

      if (member) return true;
    }

    throw new ForbiddenException(
      'Você não tem permissão para gerenciar este animal.',
    );
  }

  /**
   * Fórmula Haversine para cálculo de distância em quilômetros.
   */
  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
