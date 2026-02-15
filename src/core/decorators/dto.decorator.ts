import { Transform } from 'class-transformer';
import { IsDate, IsString, Length, ValidateIf } from 'class-validator';

export function OptionalDate() {
  return function (target: any, propertyKey: string) {
    // só valida se tiver algum valor
    ValidateIf((o) => o[propertyKey] !== undefined && o[propertyKey] !== '')(target, propertyKey);

    // transforma string vazia em undefined
    Transform(({ value }) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    })(target, propertyKey);

    // valida como Date se houver valor
    IsDate({ message: `${propertyKey} deve ser uma data válida` })(target, propertyKey);
  };
}

interface OptionalStringOptions {
  minLength?: number;
  maxLength?: number;
}

export function OptionalString(options: OptionalStringOptions = {}) {
  return function (target: any, propertyKey: string) {
    ValidateIf((o) => o[propertyKey] !== undefined && o[propertyKey] !== '')(target, propertyKey);

    IsString()(target, propertyKey);

    if (options.minLength !== undefined || options.maxLength !== undefined) {
      Length(options.minLength ?? 0, options.maxLength ?? 255)(target, propertyKey);
    }
  };
}
