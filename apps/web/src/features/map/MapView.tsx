import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Animal, animalsService } from '../animals/animalsService';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

interface MapViewProps {
  onSelectAnimal: (animal: Animal) => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSwitchToList: () => void;
  userCity?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MapView: React.FC<MapViewProps> = ({
  onSelectAnimal,
  favoritedIds,
  onToggleFavorite,
  onSwitchToList,
  userCity = 'São Paulo, SP',
  showToast,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Coordenadas centrais (São Paulo)
  const [userLocation, setUserLocation] = useState({ lat: -23.5505, lon: -46.6333 });
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isRadiusMenuOpen, setIsRadiusMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lista de animais mapeados e pet ativo no Bottom Sheet
  const [geoData, setGeoData] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);

  // 1. Inicializa o Mapa MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [userLocation.lon, userLocation.lat],
      zoom: 12,
    });

    // Marcador do usuário central com pulso coral
    const userEl = document.createElement('div');
    userEl.className = 'user-marker flex flex-col items-center pointer-events-none';
    userEl.innerHTML = `
      <div class="relative w-10 h-10 rounded-full p-0.5 bg-white shadow-lg ring-2 ring-primary flex items-center justify-center">
        <span class="text-xl">📍</span>
        <span class="absolute -inset-1 rounded-full bg-primary/20 animate-ping -z-10"></span>
      </div>
      <span class="mt-1 px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-charcoal shadow-sm">Você</span>
    `;

    new maplibregl.Marker({ element: userEl })
      .setLngLat([userLocation.lon, userLocation.lat])
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Carrega pontos de animais da API PostGIS
  useEffect(() => {
    const loadGeoPoints = async () => {
      setLoading(true);
      try {
        const res = await animalsService.getNearbyGeo(
          userLocation.lat,
          userLocation.lon,
          radiusKm
        );

        setGeoData(res.features || []);

        // Define o primeiro animal como selecionado se nenhum estiver ativo
        if (res.features && res.features.length > 0 && !selectedPet) {
          setSelectedPet(res.features[0].properties);
        }
      } catch (err) {
        console.error('Erro ao buscar dados geoespaciais:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGeoPoints();
  }, [radiusKm, userLocation]);

  // 3. Renderiza os marcadores customizados no mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpa marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    geoData.forEach((feature) => {
      const prop = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;

      const isDog = prop.species === 'DOG';
      const isSelected = selectedPet?.id === prop.id;

      const el = document.createElement('div');
      el.className = `pet-pin cursor-pointer transition-transform duration-200 ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
      }`;

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="relative p-0.5 rounded-full ${
            isDog ? 'bg-primary' : 'bg-secondary'
          } shadow-md">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-white">
              <img src="${prop.photoUrl}" alt="${prop.name}" class="w-full h-full object-cover" />
            </div>
            <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full ${
              isDog ? 'bg-apricot text-primary' : 'bg-teal-100 text-secondary'
            } flex items-center justify-center text-[9px] shadow-sm font-bold">
              ${isDog ? '🐶' : '🐱'}
            </span>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
            isDog ? 'border-t-primary' : 'border-t-secondary'
          } -mt-0.5"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPet(prop);
        map.flyTo({
          center: [lon, lat],
          zoom: 13,
          speed: 1.2,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lon, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [geoData, selectedPet]);

  const recenterMap = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [userLocation.lon, userLocation.lat],
      zoom: 12,
      speed: 1.2,
    });
    showToast('Mapa recentralizado na sua posição', 'info');
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-neutral-100 overflow-hidden flex flex-col">
      {/* Top Floating Map Controls */}
      <div className="absolute top-3 inset-x-3 z-30 flex flex-col gap-2">
        {/* Search & Radius Pill Row */}
        <div className="flex items-center gap-2">
          {/* Location Area Pill */}
          <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md border border-neutral-100">
            <span className="text-primary text-base">📍</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-none">
                Área de Adoção
              </span>
              <span className="text-xs font-bold text-charcoal truncate">
                {userCity}
              </span>
            </div>
          </div>

          {/* Radius Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRadiusMenuOpen(!isRadiusMenuOpen)}
              className="flex items-center gap-1.5 bg-primary text-white px-3.5 py-2.5 rounded-full shadow-coral hover:opacity-95 active:scale-95 transition-all text-xs font-bold"
            >
              <span>📡</span>
              <span>{radiusKm} km</span>
              <span>▾</span>
            </button>

            {isRadiusMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 z-40 border border-neutral-100">
                {[5, 10, 25, 50].map((km) => (
                  <button
                    key={km}
                    onClick={() => {
                      setRadiusKm(km);
                      setIsRadiusMenuOpen(false);
                      showToast(`Raio ajustado para ${km} km`, 'info');
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      radiusKm === km
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>Raio {km} km</span>
                    {radiusKm === km && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Count & Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-neutral-100 text-xs font-bold text-charcoal">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>{geoData.length} animais no raio de {radiusKm}km</span>
          </div>

          <div className="flex items-center p-0.5 bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-neutral-100">
            <button
              onClick={onSwitchToList}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-neutral-500 hover:text-charcoal transition-colors"
            >
              <span>Lista</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-sm">
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Right) */}
      <div className="absolute right-3 top-28 flex flex-col gap-2 z-30">
        <button
          onClick={recenterMap}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg text-primary hover:bg-neutral-50 active:scale-90 transition-transform border border-neutral-100"
          title="Minha Localização"
        >
          <span className="text-lg">🎯</span>
        </button>
      </div>

      {/* MapLibre GL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Selected Pet Quick Preview Bottom Card (Fiel ao UX/UI) */}
      <AnimatePresence>
        {selectedPet && (
          <motion.div
            key={selectedPet.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-3 inset-x-3 z-30 bg-white rounded-3xl shadow-[0_-8px_32px_rgba(17,29,35,0.14)] p-4 border border-neutral-100 flex flex-col gap-3"
          >
            {/* Grabber Handle */}
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />

            {/* Pet Quick Info */}
            <div className="flex items-start gap-3">
              {/* Pet Photo */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm">
                <img
                  src={selectedPet.photoUrl}
                  alt={selectedPet.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-2 py-0.5 bg-white/90 backdrop-blur-md text-[9px] font-bold text-charcoal rounded-full">
                  {selectedPet.species === 'DOG' ? 'Cão' : 'Gato'}
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-charcoal truncate">
                    {selectedPet.name}
                  </h3>
                  <button
                    onClick={(e) => onToggleFavorite(selectedPet.id, e)}
                    className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <span
                      className={`text-base ${
                        favoritedIds.has(selectedPet.id)
                          ? 'text-primary'
                          : 'text-neutral-400'
                      }`}
                    >
                      {favoritedIds.has(selectedPet.id) ? '❤️' : '🤍'}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {selectedPet.breed} • {selectedPet.ageApproximate}{' '}
                  {selectedPet.ageUnit === 'YEARS' ? 'ano(s)' : 'meses'}
                </p>

                <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-secondary">
                  <span>📍</span>
                  <span className="truncate">
                    a {selectedPet.distanceKm} km de você • {selectedPet.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="py-1.5 px-1 rounded-xl bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Sexo</span>
                <span className="font-bold text-charcoal text-[11px]">
                  {selectedPet.sex === 'MALE' ? 'Macho' : 'Fêmea'}
                </span>
              </div>
              <div className="py-1.5 px-1 rounded-xl bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Castrado</span>
                <span className="font-bold text-secondary text-[11px]">
                  {selectedPet.isNeutered ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="py-1.5 px-1 rounded-xl bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Vacinas</span>
                <span className="font-bold text-secondary text-[11px]">
                  {selectedPet.isVaccinated ? 'Em dia' : 'Pendente'}
                </span>
              </div>
              <div className="py-1.5 px-1 rounded-xl bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Porte</span>
                <span className="font-bold text-charcoal text-[11px]">
                  {selectedPet.size || 'Médio'}
                </span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <PrimaryButton
                  fullWidth
                  size="md"
                  onClick={async () => {
                    const full = await animalsService.getAnimalById(selectedPet.id);
                    onSelectAnimal(full);
                  }}
                >
                  Conhecer {selectedPet.name} →
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

