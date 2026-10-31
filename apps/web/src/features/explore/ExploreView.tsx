import React, { useState } from 'react';
import { SearchInput } from '../../components/ui/SearchInput';
import { Animal } from '../animals/animalsService';
import { AdvancedFilterSheet, FilterState } from './AdvancedFilterSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { PetCardSkeleton } from '../../components/ui/SkeletonLoader';

interface ExploreViewProps {
  animals: Animal[];
  loading: boolean;
  onSelectAnimal: (animal: Animal) => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  animals,
  loading,
  onSelectAnimal,
  favoritedIds,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
  filters,
  onChangeFilters,
  onResetFilters,
  showToast,
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Calcula contagem de filtros ativos
  const activeFiltersCount =
    (filters.species ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.sex ? 1 : 0) +
    (filters.isVaccinated ? 1 : 0) +
    (filters.isNeutered ? 1 : 0) +
    (filters.isPuppy ? 1 : 0) +
    (filters.isSpecialNeeds ? 1 : 0) +
    (filters.maxDistanceKm < 50 ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 pb-8">
      {/* Search Input Bar */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
        placeholder="Buscar por raça, nome ou cidade..."
      />

      {/* Quick Category Chips Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => onChangeFilters({ ...filters, species: undefined, isPuppy: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            !filters.species && !filters.isPuppy
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, species: 'DOG', isPuppy: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filters.species === 'DOG'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          🐕 Cachorros
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, species: 'CAT', isPuppy: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filters.species === 'CAT'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          🐈 Gatos
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, isPuppy: true })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filters.isPuppy
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          🍼 Filhotes
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, isSpecialNeeds: true })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filters.isSpecialNeeds
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-red-500 border border-red-200'
          }`}
        >
          🚨 Urgentes
        </button>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs py-1">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>
            <strong className="text-charcoal font-bold">{animals.length} amiguinhos</strong>{' '}
            esperando por você
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-secondary font-bold hover:underline flex items-center gap-1"
          >
            <span>✕</span> Limpar tudo
          </button>
        )}
      </div>

      {/* Pet Grid Feed (2 Colunas Mobile) */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <PetCardSkeleton />
          <PetCardSkeleton />
          <PetCardSkeleton />
          <PetCardSkeleton />
        </div>
      ) : animals.length === 0 ? (
        <EmptyState
          title="Nenhum amiguinho encontrado"
          description="Tente ajustar a distância ou limpar os filtros para ver mais animais."
          actionText="Limpar Filtros"
          onAction={onResetFilters}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {animals.map((pet, idx) => {
            const isFav = favoritedIds.has(pet.id);
            const coverPhoto = pet.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
            const matchScore = 98 - (idx * 3 % 10);

            return (
              <article
                key={pet.id}
                onClick={() => onSelectAnimal(pet)}
                className="bg-white rounded-2xl p-2.5 flex flex-col justify-between shadow-sm border border-neutral-100 hover:shadow-md transition-all group relative cursor-pointer"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
                    <img
                      src={coverPhoto}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Match Score */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-primary text-[10px] font-extrabold shadow-sm">
                        {matchScore}% Match
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => onToggleFavorite(pet.id, e)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                    >
                      <span
                        className={`text-base ${
                          isFav ? 'text-primary' : 'text-neutral-400'
                        }`}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </span>
                    </button>

                    {/* Distance & Age Pill */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center justify-between text-[10px] text-charcoal font-bold">
                        <span>{pet.distanceKm ? `${pet.distanceKm} km` : 'Perto'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span className="text-neutral-500 font-medium">
                          {pet.ageApproximate}{' '}
                          {pet.ageUnit === 'YEARS' ? 'ano(s)' : 'meses'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="pt-2 px-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-charcoal truncate">
                        {pet.name}
                      </h3>
                      <span
                        className={`text-xs font-bold ${
                          pet.sex === 'MALE' ? 'text-blue-500' : 'text-pink-500'
                        }`}
                      >
                        {pet.sex === 'MALE' ? '♂' : '♀'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {pet.breed || (pet.species === 'DOG' ? 'Cão SRD' : 'Gato SRD')}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pet.healthRecord?.isVaccinated && (
                        <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-[9px] font-bold">
                          Vacinado
                        </span>
                      )}
                      {pet.healthRecord?.isNeutered && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[9px] font-bold">
                          Castrado
                        </span>
                      )}
                      {pet.isSpecialNeeds && (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-bold">
                          Especial
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-2.5 w-full py-2 bg-neutral-100 group-hover:bg-primary group-hover:text-white text-charcoal rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all">
                  <span>Conhecer</span>
                  <span className="text-xs">→</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Banner de Alerta Inteligente */}
      <div className="mt-4 bg-gradient-to-br from-primary/10 to-secondary/15 rounded-2xl p-4 border border-primary/20 relative overflow-hidden flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shrink-0 shadow-sm text-lg">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-charcoal">Não achou seu match hoje?</h4>
            <p className="text-xs text-neutral-600 mt-0.5">
              Crie um alerta inteligente e receba um aviso instantâneo assim que um pet com suas
              preferências chegar ao abrigo parceiro!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
            <span>✓</span> Gratuito & Instantâneo
          </span>
          <button
            onClick={() => showToast('Alerta inteligente configurado com sucesso! 🔔', 'success')}
            className="px-3.5 py-1.5 bg-primary text-white rounded-full text-xs font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
          >
            Criar Alerta
          </button>
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onChangeFilters={onChangeFilters}
        onReset={onResetFilters}
        totalResultsCount={animals.length}
      />
    </div>
  );
};

