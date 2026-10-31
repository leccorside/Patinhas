import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto } from './dto/events.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Criar novo evento ou feira de adoção
  async create(userId: string, userRole: UserRole, dto: CreateEventDto) {
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
        throw new ForbiddenException('Apenas membros da organização podem cadastrar feiras e eventos.');
      }
    }

    const event = await this.prisma.adoptionEvent.create({
      data: {
        organizationId: dto.organizationId,
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        locationName: dto.locationName,
        addressStreet: dto.addressStreet,
        city: dto.city,
        state: dto.state.toUpperCase(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        bannerUrl: dto.bannerUrl,
      },
    });

    if (typeof dto.latitude === 'number' && typeof dto.longitude === 'number') {
      await this.prisma.$executeRawUnsafe(`
        UPDATE adoption_events
        SET location_geom = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
        WHERE id = '${event.id}';
      `);
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ADOPTION_EVENT_CREATED',
        resourceType: 'ADOPTION_EVENT',
        resourceId: event.id,
        metadataJson: JSON.stringify({
          title: event.title,
          eventDate: event.eventDate,
          orgId: event.organizationId,
        }),
      },
    });

    return event;
  }

  // 2. Listar eventos e feiras de adoção
  async findAll(upcomingOnly: boolean = true, city?: string, state?: string) {
    const where: any = {};

    if (upcomingOnly) {
      // Eventos a partir de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.eventDate = { gte: today };
    }

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state.toUpperCase();

    const events = await this.prisma.adoptionEvent.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            phone: true,
            verifiedStatus: true,
          },
        },
      },
      orderBy: { eventDate: 'asc' },
      take: 40,
    });

    return events;
  }

  // 3. Obter detalhes de um evento
  async findOne(id: string) {
    const event = await this.prisma.adoptionEvent.findUnique({
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

    if (!event) {
      throw new NotFoundException('Evento de adoção não encontrado');
    }

    return event;
  }

  // 4. Remover evento
  async remove(id: string, userId: string, userRole: UserRole) {
    const event = await this.prisma.adoptionEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    if (userRole !== UserRole.MASTER_ADMIN) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: event.organizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Apenas membros da organização podem remover este evento.');
      }
    }

    await this.prisma.adoptionEvent.delete({ where: { id } });

    return { message: 'Evento de adoção removido com sucesso.' };
  }
}
