import { Delete, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorator';
import { QueryParamsType } from './types/generic.type';

type QueryLike = {
  skip?: unknown;
  take?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
  filters?: unknown;
  appends?: unknown;
  hydrators?: unknown;
};
type ParsedFilters = NonNullable<QueryParamsType<unknown>['filters']>;
type ParsedFilterValue = ParsedFilters[string];
type ParsedMatchMode = NonNullable<ParsedFilterValue['matchMode']>;

@ApiBearerAuth('jwt')
export class CoreController<TService> {
  constructor(protected readonly service: TService) {}

  @Get()
  @Permission('read')
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Offset de paginação',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Quantidade de registros por página',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Campo para ordenação',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Direção da ordenação',
    example: 'asc',
  })
  @ApiQuery({
    name: 'appends',
    required: false,
    type: String,
    description: 'Campos adicionais (csv), ex: ds_company,company',
    example: 'ds_company',
  })
  @ApiQuery({
    name: 'hydrators',
    required: false,
    type: String,
    description: 'Hydrators a serem aplicados (csv), ex: company',
    example: 'company',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    description:
      'JSON de filtros. Ex: {"name":{"value":"john","matchMode":"like"},"fl_active":{"value":true,"matchMode":"eq"}}',
    example: '{"name":{"value":"john","matchMode":"like"}}',
  })
  findAll(@Query() query: QueryLike) {
    return (this.service as any).findAll({
      ...this.parsePagination(query),
      ...this.parseSorting(query),
      appends: this.parseAppends(query),
      hydrators: this.parseHydrators(query),
      filters: this.parseFilters(query),
    });
  }

  @Get(':id')
  @Permission('read')
  findOne(@Param('id') id: string) {
    return (this.service as any).findOne(Number(id));
  }

  @Delete(':id')
  @Permission('delete')
  remove(@Param('id') id: string) {
    return (this.service as any).remove(Number(id));
  }

  protected parsePagination(query: QueryLike): Pick<QueryParamsType<unknown>, 'skip' | 'take'> {
    const skip = this.toNumberOrDefault(query.skip, 0);
    const take = this.toNumberOrDefault(query.take, 10);

    return {
      skip,
      take: take > 0 ? take : 10,
    };
  }

  protected parseSorting(query: QueryLike): Pick<QueryParamsType<unknown>, 'sortBy' | 'sortOrder'> {
    const sortBy = typeof query.sortBy === 'string' && query.sortBy.trim().length > 0 ? query.sortBy : undefined;
    const sortOrder: 'asc' | 'desc' = query.sortOrder === 'desc' ? 'desc' : 'asc';

    return {
      sortBy,
      sortOrder,
    };
  }

  protected parseFilters(query: QueryLike): QueryParamsType<unknown>['filters'] {
    try {
      const filters = query.filters;
      if (!filters) return {};

      if (typeof filters === 'string') {
        const parsed = JSON.parse(filters) as unknown;
        return this.isRecord(parsed) ? this.normalizeFilters(parsed) : {};
      }

      if (this.isRecord(filters)) return this.normalizeFilters(filters);
      return {};
    } catch {
      return {};
    }
  }

  protected parseAppends(query: QueryLike): string[] {
    const rawAppends = query.appends;
    if (!rawAppends) return [];

    if (Array.isArray(rawAppends)) {
      return rawAppends
        .flatMap((append: unknown) => this.toAppendChunks(append).split(','))
        .map((append: string) => append.trim())
        .filter(Boolean);
    }

    return this.toAppendChunks(rawAppends)
      .split(',')
      .map((append) => append.trim())
      .filter(Boolean);
  }

  protected parseHydrators(query: QueryLike): string[] {
    const rawHydrators = query.hydrators;
    if (!rawHydrators) return [];

    if (Array.isArray(rawHydrators)) {
      return rawHydrators
        .flatMap((hydrator: unknown) => this.toAppendChunks(hydrator).split(','))
        .map((hydrator: string) => hydrator.trim())
        .filter(Boolean);
    }

    return this.toAppendChunks(rawHydrators)
      .split(',')
      .map((hydrator) => hydrator.trim())
      .filter(Boolean);
  }

  protected parseQuery<TWhereInput>(queryParams: QueryParamsType<TWhereInput>): QueryParamsType<TWhereInput> {
    return {
      ...this.parsePagination(queryParams),
      ...this.parseSorting(queryParams),
      appends: this.parseAppends(queryParams),
      hydrators: this.parseHydrators(queryParams),
      filters: this.parseFilters(queryParams),
    };
  }

  private toNumberOrDefault(value: unknown, defaultValue: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private normalizeFilters(filters: Record<string, unknown>): ParsedFilters {
    const normalized: ParsedFilters = {};

    for (const [field, rawFilter] of Object.entries(filters)) {
      if (this.isRecord(rawFilter) && 'value' in rawFilter) {
        const rawMatchMode = rawFilter.matchMode;
        const filterValue: ParsedFilterValue = this.isMatchMode(rawMatchMode)
          ? { value: rawFilter.value, matchMode: rawMatchMode }
          : { value: rawFilter.value };

        normalized[field] = filterValue;
        continue;
      }

      normalized[field] = { value: rawFilter };
    }

    return normalized;
  }

  private isMatchMode(value: unknown): value is ParsedMatchMode {
    return (
      value === 'like' ||
      value === 'equals' ||
      value === 'startsWith' ||
      value === 'endsWith' ||
      value === 'eq' ||
      value === 'in' ||
      value === 'isNull'
    );
  }

  private toAppendChunks(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return value.toString();
    }
    return '';
  }
}
