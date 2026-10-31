export interface PlatformOverview {
  users: {
    total: number;
    adopters: number;
    shelterMembers: number;
    protectors: number;
    active: number;
    suspended: number;
  };
  organizations: {
    total: number;
    verified: number;
    pendingApproval: number;
    unverified: number;
  };
  animals: {
    total: number;
    available: number;
    inAdoption: number;
    adopted: number;
  };
  adoptions: {
    total: number;
    completed: number;
    pending: number;
  };
  reports: {
    total: number;
    pending: number;
  };
}

export interface AdminOrganization {
  id: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  logoUrl?: string;
  verifiedStatus: 'UNVERIFIED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
  city: string;
  state: string;
  totalAnimals: number;
  totalMembers: number;
  owner?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'ADOPTER' | 'SHELTER_MEMBER' | 'PROTECTOR' | 'MASTER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  fullName: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  phone?: string;
  isEmailVerified: boolean;
  animalsCount: number;
  applicationsCount: number;
  reportsCount: number;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
  executor?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const adminService = {
  // Obter métricas globais
  async getOverview(): Promise<PlatformOverview> {
    const res = await fetch('/api/v1/admin/overview', {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Falha ao carregar visão geral do Admin Master');
    }
    return res.json();
  },

  // Listar organizações
  async getOrganizations(status?: string, search?: string): Promise<AdminOrganization[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`/api/v1/admin/organizations?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Atualizar verificação de ONG
  async updateOrganizationVerification(orgId: string, status: string) {
    const res = await fetch(`/api/v1/admin/organizations/${orgId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao alterar verificação');
    return data;
  },

  // Listar usuários
  async getUsers(search?: string, role?: string, status?: string): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Atualizar status de conta do usuário
  async updateUserStatus(userId: string, status: string, reason?: string) {
    const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao alterar status do usuário');
    return data;
  },

  // Obter logs de auditoria
  async getAuditLogs(limit: number = 30): Promise<AuditLogItem[]> {
    const res = await fetch(`/api/v1/admin/audit-logs?limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },
};

