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
import {
  Sparkles,
  Filter,
  LogOut,
  CheckCircle2,
  Shield,
  User,
  Heart,
  Edit3,
  Building2,
  FileText,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { ForgotPasswordModal } from './features/auth/ForgotPasswordModal';
import { EditProfileModal } from './features/profile/EditProfileModal';
import { CreateOrganizationModal } from './features/organizations/CreateOrganizationModal';
import { ShelterCard, ShelterData } from './features/organizations/ShelterCard';
import { PetDetailView } from './features/animals/PetDetailView';
import { CreatePetStepperModal } from './features/animals/CreatePetStepperModal';
import { animalsService, Animal } from './features/animals/animalsService';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [pets, setPets] = useState<PetCardData[]>([]);
  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DOG' | 'CAT' | 'PUPPY'>('ALL');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Visualização Detalhada do Pet (Etapa 06)
  const [detailedPet, setDetailedPet] = useState<Animal | null>(null);
  const [isCreatePetOpen, setIsCreatePetOpen] = useState(false);

  // Estados dos Modais e Bottom Sheets
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isAdoptDialogOpen, setIsAdoptDialogOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedPet, setSelectedPet] = useState<PetCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Zustand Auth Store
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Busca dados iniciais da API (Animais reais e ONGs)
  const fetchData = async () => {
    setLoading(true);
    try {
      const animalsResponse = await animalsService.getAnimals({
        userLat: -23.5505,
        userLon: -46.6333,
      });

      const mappedPets: PetCardData[] = animalsResponse.data.map((item) => ({
        id: item.id,
        name: item.name,
        species: item.species,
        breed: item.breed || (item.species === 'DOG' ? 'SRD Cão' : 'SRD Gato'),
        ageApproximate: item.ageApproximate,
        ageUnit: item.ageUnit,
        sex: item.sex,
        city: item.city,
        state: item.state,
        distanceKm: item.distanceKm ?? 3.5,
        photoUrl:
          item.photos?.[0]?.url ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        matchScore: item.name === 'Charlie' ? 98 : item.name === 'Luna' ? 94 : 88,
        organizationName: item.organization?.name || 'Protetor Independente',
        traits: item.traits?.map((t) => t.name) || [],
        isSpecialNeeds: item.isSpecialNeeds,
      }));

      setPets(mappedPets);
    } catch (err) {
      console.error('Erro ao buscar animais:', err);
    } finally {
      setLoading(false);
    }

    // Busca organizações cadastradas
    try {
      const res = await fetch('http://localhost:3333/api/v1/organizations');
      if (res.ok) {
        const orgsData = await res.json();
        setShelters(orgsData);
      }
    } catch (err) {
      console.error('Erro ao buscar ONGs:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePetCardClick = async (petCard: PetCardData) => {
    try {
      const fullAnimal = await animalsService.getAnimalById(
        petCard.id,
        -23.5505,
        -46.6333
      );
      setDetailedPet(fullAnimal);
    } catch (error) {
      console.error('Erro ao carregar detalhes do pet:', error);
      setSelectedPet(petCard);
      setIsAdoptDialogOpen(true);
    }
  };

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

  const handleLogout = async () => {
    await logout();
    showToast('Sessão encerrada com sucesso', 'info');
  };

  // Filtragem de pets
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

  // Se o usuário estiver vendo os detalhes de um pet específico (Fidelidade UX/UI)
  if (detailedPet) {
    return (
      <MobileAppShell>
        <PetDetailView
          animal={detailedPet}
          onBack={() => setDetailedPet(null)}
          onAdoptClick={(animal) => {
            setSelectedPet({
              id: animal.id,
              name: animal.name,
              species: animal.species,
              breed: animal.breed || '',
              ageApproximate: animal.ageApproximate,
              ageUnit: animal.ageUnit,
              sex: animal.sex,
              city: animal.city,
              state: animal.state,
              distanceKm: animal.distanceKm || 3.8,
              photoUrl: animal.photos[0]?.url || '',
              organizationName: animal.organization?.name || 'Protetor',
              traits: animal.traits.map((t) => t.name),
            });
            setIsAdoptDialogOpen(true);
          }}
        />

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
                  <p className="text-xs text-charcoal-muted">
                    {selectedPet.breed} • {selectedPet.city}
                  </p>
                  <span className="text-[10px] font-semibold text-[#006A63]">
                    {selectedPet.organizationName}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isAuthenticated
                  ? 'Ao clicar em prosseguir, seu perfil será compartilhado com os responsáveis para análise do questionário de triagem.'
                  : 'Você precisa estar conectado na sua conta para enviar a solicitação de adoção.'}
              </p>

              <div className="flex gap-2 pt-2">
                <SecondaryButton variant="outline" onClick={() => setIsAdoptDialogOpen(false)}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => {
                    setIsAdoptDialogOpen(false);
                    if (!isAuthenticated) {
                      setActiveTab('profile');
                      setDetailedPet(null);
                      showToast('Faça login para continuar a adoção', 'info');
                    } else {
                      showToast(`Interesse registrado para ${selectedPet.name}! 🐾`, 'success');
                    }
                  }}
                >
                  {isAuthenticated ? 'Prosseguir' : 'Fazer Login'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </Dialog>
      </MobileAppShell>
    );
  }

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
        userName={user?.fullName || 'Adotante'}
        locationCity="São Paulo"
        locationState="SP"
        notificationCount={isAuthenticated ? 2 : 0}
        onOpenNotifications={() => showToast('Você tem 2 notificações não lidas', 'info')}
        onSelectLocation={() => setIsFilterSheetOpen(true)}
      />

      {/* Conteúdo Principal Scrollável */}
      <main className="flex-1 px-5 pb-28 pt-1">
        {/* ABA: INÍCIO */}
        {activeTab === 'home' && (
          <>
            {/* Banner Hero do Warm Paws System */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8A65] to-[#FF7043] p-5 text-white shadow-coral">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                  <Sparkles size={13} />
                  Gestão & Cadastro de Pets Ativos
                </div>
                <h2 className="mt-2.5 text-xl font-extrabold leading-tight">
                  Adote com amor, transforme uma vida
                </h2>
                <p className="mt-1 text-xs text-white/90">
                  {isAuthenticated
                    ? `Olá, ${user?.fullName}! Conecte-se com ONGs e cadastre pets para adoção.`
                    : 'Cadastre-se ou entre na sua conta para acompanhar processos de adoção.'}
                </p>

                {isAuthenticated && (
                  <div className="mt-4">
                    <button
                      onClick={() => setIsCreatePetOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-primary shadow-md hover:bg-neutral-50 active:scale-95 transition-all"
                    >
                      <PlusCircle size={15} />
                      Cadastrar Novo Pet
                    </button>
                  </div>
                )}
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

            {/* Abas Horizontais de Categorias */}
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

            {/* Seção de Animais Próximos */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-charcoal">
                    {categoryFilter === 'ALL' ? 'Disponíveis Próximos' : 'Animais Filtrados'}
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    {filteredPets.length}{' '}
                    {filteredPets.length === 1 ? 'amiguinho encontrado' : 'amiguinhos encontrados'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsCreatePetOpen(true)}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      + Pet
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 text-xs font-bold text-primary border border-[#FFE0B2]"
                  >
                    <Filter size={12} />
                    Filtros
                  </button>
                </div>
              </div>

              {/* Skeletons ou Cards */}
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
                      onClick={() => handlePetCardClick(pet)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Seção: ONGs e Abrigos Verificados */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-charcoal">ONGs & Abrigos</h3>
                  <p className="text-xs text-charcoal-muted">Organizações dedicadas à causa animal</p>
                </div>

                {isAuthenticated && (
                  <button
                    onClick={() => setIsCreateOrgOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    + Criar ONG
                  </button>
                )}
              </div>

              <div className="space-y-3">
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
            </div>
          </>
        )}

        {/* ABA: EXPLORAR / BUSCA */}
        {activeTab === 'explore' && (
          <div className="pt-2">
            <h2 className="text-lg font-extrabold text-charcoal mb-3">Explorar Pets</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onOpenFilters={() => setIsFilterSheetOpen(true)}
              placeholder="Digite raça, nome ou cidade..."
            />
            <div className="mt-4 space-y-3">
              {filteredPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={{ ...pet, isFavorited: favoritedIds.has(pet.id) }}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => handlePetCardClick(pet)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ABA: MAPA */}
        {activeTab === 'map' && (
          <div className="pt-2">
            <h2 className="text-lg font-extrabold text-charcoal mb-1">Mapa de Adoção</h2>
            <p className="text-xs text-charcoal-muted mb-4">Animais próximos com cálculo espacial PostGIS</p>
            <EmptyState
              title="Mapa em Geolocalização Ativa"
              description="Visualize animais próximos em um raio personalizado no mapa interativo."
              actionText="Ver Lista Próxima"
              onAction={() => setActiveTab('home')}
            />
          </div>
        )}

        {/* ABA: FAVORITOS */}
        {activeTab === 'favorites' && (
          <div className="pt-2">
            <h2 className="text-lg font-extrabold text-charcoal mb-1">Meus Favoritos</h2>
            <p className="text-xs text-charcoal-muted mb-4">Pets que conquistaram seu coração</p>

            {pets.filter((p) => favoritedIds.has(p.id)).length === 0 ? (
              <EmptyState
                title="Nenhum amiguinho favoritado"
                description="Toque no ícone de coração nos cards dos pets para salvá-los aqui."
                actionText="Explorar Pets"
                onAction={() => setActiveTab('home')}
              />
            ) : (
              <div className="space-y-4">
                {pets
                  .filter((p) => favoritedIds.has(p.id))
                  .map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={{ ...pet, isFavorited: true }}
                      onFavoriteToggle={handleFavoriteToggle}
                      onClick={() => handlePetCardClick(pet)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: PERFIL */}
        {activeTab === 'profile' && (
          <div className="pt-2">
            {!isAuthenticated ? (
              authMode === 'login' ? (
                <LoginView
                  onNavigateToRegister={() => setAuthMode('register')}
                  onForgotPassword={() => setIsForgotPasswordOpen(true)}
                  showToast={showToast}
                />
              ) : (
                <RegisterView
                  onSuccess={() => {
                    setAuthMode('login');
                    showToast('Cadastro realizado! Faça login para continuar.', 'success');
                  }}
                  onNavigateToLogin={() => setAuthMode('login')}
                  showToast={showToast}
                />
              )
            ) : (
              <div className="space-y-5">
                {/* Card de Perfil Resumido */}
                <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-100">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user?.avatarUrl || user?.profile?.avatarUrl ? (
                        <img
                          src={user?.avatarUrl || user?.profile?.avatarUrl || ''}
                          alt={user?.fullName || ''}
                          className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-secondary border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base font-extrabold text-charcoal truncate">
                          {user?.fullName}
                        </h2>
                        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                          {user?.role === 'SHELTER_MEMBER'
                            ? 'ONG'
                            : user?.role === 'PROTECTOR'
                            ? 'Protetor'
                            : 'Adotante'}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {user?.profile?.addressCity || user?.city
                          ? `${user?.profile?.addressCity || user?.city} - ${user?.profile?.addressState || user?.state || 'SP'}`
                          : 'São Paulo - SP'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="p-2 rounded-full hover:bg-neutral-100 text-charcoal-muted transition-colors"
                      title="Editar Perfil"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>

                  {(user?.profile?.bio || user?.bio) && (
                    <p className="mt-3 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      "{user?.profile?.bio || user?.bio}"
                    </p>
                  )}
                </div>

                {/* Ações Rápidas de Gestão */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsCreatePetOpen(true)}
                    className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-left hover:bg-primary/15 transition-all"
                  >
                    <span className="text-xl block mb-1">🐾</span>
                    <span className="text-xs font-extrabold text-primary block">Cadastrar Pet</span>
                    <span className="text-[10px] text-neutral-500">Formulário em 6 etapas</span>
                  </button>

                  <button
                    onClick={() => setIsCreateOrgOpen(true)}
                    className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-left hover:bg-secondary/15 transition-all"
                  >
                    <span className="text-xl block mb-1">🏢</span>
                    <span className="text-xs font-extrabold text-secondary block">Criar ONG</span>
                    <span className="text-[10px] text-neutral-500">Perfil institucional</span>
                  </button>
                </div>

                {/* Opções de Configuração */}
                <div className="rounded-3xl bg-white shadow-sm border border-neutral-100 divide-y divide-neutral-100 text-xs">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <User size={16} className="text-primary" />
                      <span className="font-bold text-charcoal">Editar Dados Pessoais</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>

                  <button
                    onClick={() => showToast('Privacidade e termos em conformidade com LGPD', 'info')}
                    className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield size={16} className="text-secondary" />
                      <span className="font-bold text-charcoal">Privacidade e LGPD</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>

                  <button
                    onClick={() => showToast('Central de Ajuda ativa', 'info')}
                    className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle size={16} className="text-charcoal-muted" />
                      <span className="font-bold text-charcoal">Central de Ajuda</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>
                </div>

                {/* Botão de Logout */}
                <SecondaryButton
                  variant="outline"
                  onClick={handleLogout}
                  icon={<LogOut size={16} className="text-red-500" />}
                >
                  <span className="text-red-500 font-bold">Encerrar Sessão</span>
                </SecondaryButton>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar (5 Tabs) */}
      <FloatingBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
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
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Espécie
            </label>
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
                <p className="text-xs text-charcoal-muted">
                  {selectedPet.breed} • {selectedPet.city}
                </p>
                <span className="text-[10px] font-semibold text-[#006A63]">
                  {selectedPet.organizationName}
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              {isAuthenticated
                ? 'Ao clicar em prosseguir, seu perfil será compartilhado com os responsáveis para análise do questionário de triagem.'
                : 'Você precisa estar conectado na sua conta para enviar a solicitação de adoção.'}
            </p>

            <div className="flex gap-2 pt-2">
              <SecondaryButton variant="outline" onClick={() => setIsAdoptDialogOpen(false)}>
                Voltar
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  setIsAdoptDialogOpen(false);
                  if (!isAuthenticated) {
                    setActiveTab('profile');
                    showToast('Faça login para continuar a adoção', 'info');
                  } else {
                    showToast(`Interesse registrado para ${selectedPet.name}! 🐾`, 'success');
                  }
                }}
              >
                {isAuthenticated ? 'Prosseguir' : 'Fazer Login'}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal de Esqueci Minha Senha */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        showToast={showToast}
      />

      {/* Modal de Edição de Perfil e Upload MinIO */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        showToast={showToast}
      />

      {/* Modal de Cadastro de ONG */}
      <CreateOrganizationModal
        isOpen={isCreateOrgOpen}
        onClose={() => setIsCreateOrgOpen(false)}
        showToast={showToast}
        onSuccess={fetchData}
      />

      {/* Modal Stepper de Cadastro de Pet (Etapa 06) */}
      <CreatePetStepperModal
        isOpen={isCreatePetOpen}
        onClose={() => setIsCreatePetOpen(false)}
        onSuccess={() => {
          fetchData();
          showToast('Pet cadastrado com sucesso no Patinhas! 🐾', 'success');
        }}
        userOrganizations={shelters.map((s) => ({ id: s.id, name: s.name }))}
      />
    </MobileAppShell>
  );
}

export default App;
