import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Building2 } from 'lucide-react';
import { eventsService } from './eventsService';
import { shelterDashboardService, ShelterSummary } from '../shelter/shelterDashboardService';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [shelters, setShelters] = useState<ShelterSummary[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('17:00');
  const [locationName, setLocationName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShelters();
    }
  }, [isOpen]);

  const loadShelters = async () => {
    try {
      const list = await shelterDashboardService.getMyShelters();
      setShelters(list);
      if (list.length > 0) {
        setSelectedOrgId(list[0].organization.id);
      }
    } catch {
      // Ignora erro
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !title || !eventDate || !locationName || !addressStreet) {
      alert('Preencha os campos obrigatórios da feira.');
      return;
    }

    try {
      setIsSubmitting(true);
      await eventsService.createEvent({
        organizationId: selectedOrgId,
        title,
        description,
        eventDate: new Date(eventDate).toISOString(),
        startTime,
        endTime,
        locationName,
        addressStreet,
        city,
        state,
        bannerUrl: bannerUrl || undefined,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slideUp max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-coral-50 flex items-center justify-center text-[#FF7043]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238]">Nova Feira de Adoção</h3>
              <p className="text-[11px] text-[#78909C]">Divulgação de evento presencial</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#78909C] hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* ONG Promotora */}
          {shelters.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">ONG Promotora *</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              >
                {shelters.map((s) => (
                  <option key={s.organization.id} value={s.organization.id}>
                    {s.organization.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">Título da Feira *</label>
            <input
              type="text"
              required
              placeholder="Ex: 2ª Feira de Adoção no Parque Villa-Lobos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">Descrição e Atrações *</label>
            <textarea
              rows={2}
              required
              placeholder="Ex: Mais de 30 cães e gatos castrados e vacinados aguardando famílias amorosas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043] resize-none"
            />
          </div>

          {/* Data e Horários */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Data *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Início *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Fim *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
          </div>

          {/* Local Físico e Endereço */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">Nome do Local *</label>
            <input
              type="text"
              required
              placeholder="Ex: Shopping Villa-Lobos (Estacionamento Coberto)"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">Endereço Completo *</label>
            <input
              type="text"
              required
              placeholder="Av. das Nações Unidas, 4777 - Alto de Pinheiros"
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Estado (UF) *</label>
              <input
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">Banner ou Cartaz da Feira (URL)</label>
            <input
              type="url"
              placeholder="https://exemplo.com/banner.jpg"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
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
              className="flex-1 py-2.5 bg-[#FF7043] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF7043]/20 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Cadastrando...' : 'Publicar Feira'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
