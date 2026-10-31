import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { animalsService } from './animalsService';

interface CreatePetStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userOrganizations?: Array<{ id: string; name: string }>;
}

const STEPS = [
  { id: 1, title: 'Básico', subtitle: 'Nome, espécie e raça' },
  { id: 2, title: 'Fotos', subtitle: 'Galeria do pet' },
  { id: 3, title: 'Saúde', subtitle: 'Vacinas e cuidados' },
  { id: 4, title: 'Temperamento', subtitle: 'Personalidade' },
  { id: 5, title: 'Local', subtitle: 'Cidade e abrigo' },
  { id: 6, title: 'História', subtitle: 'Texto e requisitos' },
];

export const CreatePetStepperModal: React.FC<CreatePetStepperModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userOrganizations = [],
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG',
    breed: '',
    sex: 'MALE',
    ageApproximate: 1,
    ageUnit: 'YEARS',
    size: 'MEDIUM',
    weightKg: '',
    coatColor: '',
    // Saúde
    isVaccinated: true,
    vaccinationDetails: '',
    isNeutered: true,
    isDewormed: true,
    isSpecialNeeds: false,
    specialNeedsDescription: '',
    medicalNotes: '',
    // Temperamento & Convívio
    traits: ['Dócil', 'Brincalhão'] as string[],
    compatibilityDogs: true,
    compatibilityCats: true,
    compatibilityChildren: true,
    energyLevel: 'MODERATE',
    // Local & Abrigo
    organizationId: userOrganizations[0]?.id || '',
    city: 'São Paulo',
    state: 'SP',
    // História & Requisitos
    description: '',
    adoptionRequirements: 'Apartamento telado ou casa murada sem rotas de fuga.',
  });

  // Fotos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  ]);

  const availableTraits = [
    'Dócil',
    'Brincalhão',
    'Calmo',
    'Carinhoso',
    'Independente',
    'Protetor',
    'Sociável',
    'Apto para apartamento',
    'Gosta de passeios',
    'Dorme bastante',
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1 && !formData.name.trim()) {
      setErrorMessage('Por favor, informe o nome do pet.');
      return;
    }
    if (currentStep === 6 && !formData.description.trim()) {
      setErrorMessage('Por favor, conte um pouco sobre a história do pet.');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleTrait = (trait: string) => {
    setFormData((prev) => {
      const exists = prev.traits.includes(trait);
      const updated = exists
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait];
      return { ...prev, traits: updated };
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    setPhotoFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Cria o animal
      const payload: any = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        sex: formData.sex,
        ageApproximate: Number(formData.ageApproximate) || 1,
        ageUnit: formData.ageUnit,
        size: formData.size,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        coatColor: formData.coatColor || undefined,
        description: formData.description,
        adoptionRequirements: formData.adoptionRequirements || undefined,
        isSpecialNeeds: formData.isSpecialNeeds,
        specialNeedsDescription: formData.specialNeedsDescription || undefined,
        compatibilityDogs: formData.compatibilityDogs,
        compatibilityCats: formData.compatibilityCats,
        compatibilityChildren: formData.compatibilityChildren,
        energyLevel: formData.energyLevel,
        city: formData.city,
        state: formData.state,
        organizationId: formData.organizationId || undefined,
        traits: formData.traits,
        healthRecord: {
          isVaccinated: formData.isVaccinated,
          vaccinationDetails: formData.vaccinationDetails || undefined,
          isNeutered: formData.isNeutered,
          isDewormed: formData.isDewormed,
          medicalNotes: formData.medicalNotes || undefined,
        },
        photos: photoPreviews.map((url, idx) => ({
          url,
          displayOrder: idx,
          isCover: idx === 0,
        })),
      };

      const created = await animalsService.createAnimal(payload);

      // 2. Se houver arquivos reais selecionados, faz upload para o MinIO
      if (photoFiles.length > 0) {
        await animalsService.uploadAnimalPhotos(created.id, photoFiles).catch(() => {});
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cadastrar animal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header do Stepper */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Passo {currentStep} de {STEPS.length}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs font-semibold text-neutral-500">
                {STEPS[currentStep - 1].subtitle}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-charcoal">
              {STEPS[currentStep - 1].title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-neutral-100 h-1.5">
          <div
            className="bg-primary h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-sm text-charcoal">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {errorMessage}
            </div>
          )}

          {/* ETAPA 1: BÁSICO */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Nome do Pet *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Charlie, Mel, Pipoca"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Espécie
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
                  >
                    <option value="DOG">Cachorro 🐕</option>
                    <option value="CAT">Gato 🐈</option>
                    <option value="RABBIT">Coelho 🐇</option>
                    <option value="BIRD">Pássaro 🦜</option>
                    <option value="OTHER">Outro 🐾</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Sexo
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
                  >
                    <option value="MALE">Macho ♂</option>
                    <option value="FEMALE">Fêmea ♀</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Raça aproximada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Golden Mestiço, SRD, Poodle..."
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Idade aproximada
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={formData.ageApproximate}
                      onChange={(e) =>
                        setFormData({ ...formData, ageApproximate: Number(e.target.value) })
                      }
                      className="w-20 px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <select
                      value={formData.ageUnit}
                      onChange={(e) => setFormData({ ...formData, ageUnit: e.target.value })}
                      className="flex-1 px-2 py-2 rounded-xl border border-neutral-200 bg-white text-xs"
                    >
                      <option value="YEARS">Anos</option>
                      <option value="MONTHS">Meses</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Porte
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs"
                  >
                    <option value="MINI">Mini (&lt; 5kg)</option>
                    <option value="SMALL">Pequeno (5-10kg)</option>
                    <option value="MEDIUM">Médio (10-20kg)</option>
                    <option value="LARGE">Grande (20-40kg)</option>
                    <option value="GIANT">Gigante (&gt; 40kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 12.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Cor da Pelagem
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Caramelo, Tricolor..."
                    value={formData.coatColor}
                    onChange={(e) => setFormData({ ...formData, coatColor: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: FOTOS */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-neutral-500">
                Adicione fotos de alta qualidade e com boa iluminação. A primeira foto será usada como capa.
              </p>

              <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative bg-neutral-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-3xl block mb-2">📸</span>
                <span className="text-xs font-bold text-primary block">
                  Toque para adicionar fotos
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Formatos aceitos: JPG, PNG, WEBP (até 5MB)
                </span>
              </div>

              {photoPreviews.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-2">
                    Galeria ({photoPreviews.length} foto{photoPreviews.length > 1 ? 's' : ''})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            Capa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
                            setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: SAÚDE */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-neutral-700 block">
                Cuidados Veterinários Básicos
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVaccinated: !formData.isVaccinated })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.isVaccinated
                      ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  <span className="text-xs">Vacinado</span>
                  <span>{formData.isVaccinated ? '✓' : '—'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNeutered: !formData.isNeutered })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.isNeutered
                      ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  <span className="text-xs">Castrado</span>
                  <span>{formData.isNeutered ? '✓' : '—'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isDewormed: !formData.isDewormed })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.isDewormed
                      ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  <span className="text-xs">Vermifugado</span>
                  <span>{formData.isDewormed ? '✓' : '—'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isSpecialNeeds: !formData.isSpecialNeeds })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.isSpecialNeeds
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  <span className="text-xs">Especial</span>
                  <span>{formData.isSpecialNeeds ? '✓' : '—'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Detalhes das vacinas (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: V10 completa (3 doses) + Antirrábica 2026"
                  value={formData.vaccinationDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, vaccinationDetails: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {formData.isSpecialNeeds && (
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Descrição da necessidade especial
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cegueira parcial, medicação diária..."
                    value={formData.specialNeedsDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, specialNeedsDescription: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* ETAPA 4: TEMPERAMENTO */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-neutral-700 block">
                Tags de Personalidade (toque para selecionar)
              </label>

              <div className="flex flex-wrap gap-2">
                {availableTraits.map((trait) => {
                  const selected = formData.traits.includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {trait} {selected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              <label className="text-xs font-bold text-neutral-700 block mt-2">
                Convívio & Sociabilidade
              </label>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.compatibilityDogs}
                    onChange={(e) =>
                      setFormData({ ...formData, compatibilityDogs: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-xs font-medium">Sociável com outros cães 🐕</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.compatibilityCats}
                    onChange={(e) =>
                      setFormData({ ...formData, compatibilityCats: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-xs font-medium">Sociável com gatos 🐈</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.compatibilityChildren}
                    onChange={(e) =>
                      setFormData({ ...formData, compatibilityChildren: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-xs font-medium">Amigável com crianças 👶</span>
                </label>
              </div>
            </div>
          )}

          {/* ETAPA 5: LOCAL E ABRIGO */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-3">
              {userOrganizations.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Vincular a uma ONG / Abrigo
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) =>
                      setFormData({ ...formData, organizationId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs"
                  >
                    <option value="">Protetor Independente (sem ONG)</option>
                    {userOrganizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-center uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-neutral-600 flex items-start gap-2">
                <span className="text-secondary text-base">🛡️</span>
                <span>
                  <strong>Privacidade protegida:</strong> O Patinhas aplica ruído de localização
                  aleatório para não expor o endereço exato do seu abrigo ou residência.
                </span>
              </div>
            </div>
          )}

          {/* ETAPA 6: HISTÓRIA E REQUISITOS */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  História do Pet *
                </label>
                <textarea
                  rows={4}
                  placeholder="Conte como ele foi resgatado, sua rotina favorita e o que o torna especial..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Requisitos para Adoção Responsável
                </label>
                <textarea
                  rows={3}
                  value={formData.adoptionRequirements}
                  onChange={(e) =>
                    setFormData({ ...formData, adoptionRequirements: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50">
          {currentStep > 1 ? (
            <SecondaryButton size="md" onClick={handlePrev}>
              Voltar
            </SecondaryButton>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-neutral-500 px-3 py-2 hover:text-neutral-700"
            >
              Cancelar
            </button>
          )}

          {currentStep < STEPS.length ? (
            <PrimaryButton size="md" onClick={handleNext}>
              Próximo Passo →
            </PrimaryButton>
          ) : (
            <PrimaryButton size="md" onClick={handleSubmit} isLoading={isSubmitting}>
              Concluir Cadastro 🐾
            </PrimaryButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};
