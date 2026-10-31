import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HousingType } from '@prisma/client';

export class AdoptionCustomAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  questionKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answerValue: string;
}

export class CreateAdoptionQuestionnaireDto {
  @ApiProperty({ enum: HousingType, default: HousingType.HOUSE })
  @IsEnum(HousingType)
  housingType: HousingType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRented?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasOutdoorSpace?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasNettingScreens?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  familyAgreement?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  householdPeopleCount?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasOtherPets?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherPetsDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyBudgetBrl?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  routineHoursAlone?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adopterExperience?: string;

  @ApiPropertyOptional({ type: [AdoptionCustomAnswerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdoptionCustomAnswerDto)
  answers?: AdoptionCustomAnswerDto[];
}

export class CreateAdoptionApplicationDto {
  @ApiProperty({ description: 'ID do pet que deseja adotar' })
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @ApiProperty({ type: CreateAdoptionQuestionnaireDto })
  @ValidateNested()
  @Type(() => CreateAdoptionQuestionnaireDto)
  questionnaire: CreateAdoptionQuestionnaireDto;
}

