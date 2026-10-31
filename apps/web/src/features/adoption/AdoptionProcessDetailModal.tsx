import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Calendar,
  Clock,
  Home,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  FileText,
  UserCheck,
  Video,
  Award,
} from 'lucide-react';
import { AdoptionApplication, adoptionService } from './adoptionService';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

interface AdoptionProcessDetailModalProps {
  application: AdoptionApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdoptionProcessDetailModal: React.FC<AdoptionProcessDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onCancelSuccess,
  showToast,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !application) return null;

  const handleCancelApplication = async () => {
    setIsCancelling(true);
    try {
      await adoptionService.cancelApplication(application.id, 'Cancelado pelo adotante');
      showToast('Candidatura cancelada com sucesso.', 'info');
      if (onCancelSuccess) onCancelSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cancelar candidatura.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancellable = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'].includes(
    application.currentStatus
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header do Topo */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
              📋
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal leading-none">
                Processo de Adoção
              </h2>
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Protocolo #{application.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Card Resumo do Pet */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-100 flex items-center gap-3 shadow-sm">
            <img
              src={application.animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
              alt={application.animal.name}
              className="w-14 h-14 rounded-2xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-charcoal truncate">
                  {application.animal.name}
                </h3>
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  {application.animal.sex === 'MALE' ? 'Macho ♂' : 'Fêmea ♀'}
                </span>
              </div>
              <p className="text-xs text-charcoal-muted">
                {application.animal.breed} • {application.animal.ageApproximate} {application.animal.ageUnit === 'YEARS' ? 'anos' : 'meses'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Responsável: <strong>{application.animal.organization?.name || application.animal.protector?.profile?.fullName || 'Protetor'}</strong>
              </p>
            </div>
          </div>

          {/* Safety Trust Banner */}
          <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-start gap-2.5 text-xs text-charcoal">
            <ShieldCheck size={18} className="text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-secondary">Adoção Segura & 100% Gratuita</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Nunca realize transferências para taxas prévias de transporte ou entrega. A equipe Patinhas assegura processos sem cobrança.
              </p>
            </div>
          </div>

          {/* Questionário Respondido */}
          {application.questionnaire && (
            <div className="bg-white p-4 rounded-2xl border border-neutral-100 space-y-2.5 shadow-sm">
              <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <FileText size={15} className="text-primary" />
                Resumo da Ficha de Triagem
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-neutral-50 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block text-[10px]">Moradia:</span>
                  <strong className="text-charcoal">
                    {application.questionnaire.housingType === 'APARTMENT'
                      ? 'Apartamento'
                      : application.questionnaire.housingType === 'HOUSE'
                      ? 'Casa'
                      : 'Sítio / Chácara'}
                  </strong>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block text-[10px]">Rede de Proteção:</span>
                  <strong className={application.questionnaire.hasNettingScreens ? 'text-secondary' : 'text-neutral-600'}>
                    {application.questionnaire.hasNettingScreens ? 'Sim, instalada ✓' : 'Não possui'}
                  </strong>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block text-[10px]">Pessoas no Lar:</span>
                  <strong className="text-charcoal">
                    {application.questionnaire.householdPeopleCount} moradores
                  </strong>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block text-[10px]">Horas Sozinho:</span>
                  <strong className="text-charcoal">
                    {application.questionnaire.routineHoursAlone ?? 4}h por dia
                  </strong>
                </div>
              </div>

              {application.questionnaire.adopterExperience && (
                <div className="bg-neutral-50 p-2.5 rounded-xl text-[11px] text-neutral-600">
                  <span className="text-[10px] text-neutral-500 block mb-0.5">Mensagem / Experiência:</span>
                  "{application.questionnaire.adopterExperience}"
                </div>
              )}
            </div>
          )}

          {/* Linha do Tempo e Histórico de Eventos */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Clock size={15} className="text-secondary" />
              Histórico do Processo
            </h4>

            <div className="space-y-3 pl-2 border-l-2 border-neutral-200 ml-1">
              {application.statusHistory && application.statusHistory.length > 0 ? (
                application.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-3 text-xs">
                    <span className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full bg-primary ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal">{item.newStatus}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {item.observation && (
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                        {item.observation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative pl-3 text-xs">
                  <span className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-white" />
                  <span className="font-bold text-charcoal">Candidatura Registrada</span>
                  <p className="text-[11px] text-neutral-500">Aguardando análise da ONG.</p>
                </div>
              )}
            </div>
          </div>

          {/* Opção de Cancelamento pelo Adotante */}
          {isCancellable && (
            <div className="pt-2">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-2.5 text-xs text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors"
                >
                  Desejo desistir desta solicitação
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-center">
                  <p className="text-xs font-bold text-red-700">
                    Tem certeza que deseja cancelar?
                  </p>
                  <p className="text-[11px] text-red-600">
                    O protetor será informado e sua vaga será liberada para outros interessados.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white text-neutral-700 rounded-lg border border-neutral-200"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleCancelApplication}
                      disabled={isCancelling}
                      className="flex-1 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Fechar */}
        <div className="p-4 bg-white border-t border-neutral-100 flex items-center justify-end">
          <SecondaryButton variant="ghost" onClick={onClose}>
            Fechar
          </SecondaryButton>
        </div>
      </motion.div>
    </div>
  );
};
