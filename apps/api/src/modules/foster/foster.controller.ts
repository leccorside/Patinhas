import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FosterService } from './foster.service';
import { SaveFosterProfileDto, CreateFosterRequestDto } from './dto/foster.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Lares Temporários')
@Controller('foster')
export class FosterController {
  constructor(private readonly fosterService: FosterService) {}

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter meu perfil de voluntário de Lar Temporário' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.fosterService.getMyProfile(user.id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Salvar ou atualizar cadastro de Lar Temporário' })
  async saveProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveFosterProfileDto,
  ) {
    return this.fosterService.saveProfile(user.id, dto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Buscar lares temporários disponíveis para acolhimento' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'species', required: false })
  async getAvailable(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('species') species?: string,
  ) {
    return this.fosterService.getAvailableFosterHomes(city, state, species);
  }

  @Post('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicitar acolhimento temporário a um voluntário (ONG)' })
  async createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFosterRequestDto,
  ) {
    return this.fosterService.createRequest(user.id, user.role, dto);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar solicitações de acolhimento recebidas pelo voluntário' })
  async getMyRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.fosterService.getMyRequests(user.id);
  }

  @Patch('requests/:id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aceitar ou recusar solicitação de lar temporário' })
  async respondRequest(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('status') status: 'ACCEPTED' | 'DECLINED',
  ) {
    return this.fosterService.respondRequest(id, user.id, status);
  }
}
