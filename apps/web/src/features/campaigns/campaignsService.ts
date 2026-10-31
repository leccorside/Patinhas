export interface Campaign {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  goalAmountBrl: number;
  raisedAmountBrl: number;
  progressPercent: number;
  pixKey?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    tradeName?: string;
    logoUrl?: string;
    phone?: string;
    whatsapp?: string;
    addressCity?: string;
    addressState?: string;
  };
}

export interface CreateCampaignInput {
  organizationId: string;
  title: string;
  description: string;
  goalAmountBrl: number;
  pixKey?: string;
  imageUrl?: string;
}

export const campaignsService = {
  async listCampaigns(activeOnly: boolean = true): Promise<Campaign[]> {
    const res = await fetch(`/api/v1/campaigns?activeOnly=${activeOnly}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getCampaign(id: string): Promise<Campaign> {
    const res = await fetch(`/api/v1/campaigns/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao obter campanha');
    return data;
  },

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const token = localStorage.getItem('patinhas_access_token');
    const res = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao criar campanha');
    return data;
  },

  async registerDonation(
    campaignId: string,
    amount: number,
    donorName?: string,
  ): Promise<{ message: string; campaign: Campaign }> {
    const res = await fetch(`/api/v1/campaigns/${campaignId}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, donorName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao registrar doação');
    return data;
  },

  async toggleStatus(campaignId: string): Promise<{ message: string; campaign: Campaign }> {
    const token = localStorage.getItem('patinhas_access_token');
    const res = await fetch(`/api/v1/campaigns/${campaignId}/toggle`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao alternar status');
    return data;
  },

  async deleteCampaign(campaignId: string): Promise<void> {
    const token = localStorage.getItem('patinhas_access_token');
    const res = await fetch(`/api/v1/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Erro ao excluir campanha');
    }
  },
};
