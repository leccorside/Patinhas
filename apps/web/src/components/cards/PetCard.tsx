import React from 'react';
import { Heart, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PetCardData {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  ageApproximate: number;
  ageUnit: string;
  sex: string;
  city: string;
  state: string;
  distanceKm?: number;
  photoUrl: string;
  isFavorited?: boolean;
  matchScore?: number;
  organizationName?: string | null;
  isSpecialNeeds?: boolean;
  traits?: string[];
}

interface PetCardProps {
  pet: PetCardData;
  onFavoriteToggle?: (id: string, e: React.MouseEvent) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export function PetCard({
  pet,
  onFavoriteToggle,
  onClick,
  className = '',
}: PetCardProps) {
  const isMale = pet.sex === 'MALE' || pet.sex === 'Macho';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick && onClick(pet.id)}
      className={`
        group
        relative
        flex
        flex-col
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-card
        border
        border-gray-100/80
        transition-all
        duration-300
        hover:shadow-floating
        cursor-pointer
        ${className}
      `}
    >
      {/* Imagem do Pet com Overlays */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={pet.photoUrl}
          alt={pet.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradiente suave na base da foto para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Selo de Match Score Inteligente (Top Left) */}
        {typeof pet.matchScore === 'number' && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-coral backdrop-blur-sm">
            <Sparkles size={12} />
            <span>{pet.matchScore}% Match</span>
          </div>
        )}

        {/* Botão de Favoritar Flutuante (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onFavoriteToggle) onFavoriteToggle(pet.id, e);
          }}
          aria-label={pet.isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            shadow-floating
            backdrop-blur-md
            transition-transform
            active:scale-80
            ${pet.isFavorited ? 'bg-primary text-white shadow-coral' : 'bg-white/90 text-primary hover:bg-white'}
          `}
        >
          <Heart
            size={18}
            className={pet.isFavorited ? 'fill-white stroke-white' : 'stroke-primary'}
          />
        </button>

        {/* Distância e Localização Flutuante (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-charcoal shadow-sm backdrop-blur-md">
          <MapPin size={12} className="text-secondary shrink-0" />
          <span>
            {typeof pet.distanceKm === 'number'
              ? `${pet.distanceKm < 1 ? '< 1 km' : `${pet.distanceKm.toFixed(1)} km`} • ${pet.city}`
              : `${pet.city}, ${pet.state}`}
          </span>
        </div>
      </div>

      {/* Conteúdo Informativo do Card */}
      <div className="flex flex-col p-4">
        {/* Nome, Gênero e Idade */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-extrabold tracking-tight text-charcoal">
              {pet.name}
            </h3>
            <span
              className={`text-xs font-bold ${isMale ? 'text-blue-500' : 'text-pink-500'}`}
              title={isMale ? 'Macho' : 'Fêmea'}
            >
              {isMale ? '♂' : '♀'}
            </span>
          </div>

          <span className="rounded-full bg-tertiary px-2.5 py-0.5 text-[11px] font-extrabold text-primary border border-[#FFE0B2]/60">
            {pet.ageApproximate} {pet.ageUnit === 'MONTHS' ? 'm' : 'anos'}
          </span>
        </div>

        {/* Raça e Porte */}
        <p className="mt-0.5 text-xs font-medium text-charcoal-muted">
          {pet.breed || 'Sem raça definida (SRD)'}
        </p>

        {/* Chips de Características e Traços */}
        {pet.traits && pet.traits.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {pet.traits.slice(0, 3).map((trait, idx) => (
              <span
                key={idx}
                className="rounded-full bg-surface-variant px-2.5 py-0.5 text-[10px] font-semibold text-[#006A63]"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Rodapé: Organização / Protetor Responsável */}
        {pet.organizationName && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-2.5 text-[11px] font-medium text-charcoal-muted">
            <ShieldCheck size={14} className="text-secondary shrink-0" />
            <span className="truncate">{pet.organizationName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PetCard;

