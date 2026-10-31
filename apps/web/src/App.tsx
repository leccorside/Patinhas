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
import { Sparkles, Filter, LogOut, CheckCircle2, Shield, User, Heart, Settings, HelpCircle, FileText } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { ForgotPasswordModal } from './features/auth/ForgotPasswordModal';

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
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedPet, setSelectedPet] = useState<PetCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Zustand Auth Store
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Busca animais da API NestJS (PostgreSQL + PostGIS)
  useEffect(() => {
    fetch('http://localhost:3333/api/v1/animals/demo')
      .then((res) => res.json())
      .then((data) => {
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

  const handleLogout = async () => {
    await logout();
    showToast('Sessão encerrada com sucesso', 'info');
  };

  // Filtragem local de pets
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
        userName={user?.fullName || 'Adotante'}
        locationCity="São Paulo"
        locationState="SP"
        notificationCount={isAuthenticated ? 2 : 0}
        onOpenNotifications={() => showToast('Você tem 2 notificações não lidas', 'info')}
        onSelectLocation={() => setIsFilterSheetOpen(true)}
      />

      {/* Roteamento de Abas Internas Mobile */}
      <main className="flex-1 px-5 pb-28 pt-1">
        {activeTab === 'home' && (
          <>
            {/* Banner Hero do Warm Paws System */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8A65] to-[#FF7043] p-5 text-white shadow-coral">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                  <Sparkles size={13} />
                  Autenticação & Segurança Ativas
                </div>
                <h2 className="mt-2.5 text-xl font-extrabold leading-tight">
                  Adote com amor, transforme uma vida
                </h2>
                <p className="mt-1 text-xs text-white/90">
                  {isAuthenticated
                    ? `Olá, ${user?.fullName}! Animais compatíveis com você esperam um lar.`
                    : 'Cadastre-se ou entre na sua conta para iniciar processos de adoção.'}
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
                      onClick={() => {
                        setSelectedPet(pet);
                        setIsAdoptDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ABA DE PERFIL / AUTENTICAÇÃO */}
        {activeTab === 'profile' && (
          <div className="pt-2">
            {!isAuthenticated ? (
              authMode === 'login' ? (
                <LoginView
                  onSuccess={() => setActiveTab('home')}
                  onNavigateToRegister={() => setAuthMode('register')}
                  onForgotPassword={() => setIsForgotPasswordOpen(true)}
                  showToast={showToast}
                />
              ) : (
                <RegisterView
                  onSuccess={() => setAuthMode('login')}
                  onNavigateToLogin={() => setAuthMode('login')}
                  showToast={showToast}
                />
              )
            ) : (
              // Visão do Perfil Autenticado (baseada em uxui/perfil_do_adotante_patinhas)
              <div className="space-y-5">
                {/* Card de Identidade do Usuário */}
                <div className="overflow-hidden rounded-3xl bg-white p-5 shadow-card border border-gray-100 text-center">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A65] to-[#FF7043] text-2xl font-black text-white shadow-coral">
                    {user?.fullName.charAt(0)}
                    <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white">
                      <CheckCircle2 size={12} />
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold text-charcoal">{user?.fullName}</h3>
                  <p className="text-xs text-charcoal-muted">{user?.email}</p>

                  <div className="mt-3 flex justify-center gap-2">
                    <Badge variant="coral">
                      {user?.role === 'MASTER_ADMIN'
                        ? 'Administrador Master'
                        : user?.role === 'SHELTER_MEMBER'
                        ? 'Representante de ONG'
                        : user?.role === 'PROTECTOR'
                        ? 'Protetor Independente'
                        : 'Adotante Verificado'}
                    </Badge>
                    <Badge variant="success">Conta Ativa</Badge>
                  </div>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-3 gap-2">
                  <SpecBadge label="Favoritos" value={favoritedIds.size} variant="apricot" />
                  <SpecBadge label="Adoções" value="0" variant="white" />
                  <SpecBadge label="Mensagens" value="0" variant="ice" />
                </div>

                {/* Menu de Configurações e Atalhos */}
                <div className="rounded-3xl bg-white shadow-card border border-gray-100 overflow-hidden divide-y divide-gray-100 text-xs">
                  <button className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <User size={16} className="text-primary" />
                      <span className="font-bold text-charcoal">Meus Dados Pessoais</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>

                  <button className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Heart size={16} className="text-[#E91E63]" />
                      <span className="font-bold text-charcoal">Animais Favoritados</span>
                    </div>
                    <span className="text-charcoal-muted">{favoritedIds.size} ›</span>
                  </button>

                  <button className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-secondary" />
                      <span className="font-bold text-charcoal">Comprovantes & Documentos</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>

                  <button className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Shield size={16} className="text-[#0277BD]" />
                      <span className="font-bold text-charcoal">Privacidade e LGPD</span>
                    </div>
                    <span className="text-charcoal-muted">›</span>
                  </button>

                  <button className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
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

        {/* ABA DE FAVORITOS */}
        {activeTab === 'favorites' && (
          <div className="pt-2">
            <h2 className="text-lg font-extrabold text-charcoal mb-3">Meus Pets Favoritos</h2>
            {favoritedIds.size === 0 ? (
              <EmptyState
                icon={<Heart size={28} className="text-primary fill-primary" />}
                title="Nenhum favorito ainda"
                description="Toque no coração dos pets que você amou para encontrá-los facilmente aqui."
                actionText="Explorar Animais"
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
                      onClick={() => {
                        setSelectedPet(pet);
                        setIsAdoptDialogOpen(true);
                      }}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* OUTRAS ABAS (EXPLORAR / MAPA) */}
        {(activeTab === 'explore' || activeTab === 'map') && (
          <div className="pt-4">
            <EmptyState
              title={activeTab === 'map' ? 'Mapa Interativo em Breve' : 'Busca Avançada'}
              description={
                activeTab === 'map'
                  ? 'O mapa MapLibre GL com consultas espaciais PostGIS será implementado na Etapa 08.'
                  : 'Filtros detalhados de porte, compatibilidade e raio serão consolidados na Etapa 07.'
              }
              actionText="Voltar para Início"
              onAction={() => setActiveTab('home')}
            />
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
              {isAuthenticated
                ? 'Ao clicar em prosseguir, seu perfil será compartilhado com os responsáveis para análise do questionário de triagem.'
                : 'Você precisa estar conectado na sua conta para enviar a solicitação de adoção.'}
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
    </MobileAppShell>
  );
}

export default App;
