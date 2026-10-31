import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Lucas Silva Santos', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '(11) 98765-4321', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '1995-08-15', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ example: 'Apaixonado por animais, com experiência em cães de porte médio.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'Rua das Flores', required: false })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  addressState?: string;

  @ApiProperty({ example: '01310-100', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: -23.5505, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -46.6333, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

