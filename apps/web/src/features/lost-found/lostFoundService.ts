export type LostFoundType = 'LOST' | 'FOUND';
export type LostFoundStatus = 'OPEN' | 'REUNITED' | 'CLOSED';

export interface LostFoundItem {
  id: string;
  type: LostFoundType;
  petName?: string;
  species: 'DOG' | 'CAT' | 'OTHER';
  breed?: string;
  color: string;
  distinctiveMarks?: string;
  photoUrl: string;
  lastSeenDate: string;
  city: string;
  state: string;
  addressRef?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  rewardDetails?: string;
  status: LostFoundStatus;
  createdAt: string;
  distanceKm?: number;
  authorName?: string;
  authorAvatar?: string;
}

export interface CreateLostFoundPayload {
  type: LostFoundType;
  petName?: string;
  species: 'DOG' | 'CAT' | 'OTHER';
  breed?: string;
  color: string;
  distinctiveMarks?: string;
  photoUrl: string;
  lastSeenDate: string;
  city: string;
  state: string;
  addressRef?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  rewardDetails?: string;
}

export const lostFoundService = {
  // Listar relatos com filtros
  async getReports(params?: {
    type?: LostFoundType;
    species?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  }): Promise<LostFoundItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.species) searchParams.append('species', params.species);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.state) searchParams.append('state', params.state);
    if (params?.latitude !== undefined) searchParams.append('latitude', params.latitude.toString());
    if (params?.longitude !== undefined) searchParams.append('longitude', params.longitude.toString());
    if (params?.radiusKm !== undefined) searchParams.append('radiusKm', params.radiusKm.toString());

    const res = await fetch(`/api/v1/lost-found?${searchParams.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Obter detalhes
  async getReportById(id: string): Promise<LostFoundItem> {
    const res = await fetch(`/api/v1/lost-found/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao buscar relato.');
    return data;
  },

  // Criar relato
  async createReport(payload: CreateLostFoundPayload): Promise<LostFoundItem> {
    const res = await fetch('/api/v1/lost-found', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao cadastrar relato.');
    return data;
  },

  // Marcar como reencontrado
  async markAsReunited(id: string) {
    const res = await fetch(`/api/v1/lost-found/${id}/reunited`, {
      method: 'PATCH',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao marcar como reencontrado.');
    return data;
  },
};
