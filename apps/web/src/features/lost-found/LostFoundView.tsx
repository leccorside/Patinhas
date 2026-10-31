import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Share2,
} from 'lucide-react';
import {
  lostFoundService,
  LostFoundItem,
  LostFoundType,
} from './lostFoundService';

interface LostFoundViewProps {
  onBack: () => void;
  onOpenCreate: (type: LostFoundType) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({
  onBack,
  onOpenCreate,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<LostFoundType>('LOST');
  const [reports, setReports] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await lostFoundService.getReports({ type: activeTab });
      setReports(data);
    } catch (err) {
      console.error('Erro ao carregar relatos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReunited = async (reportId: string, petName?: string) => {
    const confirmMsg = `Confirmar que ${petName || 'o pet'} foi reencontrado? Que felicidade! 🎉`;
    if (!confirm(confirmMsg)) return;

    try {
      setActionLoadingId(reportId);
      await lostFoundService.markAsReunited(reportId);
      showToast(`🎉 Maravilha! ${petName || 'O pet'} foi marcado como reencontrado!`, 'success');
      loadReports();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleShare = async (item: LostFoundItem) => {
    const title = item.type === 'LOST' ? `🚨 DESAPARECIDO: ${item.petName || 'Pet'}` : `🐾 PET ENCONTRADO`;
    const text = `${title} em ${item.city}/${item.state}. Visto em: ${item.addressRef || 'Região central'}. Ajude compartilhando! Contato: ${item.contactPhone}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.href });
      } catch {
        // Ignora cancelamento
      }
    } else {
      navigator.clipboard.writeText(`${title}\n${text}`);
      showToast('Informações copiadas para compartilhamento! 📋', 'info');
    }
  };

  const filtered = reports.filter(
    (r) =>
      (r.petName && r.petName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.addressRef && r.addressRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.breed && r.breed.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <h1 className="text-base font-extrabold text-[#263238] tracking-tight">
              Perdidos & Achados
            </h1>
            <p className="text-[11px] text-[#78909C]">Rede Comunitária de Resgate</p>
          </div>

          <button
            onClick={() => onOpenCreate(activeTab)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs shadow-sm shadow-red-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Alerta</span>
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="mt-3 bg-gray-100 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveTab('LOST')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'LOST'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-[#78909C] hover:text-[#263238]'
            }`}
          >
            🚨 Perdidos (Busca Ativa)
          </button>
          <button
            onClick={() => setActiveTab('FOUND')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'FOUND'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[#78909C] hover:text-[#263238]'
            }`}
          >
            🐾 Encontrados (Comigo)
          </button>
        </div>

        {/* Busca rápida */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78909C]" />
          <input
            type="text"
            placeholder="Buscar por raça, cor, bairro ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3.5">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#78909C]">
            Carregando alertas comunitários...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#78909C] mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#263238]">Nenhum alerta registrado</h4>
            <p className="text-xs text-[#78909C] mt-1">
              {activeTab === 'LOST'
                ? 'Nenhum pet desaparecido nesta categoria no momento.'
                : 'Nenhum pet encontrado esperando pelo tutor nesta categoria.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-4 border shadow-sm space-y-3 transition-all ${
                item.status === 'REUNITED'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : item.type === 'LOST'
                  ? 'border-red-100 hover:border-red-200'
                  : 'border-blue-100 hover:border-blue-200'
              }`}
            >
              {/* Top Banner de Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                    item.status === 'REUNITED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.type === 'LOST'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.status === 'REUNITED'
                    ? '🎉 REENCONTRADO'
                    : item.type === 'LOST'
                    ? 'DESAPARECIDO'
                    : 'ENCONTRADO'}
                </span>

                <span className="text-[10px] text-[#78909C]">
                  {new Date(item.lastSeenDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>

              {/* Informações do Pet */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={item.photoUrl}
                    alt={item.petName || 'Pet'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-[#263238] truncate">
                    {item.petName || `${item.species === 'DOG' ? 'Cachorro' : 'Gato'} sem nome`}
                  </h3>
                  <p className="text-xs text-[#78909C]">
                    {item.breed || (item.species === 'DOG' ? 'Cão SRD' : 'Gato')} • {item.color}
                  </p>
                  <p className="text-[11px] text-[#78909C] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="truncate">{item.addressRef || item.city}</span>
                  </p>
                </div>
              </div>

              {/* Marcas ou Características */}
              {item.distinctiveMarks && (
                <div className="bg-[#FAFAF8] p-2.5 rounded-2xl text-[11px] text-[#78909C]">
                  <strong>Características:</strong> {item.distinctiveMarks}
                </div>
              )}

              {/* Recompensa */}
              {item.rewardDetails && (
                <div className="bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>{item.rewardDetails}</span>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                <a
                  href={`tel:${item.contactPhone.replace(/\D/g, '')}`}
                  className="flex-1 py-2 bg-[#FF7043] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#FF7043]/20 active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar / Contato</span>
                </a>

                <button
                  onClick={() => handleShare(item)}
                  className="w-9 h-9 rounded-xl bg-gray-100 text-[#78909C] hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                  title="Compartilhar Alerta"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {item.status !== 'REUNITED' && (
                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleMarkReunited(item.id, item.petName)}
                    className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all"
                  >
                    Reencontrado 🎉
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

