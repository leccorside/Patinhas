import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Home,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { matchingService, MatchResult } from './matchingService';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';

interface MatchExplanationModalProps {
  animalId: string | null;
  animalName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAdoptClick?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  animalId,
  animalName,
  isOpen,
  onClose,
  onAdoptClick,
  showToast,
}) => {
  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !animalId) return;

    let isMounted = true;
    const fetchMatch = async () => {
      setIsLoading(true);
      try {
        const data = await matchingService.getAnimalMatch(animalId);
        if (isMounted) setMatchData(data);
      } catch (err: any) {
        showToast(err.message || 'Erro ao carregar análise de compatibilidade.', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMatch();

    return () => {
      isMounted = false;
    };
  }, [isOpen, animalId]);

  if (!isOpen) return null;

  const score = matchData?.overallPercentage || 92;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-bold text-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-charcoal">
                Match Inteligente Patinhas ✨
              </h2>
              <p className="text-[11px] text-charcoal-muted">
                Análise para {matchData?.animalName || animalName || 'este pet'}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-charcoal-muted text-xs">
              <RefreshCw size={24} className="animate-spin text-primary mb-2" />
              Calculando compatibilidade personalizada...
            </div>
          ) : matchData ? (
            <>
              {/* Card Central de Destaque da Pontuação */}
              <div className="bg-gradient-to-br from-primary via-[#FF8A65] to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-primary/25 relative overflow-hidden text-center">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-center gap-1.5 mb-1 text-white/90 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Índice de Afinidade</span>
                </div>

                <div className="text-5xl font-extrabold tracking-tight my-1">
                  {score}%
                </div>

                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white shadow-sm mt-1">
                  {matchData.label}
                </span>

                <p className="text-[11px] text-white/85 mt-2 leading-relaxed max-w-[280px] mx-auto">
                  Calculado combinando seu estilo de moradia, rotina diária e histórico de cuidados com o temperamento do animal.
                </p>
              </div>

              {/* Pilares Avaliados */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-100 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-charcoal border-b border-neutral-100 pb-2">
                  Pontuação por Pilar
                </h3>

                <div className="space-y-2.5">
                  {matchData.pillars.map((pillar) => (
                    <div key={pillar.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-charcoal">{pillar.name}</span>
                        <span className="font-extrabold text-secondary">{pillar.score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pillar.score}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            pillar.score >= 80
                              ? 'bg-secondary'
                              : pillar.score >= 60
                              ? 'bg-amber-500'
                              : 'bg-primary'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destaques Positivos */}
              {matchData.highlights.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-neutral-100 space-y-2.5 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Por que vocês combinam tanto?
                  </h3>

                  <ul className="space-y-2 text-xs text-neutral-700">
                    {matchData.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pontos de Atenção & Adaptação Construtiva */}
              {matchData.cautions.length > 0 && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
                  <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
                    <AlertTriangle size={15} className="text-amber-600" />
                    Pontos de atenção para adaptação:
                  </h3>

                  <ul className="space-y-1.5 text-xs text-amber-900/90">
                    {matchData.cautions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 leading-snug">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Rodapé com CTA de Adoção */}
        <div className="p-4 bg-white border-t border-neutral-100 flex items-center gap-2">
          <SecondaryButton variant="ghost" onClick={onClose}>
            Fechar
          </SecondaryButton>

          {onAdoptClick && (
            <PrimaryButton
              onClick={() => {
                onClose();
                onAdoptClick();
              }}
              icon={<Heart size={16} className="fill-white" />}
            >
              Quero Adotar 🐾
            </PrimaryButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};

