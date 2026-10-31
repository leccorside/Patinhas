import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAdoptionQuestionnaireDto } from '../../adoptions/dto/create-application.dto';

export class CalculateMatchDto {
  @ApiPropertyOptional({ type: CreateAdoptionQuestionnaireDto })
  @IsOptional()
  questionnaire?: CreateAdoptionQuestionnaireDto;
}

