import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';

export interface FilterState {
  species?: string;
  size?: string;
  sex?: string;
  maxDistanceKm: number;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  isSpecialNeeds?: boolean;
  isPuppy?: boolean;
}

interface AdvancedFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  onReset: () => void;
  totalResultsCount?: number;
}

export const AdvancedFilterSheet: React.FC<AdvancedFilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onReset,
  totalResultsCount,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto flex flex-col gap-5 z-10"
        >
          {/* Grabber indicator */}
          <div className="w-12 h-1.5 rounded-full bg-neutral-200 mx-auto" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-charcoal">Filtros Avançados</h3>
              <p className="text-xs text-neutral-500">
                Encontre o pet que mais combina com seu lar
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
            >
              ✕
            </button>
          </div>

          {/* Slider de Distância */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-charcoal">Distância Máxima</span>
              <span className="text-primary text-sm">{filters.maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.maxDistanceKm}
              onChange={(e) =>
                onChangeFilters({ ...filters, maxDistanceKm: Number(e.target.value) })
              }
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Espécie */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-charcoal">Espécie</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '', label: 'Todos' },
                { id: 'DOG', label: 'Cães 🐕' },
                { id: 'CAT', label: 'Gatos 🐈' },
                { id: 'OTHER', label: 'Outros 🐾' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, species: item.id || undefined })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    (filters.species || '') === item.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-charcoal hover:bg-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Porte */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-charcoal">Porte</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '', label: 'Qualquer' },
                { id: 'SMALL', label: 'Pequeno' },
                { id: 'MEDIUM', label: 'Médio' },
                { id: 'LARGE', label: 'Grande' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, size: item.id || undefined })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    (filters.size || '') === item.id
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-neutral-100 text-charcoal hover:bg-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sexo */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-charcoal">Sexo</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '', label: 'Qualquer' },
                { id: 'MALE', label: 'Macho ♂' },
                { id: 'FEMALE', label: 'Fêmea ♀' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, sex: item.id || undefined })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    (filters.sex || '') === item.id
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'bg-neutral-100 text-charcoal hover:bg-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuidados e Saúde */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-charcoal">Cuidados & Preferências</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  onChangeFilters({ ...filters, isVaccinated: !filters.isVaccinated })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                  filters.isVaccinated
                    ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <span>Apenas Vacinados</span>
                <span>{filters.isVaccinated ? '✓' : '—'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeFilters({ ...filters, isNeutered: !filters.isNeutered })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                  filters.isNeutered
                    ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <span>Apenas Castrados</span>
                <span>{filters.isNeutered ? '✓' : '—'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeFilters({ ...filters, isPuppy: !filters.isPuppy })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                  filters.isPuppy
                    ? 'bg-primary/10 border-primary text-primary font-bold'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <span>Apenas Filhotes 🍼</span>
                <span>{filters.isPuppy ? '✓' : '—'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeFilters({ ...filters, isSpecialNeeds: !filters.isSpecialNeeds })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                  filters.isSpecialNeeds
                    ? 'bg-primary/10 border-primary text-primary font-bold'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <span>Necessidades Especiais</span>
                <span>{filters.isSpecialNeeds ? '✓' : '—'}</span>
              </button>
            </div>
          </div>

          {/* Rodapé com Ações */}
          <div className="pt-2 flex items-center gap-2">
            <SecondaryButton variant="outline" onClick={onReset}>
              Limpar
            </SecondaryButton>
            <div className="flex-1">
              <PrimaryButton fullWidth onClick={onClose}>
                {totalResultsCount !== undefined
                  ? `Ver ${totalResultsCount} amiguinho${totalResultsCount === 1 ? '' : 's'}`
                  : 'Aplicar Filtros'}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

