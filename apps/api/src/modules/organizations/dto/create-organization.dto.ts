import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Instituto Amigo dos Bichos', description: 'Nome institucional da ONG' })
  @IsString()
  @IsNotEmpty({ message: 'Nome da organização é obrigatório' })
  name: string;

  @ApiProperty({ example: 'Amigo dos Bichos Resgates', required: false })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({ example: '12.345.678/0001-90', required: false })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ example: 'contato@amigodosbichos.org' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'E-mail institucional é obrigatório' })
  email: string;

  @ApiProperty({ example: '(11) 3333-4444', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '(11) 98888-7777', required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ example: 'Resgatamos e reabilitamos animais de rua na grande São Paulo.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://amigodosbichos.org', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ example: '@amigodosbichos', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ example: 'Av. Paulista', required: false })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiProperty({ example: '1000', required: false })
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  addressCity: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  addressState: string;

  @ApiProperty({ example: '01310-100', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: -23.5615, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -46.6853, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

