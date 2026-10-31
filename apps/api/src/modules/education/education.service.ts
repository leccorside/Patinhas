import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitFollowUpFeedbackDto } from './dto/education.dto';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'rotina' | 'saude' | 'socializacao' | 'seguranca';
  completedByDefault?: boolean;
}

export interface PostAdoptionChecklistResponse {
  period: string;
  periodLabel: string;
  recommendedDays: number;
  veterinaryDisclaimer: string;
  items: ChecklistItem[];
}

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Obter Artigos Educativos
  async getArticles(category?: string, search?: string) {
    const where: any = { isPublished: true };

    if (category && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { summary: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const articles = await this.prisma.educationalArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    // Se o banco tiver menos de 3, complementa com conteúdo educativo de referência
    if (articles.length === 0) {
      return [
        {
          id: 'art-1',
          title: 'Guia dos Primeiros 15 Dias: Acolhendo com Respeito e Paciência',
          slug: 'guia-primeiros-15-dias-acolhimento',
          summary: 'Descubra a regra 3-3-3: 3 dias para descomprimir, 3 semanas para aprender a rotina e 3 meses para se sentir em casa.',
          category: 'Adaptação',
          readTimeMin: 4,
          coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
          publishedAt: new Date(),
          content: `Adotar é um ato de amor e paciência. O animal resgatado precisa de tempo para entender que seu novo lar é seguro.
          
1. Regra dos 3 Dias: O pet pode ficar tímido, sem apetite ou buscar refúgio embaixo de móveis. Mantenha tom de voz calmo e não force abraços.
2. Regra das 3 Semanas: Ele começará a relaxar e a demonstrar sua verdadeira personalidade. Mantenha horários fixos de refeições.
3. Regra dos 3 Meses: Ele já confia totalmente na sua família e sente-se parte do lar.

*Aviso Médico: Certifique-se de realizar uma consulta com um médico veterinário na primeira semana para conferir a carteira de vacinação.*`,
        },
        {
          id: 'art-2',
          title: 'Protocolo de Vacinação Essencial para Cães e Gatos',
          slug: 'protocolo-vacinacao-essencial-caes-gatos',
          summary: 'Entenda os ciclos de vacinas múltiplas (V8/V10 para cães e V4/V5 para gatos) e a vacina antirrábica obrigatória.',
          category: 'Saúde',
          readTimeMin: 5,
          coverUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
          publishedAt: new Date(),
          content: `A imunização protege contra doenças graves como cinomose, parvovirose e febre amarela felina.
          
- Cães: Vacina Polivalente (V8 ou V10) aplicada a cada 21 a 30 dias em filhotes, com reforço anual em adultos. Vacina Antirrábica obrigatória anualmente.
- Gatos: Vacina Polivalente (V4 ou V5 com proteção contra Leucemia Felina FeLV). Reforço anual imprescindível.
- Vermifugação e Antipulgas: Manter profilaxia a cada 3 a 6 meses conforme recomendação veterinária.

*Importante: Somente um médico veterinário credenciado pelo CRMV pode prescrever e aplicar vacinas.*`,
        },
        {
          id: 'art-3',
          title: 'Enriquecimento Ambiental: Menos Tédio e Mais Bem-Estar',
          slug: 'enriquecimento-ambiental-brincadeiras-cognitivas',
          summary: 'Atividades cognitivas, brinquedos recheáveis e arranhadores verticais previnem ansiedade de separação.',
          category: 'Comportamento',
          readTimeMin: 3,
          coverUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
          publishedAt: new Date(),
          content: `Animais estimulados mentalmente são mais calmos e equilibrados.
          
- Tapetes de fuçar e quebra-cabeças alimentares
- Kong ou garrafas com petiscos congelados nos dias quentes
- Arranhadores altos e prateleiras nas paredes para gatos
- Rotina consistente de passeios exploratórios permitindo que o cão cheire o ambiente calmamente.`,
        },
      ];
    }

    return articles;
  }

  // 2. Obter Artigo por Slug
  async getArticleBySlug(slug: string) {
    const article = await this.prisma.educationalArticle.findUnique({
      where: { slug },
    });

    if (!article) {
      const all = await this.getArticles();
      const fallback = all.find((a: any) => a.slug === slug);
      if (fallback) return fallback;
      throw new NotFoundException('Artigo educativo não encontrado.');
    }

    return article;
  }

  // 3. Obter Checklists de Acompanhamento Pós-Adoção (15, 30 e 90 Dias)
  async getPostAdoptionChecklists(period: string = '15_DAYS'): Promise<PostAdoptionChecklistResponse> {
    const veterinaryDisclaimer =
      'Atenção: Os checklists e dicas desta plataforma têm objetivo exclusivamente educativo e de apoio pós-adoção. Eles não substituem, em hipótese alguma, a avaliação, diagnóstico e prescrição de um médico veterinário habilitado.';

    switch (period) {
      case '30_DAYS':
        return {
          period: '30_DAYS',
          periodLabel: '30 Dias no Lar — Rotina & Saúde Preventiva',
          recommendedDays: 30,
          veterinaryDisclaimer,
          items: [
            {
              id: 'c30-1',
              title: 'Primeira Consulta Veterinária de Rotina',
              description: 'Leve o pet ao veterinário para check-up geral, pesagem e atualização da carteirinha de vacinas.',
              category: 'saude',
            },
            {
              id: 'c30-2',
              title: 'Antipulgas e Vermífugo em Dia',
              description: 'Verifique com o veterinário o melhor comprimido ou pipeta para o peso atual do animal.',
              category: 'saude',
            },
            {
              id: 'c30-3',
              title: 'Socialização Gradual e Passeios',
              description: 'Inicie passeios diários em horários de menor movimento para habituar o pet aos estímulos urbanos.',
              category: 'socializacao',
            },
            {
              id: 'c30-4',
              title: 'Rotina de Alimentação Fixa',
              description: 'Mantenha os mesmos horários para ração e água fresca para estabelecer segurança biológica.',
              category: 'rotina',
            },
          ],
        };

      case '90_DAYS':
        return {
          period: '90_DAYS',
          periodLabel: '90 Dias no Lar — Vínculo & Bem-Estar Consolidado',
          recommendedDays: 90,
          veterinaryDisclaimer,
          items: [
            {
              id: 'c90-1',
              title: 'Adaptação e Segurança Emocional',
              description: 'O pet já se sente protegido, responde ao nome e busca contato espontâneo com os tutores.',
              category: 'socializacao',
            },
            {
              id: 'c90-2',
              title: 'Enriquecimento Ambiental Diário',
              description: 'Brinquedos interativos, mordedores apropriados ou arranhadores para prevenir ansiedade.',
              category: 'rotina',
            },
            {
              id: 'c90-3',
              title: 'Acompanhamento de Peso e Pelagem',
              description: 'Pelagem brilhante e peso estável são fortes indicadores de nutrição e saúde equilibradas.',
              category: 'saude',
            },
            {
              id: 'c90-4',
              title: 'Compartilhar Fotos com a ONG Protetora',
              description: 'Envie um relato carinhoso e fotos para a equipe que o resgatou celebrar a nova vida do pet!',
              category: 'seguranca',
            },
          ],
        };

      case '15_DAYS':
      default:
        return {
          period: '15_DAYS',
          periodLabel: '15 Dias no Lar — Primeiros Passos & Descompressão',
          recommendedDays: 15,
          veterinaryDisclaimer,
          items: [
            {
              id: 'c15-1',
              title: 'Cantinho Seguro e Espaço de Descanso',
              description: 'Providencie uma caminha macia em local tranquilo onde o pet possa dormir sem interrupções.',
              category: 'rotina',
            },
            {
              id: 'c15-2',
              title: 'Plaquinha de Identificação na Coleira',
              description: 'Coleira confortável com plaqueta contendo nome do pet e 2 telefones de contato com DDD.',
              category: 'seguranca',
            },
            {
              id: 'c15-3',
              title: 'Redes de Proteção / Muros Telados',
              description: 'Verifique se todas as janelas (para gatos) e portões de saída estão devidamente telados.',
              category: 'seguranca',
            },
            {
              id: 'c15-4',
              title: 'Respeito ao Tempo de Descompressão',
              description: 'Evite receber visitas barulhentas nos primeiros dias para que o pet não fique assustado.',
              category: 'socializacao',
            },
          ],
        };
    }
  }

  // 4. Submissão de Feedback e Fotos de Pós-Adoção
  async submitFeedback(userId: string, dto: SubmitFollowUpFeedbackDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const audit = await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'POST_ADOPTION_FEEDBACK_SUBMITTED',
        resourceType: 'POST_ADOPTION',
        resourceId: dto.adoptionId || 'general',
        metadataJson: JSON.stringify({
          period: dto.period,
          report: dto.adaptationReport,
          photoUrl: dto.photoUrl,
          challenges: dto.challenges,
          submittedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      message: '🎉 Que alegria ver a evolução do seu pet! Seu relato de pós-adoção foi registrado com sucesso.',
      auditId: audit.id,
    };
  }
}

