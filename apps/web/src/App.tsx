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
  ChevronRight,
  ClipboardList,
  MessageSquare,
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
import { FavoritesView } from './features/favorites/FavoritesView';
import { DiscoveryModeModal } from './features/discovery/DiscoveryModeModal';
import { AdoptionQuestionnaireModal } from './features/adoption/AdoptionQuestionnaireModal';
import { MyAdoptionsView } from './features/adoption/MyAdoptionsView';
import { AdoptionProcessDetailModal } from './features/adoption/AdoptionProcessDetailModal';
import { AdoptionApplication } from './features/adoption/adoptionService';
import { ChatViewModal } from './features/chat/ChatViewModal';
import { ConversationsListViewModal } from './features/chat/ConversationsListViewModal';
import { chatService } from './features/chat/chatService';
import { NotificationsViewModal } from './features/notifications/NotificationsViewModal';
import { notificationsService } from './features/notifications/notificationsService';
import { MatchExplanationModal } from './features/matching/MatchExplanationModal';
import { ShelterDashboardView } from './features/shelter/ShelterDashboardView';
import { AdminMasterDashboardView } from './features/admin/AdminMasterDashboardView';
import { Building2 } from 'lucide-react';

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
  const [isDiscoveryModeOpen, setIsDiscoveryModeOpen] = useState(false);

  // Visualização Detalhada do Pet (Fidelidade UX/UI)
  const [detailedPet, setDetailedPet] = useState<Animal | null>(null);

  // Modais e Fluxo de Adoção (Etapa 10)
  const [isCreatePetOpen, setIsCreatePetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isAdoptDialogOpen, setIsAdoptDialogOpen] = useState(false);
  const [isAdoptionQuestionnaireOpen, setIsAdoptionQuestionnaireOpen] = useState(false);
  const [isMyAdoptionsOpen, setIsMyAdoptionsOpen] = useState(false);
  const [selectedApplicationForDetail, setSelectedApplicationForDetail] = useState<AdoptionApplication | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedPet, setSelectedPet] = useState<Animal | null>(null);

  // Chat em Tempo Real (Etapa 11)
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [isConversationsListOpen, setIsConversationsListOpen] = useState(false);

  // Notificações e Web Push (Etapa 12)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Match Inteligente (Etapa 13)
  const [matchExplanationPet, setMatchExplanationPet] = useState<Animal | null>(null);

  // Dashboard de ONG e Protetor (Etapa 14)
  const [isShelterDashboardOpen, setIsShelterDashboardOpen] = useState(false);

  // Painel Admin Master (Etapa 15)
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Zustand Auth Store
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const notifs = await notificationsService.getNotifications();
      const unread = notifs.filter((n) => !n.isRead).length;
      setUnreadNotificationsCount(unread);
    } catch {
      // Ignora erro
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotifications();
    }
  }, [isAuthenticated, fetchUnreadNotifications]);

  const handleOpenChatForAnimal = async (animalId: string) => {
    if (!isAuthenticated) {
      setActiveTab('profile');
      showToast('Faça login para conversar com o responsável! 🐾', 'info');
      return;
    }
    try {
      const conv = await chatService.getOrCreateConversation(animalId);
      setActiveChatConversationId(conv.id);
    } catch (err: any) {
      showToast(err.message || 'Erro ao abrir chat com o responsável.', 'error');
    }
  };

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

  // Carrega IDs favoritos do usuário se estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      animalsService
        .getFavoriteIds()
        .then((ids) => {
          if (Array.isArray(ids)) {
            setFavoritedIds(new Set(ids));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyFav = favoritedIds.has(id);

    // Atualização otimista
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFav) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (isCurrentlyFav) {
      showToast('Removido dos favoritos', 'info');
      if (isAuthenticated) {
        animalsService.removeFavorite(id).catch(() => {});
      }
    } else {
      showToast('Adicionado aos favoritos com carinho! 🐾', 'success');
      if (isAuthenticated) {
        animalsService.addFavorite(id).catch(() => {});
      }
    }
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
          onOpenMatchModal={(animal) => setMatchExplanationPet(animal)}
          onAdoptClick={(animal) => {
            if (!isAuthenticated) {
              setDetailedPet(null);
              setActiveTab('profile');
              showToast(`Faça login para adotar ${animal.name}! 🐾`, 'info');
              return;
            }
            setSelectedPet(animal);
            setIsAdoptionQuestionnaireOpen(true);
          }}
        />

        {/* Modal de Questionário de Adoção (Etapa 10) */}
        <AdoptionQuestionnaireModal
          isOpen={isAdoptionQuestionnaireOpen}
          onClose={() => setIsAdoptionQuestionnaireOpen(false)}
          animal={selectedPet || detailedPet}
          onSuccess={(appId) => {
            setDetailedPet(null);
            setIsMyAdoptionsOpen(true);
            setActiveTab('profile');
          }}
          showToast={showToast}
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
        notificationCount={unreadNotificationsCount}
        onOpenNotifications={() => {
          if (!isAuthenticated) {
            setActiveTab('profile');
            showToast('Faça login para ver suas notificações! 🐾', 'info');
            return;
          }
          setIsNotificationsOpen(true);
        }}
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
          <FavoritesView
            favorites={animals.filter((p) => favoritedIds.has(p.id))}
            loading={loading}
            onSelectAnimal={setDetailedPet}
            onRemoveFavorite={(id, e) => handleToggleFavorite(id, e)}
            onOpenDiscoveryMode={() => setIsDiscoveryModeOpen(true)}
            onAdoptClick={(animal) => {
              if (!isAuthenticated) {
                setActiveTab('profile');
                showToast(`Faça login para solicitar a adoção de ${animal.name}! 🐾`, 'info');
                return;
              }
              setSelectedPet(animal);
              setIsAdoptionQuestionnaireOpen(true);
            }}
            showToast={showToast}
          />
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
            ) : isAdminDashboardOpen ? (
              <AdminMasterDashboardView onBack={() => setIsAdminDashboardOpen(false)} />
            ) : isShelterDashboardOpen ? (
              <ShelterDashboardView
                onBack={() => setIsShelterDashboardOpen(false)}
                onOpenRegisterPet={() => {
                  setIsShelterDashboardOpen(false);
                  setIsCreatePetOpen(true);
                }}
                onOpenChat={(convId) => {
                  setIsShelterDashboardOpen(false);
                  setActiveChatConversationId(convId);
                }}
                onViewPet={(petId) => {
                  const found = animals.find((a) => a.id === petId);
                  if (found) {
                    setDetailedPet(found);
                    setIsShelterDashboardOpen(false);
                  }
                }}
              />
            ) : isMyAdoptionsOpen ? (
              <div className="space-y-3">
                <button
                  onClick={() => setIsMyAdoptionsOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary px-1 hover:underline"
                >
                  ← Voltar ao Meu Perfil
                </button>
                <MyAdoptionsView
                  onSelectApplication={(app) => setSelectedApplicationForDetail(app)}
                  onOpenChatWithHost={(animalId, petName) => {
                    handleOpenChatForAnimal(animalId);
                  }}
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="space-y-4">
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

                {/* Banner de Minhas Solicitações de Adoção (Etapa 10) */}
                <button
                  onClick={() => setIsMyAdoptionsOpen(true)}
                  className="flex w-full items-center justify-between p-4 bg-gradient-to-r from-primary/10 via-amber-50 to-secondary/10 rounded-3xl border border-primary/20 shadow-sm text-left hover:opacity-95 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                      🐾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-charcoal block">
                          Minhas Solicitações de Adoção
                        </span>
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      </div>
                      <span className="text-[11px] text-charcoal-muted">
                        Acompanhe etapas, triagem e entrevistas
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Banner de Mensagens e Chat em Tempo Real (Etapa 11) */}
                <button
                  onClick={() => setIsConversationsListOpen(true)}
                  className="flex w-full items-center justify-between p-4 bg-white rounded-3xl border border-neutral-100 shadow-sm text-left hover:border-secondary/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                      💬
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-charcoal block">
                          Mensagens & Chat em Tempo Real
                        </span>
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                      </div>
                      <span className="text-[11px] text-charcoal-muted">
                        Converse diretamente com os responsáveis pelos pets
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Banner de Painel da ONG e Protetor (Etapa 14) */}
                <button
                  onClick={() => setIsShelterDashboardOpen(true)}
                  className="flex w-full items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/40 rounded-3xl border border-emerald-200/70 shadow-sm text-left hover:border-emerald-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#4DB6AC] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#4DB6AC]/30 group-hover:scale-105 transition-transform">
                      🏢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#263238] block">
                          Painel da ONG & Protetores
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                          Gestão Mobile
                        </span>
                      </div>
                      <span className="text-[11px] text-[#78909C]">
                        Métricas, triagem rápida de candidaturas e equipe
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Banner de Admin Master (Etapa 15) */}
                {user?.role === 'MASTER_ADMIN' && (
                  <button
                    onClick={() => setIsAdminDashboardOpen(true)}
                    className="flex w-full items-center justify-between p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100/50 rounded-3xl border border-purple-200 shadow-sm text-left hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-purple-950 block">
                            Painel Admin Master
                          </span>
                          <span className="text-[10px] bg-purple-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                            Global
                          </span>
                        </div>
                        <span className="text-[11px] text-purple-700">
                          Moderação de ONGs, usuários e logs de auditoria
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

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

      {/* Modo Descoberta (Tinder-style Swipe - Etapa 09) */}
      <DiscoveryModeModal
        isOpen={isDiscoveryModeOpen}
        onClose={() => setIsDiscoveryModeOpen(false)}
        animals={animals}
        onLike={(animal) => {
          setFavoritedIds((prev) => new Set([...prev, animal.id]));
          if (isAuthenticated) {
            animalsService.addFavorite(animal.id).catch(() => {});
          }
        }}
        onDislike={() => {}}
        onSelectAnimal={(animal) => {
          setIsDiscoveryModeOpen(false);
          setDetailedPet(animal);
        }}
        showToast={showToast}
      />

      {/* Modal de Questionário de Adoção (Etapa 10) */}
      <AdoptionQuestionnaireModal
        isOpen={isAdoptionQuestionnaireOpen}
        onClose={() => setIsAdoptionQuestionnaireOpen(false)}
        animal={selectedPet}
        onSuccess={(appId) => {
          setIsMyAdoptionsOpen(true);
          setActiveTab('profile');
        }}
        showToast={showToast}
      />

      {/* Modal de Detalhes e Timeline do Processo (Etapa 10) */}
      <AdoptionProcessDetailModal
        isOpen={!!selectedApplicationForDetail}
        application={selectedApplicationForDetail}
        onClose={() => setSelectedApplicationForDetail(null)}
        onCancelSuccess={() => {
          // Recarrega se necessário
        }}
        showToast={showToast}
      />

      {/* Lista de Conversas do Usuário (Etapa 11) */}
      <ConversationsListViewModal
        isOpen={isConversationsListOpen}
        onClose={() => setIsConversationsListOpen(false)}
        currentUserId={user?.id || ''}
        onSelectConversation={(convId) => {
          setIsConversationsListOpen(false);
          setActiveChatConversationId(convId);
        }}
        showToast={showToast}
      />

      {/* Janela de Chat em Tempo Real com Socket.IO (Etapa 11) */}
      {activeChatConversationId && (
        <ChatViewModal
          isOpen={!!activeChatConversationId}
          conversationId={activeChatConversationId}
          onClose={() => setActiveChatConversationId(null)}
          currentUserId={user?.id || ''}
          showToast={showToast}
        />
      )}

      {/* Central de Notificações e Web Push (Etapa 12) */}
      <NotificationsViewModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          fetchUnreadNotifications();
        }}
        onActionClick={(url) => {
          setIsNotificationsOpen(false);
          if (url.includes('adoptions') || url.includes('solicitacoes')) {
            setIsMyAdoptionsOpen(true);
            setActiveTab('profile');
          } else if (url.includes('chat') || url.includes('conversas')) {
            setIsConversationsListOpen(true);
          }
        }}
        showToast={showToast}
      />

      {/* Modal Explicativo de Match Inteligente (Etapa 13) */}
      <MatchExplanationModal
        isOpen={Boolean(matchExplanationPet)}
        animalId={matchExplanationPet?.id || null}
        animalName={matchExplanationPet?.name}
        onClose={() => setMatchExplanationPet(null)}
        onAdoptClick={() => {
          if (matchExplanationPet) {
            setSelectedPet(matchExplanationPet);
            setMatchExplanationPet(null);
            setIsAdoptionQuestionnaireOpen(true);
          }
        }}
        showToast={showToast}
      />
    </MobileAppShell>
  );
}

export default App;
