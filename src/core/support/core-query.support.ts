import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParamsType } from '../types/generic.type';

type SortDirection = 'asc' | 'desc';
type MatchMode = 'like' | 'equals' | 'startsWith' | 'endsWith' | 'eq' | 'in' | 'isNull';
type FilterRecordValue =
  | { value: unknown; matchMode?: MatchMode }
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined;
type FilterRecord = Record<string, FilterRecordValue>;

export type CoreQueryParams = Omit<QueryParamsType<any>, 'filters'> & {
  filters?: FilterRecord;
  appends?: string[] | string;
};

export type CoreQueryFilter = {
  field: string;
  value: unknown;
  matchMode: MatchMode;
};

export type CoreQueryListResult<T> = {
  data: T[];
  total: number;
  skip: number;
  take: number;
  totalPages: number;
};

export abstract class CoreQuery<T> {
  private static readonly JOIN_NONE = 0;
  private static readonly JOIN_REQUESTED = 1;
  private static readonly JOIN_APPLIED = 2;

  protected readonly prisma: PrismaService;
  protected readonly params: CoreQueryParams;

  protected readonly requestedAppends = new Set<string>();
  protected readonly appendMappers = new Map<string, (items: T[]) => void | Promise<void>>();
  protected readonly hydrators = new Map<string, (items: T[]) => void | Promise<void>>();
  protected readonly activeHydrators = new Set<string>();
  protected readonly requestedIncludes: Record<string, unknown> = {};
  protected readonly joinRegistry = new Map<
    string,
    {
      state: number;
      callback: () => void;
    }
  >();
  protected defaultSort?: {
    field: string;
    direction: SortDirection;
  };
  protected readonly beforeExecuteCallbacks: Array<(args: Record<string, unknown>) => void | Promise<void>> = [];

  constructor(prisma: PrismaService, params: CoreQueryParams) {
    this.prisma = prisma;
    this.params = params;

    this.parseAppends(params.appends).forEach((append) => this.requestedAppends.add(append));
    this.parseHydrators(params.hydrators).forEach((hydrator) => this.activeHydrators.add(hydrator));
  }

  protected abstract model(): {
    findMany: (args: any) => Promise<T[]>;
    count: (args: { where: any }) => Promise<number>;
  };
  protected abstract baseWhere(): Record<string, unknown>;

  protected baseSelect(): Record<string, unknown> | undefined {
    return undefined;
  }

  protected baseInclude(): Record<string, unknown> | undefined {
    return undefined;
  }

  protected appendMap(): Record<string, () => void> {
    return {};
  }

  protected filterMap(): Record<string, (where: Record<string, unknown>, filter: CoreQueryFilter) => void> {
    return {};
  }

  protected sortMap(): Record<string, (orderBy: Record<string, unknown>, direction: SortDirection) => void> {
    return {};
  }

  withAppends(fields: string[]): this {
    fields.forEach((field) => this.requestedAppends.add(field));
    return this;
  }

  withAllAppends(): this {
    return this.withAppends(Object.keys(this.appendMap()));
  }

  withAllHydrators(): this {
    this.hydrators.forEach((_, key) => this.activeHydrators.add(key));
    return this;
  }

  beforeExecute(callback: (args: Record<string, unknown>) => void | Promise<void>): this {
    this.beforeExecuteCallbacks.push(callback);
    return this;
  }

  protected resolveAppends(appendHandlers: Record<string, () => void>, filters: CoreQueryFilter[], sortBy?: string) {
    const fields = new Set<string>(this.requestedAppends);

    for (const filter of filters) {
      fields.add(filter.field);
    }
    if (sortBy) {
      fields.add(sortBy);
    }

    for (const field of fields) {
      appendHandlers[field]?.();
    }
  }

  protected applyFilters(
    where: Record<string, unknown>,
    filters: CoreQueryFilter[],
    filterHandlers: Record<string, (where: Record<string, unknown>, filter: CoreQueryFilter) => void>,
  ) {
    for (const filter of filters) {
      const handler = filterHandlers[filter.field];
      if (handler) {
        handler(where, filter);
        continue;
      }

      this.applyDefaultFilter(where, filter);
    }
  }

  protected applyStringFilter(where: Record<string, unknown>, field: string, filter: CoreQueryFilter) {
    const value = this.toFilterString(filter.value);
    if (!value) return;

    switch (filter.matchMode) {
      case 'eq':
      case 'equals':
        where[field] = value;
        return;
      case 'startsWith':
        where[field] = { startsWith: value };
        return;
      case 'endsWith':
        where[field] = { endsWith: value };
        return;
      case 'in':
        where[field] = {
          in: value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        };
        return;
      case 'isNull':
        where[field] = filter.value ? null : { not: null };
        return;
      case 'like':
      default:
        where[field] = { contains: value };
        return;
    }
  }

  protected applyRelationStringFilter(
    where: Record<string, unknown>,
    relation: string,
    relationField: string,
    filter: CoreQueryFilter,
    relationOperator: 'is' | 'some' | 'every' | 'none' = 'is',
  ) {
    const relationWhere: Record<string, unknown> = {};
    this.applyStringFilter(relationWhere, relationField, filter);

    if (Object.keys(relationWhere).length === 0) return;

    where[relation] = {
      [relationOperator]: relationWhere,
    };
  }

  protected toFilterString(value: unknown): string | null {
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized.length > 0 ? normalized : null;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return value.toString();
    }

    return null;
  }

  protected toBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
    if (typeof value !== 'string') return null;

    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'sim'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'nao'].includes(normalized)) return false;

    return null;
  }

  protected toBigInt(value: unknown): bigint | null {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value));
    if (typeof value !== 'string') return null;

    const normalized = value.trim();
    if (!normalized) return null;

    try {
      return BigInt(normalized);
    } catch {
      return null;
    }
  }

  protected applySort(
    orderBy: Record<string, unknown>,
    sortHandlers: Record<string, (orderBy: Record<string, unknown>, direction: SortDirection) => void>,
    sort: { field?: string; direction: SortDirection },
  ) {
    const sortBy = sort.field;
    const sortOrder = sort.direction;
    if (!sortBy) return;

    const handler = sortHandlers[sortBy];
    if (handler) {
      handler(orderBy, sortOrder);
      return;
    }

    orderBy[sortBy] = sortOrder;
  }

  protected async applyHydrators(items: T[]) {
    if (!items.length) return;

    for (const key of this.activeHydrators) {
      const hydrate = this.hydrators.get(key);
      if (hydrate) {
        await hydrate(items);
      }
    }
  }

  protected registerHydrator(key: string, callback: (items: T[]) => void | Promise<void>) {
    this.hydrators.set(key, callback);
  }

  protected registerAppendMapper(key: string, callback: (items: T[]) => void | Promise<void>) {
    this.appendMappers.set(key, callback);
  }

  protected requestHydrator(key: string) {
    if (this.hydrators.has(key)) {
      this.activeHydrators.add(key);
    }
  }

  protected setDefaultSort(field: string, direction: SortDirection = 'asc') {
    this.defaultSort = { field, direction };
  }

  protected addInclude(include: Record<string, unknown>) {
    this.mergeObject(this.requestedIncludes, include);
  }

  protected registerJoin(key: string, callback: () => void) {
    if (!this.joinRegistry.has(key)) {
      this.joinRegistry.set(key, {
        state: CoreQuery.JOIN_NONE,
        callback,
      });
    }
  }

  protected requestJoin(key: string) {
    const join = this.joinRegistry.get(key);
    if (!join) return;

    if (join.state === CoreQuery.JOIN_NONE) {
      join.state = CoreQuery.JOIN_REQUESTED;
    }
  }

  async get(): Promise<CoreQueryListResult<T>> {
    const filters = this.normalizeFilters();
    const appendHandlers = this.appendMap();
    const filterHandlers = this.filterMap();
    const sortHandlers = this.sortMap();
    const sort = this.resolveSort();

    this.resolveAppends(appendHandlers, filters, sort.field);
    this.applyJoins();

    const where: Record<string, unknown> = {
      ...this.baseWhere(),
      ...((this.params.where as Record<string, unknown> | undefined) ?? {}),
    };
    const orderBy: Record<string, unknown> = {};

    this.applyFilters(where, filters, filterHandlers);
    this.applySort(orderBy, sortHandlers, sort);

    const select = this.baseSelect();
    const include = this.resolveInclude();

    const skip = this.parseSkip();
    const take = this.parseTake();

    const args: Record<string, unknown> = {
      where,
      skip,
      take,
    };

    if (Object.keys(orderBy).length > 0) {
      args.orderBy = orderBy;
    }
    if (select && include) {
      args.select = this.mergeSelectWithInclude(select, include);
    } else if (select) {
      args.select = select;
    } else if (include) {
      args.include = include;
    }
    for (const callback of this.beforeExecuteCallbacks) {
      await callback(args);
    }

    const [data, total] = await Promise.all([this.model().findMany(args), this.model().count({ where })]);

    await this.applyHydrators(data);
    await this.applyAppendMappers(data);

    return {
      data,
      total,
      skip,
      take,
      totalPages: take > 0 ? Math.ceil(total / take) : 0,
    };
  }

  private parseSkip(): number {
    const value = Number(this.params.skip);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.trunc(value);
  }

  private parseTake(): number {
    const value = Number(this.params.take);
    if (!Number.isFinite(value) || value <= 0) return 10;
    return Math.trunc(value);
  }

  private parseAppends(appends: CoreQueryParams['appends']): string[] {
    if (!appends) return [];

    if (Array.isArray(appends)) {
      return appends
        .flatMap((append) => this.toAppendString(append).split(','))
        .map((append) => append.trim())
        .filter(Boolean);
    }

    return this.toAppendString(appends)
      .split(',')
      .map((append) => append.trim())
      .filter(Boolean);
  }

  private parseHydrators(hydrators: CoreQueryParams['hydrators']): string[] {
    if (!hydrators) return [];

    if (Array.isArray(hydrators)) {
      return hydrators
        .flatMap((hydrator) => this.toAppendString(hydrator).split(','))
        .map((hydrator) => hydrator.trim())
        .filter(Boolean);
    }

    return this.toAppendString(hydrators)
      .split(',')
      .map((hydrator) => hydrator.trim())
      .filter(Boolean);
  }

  private normalizeFilters(): CoreQueryFilter[] {
    const filters = this.params.filters;
    if (!filters) return [];

    return Object.entries(filters).map(([field, filterConfig]) => {
      if (typeof filterConfig === 'object' && filterConfig !== null && 'value' in filterConfig) {
        const typedFilter = filterConfig as { value: unknown; matchMode?: MatchMode };

        return {
          field,
          value: typedFilter.value,
          matchMode: typedFilter.matchMode ?? this.inferMatchMode(typedFilter.value),
        };
      }

      return {
        field,
        value: filterConfig,
        matchMode: this.inferMatchMode(filterConfig),
      };
    });
  }

  private applyDefaultFilter(where: Record<string, unknown>, filter: CoreQueryFilter) {
    const field = filter.field;
    const value = filter.value;

    switch (filter.matchMode) {
      case 'equals':
      case 'eq':
        where[field] = value;
        break;
      case 'startsWith':
        {
          const parsed = this.toFilterString(value);
          if (!parsed) return;
          where[field] = { startsWith: parsed };
        }
        break;
      case 'endsWith':
        {
          const parsed = this.toFilterString(value);
          if (!parsed) return;
          where[field] = { endsWith: parsed };
        }
        break;
      case 'in':
        {
          const parsed = this.toArrayValue(value);
          if (parsed.length === 0) return;
          where[field] = { in: parsed };
        }
        break;
      case 'isNull':
        where[field] = value ? null : { not: null };
        break;
      case 'like':
      default:
        {
          const parsed = this.toFilterString(value);
          if (!parsed) return;
          where[field] = { contains: parsed };
        }
        break;
    }
  }

  private toAppendString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return value.toString();
    }
    return '';
  }

  private toArrayValue(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== null && item !== undefined);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (value === null || value === undefined) return [];
    return [value];
  }

  private inferMatchMode(value: unknown): MatchMode {
    return typeof value === 'string' ? 'like' : 'eq';
  }

  private resolveInclude(): Record<string, unknown> | undefined {
    const resolved: Record<string, unknown> = {};

    const baseInclude = this.baseInclude();
    if (baseInclude) {
      this.mergeObject(resolved, baseInclude);
    }

    this.mergeObject(resolved, this.requestedIncludes);

    return Object.keys(resolved).length > 0 ? resolved : undefined;
  }

  private mergeSelectWithInclude(
    select: Record<string, unknown>,
    include: Record<string, unknown>,
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = {};
    this.mergeObject(merged, select);
    this.mergeObject(merged, include);
    return merged;
  }

  private mergeObject(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) {
      if (this.isPlainObject(value)) {
        const current = target[key];

        if (this.isPlainObject(current)) {
          this.mergeObject(current, value);
        } else {
          const nested: Record<string, unknown> = {};
          this.mergeObject(nested, value);
          target[key] = nested;
        }

        continue;
      }

      target[key] = value;
    }
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private resolveSort(): { field?: string; direction: SortDirection } {
    if (this.params.sortBy) {
      return {
        field: this.params.sortBy,
        direction: this.params.sortOrder ?? 'asc',
      };
    }

    if (this.defaultSort) {
      return this.defaultSort;
    }

    return {
      field: undefined,
      direction: 'asc',
    };
  }

  private async applyAppendMappers(items: T[]) {
    if (!items.length) return;

    for (const append of this.requestedAppends) {
      const mapper = this.appendMappers.get(append);
      if (mapper) {
        await mapper(items);
        continue;
      }

      this.applyDefaultAppendMapper(items, append);
    }
  }

  private applyDefaultAppendMapper(items: T[], append: string) {
    if (!append.startsWith('ds_')) return;

    const relation = append.slice(3);
    if (!relation) return;

    for (const item of items as Array<Record<string, unknown>>) {
      const relationData = item[relation];
      if (!this.isPlainObject(relationData) || !('name' in relationData)) continue;

      item[append] = relationData.name ?? null;

      const keepRelation = this.requestedAppends.has(relation) || this.activeHydrators.has(relation);
      if (!keepRelation) {
        delete item[relation];
      }
    }
  }

  private applyJoins() {
    let hasPending = true;

    while (hasPending) {
      hasPending = false;

      for (const [, join] of this.joinRegistry) {
        if (join.state === CoreQuery.JOIN_REQUESTED) {
          join.callback();
          join.state = CoreQuery.JOIN_APPLIED;
          hasPending = true;
        }
      }
    }
  }
}
