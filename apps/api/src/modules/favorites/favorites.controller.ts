import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favoritos')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar animais favoritados pelo usuário logado' })
  getUserFavorites(@Req() req: any) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Obter apenas os IDs dos animais favoritados pelo usuário' })
  getFavoriteIds(@Req() req: any) {
    return this.favoritesService.getFavoriteIds(req.user.id);
  }

  @Post(':animalId')
  @ApiOperation({ summary: 'Adicionar um animal aos favoritos' })
  addFavorite(@Req() req: any, @Param('animalId') animalId: string) {
    return this.favoritesService.addFavorite(req.user.id, animalId);
  }

  @Delete(':animalId')
  @ApiOperation({ summary: 'Remover um animal dos favoritos' })
  removeFavorite(@Req() req: any, @Param('animalId') animalId: string) {
    return this.favoritesService.removeFavorite(req.user.id, animalId);
  }
}

