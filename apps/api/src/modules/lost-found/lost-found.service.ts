import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLostFoundDto, QueryLostFoundDto } from './dto/lost-found.dto';
import { LostFoundStatus, UserRole } from '@prisma/client';

@Injectable()
export class LostFoundService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Criar Relato de Pet Perdido ou Encontrado
  async create(userId: string, dto: CreateLostFoundDto) {
    const report = await this.prisma.lostFoundReport.create({
      data: {
        userId,
        type: dto.type,
        petName: dto.petName,
        species: dto.species,
        breed: dto.breed,
        color: dto.color,
        distinctiveMarks: dto.distinctiveMarks,
        photoUrl: dto.photoUrl,
        lastSeenDate: new Date(dto.lastSeenDate),
        city: dto.city,
        state: dto.state.toUpperCase(),
        addressRef: dto.addressRef,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        rewardDetails: dto.rewardDetails,
        status: LostFoundStatus.OPEN,
      },
    });

    // Se tiver coordenadas, atualiza a geometria espacial PostGIS
    if (typeof dto.latitude === 'number' && typeof dto.longitude === 'number') {
      await this.prisma.$executeRawUnsafe(`
        UPDATE lost_found_reports
        SET location_geom = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
        WHERE id = '${report.id}';
      `);
    }

    // Registra na auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `LOST_FOUND_CREATED_${dto.type}`,
        resourceType: 'LOST_FOUND',
        resourceId: report.id,
        metadataJson: JSON.stringify({
          petName: dto.petName,
          species: dto.species,
          city: dto.city,
        }),
      },
    });

    return report;
  }

  // 2. Listar Relatos com Filtros e Busca Espacial
  async findAll(query: QueryLostFoundDto) {
    const {
      type,
      species,
      status = LostFoundStatus.OPEN,
      city,
      state,
      latitude,
      longitude,
      radiusKm = 50,
    } = query;

    // Se latitude e longitude forem fornecidas, faz busca geoespacial via PostGIS
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const radiusMeters = radiusKm * 1000;
      let rawQuery = `
        SELECT id, pet_name as "petName", type, species, breed, color,
               distinctive_marks as "distinctiveMarks", photo_url as "photoUrl",
               last_seen_date as "lastSeenDate", city, state, address_ref as "addressRef",
               latitude, longitude, contact_phone as "contactPhone", reward_details as "rewardDetails",
               status, created_at as "createdAt",
               ST_Distance(
                 location_geom::geography,
                 ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
               ) / 1000.0 as "distanceKm"
        FROM lost_found_reports
        WHERE status = '${status}'
          AND ST_DWithin(
            location_geom::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
      `;

      if (type) rawQuery += ` AND type = '${type}'`;
      if (species) rawQuery += ` AND species = '${species}'`;
      if (state) rawQuery += ` AND state = '${state.toUpperCase()}'`;

      rawQuery += ` ORDER BY "distanceKm" ASC, created_at DESC LIMIT 50;`;

      const spatialResults = await this.prisma.$queryRawUnsafe<any[]>(rawQuery);
      return spatialResults;
    }

    // Caso contrário, busca relacional padrão
    const where: any = { status };
    if (type) where.type = type;
    if (species) where.species = species;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state.toUpperCase();

    const reports = await this.prisma.lostFoundReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reports.map((r) => ({
      ...r,
      authorName: r.user.profile?.fullName || r.user.email.split('@')[0],
      authorAvatar: r.user.profile?.avatarUrl,
    }));
  }

  // 3. Obter Detalhes de um Relato
  async findOne(id: string) {
    const report = await this.prisma.lostFoundReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true, phone: true } },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Relato de animal perdido/encontrado não encontrado');
    }

    return {
      ...report,
      authorName: report.user.profile?.fullName || report.user.email,
      authorAvatar: report.user.profile?.avatarUrl,
    };
  }

  // 4. Marcar como Reencontrado
  async markAsReunited(id: string, userId: string, userRole: UserRole) {
    const report = await this.prisma.lostFoundReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Relato não encontrado');

    if (report.userId !== userId && userRole !== UserRole.MASTER_ADMIN) {
      throw new ForbiddenException('Apenas o autor do relato pode marcá-lo como reencontrado.');
    }

    const updated = await this.prisma.lostFoundReport.update({
      where: { id },
      data: { status: LostFoundStatus.REUNITED },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LOST_FOUND_REUNITED',
        resourceType: 'LOST_FOUND',
        resourceId: id,
        metadataJson: JSON.stringify({ petName: report.petName, type: report.type }),
      },
    });

    return {
      message: '🎉 Que notícia maravilhosa! O pet foi marcado como reencontrado!',
      report: updated,
    };
  }

  // 5. Remover Relato
  async remove(id: string, userId: string, userRole: UserRole) {
    const report = await this.prisma.lostFoundReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Relato não encontrado');

    if (report.userId !== userId && userRole !== UserRole.MASTER_ADMIN) {
      throw new ForbiddenException('Apenas o autor ou administradores podem excluir este relato.');
    }

    await this.prisma.lostFoundReport.delete({ where: { id } });

    return { message: 'Relato excluído com sucesso.' };
  }
}

