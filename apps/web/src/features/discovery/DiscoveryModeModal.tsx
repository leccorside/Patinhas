import React, { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from 'framer-motion';
import { Animal } from '../animals/animalsService';

interface DiscoveryModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onLike: (animal: Animal) => void;
  onDislike: (animal: Animal) => void;
  onSelectAnimal: (animal: Animal) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DiscoveryModeModal: React.FC<DiscoveryModeModalProps> = ({
  isOpen,
  onClose,
  animals,
  onLike,
  onDislike,
  onSelectAnimal,
  showToast,
}) => {
  const [deck, setDeck] = useState<Animal[]>(animals);
  const [history, setHistory] = useState<Animal[]>([]);

  // Sincroniza o deck inicial se os animais mudarem
  React.useEffect(() => {
    setDeck(animals);
  }, [animals]);

  const currentPet = deck[0];

  // Motion values para o card do topo
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const dislikeOpacity = useTransform(x, [-20, -120], [0, 1]);

  if (!isOpen) return null;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 100) {
      handleSwipeRight();
    } else if (info.offset.x < -100) {
      handleSwipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (!currentPet) return;
    onLike(currentPet);
    setHistory((prev) => [currentPet, ...prev]);
    setDeck((prev) => prev.slice(1));
    showToast(`Você demonstrou interesse em ${currentPet.name}! ❤️`, 'success');
  };

  const handleSwipeLeft = () => {
    if (!currentPet) return;
    onDislike(currentPet);
    setHistory((prev) => [currentPet, ...prev]);
    setDeck((prev) => prev.slice(1));
  };

  const handleUndo = () => {
    if (history.length === 0) {
      showToast('Nenhum pet anterior para desfazer', 'info');
      return;
    }
    const previous = history[0];
    setHistory((prev) => prev.slice(1));
    setDeck((prev) => [previous, ...prev]);
    showToast(`Retornando ${previous.name}`, 'info');
  };

  const handleSuperLike = () => {
    if (!currentPet) return;
    onLike(currentPet);
    setHistory((prev) => [currentPet, ...prev]);
    setDeck((prev) => prev.slice(1));
    showToast(`🌟 Super Match com ${currentPet.name}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-[400px] h-[640px] flex flex-col justify-between">
        {/* Top Bar do Modo Descoberta */}
        <div className="flex items-center justify-between text-white px-2 py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🔥</span>
            <span className="font-extrabold text-sm tracking-tight">
              Modo Descoberta
            </span>
            <span className="text-xs text-white/70">
              ({deck.length} amiguinhos)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stack de Cards Swipable */}
        <div className="relative flex-1 w-full my-2 flex items-center justify-center overflow-hidden">
          <AnimatePresence>
            {deck.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full rounded-3xl bg-white p-6 flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center text-4xl mb-4">
                  🐾
                </div>
                <h3 className="text-xl font-extrabold text-charcoal">
                  Você viu todos os amiguinhos!
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Não se preocupe, novos pets são cadastrados diariamente por ONGs
                  e protetores parceiros.
                </p>

                <div className="mt-6 flex flex-col gap-2 w-full">
                  <button
                    onClick={() => setDeck(animals)}
                    className="w-full py-3 rounded-full bg-primary text-white text-xs font-bold shadow-coral hover:opacity-95 transition-opacity"
                  >
                    Ver Novamente ↺
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-full bg-neutral-100 text-charcoal text-xs font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Voltar aos Favoritos
                  </button>
                </div>
              </motion.div>
            ) : (
              deck.slice(0, 2).reverse().map((pet, idx) => {
                const isTop = idx === deck.slice(0, 2).length - 1;
                const photoUrl =
                  pet.photos[0]?.url ||
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

                if (!isTop) {
                  // Card de fundo (efeito pilha)
                  return (
                    <div
                      key={pet.id}
                      className="absolute inset-0 rounded-3xl overflow-hidden bg-neutral-800 shadow-xl scale-95 translate-y-3 opacity-60 pointer-events-none"
                    >
                      <img
                        src={photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }

                // Card do topo arrastável
                return (
                  <motion.div
                    key={pet.id}
                    style={{ x, rotate }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl cursor-grab active:cursor-grabbing select-none"
                  >
                    {/* Imagem de Fundo com Gradiente de Legibilidade */}
                    <img
                      src={photoUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

                    {/* Selo: QUERO ADOTAR (Direita) */}
                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className="absolute top-6 left-6 border-4 border-secondary text-secondary font-black text-xl px-4 py-1.5 rounded-2xl rotate-[-15deg] bg-black/40 backdrop-blur-sm pointer-events-none tracking-wider shadow-lg"
                    >
                      QUERO ADOTAR ❤️
                    </motion.div>

                    {/* Selo: DEPOIS (Esquerda) */}
                    <motion.div
                      style={{ opacity: dislikeOpacity }}
                      className="absolute top-6 right-6 border-4 border-red-500 text-red-500 font-black text-xl px-4 py-1.5 rounded-2xl rotate-[15deg] bg-black/40 backdrop-blur-sm pointer-events-none tracking-wider shadow-lg"
                    >
                      DEPOIS ✕
                    </motion.div>

                    {/* Match Score Badge (Topo Centro) */}
                    <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary text-xs font-extrabold shadow-sm">
                        ⭐ 98% de Compatibilidade
                      </span>
                    </div>

                    {/* Conteúdo Informativo Inferior */}
                    <div className="absolute bottom-4 inset-x-4 text-white flex flex-col gap-2">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-extrabold leading-none">
                              {pet.name}
                            </h2>
                            <span className="text-lg">
                              {pet.sex === 'MALE' ? '♂' : '♀'}
                            </span>
                            <span className="text-sm font-semibold opacity-90">
                              • {pet.ageApproximate}{' '}
                              {pet.ageUnit === 'YEARS' ? 'anos' : 'meses'}
                            </span>
                          </div>
                          <p className="text-xs text-white/80 mt-1">
                            {pet.breed || 'SRD'} • Porte {pet.size || 'Médio'}
                          </p>
                        </div>

                        {/* Botão Informações (Abre perfil completo) */}
                        <button
                          onClick={() => onSelectAnimal(pet)}
                          className="w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white text-base font-bold shadow-md transition-colors"
                          title="Ver Ficha Completa"
                        >
                          ℹ️
                        </button>
                      </div>

                      {/* Localização & Abrigo */}
                      <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <span>📍</span>
                        <span>
                          {pet.city} – {pet.state}
                        </span>
                        {pet.distanceKm !== undefined && (
                          <span className="text-secondary font-bold">
                            • a {pet.distanceKm} km
                          </span>
                        )}
                      </div>

                      {/* Tags de Personalidade & Saúde */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pet.healthRecord?.isVaccinated && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary/80 text-white text-[10px] font-bold">
                            ✓ Vacinado
                          </span>
                        )}
                        {pet.healthRecord?.isNeutered && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/80 text-white text-[10px] font-bold">
                            ✓ Castrado
                          </span>
                        )}
                        {pet.traits?.[0] && (
                          <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium">
                            {pet.traits[0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Botões de Ação Inferiores (Tinder-style Pad) */}
        {deck.length > 0 && (
          <div className="flex items-center justify-around px-4 py-2">
            {/* Desfazer */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-transform active:scale-90 ${
                history.length > 0
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed'
              }`}
              title="Voltar anterior"
            >
              ↺
            </button>

            {/* Passar (Dislike) */}
            <button
              onClick={handleSwipeLeft}
              className="w-14 h-14 rounded-full bg-neutral-900 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-2xl font-bold shadow-xl active:scale-90 transition-all"
              title="Passar"
            >
              ✕
            </button>

            {/* Super Like */}
            <button
              onClick={handleSuperLike}
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg active:scale-90 transition-all"
              title="Super Like"
            >
              ⭐
            </button>

            {/* Quero Adotar (Like) */}
            <button
              onClick={handleSwipeRight}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-[#FF8A65] text-white flex items-center justify-center text-2xl font-bold shadow-coral active:scale-90 transition-all"
              title="Quero Adotar"
            >
              ❤️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

