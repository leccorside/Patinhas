import React, { useState, useEffect } from 'react';
import { Heart, Compass, MapPin, User, Home, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [apiStatus, setApiStatus] = useState<string>('Verificando conexão...');

  useEffect(() => {
    fetch('http://localhost:3333/api/v1/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status === 'ok' ? 'Conectado à API' : 'Erro na API'))
      .catch(() => setApiStatus('API offline ou inicializando'));
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
              <p className="text-xs text-[#78909C]">Adoção de Animais</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#E3F0F8] px-3 py-1 text-xs font-semibold text-[#006a63]">
            <CheckCircle2 size={13} className="text-[#4DB6AC]" />
            v1.0.0
          </span>
        </header>

        {/* Conteúdo Central Scrollável */}
        <main className="flex-1 px-5 pb-24 pt-2">
          {/* Card de Boas-vindas Warm Paws */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8A65] to-[#FF7043] p-6 text-white shadow-[0px_8px_20px_rgba(255,112,67,0.35)]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles size={14} />
                Ambiente Docker Pronto
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight">
                Encontre seu novo melhor amigo
              </h2>
              <p className="mt-1 text-sm text-white/90">
                Plataforma com visual mobile permanente e infraestrutura conteinerizada.
              </p>
            </div>
          </div>

          {/* Status da Infraestrutura */}
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-[0px_4px_16px_rgba(38,50,56,0.05)]">
            <h3 className="text-sm font-bold text-[#263238]">Status da Infraestrutura</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#78909C]">Frontend React Vite</span>
                <span className="font-semibold text-[#2E7D32]">Rodando (Porta 3000)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78909C]">Backend NestJS</span>
                <span className="font-semibold text-[#FF7043]">{apiStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78909C]">Layout Mobile Container</span>
                <span className="font-semibold text-[#4DB6AC]">Ativo (Máx 430px)</span>
              </div>
            </div>
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

