export interface AdoptionEventItem {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  addressStreet: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  bannerUrl?: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    logoUrl?: string;
    phone?: string;
    verifiedStatus: string;
  };
}

export interface CreateEventPayload {
  organizationId: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  addressStreet: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  bannerUrl?: string;
}

export const eventsService = {
  // Listar feiras e eventos
  async getEvents(upcomingOnly: boolean = true, city?: string, state?: string): Promise<AdoptionEventItem[]> {
    const params = new URLSearchParams();
    params.append('upcomingOnly', upcomingOnly.toString());
    if (city) params.append('city', city);
    if (state) params.append('state', state);

    const res = await fetch(`/api/v1/events?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Obter detalhes
  async getEventById(id: string): Promise<AdoptionEventItem> {
    const res = await fetch(`/api/v1/events/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao buscar feira de adoção.');
    return data;
  },

  // Cadastrar feira de adoção
  async createEvent(payload: CreateEventPayload): Promise<AdoptionEventItem> {
    const res = await fetch('/api/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao cadastrar evento.');
    return data;
  },

  // Excluir feira
  async deleteEvent(id: string) {
    const res = await fetch(`/api/v1/events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao excluir evento.');
    return data;
  },
};

