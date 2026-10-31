import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Animal, AnimalSize, EnergyLevel, HousingType } from '@prisma/client';

export interface MatchPillarScore {
  name: string;
  score: number; // 0 a 100
  weight: number;
  description: string;
}

export interface MatchResult {
  animalId: string;
  animalName: string;
  overallPercentage: number;
  level: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'ATTENTION';
  label: string;
  highlights: string[];
  cautions: string[];
  pillars: MatchPillarScore[];
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula compatibilidade entre o adotante e o pet
   */
  async calculateMatchForUser(animalId: string, userId: string): Promise<MatchResult> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        healthRecord: true,
        traits: true,
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado.');
    }

    // Busca o último questionário preenchido pelo usuário (ou adota perfil base)
    const latestApp = await this.prisma.adoptionApplication.findFirst({
      where: { adopterId: userId },
      orderBy: { createdAt: 'desc' },
      include: { questionnaire: true },
    });

    const q = latestApp?.questionnaire || {
      housingType: HousingType.APARTMENT,
      isRented: false,
      hasOutdoorSpace: false,
      hasNettingScreens: true,
      familyAgreement: true,
      householdPeopleCount: 2,
      hasOtherPets: false,
      monthlyBudgetBrl: 400,
      routineHoursAlone: 4,
    };

    return this.evaluateMatch(animal, q);
  }

  /**
   * Algoritmo determinístico ponderado de compatibilidade
   */
  evaluateMatch(animal: Animal, q: any): MatchResult {
    const highlights: string[] = [];
    const cautions: string[] = [];

    // 1. Pilar: Espaço Físico & Proteção (Peso: 25%)
    let spaceScore = 80;
    if (animal.species === 'CAT') {
      if (q.hasNettingScreens) {
        spaceScore = 100;
        highlights.push('Janelas teladas: proteção essencial e impecável para gatos.');
      } else {
        spaceScore = 40;
        cautions.push('Gatinhos necessitam de telas de proteção para evitar quedas e fugas.');
      }
    } else {
      // Cães
      if (animal.size === AnimalSize.GIANT || animal.size === AnimalSize.LARGE) {
        if (q.housingType === HousingType.APARTMENT && !q.hasOutdoorSpace) {
          spaceScore = 55;
          cautions.push('Porte grande em apartamento: exigirá passeios vigorosos diários.');
        } else {
          spaceScore = 95;
          highlights.push('Espaço ideal e confortável para o porte deste pet.');
        }
      } else {
        spaceScore = 95;
        highlights.push('Porte versátil e perfeito para o ambiente do seu lar.');
      }
    }

    // 2. Pilar: Rotina & Nível de Energia (Peso: 25%)
    let routineScore = 85;
    const hours = q.routineHoursAlone ?? 4;

    if (animal.energyLevel === EnergyLevel.VERY_HIGH || animal.energyLevel === EnergyLevel.HIGH) {
      if (hours > 6) {
        routineScore = 50;
        cautions.push(`Pet com energia alta e ${hours}h sozinho: precisará de brinquedos e enriquecimento.`);
      } else {
        routineScore = 90;
        highlights.push('Tempo disponível excelente para brincadeiras e passeios.');
      }
    } else {
      // Energia baixa/moderada
      if (hours <= 5) {
        routineScore = 98;
        highlights.push('Rotina calma e equilibrada: sincronia perfeita de hábitos.');
      } else {
        routineScore = 75;
      }
    }

    // 3. Pilar: Sociabilidade & Convivência (Peso: 25%)
    let socialScore = 85;
    if (q.hasOtherPets) {
      if (animal.compatibilityDogs || animal.compatibilityCats) {
        socialScore = 95;
        highlights.push('Pet sociável e acolhedor para conviver com outros amiguinhos.');
      } else {
        socialScore = 55;
        cautions.push('Requer aproximação gradual com os pets já existentes na casa.');
      }
    } else {
      socialScore = 90;
      highlights.push('Atenção exclusiva e carinho dedicado ao novo membro.');
    }

    if (q.householdPeopleCount >= 3 && animal.compatibilityChildren) {
      highlights.push('Adora crianças e família movimentada!');
    }

    // 4. Pilar: Planejamento Financeiro & Saúde (Peso: 25%)
    let budgetScore = 85;
    const budget = q.monthlyBudgetBrl ?? 350;

    if (budget >= 300) {
      budgetScore = 95;
      highlights.push('Orçamento mensal saudável para alimentação de qualidade e vacinas.');
    } else {
      budgetScore = 65;
      cautions.push('Considere reservar valores para imprevistos e consultas preventivas.');
    }

    // Cálculo da Média Ponderada
    const overallPercentage = Math.round(
      spaceScore * 0.25 + routineScore * 0.25 + socialScore * 0.25 + budgetScore * 0.25,
    );

    let level: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'ATTENTION' = 'EXCELLENT';
    let label = 'Excelente Afinidade ✨';

    if (overallPercentage >= 85) {
      level = 'EXCELLENT';
      label = 'Excelente Afinidade ✨';
    } else if (overallPercentage >= 70) {
      level = 'GOOD';
      label = 'Alta Compatibilidade 🐾';
    } else if (overallPercentage >= 50) {
      level = 'MODERATE';
      label = 'Compatibilidade Moderada 🌱';
    } else {
      level = 'ATTENTION';
      label = 'Requer Adaptações Especiais ⚠️';
    }

    return {
      animalId: animal.id,
      animalName: animal.name,
      overallPercentage,
      level,
      label,
      highlights,
      cautions,
      pillars: [
        {
          name: 'Espaço & Moradia',
          score: spaceScore,
          weight: 25,
          description: 'Adequação do imóvel, quintal e telas de proteção',
        },
        {
          name: 'Rotina & Energia',
          score: routineScore,
          weight: 25,
          description: 'Horas disponíveis comparadas à energia do pet',
        },
        {
          name: 'Sociabilidade',
          score: socialScore,
          weight: 25,
          description: 'Convívio com outros animais e perfil familiar',
        },
        {
          name: 'Orçamento & Cuidados',
          score: budgetScore,
          weight: 25,
          description: 'Capacidade para ração premium e cuidados veterinários',
        },
      ],
    };
  }
}

