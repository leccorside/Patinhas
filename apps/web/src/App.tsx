import React, { useState, useEffect, useCallback } from 'react';
import {
  MobileAppShell,
  FloatingBottomNav,
  AppHeader,
  PrimaryButton,
  SecondaryButton,
  Dialog,
  Toast,
  NavTabId,
  PetCard,
  EmptyState,
} from './components';
import {
  LogOut,
  Shield,
  User,
  Edit3,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { ForgotPasswordModal } from './features/auth/ForgotPasswordModal';
import { EditProfileModal } from './features/profile/EditProfileModal';
import { CreateOrganizationModal } from './features/organizations/CreateOrganizationModal';
import { ShelterData } from './features/organizations/ShelterCard';
import { PetDetailView } from './features/animals/PetDetailView';
import { CreatePetStepperModal } from './features/animals/CreatePetStepperModal';
import { animalsService, Animal, SuccessStory } from './features/animals/animalsService';
import { HomeView } from './features/home/HomeView';
import { ExploreView } from './features/explore/ExploreView';
import { FilterState, AdvancedFilterSheet } from './features/explore/AdvancedFilterSheet';
import { MapView } from './features/map/MapView';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Globais e Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [filters, setFilters] = useState<FilterState>({
    maxDistanceKm: 30,
  });

  // Favoritos
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Visualização Detalhada do Pet (Fidelidade UX/UI)
  const [detailedPet, setDetailedPet] = useState<Animal | null>(null);

  // Modais
  const [isCreatePetOpen, setIsCreatePetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isAdoptDialogOpen, setIsAdoptDialogOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedPet, setSelectedPet] = useState<Animal | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Zustand Auth Store
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Carrega animais reais da API com suporte a filtros combinados
  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        userLat: -23.5505,
        userLon: -46.6333,
        search: searchQuery || undefined,
        maxDistanceKm: filters.maxDistanceKm,
        isVaccinated: filters.isVaccinated,
        isNeutered: filters.isNeutered,
        isSpecialNeeds: filters.isSpecialNeeds,
        isPuppy: filters.isPuppy,
        species: filters.species,
        size: filters.size,
        sex: filters.sex,
      };

      // Categoria rápida
      if (categoryFilter === 'DOG') params.species = 'DOG';
      if (categoryFilter === 'CAT') params.species = 'CAT';
      if (categoryFilter === 'PUPPY') params.isPuppy = true;
      if (categoryFilter === 'URGENT') params.isSpecialNeeds = true;

      const res = await animalsService.getAnimals(params);
      setAnimals(res.data);
    } catch (err) {
      console.error('Erro ao carregar animais:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, filters]);

  // Carrega organizações e histórias felizes
  const fetchAuxiliaryData = async () => {
    try {
      const [orgsRes, stories] = await Promise.all([
        fetch('http://localhost:3333/api/v1/organizations').then((r) => r.json()),
        animalsService.getSuccessStories().catch(() => []),
      ]);
      setShelters(orgsRes);
      setSuccessStories(stories);
    } catch (err) {
      console.error('Erro ao carregar dados auxiliares:', err);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setFilters({ maxDistanceKm: 30 });
    showToast('Filtros restaurados', 'info');
  };

  // Se o usuário estiver na tela de detalhes do pet
  if (detailedPet) {
    return (
      <MobileAppShell>
        <PetDetailView
          animal={detailedPet}
          onBack={() => setDetailedPet(null)}
          onAdoptClick={(animal) => {
            setSelectedPet(animal);
            setIsAdoptDialogOpen(true);
          }}
        />

        {/* Dialog Modal de Interesse no Pet */}
        <Dialog
          isOpen={isAdoptDialogOpen}
          onClose={() => setIsAdoptDialogOpen(false)}
          title={selectedPet ? `Adotar ${selectedPet.name}?` : 'Adoção'}
          description="Você iniciará a primeira etapa do processo responsável de adoção."
        >
          {selectedPet && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-surface-variant p-3">
                <img
                  src={selectedPet.photos[0]?.url || ''}
                  alt={selectedPet.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-charcoal">{selectedPet.name}</h4>
                  <p className="text-xs text-charcoal-muted">
                    {selectedPet.breed || 'SRD'} • {selectedPet.city}
                  </p>
                  <span className="text-[10px] font-semibold text-[#006A63]">
                    {selectedPet.organization?.name || 'Protetor Responsável'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isAuthenticated
                  ? 'Ao prosseguir, seu perfil será compartilhado com o abrigo para a triagem inicial e agendamento da visita.'
                  : 'Você precisa estar conectado na sua conta para solicitar a adoção.'}
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
          <HomeView
            animals={animals}
            shelters={shelters}
            successStories={successStories}
            loading={loading}
            onSelectAnimal={setDetailedPet}
            favoritedIds={favoritedIds}
            onToggleFavorite={handleToggleFavorite}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onOpenFilters={() => setIsFilterSheetOpen(true)}
            isAuthenticated={isAuthenticated}
            userName={user?.fullName}
            onCreatePetClick={() => setIsCreatePetOpen(true)}
            onCreateOrgClick={() => setIsCreateOrgOpen(true)}
            showToast={showToast}
          />
        )}

        {/* ABA: EXPLORAR / BUSCA */}
        {activeTab === 'explore' && (
          <ExploreView
            animals={animals}
            loading={loading}
            onSelectAnimal={setDetailedPet}
            favoritedIds={favoritedIds}
            onToggleFavorite={handleToggleFavorite}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onChangeFilters={setFilters}
            onResetFilters={handleResetFilters}
            showToast={showToast}
          />
        )}

        {/* ABA: MAPA */}
        {activeTab === 'map' && (
          <div className="-mx-5 -mt-1">
            <MapView
              onSelectAnimal={setDetailedPet}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
              onSwitchToList={() => setActiveTab('explore')}
              userCity="São Paulo, SP"
              showToast={showToast}
            />
          </div>
        )}

        {/* ABA: FAVORITOS */}
        {activeTab === 'favorites' && (
          <div className="pt-2">
            <h2 className="text-lg font-extrabold text-charcoal mb-1">Meus Favoritos</h2>
            <p className="text-xs text-charcoal-muted mb-4">Pets que conquistaram seu coração</p>

            {animals.filter((p) => favoritedIds.has(p.id)).length === 0 ? (
              <EmptyState
                title="Nenhum amiguinho favoritado"
                description="Toque no ícone de coração nos cards dos pets para salvá-los aqui."
                actionText="Explorar Pets"
                onAction={() => setActiveTab('explore')}
              />
            ) : (
              <div className="space-y-4">
                {animals
                  .filter((p) => favoritedIds.has(p.id))
                  .map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={{
                        id: pet.id,
                        name: pet.name,
                        species: pet.species,
                        breed: pet.breed || 'SRD',
                        ageApproximate: pet.ageApproximate,
                        ageUnit: pet.ageUnit,
                        sex: pet.sex,
                        city: pet.city,
                        state: pet.state,
                        distanceKm: pet.distanceKm || 3.5,
                        photoUrl:
                          pet.photos[0]?.url ||
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
                        matchScore: 95,
                        organizationName: pet.organization?.name || 'Protetor Independente',
                        traits: pet.traits.map((t) => t.name),
                        isSpecialNeeds: pet.isSpecialNeeds,
                        isFavorited: true,
                      }}
                      onFavoriteToggle={handleToggleFavorite}
                      onClick={() => setDetailedPet(pet)}
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

      {/* Bottom Sheet de Filtros Avançados Mobile */}
      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        onReset={handleResetFilters}
        totalResultsCount={animals.length}
      />

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
        onSuccess={fetchAuxiliaryData}
      />

      {/* Modal Stepper de Cadastro de Pet (Etapa 06) */}
      <CreatePetStepperModal
        isOpen={isCreatePetOpen}
        onClose={() => setIsCreatePetOpen(false)}
        onSuccess={() => {
          fetchAnimals();
          showToast('Pet cadastrado com sucesso no Patinhas! 🐾', 'success');
        }}
        userOrganizations={shelters.map((s) => ({ id: s.id, name: s.name }))}
      />
    </MobileAppShell>
  );
}

export default App;
