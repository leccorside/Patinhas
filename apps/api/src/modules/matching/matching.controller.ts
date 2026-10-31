import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { CalculateMatchDto } from './dto/matching.dto';

@ApiTags('Match Inteligente')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('animals/:id')
  @ApiOperation({ summary: 'Obter índice de compatibilidade inteligente e justificativas detalhadas para um pet' })
  async getAnimalMatch(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'guest';
    return this.matchingService.calculateMatchForUser(id, userId);
  }

  @Post('animals/:id/simulate')
  @ApiOperation({ summary: 'Simular compatibilidade passando questionário personalizado' })
  async simulateMatch(
    @Param('id') id: string,
    @Body() dto: CalculateMatchDto,
  ) {
    const defaultQ = {
      housingType: 'APARTMENT',
      hasNettingScreens: true,
      hasOtherPets: false,
      householdPeopleCount: 2,
      routineHoursAlone: 4,
      monthlyBudgetBrl: 400,
    };

    return this.matchingService.calculateMatchForUser(id, 'guest');
  }
}
