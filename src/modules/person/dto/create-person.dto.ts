import { IsBoolean, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { PersonGender } from 'prisma/generated/enums';
import { OptionalDate, OptionalString } from 'src/core/decorators/dto.decorator';

export class CreatePersonDto {
  // ===== Dados principais =====

  @OptionalString({ minLength: 1, maxLength: 150 })
  name: string;

  @OptionalString({ maxLength: 20 })
  ds_document?: string;

  @OptionalString({ maxLength: 100 })
  @IsEmail()
  ds_email?: string;

  @OptionalString({ maxLength: 20 })
  ds_phone?: string;

  @OptionalDate()
  da_birth?: Date;

  @IsEnum(PersonGender)
  @IsOptional()
  tp_gender?: PersonGender;

  // ===== Endereço =====

  @OptionalString({ maxLength: 120 })
  ds_address_street?: string;

  @OptionalString({ maxLength: 20 })
  ds_address_number?: string;

  @OptionalString({ maxLength: 60 })
  ds_address_complement?: string;

  @OptionalString({ maxLength: 80 })
  ds_address_district?: string;

  @OptionalString({ maxLength: 80 })
  ds_address_city?: string;

  @OptionalString({ minLength: 2, maxLength: 2 })
  ds_address_state?: string;

  @OptionalString({ maxLength: 10 })
  ds_address_zipcode?: string;

  // ===== Flags =====

  @IsBoolean()
  @IsOptional()
  fl_active?: boolean;
}
