import React, { useState, useEffect } from 'react';
import {
  MobileAppShell,
  FloatingBottomNav,
  AppHeader,
  PrimaryButton,
  SecondaryButton,
  SearchInput,
  SpecBadge,
  Badge,
  BottomSheet,
  Dialog,
  Toast,
  PetCardSkeleton,
  EmptyState,
  Tabs,
  PetCard,
  NavTabId,
  PetCardData,
} from './components';
import { Sparkles, Filter } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [pets, setPets] = useState<PetCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DOG' | 'CAT' | 'PUPPY'>('ALL');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Estados dos Componentes Interativos
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isAdoptDialogOpen, setIsAdoptDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Busca animais da API NestJS (PostgreSQL + PostGIS)
  useEffect(() => {
    fetch('http://localhost:3333/api/v1/animals/demo')
      .then((res) => res.json())
      .then((data) => {
        // Mapeia para o tipo do PetCard
        const mappedPets: PetCardData[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          species: item.species,
          breed: item.breed,
          ageApproximate: item.ageApproximate,
          ageUnit: item.ageUnit,
          sex: item.sex,
          city: item.city,
          state: item.state,
          distanceKm: item.name === 'Charlie' ? 5.4 : item.name === 'Luna' ? 5.4 : item.name === 'Thor' ? 83.5 : 0.8,
          photoUrl: item.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          matchScore: item.name === 'Charlie' ? 98 : item.name === 'Luna' ? 94 : 88,
          organizationName: item.organization?.name || 'Protetora Independente',
          traits: item.traits?.map((t: any) => t.name) || [],
          isSpecialNeeds: item.isSpecialNeeds,
        }));
        setPets(mappedPets);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar pets:', err);
        setLoading(false);
      });
  }, []);

  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removido dos favoritos', 'info');
      } else {
        next.add(id);
        showToast('Adicionado aos favoritos com carinho! 🐾', 'success');
      }
      return next;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Filtragem local
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pet.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'DOG' && pet.species === 'DOG') ||
      (categoryFilter === 'CAT' && pet.species === 'CAT') ||
      (categoryFilter === 'PUPPY' && pet.ageApproximate <= 1 && pet.ageUnit === 'YEARS');

    return matchesSearch && matchesCategory;
  });

  return (
    <MobileAppShell>
      {/* Toast Flutuante de Feedback */}
      <Toast
        isOpen={Boolean(toastMessage)}
        message={toastMessage || ''}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Header Mobile Global */}
      <AppHeader
        userName="Lucas"
        locationCity="São Paulo"
        locationState="SP"
        notificationCount={2}
        onOpenNotifications={() => showToast('Você tem 2 notificações não lidas', 'info')}
        onSelectLocation={() => setIsFilterSheetOpen(true)}
      />

      {/* Conteúdo Principal Scrollável */}
      <main className="flex-1 px-5 pb-28 pt-1">
        {/* Banner Hero do Warm Paws System */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8A65] to-[#FF7043] p-5 text-white shadow-coral">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles size={13} />
              Design System Mobile Ativo
            </div>
            <h2 className="mt-2.5 text-xl font-extrabold leading-tight">
              Adote com amor, transforme uma vida
            </h2>
            <p className="mt-1 text-xs text-white/90">
              Todos os animais vacinados, vermifugados e com histórico médico verificado.
            </p>
          </div>
        </div>

        {/* Barra de Busca com Botão de Filtros */}
        <div className="mt-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onOpenFilters={() => setIsFilterSheetOpen(true)}
            activeFiltersCount={categoryFilter !== 'ALL' ? 1 : 0}
            placeholder="Buscar por raça, nome ou cidade..."
          />
        </div>

        {/* Abas Horizontais de Categorias (Warm Paws Tabs) */}
        <div className="mt-4">
          <Tabs
            activeId={categoryFilter}
            onChange={(id) => setCategoryFilter(id as any)}
            options={[
              { id: 'ALL', label: 'Todos os Pets', count: pets.length },
              { id: 'DOG', label: 'Cachorros', icon: <span>🐕</span> },
              { id: 'CAT', label: 'Gatos', icon: <span>🐈</span> },
              { id: 'PUPPY', label: 'Filhotes', icon: <span>🍼</span> },
            ]}
          />
        </div>

        {/* Seção Principal: Lista de Animais */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-extrabold text-charcoal">
                {categoryFilter === 'ALL' ? 'Disponíveis Próximos' : 'Animais Filtrados'}
              </h3>
              <p className="text-xs text-charcoal-muted">
                {filteredPets.length} {filteredPets.length === 1 ? 'amiguinho encontrado' : 'amiguinhos encontrados'}
              </p>
            </div>

            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 text-xs font-bold text-primary border border-[#FFE0B2]"
            >
              <Filter size={12} />
              Filtros
            </button>
          </div>

          {/* Estado de Carregamento (Skeletons) */}
          {loading ? (
            <div className="space-y-4">
              <PetCardSkeleton />
              <PetCardSkeleton />
            </div>
          ) : filteredPets.length === 0 ? (
            <EmptyState
              title="Nenhum pet encontrado"
              description="Tente ajustar os filtros de busca ou remover o termo pesquisado."
              actionText="Limpar Filtros"
              onAction={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={{
                    ...pet,
                    isFavorited: favoritedIds.has(pet.id),
                  }}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => {
                    setSelectedPet(pet);
                    setIsAdoptDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vitrine de Componentes UI do Design System (Para validação da Etapa 03) */}
        <div className="mt-8 rounded-3xl bg-white p-5 shadow-card border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎨</span>
            <div>
              <h4 className="text-sm font-bold text-charcoal">Catálogo do Design System</h4>
              <p className="text-[11px] text-charcoal-muted">Componentes estritamente em conformidade com o Warm Paws</p>
            </div>
          </div>

          {/* Badges de Especificações */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <SpecBadge label="Idade" value="11 meses" variant="apricot" />
            <SpecBadge label="Porte" value="Médio" variant="white" />
            <SpecBadge label="Peso" value="14.5 kg" variant="ice" />
          </div>

          {/* Chips e Badges de Status */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="coral">Warm Coral</Badge>
            <Badge variant="teal">Saúde Verificada</Badge>
            <Badge variant="apricot">Castrado</Badge>
            <Badge variant="ice">Vacinado V10</Badge>
            <Badge variant="success">Aprovado</Badge>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 space-y-2">
            <PrimaryButton
              showArrow
              onClick={() => showToast('Ação Primária executada!', 'success')}
            >
              Quero Adotar Agora
            </PrimaryButton>

            <SecondaryButton
              variant="teal"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              Abrir Bottom Sheet de Filtros
            </SecondaryButton>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar (5 Tabs) */}
      <FloatingBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'favorites') {
            showToast(`${favoritedIds.size} pets favoritados`, 'info');
          }
        }}
        favoritesCount={favoritedIds.size}
      />

      {/* Bottom Sheet de Filtros Mobile */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filtros de Adoção"
      >
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Espécie</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['ALL', 'DOG', 'CAT'] as const).map((sp) => (
                <button
                  key={sp}
                  onClick={() => setCategoryFilter(sp as any)}
                  className={`rounded-2xl p-3 text-xs font-bold border transition-all ${
                    categoryFilter === sp
                      ? 'bg-primary text-white border-primary shadow-coral'
                      : 'bg-white text-charcoal border-gray-200'
                  }`}
                >
                  {sp === 'ALL' ? 'Todos' : sp === 'DOG' ? 'Cães 🐕' : 'Gatos 🐈'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Porte do Animal</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Pequeno', 'Médio', 'Grande', 'Gigante'].map((size) => (
                <Badge key={size} variant="gray" onClick={() => showToast(`Porte selecionado: ${size}`, 'info')}>
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Saúde e Cuidados</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="teal">Vacinado</Badge>
              <Badge variant="apricot">Castrado</Badge>
              <Badge variant="ice">Vermifugado</Badge>
              <Badge variant="gray">Necessidades Especiais</Badge>
            </div>
          </div>

          <PrimaryButton
            onClick={() => {
              setIsFilterSheetOpen(false);
              showToast('Filtros aplicados com sucesso!', 'success');
            }}
          >
            Aplicar Filtros
          </PrimaryButton>
        </div>
      </BottomSheet>

      {/* Dialog Modal de Interesse no Pet */}
      <Dialog
        isOpen={isAdoptDialogOpen}
        onClose={() => setIsAdoptDialogOpen(false)}
        title={selectedPet ? `Adotar ${selectedPet.name}?` : 'Demonstração'}
        description="Você iniciará a primeira etapa do processo responsável de adoção."
      >
        {selectedPet && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-surface-variant p-3">
              <img
                src={selectedPet.photoUrl}
                alt={selectedPet.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-charcoal">{selectedPet.name}</h4>
                <p className="text-xs text-charcoal-muted">{selectedPet.breed} • {selectedPet.city}</p>
                <span className="text-[10px] font-semibold text-[#006A63]">
                  {selectedPet.organizationName}
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Ao clicar em prosseguir, seu perfil será compartilhado com os responsáveis para análise do questionário de triagem.
            </p>

            <div className="flex gap-2 pt-2">
              <SecondaryButton
                variant="outline"
                onClick={() => setIsAdoptDialogOpen(false)}
              >
                Voltar
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  setIsAdoptDialogOpen(false);
                  showToast(`Interesse registrado para ${selectedPet.name}! 🐾`, 'success');
                }}
              >
                Prosseguir
              </PrimaryButton>
            </div>
          </div>
        )}
      </Dialog>
    </MobileAppShell>
  );
}

export default App;
