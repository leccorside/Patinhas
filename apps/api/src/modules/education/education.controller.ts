import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { SubmitFollowUpFeedbackDto } from './dto/education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Conteúdo Educativo e Pós-Adoção')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get('articles')
  @ApiOperation({ summary: 'Listar artigos educativos sobre bem-estar, saúde e adaptação' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getArticles(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.educationService.getArticles(category, search);
  }

  @Get('articles/:slug')
  @ApiOperation({ summary: 'Obter artigo educativo completo pelo slug' })
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.educationService.getArticleBySlug(slug);
  }

  @Get('post-adoption/checklist')
  @ApiOperation({ summary: 'Obter checklist interativo de adaptação pós-adoção (15, 30 e 90 dias)' })
  @ApiQuery({ name: 'period', required: false, enum: ['15_DAYS', '30_DAYS', '90_DAYS'] })
  async getPostAdoptionChecklist(@Query('period') period?: string) {
    return this.educationService.getPostAdoptionChecklists(period || '15_DAYS');
  }

  @Post('post-adoption/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submeter relato e fotos de acompanhamento pós-adoção pelo tutor' })
  async submitFeedback(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitFollowUpFeedbackDto,
  ) {
    return this.educationService.submitFeedback(user.id, dto);
  }
}
