export interface AnimalPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isCover: boolean;
}

export interface AnimalHealthRecord {
  id: string;
  isVaccinated: boolean;
  vaccinationDetails?: string | null;
  isNeutered: boolean;
  isDewormed: boolean;
  medicalNotes?: string | null;
}

export interface AnimalTrait {
  id: string;
  name: string;
}

export interface Animal {
  id: string;
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
  breed?: string | null;
  ageApproximate: number;
  ageUnit: 'MONTHS' | 'YEARS';
  sex: 'MALE' | 'FEMALE';
  size: 'MINI' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';
  weightKg?: number | null;
  coatColor?: string | null;
  description: string;
  adoptionRequirements?: string | null;
  status: 'AVAILABLE' | 'PENDING_ADOPTION' | 'ADOPTED' | 'QUARANTINE' | 'UNAVAILABLE';
  isSpecialNeeds: boolean;
  specialNeedsDescription?: string | null;
  compatibilityDogs: boolean;
  compatibilityCats: boolean;
  compatibilityChildren: boolean;
  energyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  viewsCount: number;
  createdAt: string;
  photos: AnimalPhoto[];
  traits: AnimalTrait[];
  healthRecord?: AnimalHealthRecord | null;
  organization?: {
    id: string;
    name: string;
    tradeName?: string | null;
    logoUrl?: string | null;
    verifiedStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  } | null;
  protector?: {
    id: string;
    role: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  _count?: {
    favorites: number;
    adoptionApplications: number;
  };
}

export interface FilterAnimalsParams {
  search?: string;
  species?: string;
  sex?: string;
  size?: string;
  city?: string;
  state?: string;
  isSpecialNeeds?: boolean;
  userLat?: number;
  userLon?: number;
  page?: number;
  limit?: number;
}

const API_BASE = '/api/v1';

export const animalsService = {
  async getAnimals(params: FilterAnimalsParams = {}): Promise<{ data: Animal[]; total: number }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.species) query.append('species', params.species);
    if (params.sex) query.append('sex', params.sex);
    if (params.size) query.append('size', params.size);
    if (params.city) query.append('city', params.city);
    if (params.state) query.append('state', params.state);
    if (params.isSpecialNeeds !== undefined) query.append('isSpecialNeeds', String(params.isSpecialNeeds));
    if (params.userLat) query.append('userLat', String(params.userLat));
    if (params.userLon) query.append('userLon', String(params.userLon));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/animals?${query.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Falha ao carregar animais.');
    return res.json();
  },

  async getAnimalById(id: string, userLat?: number, userLon?: number): Promise<Animal> {
    const query = new URLSearchParams();
    if (userLat) query.append('userLat', String(userLat));
    if (userLon) query.append('userLon', String(userLon));

    const res = await fetch(`${API_BASE}/animals/${id}?${query.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Falha ao carregar detalhes do animal.');
    return res.json();
  },

  async createAnimal(data: any): Promise<Animal> {
    const res = await fetch(`${API_BASE}/animals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao cadastrar animal.');
    }
    return res.json();
  },

  async uploadAnimalPhotos(animalId: string, files: File[]): Promise<AnimalPhoto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));

    const res = await fetch(`${API_BASE}/animals/${animalId}/photos`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Falha ao enviar fotos do animal.');
    return res.json();
  },
};

