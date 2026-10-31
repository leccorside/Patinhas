export type ReportTargetType = 'ANIMAL' | 'USER' | 'ORGANIZATION' | 'MESSAGE';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ReportItem {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  reporter: {
    id: string;
    email: string;
    name: string;
  };
  targetSummary?: any;
  actions: Array<{
    id: string;
    actionTaken: string;
    notes?: string;
    createdAt: string;
    moderatorName: string;
  }>;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export interface ResolveReportPayload {
  action: 'ACCOUNT_SUSPENDED' | 'ANIMAL_REMOVED' | 'WARNING_ISSUED' | 'DISMISSED';
  status: 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  notes?: string;
}

export const moderationService = {
  // Enviar denúncia
  async submitReport(payload: CreateReportPayload) {
    const res = await fetch('/api/v1/moderation/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao enviar denúncia.');
    return data;
  },

  // Listar denúncias (Apenas moderador)
  async getReports(status?: ReportStatus, targetType?: ReportTargetType): Promise<ReportItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (targetType) params.append('targetType', targetType);

    const res = await fetch(`/api/v1/moderation/reports?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Resolver denúncia (Apenas moderador)
  async resolveReport(reportId: string, payload: ResolveReportPayload) {
    const res = await fetch(`/api/v1/moderation/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Falha ao resolver denúncia.');
    return data;
  },

  // Listar ações disciplinares
  async getModerationActions(limit: number = 30) {
    const res = await fetch(`/api/v1/moderation/actions?limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },
};
