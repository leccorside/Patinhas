import React, { InputHTMLAttributes } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onOpenFilters,
  activeFiltersCount = 0,
  placeholder = 'Buscar por raça, nome ou cidade...',
  className = '',
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Ícone de Busca à Esquerda */}
      <span className="absolute left-4 text-charcoal-muted pointer-events-none">
        <Search size={18} />
      </span>

      {/* Campo de Texto em Pílula */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-full
          bg-white
          py-3.5
          pl-11
          pr-14
          text-sm
          font-medium
          text-charcoal
          placeholder-charcoal-muted
          shadow-card
          border
          border-gray-100
          transition-all
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/20
        "
        {...props}
      />

      {/* Botão de Limpar Busca se houver texto */}
      {value.length > 0 && (
        <button
          onClick={() => onChange('')}
          className="absolute right-12 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-charcoal-muted hover:bg-gray-200 transition-colors"
          aria-label="Limpar texto"
        >
          <X size={12} />
        </button>
      )}

      {/* Botão de Filtros à Direita */}
      {onOpenFilters && (
        <button
          onClick={onOpenFilters}
          aria-label="Filtros avançados"
          className={`
            absolute
            right-2
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            transition-transform
            active:scale-90
            ${activeFiltersCount > 0 ? 'bg-primary text-white shadow-coral' : 'bg-gray-100 text-charcoal hover:bg-gray-200'}
          `}
        >
          <SlidersHorizontal size={15} />
          {activeFiltersCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-charcoal text-[9px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export default SearchInput;

