import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle2, Lock } from 'lucide-react';
import { moderationService, ReportTargetType } from './moderationService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  'Venda ilegal ou comércio disfarçado de filhotes',
  'Cobrança indevida de taxas ou valores para adoção',
  'Suspeita de maus-tratos, abandono ou negligência',
  'Perfil falso, fotos roubadas ou golpe',
  'Informações médicas ou comportamentais enganosas',
  'Comportamento abusivo, assédio ou desrespeito',
  'Outro motivo relevante',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    try {
      setIsSubmitting(true);
      await moderationService.submitReport({
        targetType,
        targetId,
        reason: selectedReason,
        details: details || undefined,
      });
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar denúncia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238]">Denunciar</h3>
              <p className="text-[11px] text-[#78909C]">
                {targetType === 'ANIMAL' ? 'Anúncio de Pet' : targetType === 'USER' ? 'Usuário' : 'Organização'}: <strong>{targetName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#78909C] hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#263238]">Denúncia Recebida</h4>
            <p className="text-xs text-[#78909C] max-w-xs mx-auto">
              Obrigado por ajudar a manter nossa comunidade segura. Nossa equipe analisará com sigilo absoluto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                Sua identidade é 100% protegida. O responsável pelo anúncio jamais saberá quem enviou a denúncia.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-2">
                Qual o motivo principal?
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === r
                        ? 'bg-red-50/60 border-red-200 text-red-950 font-semibold'
                        : 'bg-gray-50 border-gray-100 text-[#263238] hover:bg-gray-100/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="accent-red-600 w-3.5 h-3.5"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">
                Detalhes adicionais (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Descreva o que aconteceu ou cole links/provas..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#78909C] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

