import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tp_company: string;

  @ValidateIf((o) => o.ds_email !== '')
  @IsEmail()
  ds_email: string;

  @ValidateIf((o) => o.ds_phone !== '')
  @IsString()
  ds_phone: string;

  @ValidateIf((o) => o.ds_address !== '')
  @IsString()
  ds_address: string;
}
