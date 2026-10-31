import React from 'react';
import { SearchInput } from '../../components/ui/SearchInput';
import { Animal, SuccessStory } from '../animals/animalsService';
import { ShelterCard, ShelterData } from '../organizations/ShelterCard';
import { PetCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';

interface HomeViewProps {
  animals: Animal[];
  shelters: ShelterData[];
  successStories: SuccessStory[];
  loading: boolean;
  onSelectAnimal: (animal: Animal) => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  onOpenFilters: () => void;
  isAuthenticated: boolean;
  userName?: string;
  onCreatePetClick: () => void;
  onCreateOrgClick: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  animals,
  shelters,
  successStories,
  loading,
  onSelectAnimal,
  favoritedIds,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onOpenFilters,
  isAuthenticated,
  userName,
  onCreatePetClick,
  onCreateOrgClick,
  showToast,
}) => {
  // Pet em destaque urgente (Thor ou o primeiro da lista)
  const urgentPet = animals.find((a) => a.name === 'Thor') || animals[0];
  const featuredStory = successStories[0];

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        onOpenFilters={onOpenFilters}
        placeholder="Buscar por raça, nome ou cidade..."
      />

      {/* Horizontal Category Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Todos os Pets' },
          { id: 'DOG', label: 'Cachorros 🐕' },
          { id: 'CAT', label: 'Gatos 🐈' },
          { id: 'PUPPY', label: 'Filhotes 🍼' },
          { id: 'URGENT', label: 'Urgentes 🚨' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              categoryFilter === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Banner de Urgência & Lar Temporário (Fiel ao UX/UI) */}
      {urgentPet && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF7043] via-[#FF8A65] to-[#FF7043] p-5 text-white shadow-[0_8px_24px_rgba(255,112,67,0.28)]">
          <div className="relative z-10 flex flex-col space-y-2 max-w-[70%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase tracking-wider font-extrabold self-start">
              🚨 Lar Temporário Urgente
            </span>
            <h2 className="text-lg font-extrabold text-white leading-tight">
              {urgentPet.name} precisa de um lar até o fim do mês!
            </h2>
            <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
              {urgentPet.description || 'Dócil, brincalhão e pronto para receber todo o amor da sua família.'}
            </p>
            <div className="pt-1">
              <button
                onClick={() => onSelectAnimal(urgentPet)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-primary text-xs font-extrabold shadow-md hover:bg-neutral-50 transition-transform active:scale-95"
              >
                <span>Ajudar agora</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Imagem Recortada Decorativa */}
          <div className="absolute -right-3 -bottom-3 w-36 h-40 rounded-full overflow-hidden bg-white/20 pointer-events-none">
            <img
              src={
                urgentPet.photos[0]?.url ||
                'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'
              }
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        </section>
      )}

      {/* Seção: Animais Próximos de Você */}
      <section className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-charcoal">
              Animais próximos de você
            </h2>
            <span className="text-xs text-neutral-500">
              Prontos para ganhar um lar seguro
            </span>
          </div>
          <button
            onClick={() => onCategoryChange('ALL')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>Ver todos</span>
            <span>→</span>
          </button>
        </div>

        {/* Bento Cards Verticais */}
        {loading ? (
          <div className="space-y-4">
            <PetCardSkeleton />
            <PetCardSkeleton />
          </div>
        ) : animals.length === 0 ? (
          <EmptyState
            title="Nenhum pet encontrado"
            description="Tente escolher outra categoria ou ajustar seus filtros de busca."
            actionText="Ver Todos"
            onAction={() => onCategoryChange('ALL')}
          />
        ) : (
          <div className="flex flex-col space-y-4">
            {animals.map((pet) => {
              const isFav = favoritedIds.has(pet.id);
              const coverPhoto =
                pet.photos?.[0]?.url ||
                'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

              return (
                <article
                  key={pet.id}
                  onClick={() => onSelectAnimal(pet)}
                  className="relative flex flex-col bg-white rounded-3xl p-4 shadow-[0_8px_24px_rgba(38,50,56,0.06)] border border-neutral-100 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Photo Frame */}
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-neutral-100">
                    <img src={coverPhoto} alt={pet.name} className="w-full h-full object-cover" />

                    {/* Botão Favoritar Flutuante */}
                    <button
                      onClick={(e) => onToggleFavorite(pet.id, e)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                      <span className={`text-lg ${isFav ? 'text-primary' : 'text-neutral-400'}`}>
                        {isFav ? '❤️' : '🤍'}
                      </span>
                    </button>

                    {/* Distância Pill */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-charcoal shadow-sm">
                      <span className="text-secondary text-sm">📍</span>
                      <span>
                        {pet.city} • {pet.distanceKm ? `${pet.distanceKm} km` : 'Próximo'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col pt-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-charcoal leading-none">
                          {pet.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          {pet.breed || (pet.species === 'DOG' ? 'Cachorro SRD' : 'Gato SRD')} •{' '}
                          {pet.sex === 'MALE' ? 'Macho' : 'Fêmea'}
                        </p>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                        {pet.ageApproximate} {pet.ageUnit === 'YEARS' ? 'ano(s)' : 'meses'}
                      </span>
                    </div>

                    {/* Badges de Saúde & Convivência */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pet.healthRecord?.isVaccinated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-semibold">
                          <span>✓</span> Vacinado
                        </span>
                      )}
                      {pet.healthRecord?.isNeutered && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                          <span>✓</span> Castrado
                        </span>
                      )}
                      {pet.traits?.[0] && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px]">
                          <span>🐾</span> {pet.traits[0].name}
                        </span>
                      )}
                    </div>

                    {/* Botão de Ação Principal */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnimal(pet);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#FF8A65] text-white font-bold text-xs shadow-coral hover:opacity-95 transition-all"
                      >
                        <span>Quero Adotar o {pet.name}</span>
                        <span className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center font-bold text-xs">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Seção: ONGs e Abrigos Verificados */}
      <section className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-charcoal">
              ONGs & Abrigos Verificados
            </h2>
            <span className="text-xs text-neutral-500">
              Instituições com garantia de cuidado ético
            </span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={onCreateOrgClick}
              className="text-xs font-bold text-primary hover:underline"
            >
              + Criar ONG
            </button>
          ) : (
            <span className="text-xs font-bold text-secondary">Verificadas ✓</span>
          )}
        </div>

        <div className="flex flex-col space-y-2.5">
          {shelters.map((shelter) => (
            <ShelterCard
              key={shelter.id}
              shelter={shelter}
              onContact={() =>
                showToast(`Abrindo perfil institucional de ${shelter.name}`, 'info')
              }
            />
          ))}
        </div>
      </section>

      {/* História Feliz da Semana (Finais Felizes) */}
      {featuredStory && (
        <section className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-4 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💛</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Finais Felizes
              </span>
              <h3 className="text-sm font-extrabold text-charcoal">
                {featuredStory.petName} encontrou seu humano!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-2xl p-2.5 shadow-sm border border-neutral-100">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
              <img
                src={featuredStory.photoAfter}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 text-xs">
              <p className="text-neutral-600 italic line-clamp-2">
                "{featuredStory.testimonial}"
              </p>
              <span className="font-bold text-primary mt-1 text-[11px]">
                — {featuredStory.adopterName} & {featuredStory.petName}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

