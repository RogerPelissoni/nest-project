import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  ds_description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionRequestDto)
  profilePermission?: PermissionRequestDto[];
}

export class PermissionRequestDto {
  @IsOptional()
  @IsNumber()
  profile_permission_id?: number;

  @IsNumber()
  resource_id: number;

  @IsNumber()
  permission_level: number;
}
