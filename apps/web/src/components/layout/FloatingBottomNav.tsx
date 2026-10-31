import { Home, Compass, MapPin, Heart, User, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export type NavTabId = 'home' | 'explore' | 'map' | 'favorites' | 'profile';

interface FloatingBottomNavProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
  favoritesCount?: number;
}

interface TabItem {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'explore', label: 'Explorar', icon: Compass },
  { id: 'map', label: 'Mapa', icon: MapPin },
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function FloatingBottomNav({ activeTab, onChangeTab, favoritesCount }: FloatingBottomNavProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2">
      <nav
        aria-label="Navegação Principal"
        className="
          flex
          items-center
          justify-around
          rounded-full
          bg-white/95
          px-2.5
          py-2
          shadow-floating
          backdrop-blur-md
          border
          border-gray-100/60
        "
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center px-3 py-1.5 transition-colors focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon
                    size={19}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-charcoal-muted'
                    }`}
                  />
                  {tab.id === 'favorites' && typeof favoritesCount === 'number' && favoritesCount > 0 && (
                    <span
                      className={`
                        absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold
                        ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'}
                      `}
                    >
                      {favoritesCount}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-charcoal-muted'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default FloatingBottomNav;
