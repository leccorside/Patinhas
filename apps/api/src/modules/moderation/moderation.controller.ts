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
import { ModerationService } from './moderation.service';
import { CreateReportDto, ResolveReportDto } from './dto/moderation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import {
  UserRole,
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

@ApiTags('Moderação e Denúncias (Antifraude)')
@Controller('moderation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Enviar denúncia de animal, usuário ou organização' })
  async createReport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.moderationService.createReport(user.id, dto);
  }

  @Get('reports')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER_ADMIN)
  @ApiOperation({ summary: 'Listar denúncias para moderação (Apenas Master Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'targetType', required: false, enum: ReportTargetType })
  async getReports(
    @Query('status') status?: ReportStatus,
    @Query('targetType') targetType?: ReportTargetType,
  ) {
    return this.moderationService.getReports(status, targetType);
  }

  @Patch('reports/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER_ADMIN)
  @ApiOperation({ summary: 'Resolver denúncia com ação disciplinar (Apenas Master Admin)' })
  async resolveReport(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: ResolveReportDto,
  ) {
    return this.moderationService.resolveReport(id, admin.id, dto);
  }

  @Get('actions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER_ADMIN)
  @ApiOperation({ summary: 'Listar histórico de ações tomadas pelos moderadores' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getModerationActions(@Query('limit') limit?: string) {
    return this.moderationService.getModerationActions(limit ? parseInt(limit, 10) : 30);
  }
}

