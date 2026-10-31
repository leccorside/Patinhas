export interface MatchPillarScore {
  name: string;
  score: number;
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

export const matchingService = {
  /**
   * Obter índice de compatibilidade inteligente e justificativas para um pet
   */
  async getAnimalMatch(animalId: string): Promise<MatchResult> {
    const res = await fetch(`/api/v1/matching/animals/${animalId}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Falha ao calcular compatibilidade.');
    }

    return res.json();
  },
};
