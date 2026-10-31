import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, RegisterDonationDto } from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Campanhas de Doação e Apoio')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova campanha de arrecadação (Membros de ONG ou Master Admin)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(user.id, user.role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas de arrecadação ativas' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.campaignsService.findAll(activeOnly !== 'false');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma campanha de arrecadação' })
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post(':id/donate')
  @ApiOperation({ summary: 'Registrar doação ou contribuição em uma campanha' })
  async registerDonation(
    @Param('id') id: string,
    @Body() dto: RegisterDonationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.campaignsService.registerDonation(id, dto, userId);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pausar ou reativar campanha (Membros de ONG ou Master Admin)' })
  async toggleStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.campaignsService.toggleStatus(id, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir campanha (Membros de ONG ou Master Admin)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.campaignsService.remove(id, user.id, user.role);
  }
}

