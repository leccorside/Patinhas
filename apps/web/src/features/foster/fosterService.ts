export interface FosterProfile {
  id: string;
  userId: string;
  capacityPets: number;
  acceptedSpecies: string;
  hasQuarantineSpace: boolean;
  isAvailable: boolean;
  experienceDetails?: string;
  city: string;
  state: string;
  _count?: {
    fosterRequests: number;
  };
}

export interface AvailableFosterHome {
  id: string;
  userId: string;
  capacityPets: number;
  acceptedSpecies: string[];
  hasQuarantineSpace: boolean;
  experienceDetails?: string;
  city: string;
  state: string;
  volunteerName: string;
  volunteerAvatar?: string;
  contactPhone?: string;
  createdAt: string;
}

export interface FosterRequestItem {
  id: string;
  fosterProfileId: string;
  organizationId: string;
  petDetails: string;
  startDate: string;
  estimatedDays: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  createdAt: string;
  organization: {
    id: string;
    name: string;
    logoUrl?: string;
    phone?: string;
    addressCity: string;
    addressState: string;
  };
}

export interface SaveFosterProfilePayload {
  capacityPets: number;
  acceptedSpecies: string;
  hasQuarantineSpace: boolean;
  isAvailable: boolean;
  experienceDetails?: string;
  city: string;
  state: string;
}

export interface CreateFosterRequestPayload {
  fosterProfileId: string;
  organizationId: string;
  petDetails: string;
  startDate: string;
  estimatedDays: number;
}

export const fosterService = {
  // Obter meu perfil
  async getMyProfile(): Promise<FosterProfile | null> {
    const res = await fetch('/api/v1/foster/my-profile', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Salvar meu perfil
  async saveProfile(payload: SaveFosterProfilePayload) {
    const res = await fetch('/api/v1/foster/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao salvar perfil de voluntário.');
    return data;
  },

  // Listar lares temporários disponíveis
  async getAvailable(city?: string, state?: string, species?: string): Promise<AvailableFosterHome[]> {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (species) params.append('species', species);

    const res = await fetch(`/api/v1/foster/available?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Solicitar acolhimento
  async createRequest(payload: CreateFosterRequestPayload) {
    const res = await fetch('/api/v1/foster/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao enviar solicitação.');
    return data;
  },

  // Listar solicitações recebidas
  async getMyRequests(): Promise<FosterRequestItem[]> {
    const res = await fetch('/api/v1/foster/my-requests', {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Responder solicitação
  async respondRequest(requestId: string, status: 'ACCEPTED' | 'DECLINED') {
    const res = await fetch(`/api/v1/foster/requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao responder solicitação.');
    return data;
  },
};
