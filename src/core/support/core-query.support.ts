import { PrismaService } from 'src/prisma/prisma.service';
import {
  CoreQueryAppendHandler,
  CoreQueryFilterHandler,
  CoreQueryHydratorHandler,
  CoreQuerySortHandler,
} from '../types/core-query.type';
import { QueryParamsType } from '../types/query.type';
import { normalizeQueryFilters, normalizeQueryOrderBy } from './query.support';

export abstract class CoreQuery<
  TDelegate,
  TSelect,
  TWhere,
  TOrderBy,
  TInclude,
  TAppend extends string = string,
  THydrator extends string = string,
> {
  protected select: Partial<TSelect> = {};
  protected where: TWhere = {} as TWhere;
  protected orderBy?: TOrderBy;
  protected include?: Partial<TInclude>;

  protected runtimeAppends: Set<string> = new Set();
  protected runtimeHydrators = new Set<string>();

  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly params: QueryParamsType<TWhere>,
    protected readonly model: TDelegate,
  ) {}

  // ===== BASE =====

  protected baseSelect(): TSelect | undefined {
    return undefined;
  }

  protected abstract baseWhere(): TWhere;

  protected baseOrderBy(): TOrderBy | undefined {
    return undefined;
  }

  protected appendMap(): Record<string, CoreQueryAppendHandler<TSelect>> {
    return {};
  }

  protected filterMap(): Record<string, CoreQueryFilterHandler<TWhere>> {
    return {};
  }

  protected sortMap(): Record<string, CoreQuerySortHandler<TOrderBy>> {
    return {};
  }

  protected hydratorMap(): Record<string, CoreQueryHydratorHandler> {
    return {};
  }

  // ===== FLUENT API =====

  withAppends(appends: TAppend | TAppend[]) {
    (Array.isArray(appends) ? appends : [appends]).forEach((a) => this.runtimeAppends.add(a));
    return this;
  }

  withHydrators(hydrators: THydrator | THydrator[]) {
    (Array.isArray(hydrators) ? hydrators : [hydrators]).forEach((h) => this.runtimeHydrators.add(h));
    return this;
  }

  withAllAppends() {
    Object.keys(this.appendMap()).forEach((a) => this.withAppends(a as TAppend));
    return this;
  }

  withAllHydrators() {
    Object.keys(this.hydratorMap()).forEach((h) => this.withHydrators(h as THydrator));
    return this;
  }

  withAll() {
    this.withAllAppends();
    this.withAllHydrators();
    return this;
  }

  // ===== INTERNAL =====

  protected getRequestedAppends(): string[] {
    const fromParams = Array.isArray(this.params?.appends)
      ? this.params.appends
      : this.params?.appends
        ? [this.params.appends]
        : [];

    return Array.from(new Set([...fromParams, ...this.runtimeAppends]));
  }

  protected getRequestedHydrators(): string[] {
    const fromParams = Array.isArray(this.params?.hydrators)
      ? this.params.hydrators
      : this.params?.hydrators
        ? [this.params.hydrators]
        : [];

    return Array.from(new Set([...fromParams, ...this.runtimeHydrators]));
  }

  // ===== APPLY =====

  protected applySelect() {
    this.select ??= {};
    Object.assign(this.select, this.baseSelect() ?? {});
  }

  protected applyWhere() {
    const dynamicWhere: any = {};
    const filters = this.params?.filters ?? {};
    const map = this.filterMap();

    for (const field in filters) {
      const { value, matchMode } = filters[field];

      if (map[field]) {
        Object.assign(dynamicWhere, map[field](value, matchMode, this.params));
        continue;
      }

      Object.assign(dynamicWhere, normalizeQueryFilters({ [field]: filters[field] }));
    }

    this.where = {
      ...this.baseWhere(),
      ...dynamicWhere,
      ...this.where,
    };
  }

  protected applyOrderBy() {
    const sortBy = this.params?.sortBy;
    const direction = this.params?.sortOrder ?? 'asc';

    if (!sortBy) {
      this.orderBy = this.baseOrderBy();
      return;
    }

    const map = this.sortMap();

    if (map[sortBy]) {
      this.orderBy = map[sortBy](direction);
      return;
    }

    this.orderBy = normalizeQueryOrderBy<TOrderBy>(sortBy, direction);
  }

  protected applyAppends() {
    const appends = this.getRequestedAppends();
    if (!appends.length) return;

    this.select ??= {} as any;

    for (const key of appends) {
      const handler = this.appendMap()[key];
      if (!handler?.select) continue;

      Object.assign(this.select, handler.select());
    }
  }

  protected async applyHydrators(rows: any[]) {
    for (const key of this.getRequestedHydrators()) {
      const hydrator = this.hydratorMap()[key];
      if (hydrator) {
        await hydrator.hydrate(rows, this.prisma);
      }
    }
  }

  protected transformPayload(rows: any[]) {
    const appends = this.getRequestedAppends();
    if (!appends.length) return rows;

    return rows.map((row) => {
      for (const key of appends) {
        const handler = this.appendMap()[key];
        if (!handler) continue;

        if (handler.resolve) {
          Object.assign(row, handler.resolve(row));
        }

        handler.cleanup?.forEach((field) => {
          delete row[field];
        });
      }

      return row;
    });
  }

  // ===== EXECUTION =====

  execute() {
    this.applySelect();
    this.applyAppends();
    this.applyWhere();
    this.applyOrderBy();
  }

  async get() {
    this.execute();

    const rows = await (this.model as any).findMany({
      select: this.select,
      where: this.where,
      orderBy: this.orderBy,
    });

    await this.applyHydrators(rows);
    return this.transformPayload(rows);
  }

  async paginate(skip = 0, take = 10) {
    this.execute();

    const total = await (this.model as any).count({
      where: this.where,
    });

    const rows = await (this.model as any).findMany({
      select: this.select,
      where: this.where,
      orderBy: this.orderBy,
      skip,
      take,
    });

    await this.applyHydrators(rows);
    const transformed = this.transformPayload(rows);

    return {
      data: transformed,
      total,
      skip,
      take,
      totalPages: Math.ceil(total / take),
    };
  }

  // ===== AUX =====

  protected async hydrateHasMany<
    TParent extends { id: bigint | number },
    TChild extends Record<string, any>,
    TForeignKey extends keyof TChild,
  >(
    rows: TParent[],
    delegate: {
      findMany(args: any): Promise<TChild[]>;
    },
    foreignKey: TForeignKey, // FK NO FILHO
    attributeName: string, // onde hidratar no pai
    select: Record<string, boolean>,
    extraWhere?: Record<string, any>,
  ): Promise<void> {
    if (!rows.length) return;

    const ids = rows.map((r) => BigInt(r.id));

    const children = await delegate.findMany({
      where: {
        [foreignKey]: { in: ids },
        ...extraWhere,
      },
      select,
    });

    const map = new Map<string, TChild[]>();

    for (const child of children) {
      const key = String(child[foreignKey] as bigint);

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(child);
    }

    for (const row of rows) {
      const key = String(row.id);
      (row as Record<string, any>)[attributeName] = map.get(key) ?? [];
    }
  }
}
