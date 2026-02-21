import { RequestContext } from 'src/common/context/request-context';

export default class DTO {
  static normalize<T>(dto: Record<string, any>): T {
    return this.transformRelations<T>(dto);
  }

  private static transformRelations<T>(dto: Record<string, any>): T {
    const result: any = {};

    const requestContext = RequestContext.get();
    const obCurrentUser = requestContext?.user;

    for (const key in dto) {
      const dtoParam = dto[key];

      if (dtoParam === undefined || dtoParam === null) continue;

      if (key.endsWith('_id')) {
        const relation = key.replace('_id', '');

        result[relation] = {
          connect: { id: dtoParam },
        };
      } else {
        /**
         * Relation
         * Ex: personPhone: [
         *  {id: 1, ...},
         *  {id: 2, ...},
         * ]
         */
        if (Array.isArray(dtoParam)) {
          result[key] = {
            upsert: dtoParam.map((d: Record<string, any>) => {
              const normalizedRelation = DTO.transformRelations({
                ...d,
                company_id: obCurrentUser?.company_id,
              });

              return {
                where: { id: d.id ?? 0 },
                update: normalizedRelation,
                create: normalizedRelation,
              };
            }),
          };
        } else {
          result[key] = dtoParam;
        }
      }
    }

    return result as T;
  }
}
