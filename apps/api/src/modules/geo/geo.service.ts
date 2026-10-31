import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface NearbyQueryOptions {
  lat: number;
  lon: number;
  radiusKm?: number;
  species?: string;
}

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async getNearbyAnimals(options: NearbyQueryOptions) {
    const lat = Number(options.lat);
    const lon = Number(options.lon);
    const radiusKm = Number(options.radiusKm) || 10;

    if (isNaN(lat) || isNaN(lon)) {
      throw new BadRequestException('Latitude e longitude válidas são obrigatórias.');
    }

    const speciesFilter = options.species
      ? `AND a.species = '${options.species.replace(/'/g, '')}'`
      : '';

    const radiusMeters = radiusKm * 1000.0;

    const query = `
      SELECT 
        a.id, 
        a.name, 
        a.species, 
        a.breed, 
        a.sex, 
        a.size, 
        a.age_approximate as "ageApproximate", 
        a.age_unit as "ageUnit",
        a.city,
        a.state,
        a.latitude, 
        a.longitude,
        ROUND((ST_Distance(a.location_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000.0)::numeric, 1) as "distanceKm",
        json_build_object(
          'id', o.id, 
          'name', o.name, 
          'logoUrl', o.logo_url, 
          'verifiedStatus', o.verified_status
        ) as organization,
        (
          SELECT json_agg(
            json_build_object(
              'url', p.url, 
              'isCover', p.is_cover
            ) ORDER BY p.is_cover DESC
          ) 
          FROM animal_photos p 
          WHERE p.animal_id = a.id
        ) as photos,
        json_build_object(
          'isVaccinated', h.is_vaccinated, 
          'isNeutered', h.is_neutered,
          'isDewormed', h.is_dewormed
        ) as "healthRecord"
      FROM animals a
      LEFT JOIN organizations o ON o.id = a.organization_id
      LEFT JOIN animal_health_records h ON h.animal_id = a.id
      WHERE a.deleted_at IS NULL 
        AND a.status = 'AVAILABLE'
        AND a.location_geom IS NOT NULL
        AND ST_DWithin(a.location_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ${speciesFilter}
      ORDER BY "distanceKm" ASC
      LIMIT 100
    `;

    const animals: any[] = await this.prisma.$queryRawUnsafe(
      query,
      lon,
      lat,
      radiusMeters,
    );

    // Converte em GeoJSON FeatureCollection para consumo padronizado pelo MapLibre GL
    const features = animals.map((animal) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(animal.longitude), Number(animal.latitude)],
      },
      properties: {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed || (animal.species === 'DOG' ? 'Cão SRD' : 'Gato SRD'),
        sex: animal.sex,
        size: animal.size,
        ageApproximate: animal.ageApproximate,
        ageUnit: animal.ageUnit,
        city: animal.city,
        state: animal.state,
        distanceKm: Number(animal.distanceKm),
        photoUrl: animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        organizationName: animal.organization?.name || 'Protetor Independente',
        organizationVerified: animal.organization?.verifiedStatus === 'VERIFIED',
        isVaccinated: Boolean(animal.healthRecord?.isVaccinated),
        isNeutered: Boolean(animal.healthRecord?.isNeutered),
      },
    }));

    return {
      type: 'FeatureCollection',
      total: features.length,
      center: { lat, lon, radiusKm },
      features,
    };
  }
}

