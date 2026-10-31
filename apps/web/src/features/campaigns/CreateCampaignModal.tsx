import React, { useState } from 'react';
import { X, Target, DollarSign, Image as ImageIcon } from 'lucide-react';
import { campaignsService, Campaign } from './campaignsService';

interface CreateCampaignModalProps {
  organizationId: string;
  onClose: () => void;
  onCreated: (created: Campaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  organizationId,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmountBrl, setGoalAmountBrl] = useState<number>(1000);
  const [pixKey, setPixKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || goalAmountBrl < 50) return;

    setLoading(true);
    try {
      const created = await campaignsService.createCampaign({
        organizationId,
        title,
        description,
        goalAmountBrl,
        pixKey: pixKey.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar campanha de arrecadação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Nova Campanha de Apoio</h3>
              <p className="text-xs text-gray-600">Arrecadação transparente para tratamentos e resgates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Título da Campanha *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cirurgia e Fisioterapia da Mel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Meta de Arrecadação (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">R$</span>
              <input
                type="number"
                min="50"
                required
                value={goalAmountBrl}
                onChange={(e) => setGoalAmountBrl(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              História e Destinação dos Recursos *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Conte o histórico do animal e por que a ajuda é fundamental..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chave PIX Específica (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: pix@patinhasdeluz.org"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL da Foto da Campanha (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !title || !description}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? 'Publicando...' : 'Lançar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
