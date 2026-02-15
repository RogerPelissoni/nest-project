import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParamsType } from './types/query.type';

export class CoreService<TModel, TWhereUnique, TWhere, TCreate, TUpdate> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelKey: keyof PrismaService, // ex: 'user'
  ) {}

  protected get model() {
    return this.prisma[this.modelKey] as any;
  }

  findOne(where: TWhereUnique): Promise<TModel | null> {
    return this.model.findUnique({ where });
  }

  async findAll(params: QueryParamsType<TWhere>) {
    const { skip = 0, take = 10, sortBy, sortOrder, where, filters } = params;

    const whereConditions: any = { ...where };

    if (filters) {
      for (const key of Object.keys(filters)) {
        const { value, matchMode = 'like' } = filters[key];

        switch (matchMode) {
          case 'equals':
            whereConditions[key] = value;
            break;
          case 'startsWith':
            whereConditions[key] = { startsWith: value };
            break;
          case 'endsWith':
            whereConditions[key] = { endsWith: value };
            break;
          default:
            whereConditions[key] = { contains: value };
        }
      }
    }

    const orderBy: any = sortBy ? { [sortBy]: sortOrder } : undefined;

    const data = await this.model.findMany({
      skip,
      take,
      where: whereConditions,
      orderBy,
    });

    const total = await this.model.count({ where: whereConditions });

    return {
      data,
      total,
      skip,
      take,
      totalPages: Math.ceil(total / take),
    };
  }

  async create(data: TCreate): Promise<TModel> {
    return await this.model.create({ data });
  }

  async update(id: number, data: TUpdate) {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<TModel> {
    return await this.model.delete({
      where: { id },
    });
  }

  async getKeyValue() {
    const obModel = await this.model.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return Object.fromEntries(
      (obModel as Array<{ id: number | bigint; name: string }>).map((row) => [row.id, row.name]),
    );
  }
}
