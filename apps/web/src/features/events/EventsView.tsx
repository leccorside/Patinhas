import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Plus,
  ArrowLeft,
  Building2,
  ShieldCheck,
  CalendarPlus,
} from 'lucide-react';
import { eventsService, AdoptionEventItem } from './eventsService';

interface EventsViewProps {
  onBack: () => void;
  onOpenCreate: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onBack,
  onOpenCreate,
  showToast,
}) => {
  const [events, setEvents] = useState<AdoptionEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getEvents(true);
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCalendar = (event: AdoptionEventItem) => {
    // Formata data para o link do Google Calendar
    const eventDateObj = new Date(event.eventDate);
    const dateStr = eventDateObj.toISOString().split('T')[0].replace(/-/g, '');
    const startTimeFormatted = event.startTime.replace(':', '') + '00';
    const endTimeFormatted = event.endTime.replace(':', '') + '00';

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${dateStr}T${startTimeFormatted}/${dateStr}T${endTimeFormatted}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(`${event.locationName}, ${event.addressStreet}, ${event.city} - ${event.state}`)}`;

    window.open(googleCalendarUrl, '_blank');
    showToast('Abrindo Google Calendar...', 'info');
  };

  const handleShare = async (event: AdoptionEventItem) => {
    const eventDateFormatted = new Date(event.eventDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    const text = `🎉 Participe da "${event.title}" no dia ${eventDateFormatted}, das ${event.startTime} às ${event.endTime} em ${event.locationName} (${event.city}/${event.state}). Vamos encontrar lares para muitos pets!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text, url: window.location.href });
      } catch {
        // Ignora cancelamento
      }
    } else {
      navigator.clipboard.writeText(`${event.title}\n${text}`);
      showToast('Informações copiadas para compartilhamento! 📋', 'info');
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
              Feiras de Adoção
            </h1>
            <p className="text-[11px] text-[#78909C]">Eventos Presenciais na Região</p>
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#FF7043] text-white rounded-full font-bold text-xs shadow-sm shadow-[#FF7043]/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Feira</span>
          </button>
        </div>
      </div>

      {/* Lista de Feiras */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#78909C]">
            Carregando calendário de feiras...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
            <div className="w-12 h-12 bg-coral-50 rounded-full flex items-center justify-center text-[#FF7043] mx-auto mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#263238]">Nenhuma feira agendada</h4>
            <p className="text-xs text-[#78909C] mt-1">
              Fique atento! Novas feiras presenciais de adoção são anunciadas semanalmente.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm space-y-3 hover:border-coral-200 transition-all"
            >
              {/* Banner se houver */}
              {event.bannerUrl && (
                <div className="w-full h-36 bg-gray-100 relative">
                  <img
                    src={event.bannerUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#FF7043] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                    Presencial
                  </div>
                </div>
              )}

              <div className="p-4 pt-1 space-y-2.5">
                {/* Data e Horário */}
                <div className="flex items-center justify-between text-xs font-bold text-[#FF7043]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-[#78909C]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {event.startTime} às {event.endTime}
                    </span>
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#263238] leading-snug">
                  {event.title}
                </h3>

                <p className="text-xs text-[#78909C] line-clamp-2">
                  {event.description}
                </p>

                {/* Local e Endereço */}
                <div className="bg-[#FAFAF8] p-2.5 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#263238]">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7043] flex-shrink-0" />
                    <span className="truncate">{event.locationName}</span>
                  </div>
                  <p className="text-[11px] text-[#78909C] pl-5 truncate">
                    {event.addressStreet}, {event.city} - {event.state}
                  </p>
                </div>

                {/* Organização Promotora */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-coral-50 flex items-center justify-center text-[#FF7043] overflow-hidden">
                      {event.organization.logoUrl ? (
                        <img
                          src={event.organization.logoUrl}
                          alt={event.organization.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#78909C] truncate">
                      {event.organization.name}
                    </span>
                  </div>

                  {event.organization.verifiedStatus === 'VERIFIED' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verificada</span>
                    </span>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleAddToCalendar(event)}
                    className="flex-1 py-2 bg-[#FF7043] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#FF7043]/20 active:scale-95 transition-all"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Lembrete no Calendário</span>
                  </button>

                  <button
                    onClick={() => handleShare(event)}
                    className="w-9 h-9 rounded-xl bg-gray-100 text-[#78909C] hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                    title="Compartilhar Feira"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

