import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  PawPrint,
  Heart,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ArrowLeft,
  UserCheck,
  UserX,
  FileText,
  BadgeAlert,
  ChevronRight,
} from 'lucide-react';
import {
  adminService,
  PlatformOverview,
  AdminOrganization,
  AdminUser,
  AuditLogItem,
} from './adminService';
import { moderationService, ReportItem } from '../moderation/moderationService';

interface AdminMasterDashboardViewProps {
  onBack: () => void;
}

export const AdminMasterDashboardView: React.FC<AdminMasterDashboardViewProps> = ({ onBack }) => {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'reports' | 'audit'>('orgs');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [ovData, orgsData, usersData, logsData, repData] = await Promise.all([
        adminService.getOverview(),
        adminService.getOrganizations(),
        adminService.getUsers(),
        adminService.getAuditLogs(30),
        moderationService.getReports(),
      ]);
      setOverview(ovData);
      setOrganizations(orgsData);
      setUsers(usersData);
      setAuditLogs(logsData);
      setReports(repData);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleResolveReport = async (
    reportId: string,
    action: 'ACCOUNT_SUSPENDED' | 'ANIMAL_REMOVED' | 'WARNING_ISSUED' | 'DISMISSED',
    notes?: string
  ) => {
    try {
      setActionLoadingId(reportId);
      await moderationService.resolveReport(reportId, {
        action,
        status: action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED',
        notes: notes || undefined,
      });
      showFeedback('Ação disciplinar executada com sucesso!');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao resolver denúncia.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Moderação de ONGs
  const handleVerifyOrg = async (orgId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setActionLoadingId(orgId);
      await adminService.updateOrganizationVerification(orgId, status);
      showFeedback(
        status === 'VERIFIED'
          ? 'Selo de verificação concedido à ONG com sucesso!'
          : 'Verificação da organização rejeitada.'
      );
      const [ovData, orgsData, logsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getOrganizations(),
        adminService.getAuditLogs(30),
      ]);
      setOverview(ovData);
      setOrganizations(orgsData);
      setAuditLogs(logsData);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar verificação da ONG');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Moderação de Usuários
  const handleToggleUserStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const confirmMsg =
      newStatus === 'SUSPENDED'
        ? `Tem certeza que deseja suspender o usuário ${user.fullName} (${user.email})? Ele perderá acesso imediato à plataforma.`
        : `Deseja reativar o acesso de ${user.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoadingId(user.id);
      await adminService.updateUserStatus(
        user.id,
        newStatus,
        newStatus === 'SUSPENDED' ? 'Suspensão aplicada pelo Master Admin' : 'Reativação de conta'
      );
      showFeedback(
        newStatus === 'SUSPENDED'
          ? `Usuário ${user.fullName} suspenso com sucesso.`
          : `Usuário ${user.fullName} reativado.`
      );
      const [ovData, usersData, logsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers(),
        adminService.getAuditLogs(30),
      ]);
      setOverview(ovData);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do usuário');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtros de busca locais
  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.cnpj && o.cnpj.includes(searchQuery))
  );

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-[#78909C]">Carregando painel de controle global...</p>
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold tracking-wide">
              <span>🛡️</span>
              <span>Master Admin</span>
            </div>
            <p className="text-[11px] text-[#78909C] mt-0.5">Gestão Global da Plataforma</p>
          </div>

          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-[#78909C] hover:bg-gray-100 transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Banner de Feedback flutuante */}
      {feedbackMessage && (
        <div className="m-3 p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {overview && (
        <div className="p-4 space-y-4">
          {/* Bento Grid de Métricas Globais */}
          <div className="grid grid-cols-2 gap-3">
            {/* Usuários Totais */}
            <div className="bg-gradient-to-br from-[#FAF5FF] to-white p-3.5 rounded-3xl border border-[#E9D5FF] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Usuários</span>
                <div className="w-7 h-7 rounded-full bg-[#F3E8FF] flex items-center justify-center text-purple-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-purple-950">{overview.users.total}</span>
                <span className="text-xs text-purple-700 ml-1.5">
                  ({overview.users.adopters} adotantes)
                </span>
              </div>
            </div>

            {/* ONGs Cadastradas */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white p-3.5 rounded-3xl border border-[#BFDBFE] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">ONGs</span>
                <div className="w-7 h-7 rounded-full bg-[#DBEAFE] flex items-center justify-center text-blue-700">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-blue-950">{overview.organizations.total}</span>
                <span className="text-xs text-blue-700 ml-1.5">
                  ({overview.organizations.verified} selos)
                </span>
              </div>
            </div>

            {/* Animais Totais */}
            <div className="bg-gradient-to-br from-[#FFF5F2] to-white p-3.5 rounded-3xl border border-[#FFE0D6] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7043]">Animais</span>
                <div className="w-7 h-7 rounded-full bg-[#FFEAE3] flex items-center justify-center text-[#FF7043]">
                  <PawPrint className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#263238]">{overview.animals.total}</span>
                <span className="text-xs text-[#78909C] ml-1.5">
                  ({overview.animals.available} disponíveis)
                </span>
              </div>
            </div>

            {/* Adoções Concluídas */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white p-3.5 rounded-3xl border border-[#BBF7D0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Adoções</span>
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-emerald-600">
                  <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-950">{overview.adoptions.completed}</span>
                <span className="text-xs text-emerald-700 ml-1.5">lares felizes</span>
              </div>
            </div>
          </div>

          {/* Segmented Tabs Navigation */}
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('orgs')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'orgs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              ONGs ({organizations.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Usuários ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
                activeTab === 'reports'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Denúncias
              {reports.filter((r) => r.status === 'PENDING').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full font-black">
                  {reports.filter((r) => r.status === 'PENDING').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'audit'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#78909C] hover:text-[#263238]'
              }`}
            >
              Auditoria
            </button>
          </div>

          {/* Barra de Busca rápida */}
          {activeTab !== 'audit' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#78909C]" />
              <input
                type="text"
                placeholder={activeTab === 'orgs' ? 'Buscar ONG por nome, cidade ou CNPJ...' : 'Buscar usuário por nome ou e-mail...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs text-[#263238] focus:outline-none focus:border-purple-500 shadow-sm"
              />
            </div>
          )}

          {/* TAB 1: MODERAÇÃO DE ONGS */}
          {activeTab === 'orgs' && (
            <div className="space-y-3">
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold overflow-hidden flex-shrink-0">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#263238] truncate">{org.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            org.verifiedStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : org.verifiedStatus === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-[#78909C]'
                          }`}
                        >
                          {org.verifiedStatus === 'VERIFIED'
                            ? 'Selo Oficial'
                            : org.verifiedStatus === 'PENDING_APPROVAL'
                            ? 'Aguardando Análise'
                            : 'Não Verificada'}
                        </span>
                      </div>
                      <p className="text-xs text-[#78909C]">
                        📍 {org.city}/{org.state} • CNPJ: {org.cnpj || 'Não informado'}
                      </p>
                      <p className="text-[11px] text-[#78909C]">
                        🐾 {org.totalAnimals} animais cadastrados • 👥 {org.totalMembers} colaboradores
                      </p>
                    </div>
                  </div>

                  {/* Ações de Verificação */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                    {org.verifiedStatus !== 'VERIFIED' ? (
                      <button
                        disabled={actionLoadingId === org.id}
                        onClick={() => handleVerifyOrg(org.id, 'VERIFIED')}
                        className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Aprovar Selo Oficial</span>
                      </button>
                    ) : (
                      <button
                        disabled={actionLoadingId === org.id}
                        onClick={() => handleVerifyOrg(org.id, 'REJECTED')}
                        className="flex-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Revogar Selo</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MODERAÇÃO DE USUÁRIOS */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-3xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-purple-700 font-bold text-sm overflow-hidden flex-shrink-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                    ) : (
                      u.fullName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#263238] truncate">{u.fullName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78909C] truncate">{u.email}</p>
                    <p className="text-[10px] text-[#78909C] mt-0.5">
                      Papel: <strong className="text-[#263238]">{u.role}</strong> • {u.applicationsCount} candidaturas
                    </p>
                  </div>

                  {u.role !== 'MASTER_ADMIN' && (
                    <button
                      disabled={actionLoadingId === u.id}
                      onClick={() => handleToggleUserStatus(u)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        u.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Suspender Usuário' : 'Reativar Usuário'}
                    >
                      {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DENÚNCIAS & ANTIFRAUDE */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#78909C] uppercase tracking-wider">
                  Fila de Denúncias
                </h3>
                <span className="text-xs text-red-600 font-bold">
                  {reports.filter((r) => r.status === 'PENDING').length} pendentes
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#263238]">Nenhuma denúncia ativa</h4>
                  <p className="text-xs text-[#78909C] mt-1">A comunidade está segura e em conformidade.</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                        {rep.targetType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-[#78909C]'
                        }`}
                      >
                        {rep.status === 'PENDING'
                          ? 'Pendente'
                          : rep.status === 'RESOLVED'
                          ? 'Resolvida'
                          : 'Arquivada'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#263238]">Motivo: {rep.reason}</h4>
                      {rep.details && (
                        <p className="text-[11px] text-[#78909C] mt-1 bg-gray-50 p-2 rounded-xl">
                          "{rep.details}"
                        </p>
                      )}
                      <p className="text-[10px] text-[#78909C] mt-1.5">
                        Denunciante: {rep.reporter.name} • Alvo: <strong>{rep.targetSummary?.name || rep.targetId}</strong>
                      </p>
                    </div>

                    {rep.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                        <button
                          disabled={actionLoadingId === rep.id}
                          onClick={() => handleResolveReport(rep.id, 'ACCOUNT_SUSPENDED', 'Conta suspensa por violação')}
                          className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[11px] font-bold active:scale-95 transition-all whitespace-nowrap"
                        >
                          Suspender Infrator
                        </button>

                        <button
                          disabled={actionLoadingId === rep.id}
                          onClick={() => handleResolveReport(rep.id, 'ANIMAL_REMOVED', 'Anúncio removido por fraude')}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-[11px] font-bold active:scale-95 transition-all whitespace-nowrap"
                        >
                          Remover Pet
                        </button>

                        <button
                          disabled={actionLoadingId === rep.id}
                          onClick={() => handleResolveReport(rep.id, 'WARNING_ISSUED', 'Advertência emitida')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-[11px] font-bold active:scale-95 transition-all whitespace-nowrap"
                        >
                          Advertir
                        </button>

                        <button
                          disabled={actionLoadingId === rep.id}
                          onClick={() => handleResolveReport(rep.id, 'DISMISSED', 'Denúncia improcedente')}
                          className="px-2.5 py-1 bg-gray-100 text-[#78909C] hover:bg-gray-200 rounded-xl text-[11px] font-bold active:scale-95 transition-all whitespace-nowrap"
                        >
                          Arquivar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: AUDITORIA & LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#78909C] uppercase tracking-wider">
                  Últimos Eventos Administrativos
                </h3>
                <span className="text-xs text-purple-600 font-semibold">{auditLogs.length} registros</span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-gray-100">
                  <p className="text-xs text-[#78909C]">Nenhum evento registrado ainda.</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700">{log.action}</span>
                      <span className="text-[10px] text-[#78909C]">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#263238]">
                      Executor: <strong>{log.executor?.name || 'Sistema'}</strong> ({log.executor?.email})
                    </p>
                    {log.metadata && (
                      <pre className="text-[10px] bg-gray-50 p-2 rounded-xl text-[#78909C] overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
