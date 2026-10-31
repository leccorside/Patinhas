import React, { useState } from 'react';
import { X, AlertCircle, MapPin, Phone, DollarSign, Camera, Check } from 'lucide-react';
import { lostFoundService, LostFoundType } from './lostFoundService';

interface CreateLostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: LostFoundType;
}

export const CreateLostFoundModal: React.FC<CreateLostFoundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'LOST',
}) => {
  const [type, setType] = useState<LostFoundType>(defaultType);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'DOG' | 'CAT' | 'OTHER'>('DOG');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [addressRef, setAddressRef] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [rewardDetails, setRewardDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !color || !contactPhone) {
      alert('Preencha os campos obrigatórios (Foto, Cor e Telefone de contato).');
      return;
    }

    try {
      setIsSubmitting(true);
      await lostFoundService.createReport({
        type,
        petName: petName || undefined,
        species,
        breed: breed || undefined,
        color,
        distinctiveMarks: distinctiveMarks || undefined,
        photoUrl,
        lastSeenDate: new Date().toISOString(),
        city,
        state,
        addressRef: addressRef || undefined,
        contactPhone,
        rewardDetails: rewardDetails || undefined,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar pet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slideUp max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-extrabold text-[#263238]">
              {type === 'LOST' ? '🚨 Perdi meu Pet' : '🐾 Encontrei um Pet'}
            </h3>
            <p className="text-[11px] text-[#78909C]">
              Publique para alertar moradores e protetores da região
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#78909C] hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Seletor de Tipo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl border transition-all ${
                type === 'LOST'
                  ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                  : 'bg-gray-50 border-gray-100 text-[#78909C]'
              }`}
            >
              🚨 Perdi meu Pet
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl border transition-all ${
                type === 'FOUND'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-gray-50 border-gray-100 text-[#78909C]'
              }`}
            >
              🐾 Encontrei um Pet
            </button>
          </div>

          {/* Nome e Espécie */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">
                {type === 'LOST' ? 'Nome do Pet *' : 'Nome (se souber)'}
              </label>
              <input
                type="text"
                placeholder="Ex: Thor"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Espécie *</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              >
                <option value="DOG">Cachorro</option>
                <option value="CAT">Gato</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          {/* Raça e Cor */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Raça aproximada</label>
              <input
                type="text"
                placeholder="Ex: SRD, Poodle, Siames"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Cor principal *</label>
              <input
                type="text"
                required
                placeholder="Ex: Caramelo com branco"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
          </div>

          {/* Foto URL */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">
              Foto do Pet (URL) *
            </label>
            <input
              type="url"
              required
              placeholder="Cole a URL da foto do pet..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          {/* Local onde foi visto */}
          <div>
            <label className="block text-xs font-bold text-[#263238] mb-1">
              Local onde foi visto pela última vez *
            </label>
            <input
              type="text"
              required
              placeholder="Bairro, rua ou ponto de referência (Ex: Praça da Sé)..."
              value={addressRef}
              onChange={(e) => setAddressRef(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
            />
          </div>

          {/* Contato e Recompensa */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="(11) 98888-8888"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1">Recompensa (opcional)</label>
              <input
                type="text"
                placeholder="Ex: R$ 500"
                value={rewardDetails}
                onChange={(e) => setRewardDetails(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#263238] focus:outline-none focus:border-[#FF7043]"
              />
            </div>
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
              className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all ${
                type === 'LOST'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Alerta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

