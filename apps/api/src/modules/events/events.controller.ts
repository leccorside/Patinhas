import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Eventos e Feiras de Adoção')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar nova feira ou evento presencial de adoção (Membros de ONG)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(user.id, user.role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar feiras e eventos de adoção com filtros' })
  @ApiQuery({ name: 'upcomingOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  async findAll(
    @Query('upcomingOnly') upcomingOnly?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    return this.eventsService.findAll(upcomingOnly !== 'false', city, state);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma feira de adoção' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover feira de adoção (Apenas membros da ONG promotora ou Master Admin)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.remove(id, user.id, user.role);
  }
}

