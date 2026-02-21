import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export function OptionalNumericId() {
  return applyDecorators(
    Transform(({ value }) => {
      const n = Number(value);
      return Number.isInteger(n) ? n : undefined;
    }),
    IsInt(),
    IsOptional(),
  );
}
