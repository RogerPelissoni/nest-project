export default class DTO {
  static normalize<T>(dto: Record<string, any>): T {
    return this.transformRelations<T>(dto);
  }

  private static transformRelations<T>(dto: Record<string, any>): T {
    const result: any = {};

    for (const key in dto) {
      if (dto[key] === undefined || dto[key] === null) continue;

      if (key.endsWith('_id')) {
        const relation = key.replace('_id', '');

        result[relation] = {
          connect: { id: dto[key] },
        };
      } else {
        result[key] = dto[key];
      }
    }

    return result as T;
  }
}
