import React, { useState, useEffect } from 'react';
import { X, Heart, Home, Shield, Check, Info } from 'lucide-react';
import { fosterService, FosterProfile } from './fosterService';

interface FosterVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FosterVolunteerModal: React.FC<FosterVolunteerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [capacityPets, setCapacityPets] = useState(1);
  const [acceptDogs, setAcceptDogs] = useState(true);
  const [acceptCats, setAcceptCats] = useState(true);
  const [hasQuarantineSpace, setHasQuarantineSpace] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [experienceDetails, setExperienceDetails] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const prof = await fosterService.getMyProfile();
      if (prof) {
        setCapacityPets(prof.capacityPets);
        setAcceptDogs(prof.acceptedSpecies.includes('DOG'));
        setAcceptCats(prof.acceptedSpecies.includes('CAT'));
        setHasQuarantineSpace(prof.hasQuarantineSpace);
        setIsAvailable(prof.isAvailable);
        setExperienceDetails(prof.experienceDetails || '');
        setCity(prof.city);
        setState(prof.state);
      }
    } catch {
      // Ignora erro
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const speciesList: string[] = [];
    if (acceptDogs) speciesList.push('DOG');
    if (acceptCats) speciesList.push('CAT');

    if (speciesList.length === 0) {
      alert('Selecione ao menos uma espécie aceita (Cachorro ou Gato).');
      return;
    }

    try {
      setIsSubmitting(true);
      await fosterService.saveProfile({
        capacityPets,
        acceptedSpecies: speciesList.join(','),
        hasQuarantineSpace,
        isAvailable,
        experienceDetails: experienceDetails || undefined,
        city,
        state,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slideUp max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#4DB6AC]">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238]">Lar Temporário Voluntário</h3>
              <p className="text-[11px] text-[#78909C]">Acolhimento transitório para pets resgatados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#78909C] hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-teal-50/70 border border-teal-200/60 p-3 rounded-2xl flex items-start gap-2.5 text-[11px] text-teal-900">
            <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
            <span>
              O lar temporário é um ato de solidariedade. Você acolhe um animal resgatado até que ele seja adotado definitivamente. A ONG cobre ração e cuidados veterinários.
            </span>
          </div>

          {/* Capacidade */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">
              Quantos pets você pode acolher ao mesmo tempo?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCapacityPets(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    capacityPets === num
                      ? 'bg-[#4DB6AC] text-white border-[#4DB6AC]'
                      : 'bg-gray-50 text-[#263238] border-gray-200'
                  }`}
                >
                  {num} {num === 1 ? 'Pet' : 'Pets'}
                </button>
              ))}
            </div>
          </div>

          {/* Espécies Aceitas */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1.5">Espécies que você aceita</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 text-xs font-bold cursor-pointer bg-gray-50">
                <input
                  type="checkbox"
                  checked={acceptDogs}
                  onChange={(e) => setAcceptDogs(e.target.checked)}
                  className="accent-[#4DB6AC] w-4 h-4"
                />
                <span>🐶 Cães</span>
              </label>

              <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 text-xs font-bold cursor-pointer bg-gray-50">
                <input
                  type="checkbox"
                  checked={acceptCats}
                  onChange={(e) => setAcceptCats(e.target.checked)}
                  className="accent-[#4DB6AC] w-4 h-4"
                />
                <span>🐱 Gatos</span>
              </label>
            </div>
          </div>

          {/* Espaço para Quarentena */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#263238] block">Possui espaço de quarentena?</span>
              <span className="text-[10px] text-[#78909C]">Cômodo isolado para pets recém-resgatados</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasQuarantineSpace}
                onChange={(e) => setHasQuarantineSpace(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4DB6AC]" />
            </label>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#4DB6AC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Estado (UF) *</label>
              <input
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#4DB6AC]"
              />
            </div>
          </div>

          {/* Experiência */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">
              Experiência com cuidados especiais (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Já administrei medicação oral, tenho experiência com filhotes ou pós-cirúrgico..."
              value={experienceDetails}
              onChange={(e) => setExperienceDetails(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#4DB6AC] resize-none"
            />
          </div>

          {/* Disponibilidade Ativa */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#263238] block">Disponível no momento</span>
              <span className="text-[10px] text-[#78909C]">Seu lar aparecerá na busca de ONGs parceiras</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4DB6AC]" />
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#78909C] hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#4DB6AC] hover:bg-[#3FA096] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4DB6AC]/20 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
