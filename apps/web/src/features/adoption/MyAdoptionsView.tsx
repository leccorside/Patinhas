import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Award,
  Video,
  Home,
  RefreshCw,
} from 'lucide-react';
import { adoptionService, AdoptionApplication } from './adoptionService';

interface MyAdoptionsViewProps {
  onSelectApplication: (app: AdoptionApplication) => void;
  onOpenChatWithHost?: (animalId: string, petName: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyAdoptionsView: React.FC<MyAdoptionsViewProps> = ({
  onSelectApplication,
  onOpenChatWithHost,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'IN_PROGRESS' | 'COMPLETED' | 'HISTORY'>('IN_PROGRESS');
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await adoptionService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error('Erro ao buscar candidaturas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Filtragem pelas abas
  const inProgressApps = applications.filter((app) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED'].includes(app.currentStatus)
  );

  const completedApps = applications.filter((app) => app.currentStatus === 'COMPLETED');

  const historyApps = applications.filter((app) =>
    ['REJECTED', 'CANCELLED'].includes(app.currentStatus)
  );

  const currentList =
    activeTab === 'IN_PROGRESS'
      ? inProgressApps
      : activeTab === 'COMPLETED'
      ? completedApps
      : historyApps;

  // Helper para nós do Stepper (1 a 5)
  const getStepNumber = (status: string): number => {
    switch (status) {
      case 'SUBMITTED':
        return 1;
      case 'UNDER_REVIEW':
        return 2;
      case 'INTERVIEW_SCHEDULED':
        return 4; // Avançado para entrevista
      case 'APPROVED':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  // Helper para formatar o status em português com estilo
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Recebido
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px] border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Em Análise
          </span>
        );
      case 'INTERVIEW_SCHEDULED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-[11px] border border-secondary/30">
            <Video size={12} className="text-secondary" />
            Entrevista Agendada
          </span>
        );
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Aprovado 🎉
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            <Award size={12} className="text-emerald-700" />
            Lar Definitivo 🎉
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[11px]">
            Cancelada
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-[11px] border border-red-200">
            Não Selecionado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-2">
      {/* Top Greeting & Header Intro */}
      <section className="px-4 pt-1 pb-3">
        <div className="flex items-center gap-1.5 text-primary mb-1">
          <Heart size={16} className="fill-primary" />
          <span className="text-[11px] uppercase tracking-wider font-extrabold">Jornada de Amor</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-charcoal tracking-tight">
            Minhas Solicitações 🐾
          </h1>
          <button
            onClick={loadApplications}
            className="p-2 rounded-full text-charcoal-muted hover:bg-neutral-100 transition-colors"
            title="Atualizar"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
          Acompanhe de perto cada etapa da sua jornada para acolher um novo melhor amigo.
        </p>

        {/* Filter Pills / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          <button
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Em Andamento</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                activeTab === 'IN_PROGRESS' ? 'bg-white/30 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {inProgressApps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-secondary text-white shadow-sm shadow-secondary/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Concluídas</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                activeTab === 'COMPLETED' ? 'bg-white/30 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {completedApps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Histórico</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                activeTab === 'HISTORY' ? 'bg-white/30 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {historyApps.length}
            </span>
          </button>
        </div>
      </section>

      {/* Lista de Processos */}
      <div className="px-4 flex flex-col gap-3.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-charcoal-muted">
            <RefreshCw size={28} className="animate-spin text-primary mb-2" />
            <p className="text-xs">Carregando suas solicitações de amor...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-3">
              🐾
            </div>
            <h3 className="text-sm font-bold text-charcoal">Nenhuma solicitação nesta aba</h3>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed max-w-[260px]">
              Explore nossos amiguinhos disponíveis e inicie um processo de adoção responsável!
            </p>
          </div>
        ) : (
          currentList.map((app) => {
            const stepNum = getStepNumber(app.currentStatus);
            const progressPercent = Math.min(100, Math.max(20, (stepNum / 5) * 100));

            return (
              <article
                key={app.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Glow decorativo sutil */}
                <div className="absolute -right-12 -top-12 w-28 h-28 bg-primary/5 rounded-full blur-xl pointer-events-none" />

                {/* Card Top: Pet Info & Live Status Badge */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100">
                      <img
                        src={app.animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                        alt={app.animal.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
                        {app.animal.sex === 'MALE' ? '♂' : '♀'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-extrabold text-charcoal truncate">
                          {app.animal.name}
                        </h2>
                        <span className="text-[11px] text-charcoal-muted">
                          • {app.animal.ageApproximate} {app.animal.ageUnit === 'YEARS' ? 'anos' : 'meses'}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted truncate">{app.animal.breed}</p>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5 truncate">
                        <ShieldCheck size={12} className="text-secondary flex-shrink-0" />
                        <span className="truncate">
                          {app.animal.organization?.name || app.animal.protector?.profile?.fullName || 'Protetor Responsável'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">{renderStatusBadge(app.currentStatus)}</div>
                </div>

                {/* Protocol Bar */}
                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-charcoal-muted bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100">
                  <span>Solicitado em {new Date(app.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold text-charcoal">#{app.id.slice(0, 8).toUpperCase()}</span>
                </div>

                {/* Stepper Progress Bar (Para processos em andamento) */}
                {['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED'].includes(
                  app.currentStatus
                ) && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-bold text-charcoal">Etapa {stepNum} de 5</span>
                      <span className="font-bold text-primary">{progressPercent}% Concluído</span>
                    </div>

                    {/* Progress Bar & Dots */}
                    <div className="relative py-2">
                      <div className="absolute left-2 right-2 top-4 h-1 bg-neutral-200 rounded-full -translate-y-1/2" />
                      <div
                        className="absolute left-2 top-4 h-1 bg-secondary rounded-full -translate-y-1/2 transition-all duration-500"
                        style={{ width: `${progressPercent - 10}%` }}
                      />

                      <div className="relative flex justify-between items-center z-10 px-1">
                        {['Formulário', 'Triagem', 'Análise', 'Entrevista', 'Adoção'].map(
                          (stepLabel, idx) => {
                            const isDone = idx + 1 < stepNum;
                            const isCurrent = idx + 1 === stepNum;
                            return (
                              <div key={stepLabel} className="flex flex-col items-center">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    isDone
                                      ? 'bg-secondary text-white'
                                      : isCurrent
                                      ? 'bg-primary text-white ring-2 ring-primary/30'
                                      : 'bg-neutral-200 text-neutral-500'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span
                                  className={`text-[9px] font-semibold mt-1 text-center max-w-[48px] leading-tight ${
                                    isCurrent
                                      ? 'text-primary font-bold'
                                      : isDone
                                      ? 'text-secondary'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {stepLabel}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner de Próximo Passo Acionável */}
                {app.currentStatus === 'INTERVIEW_SCHEDULED' && app.interviewDate && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2 text-xs">
                    <Video size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-charcoal">Entrevista Virtual Agendada</p>
                      <p className="text-neutral-600 text-[11px] mt-0.5">
                        Agendada para{' '}
                        <strong className="text-primary font-bold">
                          {new Date(app.interviewDate).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                )}

                {app.currentStatus === 'UNDER_REVIEW' && (
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2 text-xs text-charcoal-muted">
                    <Clock size={15} className="text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] leading-snug">
                      A equipe da ONG está avaliando seu questionário de moradia e segurança do lar.
                    </p>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (onOpenChatWithHost) {
                        onOpenChatWithHost(app.animal.id, app.animal.name);
                      } else {
                        showToast(`Abrindo canal com os responsáveis por ${app.animal.name}`, 'info');
                      }
                    }}
                    className="h-10 px-3 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-primary/25 hover:opacity-95 transition-all"
                  >
                    <MessageCircle size={15} />
                    <span>Conversar</span>
                  </button>

                  <button
                    onClick={() => onSelectApplication(app)}
                    className="h-10 px-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-charcoal font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText size={15} className="text-secondary" />
                    <span>Ver Processo</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
