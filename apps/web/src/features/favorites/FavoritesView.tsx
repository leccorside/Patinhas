import React, { useState } from 'react';
import { Animal } from '../animals/animalsService';
import { EmptyState } from '../../components/ui/EmptyState';

interface FavoritesViewProps {
  favorites: Animal[];
  loading: boolean;
  onSelectAnimal: (animal: Animal) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenDiscoveryMode: () => void;
  onAdoptClick: (animal: Animal) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  loading,
  onSelectAnimal,
  onRemoveFavorite,
  onOpenDiscoveryMode,
  onAdoptClick,
  showToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DOG' | 'CAT'>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'proximity' | 'urgency'>('recent');

  const filtered = favorites.filter((pet) => {
    if (activeCategory === 'DOG') return pet.species === 'DOG';
    if (activeCategory === 'CAT') return pet.species === 'CAT';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'proximity') {
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    }
    if (sortBy === 'urgency') {
      return (b.isSpecialNeeds ? 1 : 0) - (a.isSpecialNeeds ? 1 : 0);
    }
    return 0; // recente (padrão)
  });

  const dogsCount = favorites.filter((p) => p.species === 'DOG').length;
  const catsCount = favorites.filter((p) => p.species === 'CAT').length;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Subheader & Narrative Pitch */}
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold text-charcoal">Meus Favoritos</h1>
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-extrabold shadow-sm">
              {favorites.length}
            </span>
          </div>

          {/* Botão de Atalho para o Modo Descoberta (Swipe) */}
          <button
            onClick={onOpenDiscoveryMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-[#FF8A65] text-white text-xs font-bold shadow-coral hover:opacity-95 active:scale-95 transition-all"
          >
            <span>🔥</span>
            <span>Modo Swipe</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          Acompanhe de perto quem já conquistou um pedacinho da sua história.
        </p>

        {/* Pill Segmented Control & Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            <span>Todos</span>
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('DOG')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'DOG'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            <span>Cachorros 🐕</span>
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              {dogsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('CAT')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeCategory === 'CAT'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            <span>Gatos 🐈</span>
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
              {catsCount}
            </span>
          </button>
        </div>

        {/* Quick Action Bar (Compare Trigger + Sorting Dropdown) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => showToast('Funcionalidade de comparação direta ativada!', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold active:scale-95 transition-transform"
          >
            <span>⚖️</span>
            <span>Comparar Perfis ({favorites.length > 2 ? 2 : favorites.length})</span>
          </button>

          <div className="relative inline-flex items-center text-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-full bg-white text-neutral-600 border border-neutral-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value="recent">Recentes</option>
              <option value="proximity">Mais próximos</option>
              <option value="urgency">Urgência</option>
            </select>
          </div>
        </div>
      </section>

      {/* Comparison Mini Tray Banner (Fiel ao UX/UI) */}
      {favorites.length >= 2 && (
        <section className="relative overflow-hidden rounded-2xl bg-secondary/10 p-3.5 border border-secondary/20 shadow-sm">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 text-base shadow-sm">
              ⚖️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-charcoal">2 pets selecionados</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold text-secondary">Pronto para comparar</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-snug mb-2">
                Compare compatibilidade, porte e rotina lado a lado antes de dar o próximo passo.
              </p>
              <button
                onClick={() =>
                  showToast(
                    `Comparando ${favorites[0].name} e ${favorites[1].name}...`,
                    'info'
                  )
                }
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all"
              >
                <span>Comparar agora</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Pet Cards List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-neutral-200 animate-pulse" />
          <div className="h-44 rounded-2xl bg-neutral-200 animate-pulse" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Nenhum amiguinho favoritado ainda"
          description="Toque no ícone de coração nos cards dos pets ou use o Modo Descoberta para encontrar quem combina com seu lar."
          actionText="Abrir Modo Descoberta 🔥"
          onAction={onOpenDiscoveryMode}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((pet) => {
            const photoUrl =
              pet.photos[0]?.url ||
              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

            return (
              <article
                key={pet.id}
                onClick={() => onSelectAnimal(pet)}
                className="rounded-3xl bg-white overflow-hidden shadow-sm border border-neutral-100 flex flex-col relative group cursor-pointer hover:shadow-md transition-all"
              >
                {/* Photo Frame */}
                <div className="relative w-full aspect-[16/10] bg-neutral-100 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm text-xs font-bold text-charcoal">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span>Disponível para Adoção</span>
                  </div>

                  {/* Floating Like Button */}
                  <button
                    onClick={(e) => onRemoveFavorite(pet.id, e)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-transform text-lg text-primary"
                    title="Remover dos favoritos"
                  >
                    ❤️
                  </button>

                  {/* Distance Pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-charcoal/85 text-white backdrop-blur-md text-[11px] font-semibold">
                    <span>📍</span>
                    <span>
                      {pet.distanceKm ? `${pet.distanceKm} km • ` : ''}
                      {pet.city}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-charcoal leading-none">
                        {pet.name}
                      </h2>
                      <span className="text-xs text-neutral-500 font-medium">
                        {pet.breed || (pet.species === 'DOG' ? 'Cão SRD' : 'Gato SRD')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400">
                      {pet.ageApproximate} {pet.ageUnit === 'YEARS' ? 'anos' : 'meses'} •{' '}
                      {pet.sex === 'MALE' ? 'Macho' : 'Fêmea'}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {pet.healthRecord?.isVaccinated && (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                        ✓ Vacinado
                      </span>
                    )}
                    {pet.healthRecord?.isNeutered && (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                        ✓ Castrado
                      </span>
                    )}
                    {pet.traits?.[0] && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                        🐾 {pet.traits[0].name}
                      </span>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdoptClick(pet);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-primary to-[#FF8A65] text-white font-bold text-xs shadow-coral active:scale-95 transition-all"
                    >
                      <span>Quero Adotar o {pet.name}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

