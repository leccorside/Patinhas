export interface EducationalArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  coverUrl?: string;
  readTimeMin: number;
  publishedAt?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'rotina' | 'saude' | 'socializacao' | 'seguranca';
}

export interface PostAdoptionChecklist {
  period: string;
  periodLabel: string;
  recommendedDays: number;
  veterinaryDisclaimer: string;
  items: ChecklistItem[];
}

export interface SubmitFeedbackInput {
  adoptionId?: string;
  period: string;
  adaptationReport: string;
  photoUrl?: string;
  challenges?: string;
}

export const educationService = {
  async getArticles(category?: string, search?: string): Promise<EducationalArticle[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`/api/v1/education/articles?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getArticleBySlug(slug: string): Promise<EducationalArticle> {
    const res = await fetch(`/api/v1/education/articles/${slug}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Artigo não encontrado');
    return data;
  },

  async getChecklist(period: string = '15_DAYS'): Promise<PostAdoptionChecklist> {
    const res = await fetch(`/api/v1/education/post-adoption/checklist?period=${period}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao obter checklist');
    return data;
  },

  async submitFeedback(input: SubmitFeedbackInput): Promise<{ message: string }> {
    const token = localStorage.getItem('patinhas_access_token');
    const res = await fetch('/api/v1/education/post-adoption/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao enviar feedback');
    return data;
  },
};
