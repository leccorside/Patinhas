import React from 'react';
import { Building2, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Badge } from '../../components';

export interface ShelterData {
  id: string;
  name: string;
  tradeName?: string | null;
  logoUrl?: string | null;
  addressCity: string;
  addressState: string;
  verifiedStatus: string;
  bio?: string | null;
  _count?: {
    animals: number;
    events: number;
    members: number;
  };
}

interface ShelterCardProps {
  shelter: ShelterData;
  onContact?: (shelter: ShelterData) => void;
  className?: string;
}

export function ShelterCard({ shelter, onContact, className = '' }: ShelterCardProps) {
  const isVerified = shelter.verifiedStatus === 'VERIFIED';

  return (
    <div
      className={`
        overflow-hidden
        rounded-3xl
        bg-white
        p-4
        shadow-card
        border
        border-gray-100/80
        transition-all
        hover:shadow-floating
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Logotipo da ONG */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tertiary overflow-hidden border border-[#FFE0B2]">
          {shelter.logoUrl ? (
            <img src={shelter.logoUrl} alt={shelter.name} className="h-full w-full object-cover" />
          ) : (
            <Building2 size={24} className="text-primary" />
          )}
        </div>

        {/* Informações Institucionais */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-extrabold text-charcoal truncate">
              {shelter.name}
            </h4>
            {isVerified && (
              <span title="ONG Verificada">
                <ShieldCheck size={16} className="text-secondary shrink-0" />
              </span>
            )}
          </div>

          <p className="flex items-center gap-1 mt-0.5 text-xs text-charcoal-muted">
            <MapPin size={12} className="text-secondary shrink-0" />
            <span className="truncate">{shelter.addressCity}, {shelter.addressState}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant="teal" size="sm">
              {shelter._count?.animals || 0} pets para adoção
            </Badge>

            {isVerified ? (
              <Badge variant="success" size="sm">Verificada</Badge>
            ) : (
              <Badge variant="gray" size="sm">Em análise</Badge>
            )}
          </div>
        </div>
      </div>

      {shelter.bio && (
        <p className="mt-3 text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
          {shelter.bio}
        </p>
      )}

      {onContact && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => onContact(shelter)}
            className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-[#006A63] hover:bg-secondary/20 transition-colors"
          >
            <HeartHandshake size={14} />
            Ver Animais e Apoiar
          </button>
        </div>
      )}
    </div>
  );
}

export default ShelterCard;

