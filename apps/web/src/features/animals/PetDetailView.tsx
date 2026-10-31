import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Animal } from './animalsService';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

interface PetDetailViewProps {
  animal: Animal;
  onBack: () => void;
  onAdoptClick?: (animal: Animal) => void;
}

export const PetDetailView: React.FC<PetDetailViewProps> = ({
  animal,
  onBack,
  onAdoptClick,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const photos = animal.photos && animal.photos.length > 0
    ? animal.photos
    : [
        {
          id: 'default',
          url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          displayOrder: 0,
          isCover: true,
        },
      ];

  const activePhoto = photos[activePhotoIndex] || photos[0];

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    setToastMessage(
      next
        ? `${animal.name} foi adicionado aos favoritos! ❤️`
        : `${animal.name} foi removido dos favoritos.`
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adote ${animal.name} no Patinhas!`,
          text: `Conheça ${animal.name}, ${animal.breed || 'pet'} disponível para adoção responsável no Patinhas.`,
          url: window.location.href,
        });
      } catch {
        // Ignora cancelamento do share
      }
    } else {
      setToastMessage('Link copiado para a área de transferência! 🐾');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const speciesLabels: Record<string, string> = {
    DOG: 'Cachorro',
    CAT: 'Gato',
    BIRD: 'Pássaro',
    RABBIT: 'Coelho',
    OTHER: 'Outro',
  };

  const sizeLabels: Record<string, string> = {
    MINI: 'Mini',
    SMALL: 'Pequeno',
    MEDIUM: 'Médio',
    LARGE: 'Grande',
    GIANT: 'Gigante',
  };

  const energyLabels: Record<string, string> = {
    LOW: 'Baixa',
    MODERATE: 'Moderada',
    HIGH: 'Alta',
    VERY_HIGH: 'Muito Alta',
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8] text-[#263238] pb-28 relative">
      {/* Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 inset-x-4 max-w-sm mx-auto z-50 bg-[#263238] text-white px-4 py-3 rounded-full shadow-xl flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-secondary text-lg">✓</span>
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
            <span className="text-base">🐾</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Fixo */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-charcoal active:scale-95"
            aria-label="Voltar"
          >
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🐾</span>
            <span className="font-extrabold text-lg tracking-tight text-charcoal">
              Patinhas<span className="text-primary">.</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-charcoal active:scale-95"
            aria-label="Compartilhar"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Visual Card */}
      <div className="px-4 pt-2">
        <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-100 shadow-md">
          {/* Main Photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
            <motion.img
              key={activePhoto.url}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={activePhoto.url}
              alt={animal.name}
              className="w-full h-full object-cover"
            />

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/95 shadow-md backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Favoritar"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  isFavorite ? 'text-primary fill-primary' : 'text-neutral-400 fill-none stroke-current'
                }`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Status Chip */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-semibold text-charcoal">
                {animal.status === 'AVAILABLE' ? 'Disponível para adoção' : 'Em processo'}
              </span>
            </div>

            {/* Gallery Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              {activePhotoIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Thumbnail Carousel Strip */}
          {photos.length > 1 && (
            <div className="p-2.5 bg-white flex items-center gap-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.id || index}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`relative flex-1 h-14 min-w-[56px] rounded-xl overflow-hidden transition-all ${
                    activePhotoIndex === index
                      ? 'ring-2 ring-primary ring-offset-1 scale-95'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Summary Header */}
      <section className="px-4 pt-5 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight flex items-center gap-2">
              {animal.name}
              <span
                className={`text-xl font-bold ${
                  animal.sex === 'MALE' ? 'text-blue-500' : 'text-pink-500'
                }`}
                title={animal.sex === 'MALE' ? 'Macho' : 'Fêmea'}
              >
                {animal.sex === 'MALE' ? '♂' : '♀'}
              </span>
            </h1>
            <p className="text-sm font-semibold text-neutral-500">
              {animal.breed || speciesLabels[animal.species]} • Porte {sizeLabels[animal.size]}
            </p>
          </div>

          {/* Safe Adoption Badge */}
          <div className="flex items-center gap-1 bg-secondary/15 px-3 py-1.5 rounded-full text-secondary text-xs font-bold whitespace-nowrap">
            <span>🛡️</span>
            <span>Adoção Segura</span>
          </div>
        </div>

        {/* Location & Distance */}
        <div className="flex flex-col gap-1 mt-1 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-primary text-sm">📍</span>
            <span>
              {animal.city} – {animal.state}
            </span>
            {animal.distanceKm !== null && animal.distanceKm !== undefined && (
              <>
                <span className="text-neutral-300 font-bold">•</span>
                <span className="text-secondary font-bold">a {animal.distanceKm} km de você</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>⏳</span>
            <span>Aguardando um lar com muito carinho</span>
          </div>
        </div>
      </section>

      {/* 4 Quick Specs Cards */}
      <section className="px-4 pt-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Age */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col gap-1 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold">
              <span className="text-primary">📅</span>
              <span>Idade</span>
            </div>
            <p className="text-lg font-bold text-charcoal">
              {animal.ageApproximate}{' '}
              <span className="text-xs font-normal text-neutral-500">
                {animal.ageUnit === 'YEARS' ? 'Anos' : 'Meses'}
              </span>
            </p>
          </div>

          {/* Weight / Size */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col gap-1 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold">
              <span className="text-primary">⚖️</span>
              <span>Porte & Peso</span>
            </div>
            <p className="text-lg font-bold text-charcoal">
              {animal.weightKg ? `${animal.weightKg} kg` : sizeLabels[animal.size]}
            </p>
          </div>

          {/* Sex */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col gap-1 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold">
              <span className="text-secondary">🐾</span>
              <span>Sexo</span>
            </div>
            <p className="text-lg font-bold text-charcoal">
              {animal.sex === 'MALE' ? 'Macho' : 'Fêmea'}
            </p>
          </div>

          {/* Energy */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col gap-1 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold">
              <span className="text-secondary">⚡</span>
              <span>Energia</span>
            </div>
            <p className="text-lg font-bold text-charcoal">
              {energyLabels[animal.energyLevel] || 'Moderada'}
            </p>
          </div>
        </div>
      </section>

      {/* Ficha de Saúde */}
      <section className="px-4 pt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
              <span className="text-secondary">🩺</span>
              Ficha de Saúde
            </h2>
            <span className="text-xs text-secondary bg-secondary/15 px-2.5 py-1 rounded-full font-bold">
              100% Em Dia
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-[#F4FAFF] p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[11px]">
                ✓
              </span>
              <span className="font-semibold text-charcoal">
                {animal.healthRecord?.isVaccinated ? 'Vacinado' : 'Vacinas pendentes'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F4FAFF] p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[11px]">
                ✓
              </span>
              <span className="font-semibold text-charcoal">
                {animal.healthRecord?.isNeutered ? 'Castrado' : 'Não castrado'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F4FAFF] p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[11px]">
                ✓
              </span>
              <span className="font-semibold text-charcoal">
                {animal.healthRecord?.isDewormed ? 'Vermifugado' : 'Vermífugo pendente'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F4FAFF] p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-[11px]">
                ✓
              </span>
              <span className="font-semibold text-charcoal">Microchipado</span>
            </div>
          </div>

          {animal.healthRecord?.vaccinationDetails && (
            <p className="text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
              📌 <strong>Detalhes:</strong> {animal.healthRecord.vaccinationDetails}
            </p>
          )}
        </div>
      </section>

      {/* Personalidade & Convívio */}
      <section className="px-4 pt-5 flex flex-col gap-2">
        <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
          <span className="text-primary">✨</span>
          Personalidade & Convívio
        </h2>
        <div className="flex flex-wrap gap-2">
          {animal.traits && animal.traits.length > 0 ? (
            animal.traits.map((trait) => (
              <span
                key={trait.id || trait.name}
                className="bg-apricot/60 text-charcoal text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/20"
              >
                <span>⭐</span> {trait.name}
              </span>
            ))
          ) : (
            <>
              <span className="bg-apricot/60 text-charcoal text-xs font-semibold px-3 py-1.5 rounded-full">
                🎾 Brincalhão
              </span>
              <span className="bg-apricot/60 text-charcoal text-xs font-semibold px-3 py-1.5 rounded-full">
                ❤️ Carinhoso
              </span>
            </>
          )}

          {animal.compatibilityDogs && (
            <span className="bg-secondary/15 text-secondary text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span>🐕</span> Sociável com cães
            </span>
          )}
          {animal.compatibilityCats && (
            <span className="bg-secondary/15 text-secondary text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span>🐈</span> Sociável com gatos
            </span>
          )}
          {animal.compatibilityChildren && (
            <span className="bg-secondary/15 text-secondary text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span>👶</span> Amigável com crianças
            </span>
          )}
        </div>
      </section>

      {/* História / Sobre o Pet */}
      <section className="px-4 pt-5 flex flex-col gap-2">
        <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
          <span className="text-primary">📖</span>
          História de {animal.name}
        </h2>
        <div className="bg-white p-4 rounded-2xl shadow-sm text-sm text-neutral-600 flex flex-col gap-2 border border-neutral-100 leading-relaxed">
          <p>{animal.description}</p>
          {animal.adoptionRequirements && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <p className="text-xs font-bold text-charcoal mb-1">📋 Requisitos para adoção:</p>
              <p className="text-xs text-neutral-500">{animal.adoptionRequirements}</p>
            </div>
          )}
        </div>
      </section>

      {/* Card do Cuidador / Abrigo */}
      <section className="px-4 pt-5">
        <div className="bg-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3 border border-neutral-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
              <img
                src={
                  animal.organization?.logoUrl ||
                  animal.protector?.profile?.avatarUrl ||
                  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'
                }
                alt=""
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full ring-2 ring-white" />
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-charcoal truncate">
                {animal.organization?.name || animal.protector?.profile?.fullName || 'Protetor Patinhas'}
              </h3>
              <p className="text-xs text-neutral-400 truncate">
                {animal.organization ? 'ONG Verificada' : 'Protetor Independente'}
              </p>
              <span className="text-[11px] text-secondary font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Responde rápido
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setToastMessage('Iniciando chat com o protetor...');
              setShowToast(true);
            }}
            className="flex-shrink-0 h-9 px-3.5 rounded-full bg-neutral-100 text-charcoal text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <span>💬</span>
            <span>Chat</span>
          </button>
        </div>
      </section>

      {/* Card Adoção Responsável */}
      <section className="px-4 pt-5">
        <div className="bg-secondary/10 rounded-2xl p-3.5 flex items-center gap-3 border border-secondary/20">
          <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center flex-shrink-0 text-base">
            👍
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-charcoal">Adoção 100% Responsável</span>
            <span className="text-[11px] text-neutral-600">
              Processo humanizado com suporte e acompanhamento de adaptação.
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(38,50,56,0.08)] px-4 py-3 pb-safe max-w-[430px] mx-auto border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setToastMessage('Ligando para a equipe do abrigo...');
              setShowToast(true);
            }}
            className="w-12 h-12 rounded-full bg-neutral-100 text-charcoal hover:bg-neutral-200 transition-colors flex items-center justify-center flex-shrink-0 active:scale-95"
            aria-label="Ligar"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-neutral-100 text-charcoal hover:bg-neutral-200 transition-colors flex items-center justify-center flex-shrink-0 active:scale-95"
            aria-label="Compartilhar"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <div className="flex-1">
            <PrimaryButton
              fullWidth
              size="lg"
              onClick={() => {
                if (onAdoptClick) {
                  onAdoptClick(animal);
                } else {
                  setToastMessage(`Solicitação de adoção iniciada para ${animal.name}! 🐾`);
                  setShowToast(true);
                }
              }}
              icon={
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              }
            >
              Quero Adotar
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

