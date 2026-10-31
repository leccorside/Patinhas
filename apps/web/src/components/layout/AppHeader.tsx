import React from 'react';
import { MapPin, Bell } from 'lucide-react';

interface AppHeaderProps {
  greeting?: string;
  userName?: string;
  locationCity?: string;
  locationState?: string;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onSelectLocation?: () => void;
}

export function AppHeader({
  greeting = 'Olá, Adotante',
  userName,
  locationCity = 'São Paulo',
  locationState = 'SP',
  notificationCount = 0,
  onOpenNotifications,
  onSelectLocation,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background/90 px-5 py-3.5 backdrop-blur-md">
      {/* Informações de Localização e Saudação */}
      <div className="flex flex-col">
        <button
          onClick={onSelectLocation}
          className="group flex items-center gap-1 text-left text-xs font-semibold text-charcoal-muted hover:text-charcoal transition-colors focus:outline-none"
        >
          <MapPin size={13} className="text-secondary group-hover:scale-110 transition-transform" />
          <span>{locationCity}, {locationState}</span>
        </button>

        <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-charcoal">
          {userName ? `Olá, ${userName}` : greeting}
        </h1>
      </div>

      {/* Ações do Cabeçalho: Notificações */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNotifications}
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal shadow-card transition-transform active:scale-95 focus:outline-none"
        >
          <Bell size={18} className="text-charcoal" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-sm animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;

