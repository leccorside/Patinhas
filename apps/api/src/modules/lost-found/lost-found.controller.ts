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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LostFoundService } from './lost-found.service';
import { CreateLostFoundDto, QueryLostFoundDto } from './dto/lost-found.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Animais Perdidos e Achados')
@Controller('lost-found')
export class LostFoundController {
  constructor(private readonly lostFoundService: LostFoundService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar relato de pet perdido ou encontrado' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLostFoundDto,
  ) {
    return this.lostFoundService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pets perdidos ou encontrados com filtros e raio geográfico' })
  async findAll(@Query() query: QueryLostFoundDto) {
    return this.lostFoundService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um pet perdido/encontrado' })
  async findOne(@Param('id') id: string) {
    return this.lostFoundService.findOne(id);
  }

  @Patch(':id/reunited')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar pet como reencontrado (Apenas autor do relato ou Master Admin)' })
  async markAsReunited(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostFoundService.markAsReunited(id, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir relato de pet perdido/encontrado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostFoundService.remove(id, user.id, user.role);
  }
}
