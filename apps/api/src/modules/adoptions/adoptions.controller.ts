import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdoptionsService } from './adoptions.service';
import { CreateAdoptionApplicationDto } from './dto/create-application.dto';
import { UpdateAdoptionStatusDto } from './dto/update-application-status.dto';
import { ScheduleInterviewDto, CompleteAdoptionDto } from './dto/schedule-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Adoções')
@Controller('adoptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdoptionsController {
  constructor(private readonly adoptionsService: AdoptionsService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submeter questionário e candidatura para adotar um pet' })
  apply(@Req() req: any, @Body() dto: CreateAdoptionApplicationDto) {
    return this.adoptionsService.apply(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar candidaturas do adotante autenticado' })
  findMyApplications(@Req() req: any) {
    return this.adoptionsService.findMyApplications(req.user.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'Listar candidaturas recebidas para animais da ONG ou do Protetor' })
  findReceivedApplications(@Req() req: any) {
    return this.adoptionsService.findReceivedApplications(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma solicitação de adoção' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.adoptionsService.findOne(id, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de uma candidatura (ONG/Protetor)' })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAdoptionStatusDto,
  ) {
    return this.adoptionsService.updateStatus(id, req.user.id, dto);
  }

  @Post(':id/schedule-interview')
  @ApiOperation({ summary: 'Agendar entrevista em vídeo ou presencial para triagem do candidato' })
  scheduleInterview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.adoptionsService.scheduleInterview(id, req.user.id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Concluir a adoção formal do pet de forma atômica' })
  completeAdoption(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CompleteAdoptionDto,
  ) {
    return this.adoptionsService.completeAdoption(id, req.user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar a candidatura a pedido do adotante' })
  cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adoptionsService.cancelByAdopter(id, req.user.id, reason);
  }
}

