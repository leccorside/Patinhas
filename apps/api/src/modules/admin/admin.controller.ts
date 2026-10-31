import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import {
  UserRole,
  UserStatus,
  OrganizationVerificationStatus,
} from '@prisma/client';

@ApiTags('Admin Master (Gestão Global)')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MASTER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Métricas e contadores globais da plataforma (Apenas Master Admin)' })
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('organizations')
  @ApiOperation({ summary: 'Listar todas as organizações para auditoria e aprovação' })
  @ApiQuery({ name: 'status', required: false, enum: OrganizationVerificationStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getOrganizations(
    @Query('status') status?: OrganizationVerificationStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrganizations(status, search);
  }

  @Patch('organizations/:id/verify')
  @ApiOperation({ summary: 'Aprovar ou rejeitar selo de verificação de ONG' })
  async updateOrganizationVerification(
    @Param('id') orgId: string,
    @Body('status') status: OrganizationVerificationStatus,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateOrganizationVerification(orgId, status, admin.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários com dados de atividade e status' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.adminService.getUsers(search, role, status);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Alterar status de conta do usuário (Ativar ou Suspender)' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
    @Body('reason') reason: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateUserStatus(userId, status, admin.id, reason);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Consultar logs de auditoria de ações administrativas' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(@Query('limit') limit?: string) {
    return this.adminService.getAuditLogs(limit ? parseInt(limit, 10) : 30);
  }
}

