import { PrismaService } from 'src/prisma/prisma.service';

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

  async findAll(params: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    where?: TWhere;
    filters?: Record<
      string,
      { value: any; matchMode?: 'like' | 'equals' | 'startsWith' | 'endsWith' }
    >;
  }) {
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

  async update(where: TWhereUnique, data: TUpdate): Promise<TModel> {
    return await this.model.update({ where, data });
  }

  async remove(where: TWhereUnique): Promise<TModel> {
    return await this.model.delete({ where });
  }

  async getKeyValue() {
    return await this.model.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
