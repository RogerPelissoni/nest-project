import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class ResourceRequestDto {
  @IsString()
  resource: 'company' | 'profile' | 'user' | 'person';

  @IsOptional()
  @IsBoolean()
  keyValue?: boolean;

  @IsOptional()
  @IsString()
  alias?: string;
}
