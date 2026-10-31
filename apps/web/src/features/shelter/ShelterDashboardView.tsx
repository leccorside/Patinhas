import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Heart,
  PawPrint,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ChevronRight,
  Plus,
  RefreshCw,
  Home,
  Check,
  AlertCircle,
  Sparkles,
  UserPlus,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import {
  shelterDashboardService,
  ShelterSummary,
  ShelterDashboardData,
  PendingActionApplication,
} from './shelterDashboardService';

interface ShelterDashboardViewProps {
  onBack: () => void;
  onOpenRegisterPet: () => void;
  onOpenChat: (conversationId: string) => void;
  onViewPet: (petId: string) => void;
}

export const ShelterDashboardView: React.FC<ShelterDashboardViewProps> = ({
  onBack,
  onOpenRegisterPet,
  onOpenChat,
  onViewPet,
}) => {
  const [shelters, setShelters] = useState<ShelterSummary[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<ShelterDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'animals' | 'team'>('applications');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modais de ação
  const [selectedApp, setSelectedApp] = useState<PendingActionApplication | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'VOLUNTEER'>('VOLUNTEER');

  // Carrega lista de abrigos do usuário
  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    try {
      setIsLoading(true);
      const list = await shelterDashboardService.getMyShelters();
      setShelters(list);
      if (list.length > 0) {
        setSelectedOrgId(list[0].organization.id);
        loadDashboard(list[0].organization.id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erro ao carregar abrigos:', err);
      setIsLoading(false);
    }
  };

  const loadDashboard = async (orgId: string) => {
    try {
      setIsLoading(true);
      const data = await shelterDashboardService.getDashboard(orgId);
      setDashboard(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard da ONG:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    loadDashboard(orgId);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Transições de status de candidatura
  const handleApprove = async (appId: string) => {
    try {
      setActionLoadingId(appId);
      await shelterDashboardService.updateApplicationStatus(appId, 'APPROVED', 'Candidatura pré-aprovada pela liderança da ONG.');
      showFeedback('Candidatura aprovada com sucesso! Você já pode agendar entrevista ou concluir a adoção.');
      if (selectedOrgId) loadDashboard(selectedOrgId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aprovar candidatura');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (appId: string) => {
    const reason = prompt('Informe o motivo da não aprovação (opcional):');
    if (reason === null) return;
    try {
      setActionLoadingId(appId);
      await shelterDashboardService.updateApplicationStatus(appId, 'REJECTED', reason || undefined);
      showFeedback('Candidatura arquivada com elegância.');
      if (selectedOrgId) loadDashboard(selectedOrgId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao rejeitar candidatura');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate) return;
    try {
      setActionLoadingId(selectedApp.id);
      await shelterDashboardService.scheduleInterview(selectedApp.id, interviewDate, interviewNotes || undefined);
      setIsInterviewModalOpen(false);
      setSelectedApp(null);
      setInterviewDate('');
      setInterviewNotes('');
      showFeedback('Entrevista de adoção agendada com sucesso!');
      if (selectedOrgId) loadDashboard(selectedOrgId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao agendar entrevista');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteAdoption = async (appId: string, petName: string) => {
    const confirmAdopt = confirm(`Confirma a formalização da adoção de ${petName}? Isso atualizará o pet para "Adotado" e concluirá o processo.`);
    if (!confirmAdopt) return;
    try {
      setActionLoadingId(appId);
      await shelterDashboardService.completeAdoption(appId, 'Adoção formalizada e termo assinado.');
      showFeedback(`🎉 Parabéns! ${petName} foi adotado com sucesso!`);
      if (selectedOrgId) loadDashboard(selectedOrgId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao concluir adoção');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInviteMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !inviteEmail) return;
    try {
      await shelterDashboardService.addMember(selectedOrgId, inviteEmail, inviteRole);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      showFeedback('Novo membro adicionado à equipe com sucesso!');
      loadDashboard(selectedOrgId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar membro à ONG.');
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <RefreshCw className="w-8 h-8 text-[#FF7043] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#78909C]">Carregando painel de gestão...</p>
      </div>
    );
  }

  if (shelters.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="w-16 h-16 bg-[#FFF2ED] rounded-full flex items-center justify-center text-[#FF7043] mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#263238] mb-2">Nenhuma ONG Vinculada</h2>
        <p className="text-sm text-[#78909C] max-w-xs mb-6">
          Você ainda não faz parte da equipe de uma ONG ou abrigo cadastrado na plataforma Patinhas.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#FF7043] text-white rounded-2xl font-bold shadow-md shadow-[#FF7043]/20 active:scale-95 transition-all text-sm"
        >
          Voltar ao Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-[#FAFAF8] min-h-screen">
      {/* Top Header Mobile */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-[#263238] hover:bg-gray-100 transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 px-3 text-center">
            <h1 className="text-base font-extrabold text-[#263238] tracking-tight">Painel da ONG</h1>
            <p className="text-[11px] text-[#78909C]">Gestão Mobile de Adoções</p>
          </div>

          <button
            onClick={onOpenRegisterPet}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#FF7043] text-white rounded-full font-bold text-xs shadow-sm shadow-[#FF7043]/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pet</span>
          </button>
        </div>

        {/* Seletor de ONG se tiver mais de uma */}
        {shelters.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {shelters.map((s) => (
              <button
                key={s.organization.id}
                onClick={() => handleSelectOrg(s.organization.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOrgId === s.organization.id
                    ? 'bg-[#FF7043] text-white'
                    : 'bg-gray-100 text-[#78909C]'
                }`}
              >
                {s.organization.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Banner de Feedback flutuante */}
      {feedbackMessage && (
        <div className="m-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {dashboard && (
        <div className="p-4 space-y-4">
          {/* Card da ONG */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-[#FFF2ED] flex items-center justify-center text-[#FF7043] overflow-hidden flex-shrink-0 border border-coral-100">
              {dashboard.organization.logoUrl ? (
                <img
                  src={dashboard.organization.logoUrl}
                  alt={dashboard.organization.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-[#FF7043]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#263238] truncate">{dashboard.organization.name}</h2>
                {dashboard.organization.verifiedStatus === 'VERIFIED' && (
                  <span title="Verificada">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78909C]">
                {dashboard.organization.city}, {dashboard.organization.state} • {dashboard.organization.membersCount} colaboradores
              </p>
            </div>
          </div>

          {/* Bento Grid de Métricas */}
          <div className="grid grid-cols-2 gap-3">
            {/* Animais sob cuidado */}
            <div className="bg-gradient-to-br from-[#FFF5F2] to-white p-3.5 rounded-3xl border border-[#FFE0D6] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7043]">Nossos Pets</span>
                <div className="w-7 h-7 rounded-full bg-[#FFEAE3] flex items-center justify-center text-[#FF7043]">
                  <PawPrint className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#263238]">{dashboard.metrics.totalAnimals}</span>
                <span className="text-xs text-[#78909C] ml-1.5">
                  ({dashboard.metrics.availableAnimals} disponíveis)
                </span>
              </div>
            </div>

            {/* Candidaturas Pendentes */}
            <div className="bg-gradient-to-br from-[#FFFBEB] to-white p-3.5 rounded-3xl border border-[#FDE68A] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Triagem</span>
                <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-900">{dashboard.metrics.pendingApplications}</span>
                <span className="text-xs text-amber-700 ml-1.5">aguardando</span>
              </div>
            </div>

            {/* Adoções Concluídas */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white p-3.5 rounded-3xl border border-[#BBF7D0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Adotados 🎉</span>
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-emerald-600">
                  <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-950">{dashboard.metrics.completedApplications}</span>
                <span className="text-xs text-emerald-700 ml-1.5">lares felizes</span>
              </div>
            </div>

            {/* Taxa de Conversão */}
            <div className="bg-gradient-to-br from-[#E0F2F1] to-white p-3.5 rounded-3xl border border-[#B2DFDB] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00796B]">Afinidade</span>
                <div className="w-7 h-7 rounded-full bg-[#B2DFDB]/60 flex items-center justify-center text-[#00796B]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#004D40]">{dashboard.metrics.conversionRate}%</span>
                <span className="text-xs text-[#00796B] ml-1.5">sucesso</span>
              </div>
            </div>
          </div>

          {/* Segmented Tabs Navigation */}
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
                activeTab === 'applications'
                  ? 'bg-[#FF7043] text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Triagem
              {dashboard.metrics.pendingApplications > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-white text-[#FF7043] rounded-full font-black">
                  {dashboard.metrics.pendingApplications}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('animals')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'animals'
                  ? 'bg-[#FF7043] text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Nossos Pets ({dashboard.metrics.totalAnimals})
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'team'
                  ? 'bg-[#FF7043] text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Equipe ({dashboard.members.length})
            </button>
          </div>

          {/* TAB 1: TRIAGEM & CANDIDATURAS */}
          {activeTab === 'applications' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#78909C] uppercase tracking-wider">
                  Candidaturas Pendentes de Ação
                </h3>
                <span className="text-xs text-[#FF7043] font-semibold">
                  {dashboard.pendingActions.length} ativas
                </span>
              </div>

              {dashboard.pendingActions.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#263238]">Tudo em dia!</h4>
                  <p className="text-xs text-[#78909C] mt-1">
                    Não há solicitações pendentes de análise neste momento.
                  </p>
                </div>
              ) : (
                dashboard.pendingActions.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3"
                  >
                    {/* Header do Card com Pet e Candidato */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {app.animal.photos?.[0]?.url ? (
                          <img
                            src={app.animal.photos[0].url}
                            alt={app.animal.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#FF7043]">
                            <PawPrint className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#263238] truncate">{app.animal.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              app.currentStatus === 'SUBMITTED'
                                ? 'bg-amber-100 text-amber-800'
                                : app.currentStatus === 'INTERVIEW_SCHEDULED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.currentStatus === 'SUBMITTED'
                              ? 'Nova Solicitação'
                              : app.currentStatus === 'INTERVIEW_SCHEDULED'
                              ? 'Entrevista Agendada'
                              : 'Em Análise'}
                          </span>
                        </div>
                        <p className="text-xs text-[#78909C]">
                          Candidato(a): <strong className="text-[#263238]">{app.adopter.profile?.fullName || app.adopter.email}</strong>
                        </p>
                        {app.adopter.profile?.addressCity && (
                          <p className="text-[11px] text-[#78909C]">
                            📍 {app.adopter.profile.addressCity}/{app.adopter.profile.addressState}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resumo do Questionário do Adotante */}
                    {app.questionnaire && (
                      <div className="bg-[#FAFAF8] p-2.5 rounded-2xl text-[11px] text-[#78909C] flex items-center justify-between">
                        <span>
                          🏠 Moradia: <strong>{app.questionnaire.housingType}</strong>
                        </span>
                        <span>
                          {app.questionnaire.hasNettingScreens ? '✅ Telas instaladas' : '⚠️ Sem telas'}
                        </span>
                        <span>
                          {app.questionnaire.hasOtherPets ? '🐾 Tem outros pets' : 'Primeiro pet'}
                        </span>
                      </div>
                    )}

                    {/* Ações Rápidas em Pílula */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                      {app.currentStatus !== 'APPROVED' && app.currentStatus !== 'COMPLETED' && (
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleApprove(app.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>
                      )}

                      <button
                        disabled={actionLoadingId === app.id}
                        onClick={() => {
                          setSelectedApp(app);
                          setIsInterviewModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Entrevista</span>
                      </button>

                      {app.currentStatus === 'APPROVED' && (
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleCompleteAdoption(app.id, app.animal.name)}
                          className="px-3 py-1.5 bg-[#FF7043] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm shadow-[#FF7043]/30"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>Concluir Adoção</span>
                        </button>
                      )}

                      <button
                        disabled={actionLoadingId === app.id}
                        onClick={() => handleReject(app.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: NOSSOS PETS */}
          {activeTab === 'animals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#78909C] uppercase tracking-wider">
                  Animais Cadastrados
                </h3>
                <button
                  onClick={onOpenRegisterPet}
                  className="text-xs text-[#FF7043] font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar</span>
                </button>
              </div>

              {dashboard.recentAnimals.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-gray-100">
                  <p className="text-xs text-[#78909C]">Nenhum animal cadastrado ainda.</p>
                </div>
              ) : (
                dashboard.recentAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => onViewPet(animal.id)}
                    className="bg-white rounded-3xl p-3 border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-coral-200 transition-all shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {animal.photos?.[0]?.url ? (
                        <img
                          src={animal.photos[0].url}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF7043]">
                          <PawPrint className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#263238] truncate">{animal.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            animal.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : animal.status === 'ADOPTED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {animal.status === 'AVAILABLE'
                            ? 'Disponível'
                            : animal.status === 'ADOPTED'
                            ? 'Adotado 🎉'
                            : animal.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#78909C]">
                        {animal.species === 'DOG' ? 'Cachorro' : 'Gato'} {animal.breed ? `• ${animal.breed}` : ''}
                      </p>
                      <p className="text-[11px] text-[#78909C] mt-0.5">
                        ❤️ {animal._count.favorites} favoritos • 📋 {animal._count.adoptionApplications} candidaturas
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EQUIPE DA ONG */}
          {activeTab === 'team' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#78909C] uppercase tracking-wider">
                  Membros e Voluntários
                </h3>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="text-xs text-[#FF7043] font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Convidar</span>
                </button>
              </div>

              {dashboard.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-full bg-coral-50 flex items-center justify-center text-[#FF7043] font-bold text-sm overflow-hidden flex-shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                    ) : (
                      member.fullName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#263238] truncate">{member.fullName}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[#78909C]">
                        {member.role === 'OWNER' ? 'Proprietário' : member.role === 'ADMIN' ? 'Administrador' : 'Voluntário'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78909C] truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: AGENDAR ENTREVISTA */}
      {isInterviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[390px] rounded-3xl p-5 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-[#263238] mb-1">Agendar Entrevista</h3>
            <p className="text-xs text-[#78909C] mb-4">
              Agendando para <strong className="text-[#263238]">{selectedApp.adopter.profile?.fullName || selectedApp.adopter.email}</strong> referente ao pet <strong>{selectedApp.animal.name}</strong>.
            </p>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Data e Horário</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Instruções ou Link de Vídeo (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Entrevista via Google Meet ou visita presencial na sede da ONG..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#78909C] hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedApp.id}
                  className="flex-1 py-2.5 bg-[#FF7043] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF7043]/20 active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVIDAR MEMBRO */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[390px] rounded-3xl p-5 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-[#263238] mb-1">Adicionar Membro à ONG</h3>
            <p className="text-xs text-[#78909C] mb-4">
              O usuário precisa já ter um cadastro na plataforma com este e-mail.
            </p>

            <form onSubmit={handleInviteMemberSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">E-mail do Colaborador</label>
                <input
                  type="email"
                  required
                  placeholder="colaborador@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Função na Equipe</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
                >
                  <option value="VOLUNTEER">Voluntário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#78909C] hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF7043] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF7043]/20 active:scale-95 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
