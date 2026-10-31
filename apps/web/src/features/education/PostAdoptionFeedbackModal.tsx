import React, { useState } from 'react';
import { X, Sparkles, Send, Camera } from 'lucide-react';
import { educationService } from './educationService';

interface PostAdoptionFeedbackModalProps {
  period: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const PostAdoptionFeedbackModal: React.FC<PostAdoptionFeedbackModalProps> = ({
  period,
  onClose,
  onSuccess,
}) => {
  const [adaptationReport, setAdaptationReport] = useState('');
  const [challenges, setChallenges] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adaptationReport.trim()) return;

    setLoading(true);
    try {
      const res = await educationService.submitFeedback({
        period,
        adaptationReport,
        challenges: challenges.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      });
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar relato de adaptação');
    } finally {
      setLoading(false);
    }
  };

  const periodTitle =
    period === '15_DAYS'
      ? 'Relato dos 15 Primeiros Dias'
      : period === '30_DAYS'
      ? 'Relato de 1 Mês de Lar'
      : 'Relato de 3 Meses de Família';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{periodTitle}</h3>
              <p className="text-xs text-gray-600">Compartilhe como seu novo amigo está se adaptando</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Como está sendo a convivência e adaptação? *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Conte como ele reage à rotina, brincadeiras, sono e alimentação..."
              value={adaptationReport}
              onChange={(e) => setAdaptationReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Foto Recente do Pet no Lar (URL)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
              <Camera className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Houve alguma dificuldade ou dúvida? (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Latidos quando alguém chega, xixi no tapete..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !adaptationReport.trim()}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Enviando...' : 'Enviar Relato de Adaptação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

