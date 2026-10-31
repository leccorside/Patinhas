export interface AdoptionQuestionnaireData {
  housingType: 'HOUSE' | 'APARTMENT' | 'FARM_OR_RANCH' | 'OTHER';
  isRented?: boolean;
  hasOutdoorSpace?: boolean;
  hasNettingScreens?: boolean;
  familyAgreement?: boolean;
  householdPeopleCount?: number;
  hasOtherPets?: boolean;
  otherPetsDetails?: string;
  monthlyBudgetBrl?: number;
  routineHoursAlone?: number;
  adopterExperience?: string;
  answers?: Array<{
    questionKey: string;
    questionText: string;
    answerValue: string;
  }>;
}

export interface CreateAdoptionApplicationPayload {
  animalId: string;
  questionnaire: AdoptionQuestionnaireData;
}

export interface AdoptionApplication {
  id: string;
  animalId: string;
  adopterId: string;
  currentStatus:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW_SCHEDULED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'COMPLETED';
  rejectionReason?: string | null;
  interviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
  animal: {
    id: string;
    name: string;
    species: string;
    breed: string;
    sex: string;
    ageApproximate: number;
    ageUnit: string;
    size: string;
    weightKg?: number | null;
    photos: Array<{ id: string; url: string; isCover: boolean }>;
    organization?: {
      id: string;
      name: string;
      addressCity: string;
      addressState: string;
      phone?: string | null;
      whatsapp?: string | null;
    } | null;
    protector?: {
      id: string;
      email: string;
      profile?: {
        fullName: string;
        avatarUrl?: string | null;
        phone?: string | null;
      } | null;
    } | null;
  };
  questionnaire?: {
    id: string;
    housingType: string;
    isRented: boolean;
    hasOutdoorSpace: boolean;
    hasNettingScreens: boolean;
    familyAgreement: boolean;
    householdPeopleCount: number;
    hasOtherPets: boolean;
    otherPetsDetails?: string | null;
    monthlyBudgetBrl?: number | null;
    routineHoursAlone?: number | null;
    adopterExperience?: string | null;
    answers?: Array<{
      id: string;
      questionKey: string;
      questionText: string;
      answerValue: string;
    }>;
  };
  statusHistory: Array<{
    id: string;
    previousStatus: string;
    newStatus: string;
    observation?: string | null;
    createdAt: string;
    changedByUser?: {
      id: string;
      role: string;
      profile?: {
        fullName: string;
        avatarUrl?: string | null;
      } | null;
    };
  }>;
  adoption?: {
    id: string;
    completedAt: string;
    adoptionTermsSigned: boolean;
    termsDocumentUrl?: string | null;
    notes?: string | null;
  } | null;
}

export const adoptionService = {
  /**
   * Submeter formulário e candidatura de adoção
   */
  async applyForAdoption(payload: CreateAdoptionApplicationPayload): Promise<{
    success: boolean;
    message: string;
    application: AdoptionApplication;
  }> {
    const res = await fetch('/api/v1/adoptions/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao submeter solicitação de adoção.');
    }
    return data;
  },

  /**
   * Buscar candidaturas do usuário adotante logado
   */
  async getMyApplications(): Promise<AdoptionApplication[]> {
    const res = await fetch('/api/v1/adoptions/my', {
      credentials: 'include',
    });

    if (!res.ok) {
      // Se não autenticado ou offline, retorna lista vazia
      return [];
    }
    return res.json();
  },

  /**
   * Obter detalhes completos de uma solicitação
   */
  async getApplicationById(id: string): Promise<AdoptionApplication> {
    const res = await fetch(`/api/v1/adoptions/${id}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao buscar detalhes da candidatura.');
    }
    return data;
  },

  /**
   * Cancelar candidatura a pedido do adotante
   */
  async cancelApplication(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/v1/adoptions/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao cancelar solicitação.');
    }
    return data;
  },
};
