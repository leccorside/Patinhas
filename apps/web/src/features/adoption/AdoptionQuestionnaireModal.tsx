import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  ShieldCheck,
  Heart,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { adoptionService, AdoptionQuestionnaireData } from './adoptionService';
import { Animal } from '../animals/animalsService';

interface AdoptionQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onSuccess: (applicationId: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdoptionQuestionnaireModal: React.FC<AdoptionQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  animal,
  onSuccess,
  showToast,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário de Questionário
  const [housingType, setHousingType] = useState<'HOUSE' | 'APARTMENT' | 'FARM_OR_RANCH' | 'OTHER'>('APARTMENT');
  const [isRented, setIsRented] = useState(false);
  const [hasOutdoorSpace, setHasOutdoorSpace] = useState(false);
  const [hasNettingScreens, setHasNettingScreens] = useState(true);
  const [householdPeopleCount, setHouseholdPeopleCount] = useState(2);
  const [familyAgreement, setFamilyAgreement] = useState(true);

  // Passo 2: Rotina & Cuidados
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [otherPetsDetails, setOtherPetsDetails] = useState('');
  const [routineHoursAlone, setRoutineHoursAlone] = useState(4);
  const [monthlyBudgetBrl, setMonthlyBudgetBrl] = useState(350);
  const [adopterExperience, setAdopterExperience] = useState('');

  // Passo 3: Termo e Compromisso
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen || !animal) return null;

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      showToast('Por favor, aceite os termos de responsabilidade para concluir.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const questionnaire: AdoptionQuestionnaireData = {
        housingType,
        isRented,
        hasOutdoorSpace,
        hasNettingScreens,
        familyAgreement,
        householdPeopleCount,
        hasOtherPets,
        otherPetsDetails: hasOtherPets ? otherPetsDetails : undefined,
        routineHoursAlone,
        monthlyBudgetBrl,
        adopterExperience,
      };

      const res = await adoptionService.applyForAdoption({
        animalId: animal.id,
        questionnaire,
      });

      showToast(res.message || 'Candidatura enviada com sucesso! 🐾', 'success');
      onSuccess(res.application.id);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erro ao submeter questionário de adoção.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header do Stepper */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              🐾
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal leading-none">
                Candidatura de Adoção
              </h2>
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Para acolher <strong className="text-primary">{animal.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-muted hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white px-5 py-2.5 border-b border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-semibold ${currentStep === 1 ? 'text-primary' : 'text-neutral-500'}`}>
              Lar
            </span>
            <div className={`flex-1 h-1 rounded-full mx-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-neutral-200'}`} />

            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-semibold ${currentStep === 2 ? 'text-primary' : 'text-neutral-500'}`}>
              Rotina
            </span>
            <div className={`flex-1 h-1 rounded-full mx-1 ${currentStep === 3 ? 'bg-primary' : 'bg-neutral-200'}`} />

            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              currentStep === 3 ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-semibold ${currentStep === 3 ? 'text-primary' : 'text-neutral-500'}`}>
              Compromisso
            </span>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {/* ETAPA 1: SEU LAR E AMBIENTE */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-2">
                    Tipo de Moradia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'APARTMENT', label: '🏢 Apartamento' },
                      { value: 'HOUSE', label: '🏡 Casa' },
                      { value: 'FARM_OR_RANCH', label: '🌳 Sítio / Chácara' },
                      { value: 'OTHER', label: '🏠 Outro' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHousingType(opt.value as any)}
                        className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                          housingType === opt.value
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-white border-neutral-200 text-charcoal hover:bg-neutral-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles de Moradia */}
                <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-neutral-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-charcoal">Imóvel alugado?</p>
                      <p className="text-[11px] text-charcoal-muted">O condomínio/proprietário permite pets?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRented(!isRented)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isRented ? 'bg-primary' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isRented ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-charcoal">Possui redes/telas de proteção?</p>
                      <p className="text-[11px] text-charcoal-muted">Janelas e sacadas teladas para segurança</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasNettingScreens(!hasNettingScreens)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        hasNettingScreens ? 'bg-secondary' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hasNettingScreens ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-charcoal">Possui quintal ou área aberta?</p>
                      <p className="text-[11px] text-charcoal-muted">Espaço seguro para brincadeiras</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasOutdoorSpace(!hasOutdoorSpace)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        hasOutdoorSpace ? 'bg-primary' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hasOutdoorSpace ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Moradores & Concordância */}
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      Quantas pessoas moram na residência?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHouseholdPeopleCount(Math.max(1, householdPeopleCount - 1))}
                        className="w-9 h-9 rounded-full bg-neutral-100 text-charcoal font-bold flex items-center justify-center hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-charcoal w-8 text-center">
                        {householdPeopleCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHouseholdPeopleCount(householdPeopleCount + 1)}
                        className="w-9 h-9 rounded-full bg-neutral-100 text-charcoal font-bold flex items-center justify-center hover:bg-neutral-200"
                      >
                        +
                      </button>
                      <span className="text-xs text-charcoal-muted">pessoas no lar</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs font-bold text-charcoal">Todos da família concordam?</p>
                      <p className="text-[11px] text-charcoal-muted">Decisão conjunta para garantir acolhimento</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFamilyAgreement(!familyAgreement)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        familyAgreement ? 'bg-secondary' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        familyAgreement ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: ROTINA E CUIDADOS */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Outros Pets */}
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-charcoal">Já possui outros animais?</p>
                      <p className="text-[11px] text-charcoal-muted">Cães, gatos ou outras espécies</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasOtherPets(!hasOtherPets)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        hasOtherPets ? 'bg-primary' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hasOtherPets ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {hasOtherPets && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-charcoal mb-1">
                        Conte um pouco sobre eles (espécie, idade, temperamento):
                      </label>
                      <input
                        type="text"
                        value={otherPetsDetails}
                        onChange={(e) => setOtherPetsDetails(e.target.value)}
                        placeholder="Ex: 1 gatinha castrada e calma de 3 anos"
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Horas Sozinho */}
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-charcoal">
                      Quantas horas o pet ficará sozinho por dia?
                    </label>
                    <span className="text-xs font-extrabold text-primary">
                      {routineHoursAlone} horas
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={routineHoursAlone}
                    onChange={(e) => setRoutineHoursAlone(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
                    <span>0h (Home Office)</span>
                    <span>6h</span>
                    <span>12h+</span>
                  </div>
                </div>

                {/* Orçamento Mensal */}
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-charcoal">
                      Orçamento mensal estimado para ração e saúde:
                    </label>
                    <span className="text-xs font-extrabold text-secondary">
                      R$ {monthlyBudgetBrl} / mês
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={monthlyBudgetBrl}
                    onChange={(e) => setMonthlyBudgetBrl(Number(e.target.value))}
                    className="w-full accent-secondary h-2 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
                    <span>R$ 100</span>
                    <span>R$ 500</span>
                    <span>R$ 1.000+</span>
                  </div>
                </div>

                {/* Experiência Prévia */}
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Experiência prévia e por que quer adotar {animal.name}?
                  </label>
                  <textarea
                    rows={3}
                    value={adopterExperience}
                    onChange={(e) => setAdopterExperience(e.target.value)}
                    placeholder="Conte um pouco sobre sua relação com pets e sua motivação para acolher este amiguinho..."
                    className="w-full text-xs p-3 rounded-2xl border border-neutral-200 bg-white focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* ETAPA 3: REVISÃO E COMPROMISSO */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Resumo do Pet */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center gap-3">
                  <img
                    src={animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300'}
                    alt={animal.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-charcoal truncate">{animal.name}</h3>
                    <p className="text-xs text-charcoal-muted">{animal.breed} • {animal.ageApproximate} {animal.ageUnit === 'YEARS' ? 'anos' : 'meses'}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                      {animal.organization?.name || 'Protetor Independente'}
                    </span>
                  </div>
                </div>

                {/* Banner de Adoção Segura */}
                <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-start gap-2.5">
                  <ShieldCheck size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-charcoal leading-relaxed">
                    <p className="font-bold text-secondary">Adoção 100% Gratuita e Responsável</p>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      A plataforma Patinhas não tolera cobrança de taxas de adoção. Sua solicitação passará por triagem humanizada e entrevista.
                    </p>
                  </div>
                </div>

                {/* Compromisso de Amor e Responsabilidade */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <Sparkles size={16} className="text-primary" />
                    Termo de Guarda Responsável
                  </h4>
                  <ul className="text-[11px] text-neutral-600 space-y-1.5 list-disc list-inside">
                    <li>Garantir alimentação de qualidade e água limpa</li>
                    <li>Manter vacinas e vermifugação rigorosamente em dia</li>
                    <li>Não deixar o pet solto em vias públicas sem guia</li>
                    <li>Acolher o animal como membro da família até o fim de seus dias</li>
                  </ul>

                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-charcoal leading-snug">
                      Declaro que todas as informações prestadas são verdadeiras e comprometo-me com a guarda responsável de <strong>{animal.name}</strong>.
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé de Navegação */}
        <div className="p-4 bg-white border-t border-neutral-100 flex items-center gap-2">
          {currentStep > 1 ? (
            <SecondaryButton
              variant="outline"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              icon={<ArrowLeft size={16} />}
            >
              Voltar
            </SecondaryButton>
          ) : (
            <SecondaryButton variant="ghost" onClick={onClose}>
              Cancelar
            </SecondaryButton>
          )}

          {currentStep < 3 ? (
            <PrimaryButton
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              icon={<ArrowRight size={16} />}
            >
              Próximo
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={<Heart size={16} className="fill-white" />}
            >
              Enviar Candidatura 🐾
            </PrimaryButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};
