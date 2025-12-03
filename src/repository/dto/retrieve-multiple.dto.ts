import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceRequestDto } from './resource-request.dto';

export class RetrieveMultipleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
}
