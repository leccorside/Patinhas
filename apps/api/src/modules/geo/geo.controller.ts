import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeoService } from './geo.service';

@ApiTags('Geolocalização')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('nearby')
  @ApiOperation({
    summary:
      'Buscar animais em raio geodésico no formato GeoJSON FeatureCollection para MapLibre GL JS',
  })
  @ApiQuery({ name: 'lat', example: -23.5505, description: 'Latitude central' })
  @ApiQuery({ name: 'lon', example: -46.6333, description: 'Longitude central' })
  @ApiQuery({ name: 'radiusKm', example: 10, required: false, description: 'Raio de busca em km' })
  @ApiQuery({ name: 'species', example: 'DOG', required: false, description: 'Filtrar espécie' })
  getNearby(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radiusKm') radiusKm?: number,
    @Query('species') species?: string,
  ) {
    return this.geoService.getNearbyAnimals({ lat, lon, radiusKm, species });
  }
}

