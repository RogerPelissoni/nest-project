import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto, UpdatePersonPhoneDto } from './create-person.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePersonPhoneDto)
  @IsOptional()
  personPhone?: UpdatePersonPhoneDto[];
}
