import { IsBoolean, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { PersonGender } from 'prisma/generated/enums';

export class CreatePersonDto {
  // =====================
  // Dados principais
  // =====================

  @IsNotEmpty()
  companyId: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  ds_document?: string;

  @IsOptional()
  @IsEmail()
  @Length(1, 100)
  ds_email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  ds_phone?: string;

  @IsOptional()
  @IsDateString()
  da_birth?: string;

  @IsOptional()
  @IsEnum(PersonGender)
  tp_gender?: PersonGender;

  // =====================
  // Endereço
  // =====================

  @IsOptional()
  @IsString()
  @Length(1, 120)
  ds_address_street?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  ds_address_number?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  ds_address_complement?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  ds_address_district?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  ds_address_city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  ds_address_state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  ds_address_zipcode?: string;

  // =====================
  // Flags
  // =====================

  @IsOptional()
  @IsBoolean()
  fl_active?: boolean;
}
