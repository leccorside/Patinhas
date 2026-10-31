import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Building2,
} from 'lucide-react';
import { campaignsService, Campaign } from './campaignsService';
import { DonationModal } from './DonationModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { useAuthStore } from '../../store/authStore';

interface CampaignsViewProps {
  onBack: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isShelterOrAdmin =
    user?.role === 'SHELTER_MEMBER' || user?.role === 'MASTER_ADMIN';

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignsService.listCampaigns(true);
      setCampaigns(data);
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleShare = async (c: Campaign) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Campanha Patinhas: ${c.title}`,
          text: `Ajude na campanha "${c.title}" e faça a diferença na vida dos animais resgatados!`,
          url: window.location.href,
        });
      } catch (err) {
        // Ignorar cancelamento
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleDonated = (updated: Campaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  };

  const handleCreated = (created: Campaign) => {
    setCampaigns((prev) => [created, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F7F7F6] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">Campanhas & Vaquinhas</h1>
            <p className="text-[11px] text-gray-500">Ajude tratamentos, cirurgias e resgates</p>
          </div>
        </div>

        {isShelterOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar</span>
          </button>
        )}
      </header>

      {/* Banner Informativo */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
            <Sparkles className="w-4 h-4" /> 100% Repassado às ONGs
          </div>
          <h2 className="text-base font-bold leading-snug">
            Cada real faz bater um coraçãozinho mais forte.
          </h2>
          <p className="text-xs mt-1 text-orange-50 leading-relaxed">
            Doe diretamente via PIX com segurança, transparência e sem taxas abusivas de intermediários.
          </p>
        </div>
      </div>

      {/* Lista de Campanhas */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 animate-pulse">
            Carregando campanhas ativas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">Nenhuma campanha aberta no momento</h3>
            <p className="text-xs text-gray-500 mt-1">
              Todas as metas atuais foram atingidas ou nenhuma ONG cadastrou uma nova vaquinha.
            </p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Imagem se houver */}
              {camp.imageUrl && (
                <div className="h-44 w-full overflow-hidden relative">
                  <img
                    src={camp.imageUrl}
                    alt={camp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-800 shadow-xs flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{camp.progressPercent}% arrecadado</span>
                  </div>
                </div>
              )}

              {/* Informações */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-base leading-snug">
                    {camp.title}
                  </h3>
                  <button
                    onClick={() => handleShare(camp)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 shrink-0"
                    title="Compartilhar"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Organização */}
                {camp.organization && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700 truncate">
                      {camp.organization.name}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                )}

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {camp.description}
                </p>

                {/* Barra de Progresso Bento */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-700">
                      R$ {camp.raisedAmountBrl.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-gray-400">
                      Meta: R$ {camp.goalAmountBrl.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, camp.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Botão de Ação */}
                <button
                  onClick={() => setSelectedCampaign(camp)}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-sm text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Apoiar com PIX</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Doação */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onDonated={handleDonated}
        />
      )}

      {/* Modal de Criação (para ONGs) */}
      {showCreateModal && user && (
        <CreateCampaignModal
          organizationId="3c681ba2-e881-4484-a365-fe947f189fa2" // Instituto Patinhas de Luz
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};
