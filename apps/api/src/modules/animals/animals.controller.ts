import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { FilterAnimalsDto } from './dto/filter-animals.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Animais')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar animais com filtros, busca textual e geolocalização' })
  findAll(@Query() filter: FilterAnimalsDto) {
    return this.animalsService.findAll(filter);
  }

  @Get('success-stories')
  @ApiOperation({ summary: 'Obter histórias de finais felizes de animais adotados' })
  getSuccessStories() {
    return this.animalsService.getSuccessStories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter perfil completo de um animal pelo ID' })
  findOne(
    @Param('id') id: string,
    @Query('userLat') userLat?: number,
    @Query('userLon') userLon?: number,
  ) {
    return this.animalsService.findOne(id, userLat, userLon);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar um novo animal para adoção (Protetor ou ONG)' })
  create(@Req() req: any, @Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.create(req.user.id, createAnimalDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar informações de um animal' })
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return this.animalsService.update(id, req.user.id, updateAnimalDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover (soft delete) um animal do sistema' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.animalsService.remove(id, req.user.id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('photos', 10))
  @ApiOperation({ summary: 'Enviar múltiplas fotos para a galeria do animal' })
  uploadPhotos(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.animalsService.uploadPhotos(id, req.user.id, files);
  }
}

