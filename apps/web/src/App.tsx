import React, { useState, useEffect } from 'react';
import { Heart, Compass, MapPin, User, Home, Sparkles, CheckCircle2, ShieldCheck, MapPinned } from 'lucide-react';

interface AnimalPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isCover: boolean;
}

interface AnimalTrait {
  id: string;
  name: string;
}

interface AnimalDemo {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageApproximate: number;
  ageUnit: string;
  sex: string;
  size: string;
  city: string;
  state: string;
  photos: AnimalPhoto[];
  traits: AnimalTrait[];
  organization?: { name: string; verifiedStatus: string } | null;
}

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [animals, setAnimals] = useState<AnimalDemo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3333/api/v1/animals/demo')
      .then((res) => res.json())
      .then((data) => {
        setAnimals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar animais:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#EDEDEB] antialiased">
      {/* Mobile App Shell — Max Width 430px Permanente */}
      <div
        id="mobile-app-root"
        className="
          relative
          flex
          min-h-dvh
          w-full
          max-w-[430px]
          flex-col
          justify-between
          overflow-x-clip
          bg-[#FAFAF8]
          text-[#263238]
          shadow-[0_0_50px_rgba(0,0,0,0.12)]
        "
      >
        {/* Header Superior Mobile */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-[#FAFAF8]/90 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-[#263238]">Patinhas</h1>
              <p className="text-xs text-[#78909C]">Adoção Responsável</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#E3F0F8] px-3 py-1 text-xs font-semibold text-[#006a63]">
            <CheckCircle2 size={13} className="text-[#4DB6AC]" />
            PostGIS Ativo
          </span>
        </header>

        {/* Conteúdo Central Scrollável */}
        <main className="flex-1 px-5 pb-24 pt-1">
          {/* Hero Banner Warm Paws */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8A65] to-[#FF7043] p-5 text-white shadow-[0px_8px_20px_rgba(255,112,67,0.35)]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                <Sparkles size={13} />
                Banco de Dados & Seeds Ativos
              </div>
              <h2 className="mt-2 text-xl font-bold leading-tight">
                Encontre seu novo companheiro
              </h2>
              <p className="mt-1 text-xs text-white/90">
                Conectando você a animais resgatados por ONGs e protetores verificados.
              </p>
            </div>
          </div>

          {/* Seção de Animais Próximos (Dados reais vindos do PostgreSQL + Prisma) */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#263238]">Próximos de Você</h3>
              <span className="text-xs font-semibold text-[#FF7043]">Ver todos</span>
            </div>

            {loading ? (
              <div className="mt-4 flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF7043] border-t-transparent"></div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {animals.map((pet) => (
                  <div
                    key={pet.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-[0px_4px_16px_rgba(38,50,56,0.06)] transition-all hover:shadow-[0px_8px_24px_rgba(38,50,56,0.1)]"
                  >
                    <div className="relative h-48 w-full">
                      <img
                        src={pet.photos[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                        alt={pet.name}
                        className="h-full w-full object-cover"
                      />
                      <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#FF7043] shadow-md backdrop-blur-sm transition-transform active:scale-90">
                        <Heart size={18} />
                      </button>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-[#263238]/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                        <MapPinned size={12} className="text-[#4DB6AC]" />
                        {pet.city}, {pet.state}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-[#263238]">{pet.name}</h4>
                        <span className="rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-xs font-bold text-[#FF7043]">
                          {pet.ageApproximate} {pet.ageUnit === 'MONTHS' ? 'meses' : 'anos'}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-[#78909C]">{pet.breed}</p>

                      {/* Chips de Características */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pet.traits?.slice(0, 3).map((trait) => (
                          <span
                            key={trait.id}
                            className="rounded-full bg-[#E3F0F8] px-2.5 py-1 text-[10px] font-semibold text-[#006a63]"
                          >
                            {trait.name}
                          </span>
                        ))}
                      </div>

                      {pet.organization && (
                        <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-2.5 text-[11px] text-[#78909C]">
                          <ShieldCheck size={14} className="text-[#4DB6AC]" />
                          <span>{pet.organization.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Floating Bottom Navigation Bar (5 Tabs) */}
        <nav className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2">
          <div className="flex items-center justify-around rounded-full bg-white/95 px-3 py-2.5 shadow-[0px_8px_24px_rgba(38,50,56,0.12)] backdrop-blur-md">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                activeTab === 'home' ? 'bg-[#FF7043] text-white' : 'text-[#78909C]'
              }`}
            >
              <Home size={18} />
              <span className="text-[10px] font-semibold">Início</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                activeTab === 'explore' ? 'bg-[#FF7043] text-white' : 'text-[#78909C]'
              }`}
            >
              <Compass size={18} />
              <span className="text-[10px] font-semibold">Explorar</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                activeTab === 'map' ? 'bg-[#FF7043] text-white' : 'text-[#78909C]'
              }`}
            >
              <MapPin size={18} />
              <span className="text-[10px] font-semibold">Mapa</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                activeTab === 'favorites' ? 'bg-[#FF7043] text-white' : 'text-[#78909C]'
              }`}
            >
              <Heart size={18} />
              <span className="text-[10px] font-semibold">Favoritos</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                activeTab === 'profile' ? 'bg-[#FF7043] text-white' : 'text-[#78909C]'
              }`}
            >
              <User size={18} />
              <span className="text-[10px] font-semibold">Perfil</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
