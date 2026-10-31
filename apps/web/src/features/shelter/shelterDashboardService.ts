export interface ShelterSummary {
  organization: {
    id: string;
    name: string;
    tradeName?: string;
    logoUrl?: string;
    verifiedStatus: 'UNVERIFIED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';
    addressCity: string;
    addressState: string;
    _count: {
      animals: number;
      members: number;
    };
  };
  myRole: 'OWNER' | 'ADMIN' | 'VOLUNTEER';
  joinedAt: string;
}

export interface ShelterMetrics {
  totalAnimals: number;
  availableAnimals: number;
  inAdoptionAnimals: number;
  adoptedAnimals: number;
  specialCareAnimals: number;
  totalApplications: number;
  pendingApplications: number;
  interviewApplications: number;
  approvedApplications: number;
  completedApplications: number;
  conversionRate: number;
}

export interface PendingActionApplication {
  id: string;
  currentStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  interviewDate?: string;
  createdAt: string;
  animal: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    photos?: Array<{ url: string }>;
  };
  adopter: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      addressCity?: string;
      addressState?: string;
      phone?: string;
    };
  };
  questionnaire?: {
    housingType: string;
    hasNettingScreens: boolean;
    hasOtherPets: boolean;
    monthlyBudgetBrl?: number;
  };
}

export interface ShelterRecentAnimal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  status: string;
  photos?: Array<{ url: string }>;
  _count: {
    adoptionApplications: number;
    favorites: number;
  };
}

export interface ShelterMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'VOLUNTEER';
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  joinedAt: string;
}

export interface ShelterDashboardData {
  organization: {
    id: string;
    name: string;
    tradeName?: string;
    logoUrl?: string;
    verifiedStatus: 'UNVERIFIED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';
    city: string;
    state: string;
    membersCount: number;
  };
  metrics: ShelterMetrics;
  pendingActions: PendingActionApplication[];
  recentAnimals: ShelterRecentAnimal[];
  members: ShelterMember[];
}

export const shelterDashboardService = {
  // Listar organizações do usuário autenticado
  async getMyShelters(): Promise<ShelterSummary[]> {
    const res = await fetch('/api/v1/organizations/my-shelters', {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Obter dados completos do dashboard de uma organização
  async getDashboard(orgId: string): Promise<ShelterDashboardData> {
    const res = await fetch(`/api/v1/organizations/${orgId}/dashboard`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao obter dashboard da organização.');
    }
    return data;
  },

  // Atualizar status de uma candidatura
  async updateApplicationStatus(applicationId: string, status: string, notes?: string) {
    const res = await fetch(`/api/v1/adoptions/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao atualizar status');
    return data;
  },

  // Agendar entrevista
  async scheduleInterview(applicationId: string, interviewDate: string, notes?: string) {
    const res = await fetch(`/api/v1/adoptions/${applicationId}/schedule-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ interviewDate, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao agendar entrevista');
    return data;
  },

  // Concluir adoção
  async completeAdoption(applicationId: string, finalNotes?: string) {
    const res = await fetch(`/api/v1/adoptions/${applicationId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ finalNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao formalizar adoção');
    return data;
  },

  // Adicionar membro na ONG
  async addMember(orgId: string, email: string, role: 'ADMIN' | 'VOLUNTEER') {
    const res = await fetch(`/api/v1/organizations/${orgId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao adicionar membro');
    return data;
  },

  // Remover membro da ONG
  async removeMember(orgId: string, userId: string) {
    const res = await fetch(`/api/v1/organizations/${orgId}/members/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao remover membro');
    return data;
  },
};
