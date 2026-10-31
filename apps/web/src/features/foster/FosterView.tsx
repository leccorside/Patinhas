import React, { useState, useEffect } from 'react';
import {
  Home,
  Heart,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Search,
  Plus,
  ArrowLeft,
  Building2,
  UserCheck,
} from 'lucide-react';
import {
  fosterService,
  AvailableFosterHome,
  FosterRequestItem,
} from './fosterService';

interface FosterViewProps {
  onBack: () => void;
  onOpenVolunteerModal: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FosterView: React.FC<FosterViewProps> = ({
  onBack,
  onOpenVolunteerModal,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'homes' | 'requests'>('homes');
  const [homes, setHomes] = useState<AvailableFosterHome[]>([]);
  const [requests, setRequests] = useState<FosterRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'homes') {
        const data = await fosterService.getAvailable(searchCity || undefined);
        setHomes(data);
      } else {
        const data = await fosterService.getMyRequests();
        setRequests(data);
      }
    } catch (err) {
      console.error('Erro ao carregar lares temporários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      setActionLoadingId(requestId);
      await fosterService.respondRequest(requestId, status);
      showToast(
        status === 'ACCEPTED'
          ? '🎉 Acolhimento aceito com sucesso! A ONG foi notificada.'
          : 'Solicitação de acolhimento recusada.',
        status === 'ACCEPTED' ? 'success' : 'info'
      );
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao responder solicitação', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

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
              Lares Temporários
            </h1>
            <p className="text-[11px] text-[#78909C]">Rede de Acolhimento Transitório</p>
          </div>

          <button
            onClick={onOpenVolunteerModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#4DB6AC] text-white rounded-full font-bold text-xs shadow-sm shadow-[#4DB6AC]/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Voluntário</span>
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="mt-3 bg-gray-100 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveTab('homes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'homes'
                ? 'bg-[#4DB6AC] text-white shadow-sm'
                : 'text-[#78909C] hover:text-[#263238]'
            }`}
          >
            🏡 Lares Disponíveis ({homes.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'requests'
                ? 'bg-[#4DB6AC] text-white shadow-sm'
                : 'text-[#78909C] hover:text-[#263238]'
            }`}
          >
            📋 Pedidos Recebidos ({requests.length})
          </button>
        </div>

        {/* Busca por cidade (na tab homes) */}
        {activeTab === 'homes' && (
          <div className="mt-2.5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78909C]" />
            <input
              type="text"
              placeholder="Filtrar por cidade (Ex: São Paulo)..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#4DB6AC]"
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3.5">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#78909C]">
            Carregando rede de lares temporários...
          </div>
        ) : activeTab === 'homes' ? (
          homes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-[#4DB6AC] mx-auto mb-2">
                <Home className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#263238]">Nenhum lar disponível</h4>
              <p className="text-xs text-[#78909C] mt-1 max-w-xs mx-auto">
                Não há voluntários com disponibilidade ativa nesta região no momento. Cadastre-se como voluntário!
              </p>
            </div>
          ) : (
            homes.map((home) => (
              <div
                key={home.id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3 hover:border-teal-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#4DB6AC] font-bold text-sm overflow-hidden flex-shrink-0">
                    {home.volunteerAvatar ? (
                      <img
                        src={home.volunteerAvatar}
                        alt={home.volunteerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      home.volunteerName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#263238] truncate">
                        {home.volunteerName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        Até {home.capacityPets} {home.capacityPets === 1 ? 'pet' : 'pets'}
                      </span>
                    </div>
                    <p className="text-xs text-[#78909C]">
                      📍 {home.city}/{home.state}
                    </p>
                  </div>
                </div>

                {/* Tags de características */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {home.acceptedSpecies.map((sp) => (
                    <span
                      key={sp}
                      className="px-2 py-0.5 rounded-full bg-gray-100 text-[#263238] font-semibold"
                    >
                      {sp === 'DOG' ? '🐶 Cães' : sp === 'CAT' ? '🐱 Gatos' : sp}
                    </span>
                  ))}
                  {home.hasQuarantineSpace && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Quarentena</span>
                    </span>
                  )}
                </div>

                {/* Experiência */}
                {home.experienceDetails && (
                  <p className="text-[11px] text-[#78909C] bg-gray-50 p-2.5 rounded-2xl">
                    "{home.experienceDetails}"
                  </p>
                )}

                {/* Ação de Contato */}
                {home.contactPhone && (
                  <div className="pt-1 border-t border-gray-50 flex justify-end">
                    <a
                      href={`tel:${home.contactPhone.replace(/\D/g, '')}`}
                      className="px-3.5 py-1.5 bg-[#4DB6AC] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-[#4DB6AC]/20 active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Entrar em Contato</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#78909C] mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#263238]">Nenhum pedido pendente</h4>
            <p className="text-xs text-[#78909C] mt-1">
              Quando uma ONG solicitar acolhimento no seu lar, o pedido aparecerá aqui.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center text-[#4DB6AC] overflow-hidden flex-shrink-0">
                  {req.organization.logoUrl ? (
                    <img
                      src={req.organization.logoUrl}
                      alt={req.organization.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#263238] truncate">
                      {req.organization.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'DECLINED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'ACCEPTED'
                        ? 'Aceito 🎉'
                        : req.status === 'DECLINED'
                        ? 'Recusado'
                        : 'Aguardando Resposta'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78909C]">
                    Previsão: {req.estimatedDays} dias a partir de{' '}
                    {new Date(req.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="bg-[#FAFAF8] p-2.5 rounded-2xl text-[11px] text-[#263238]">
                <strong>Detalhes do Pet:</strong> {req.petDetails}
              </div>

              {req.status === 'PENDING' && (
                <div className="flex gap-2 pt-1 border-t border-gray-50">
                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleRespond(req.id, 'ACCEPTED')}
                    className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aceitar Acolhimento</span>
                  </button>

                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleRespond(req.id, 'DECLINED')}
                    className="flex-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
