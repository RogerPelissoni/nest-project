import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParamsType } from './query.type';

export type CoreQueryAppendHandler<TSelect> = {
  select?: () => Partial<TSelect>;
  resolve?: (row: any) => Record<string, any>;
  cleanup?: string[];
  hydrate?: (rows: any[], prisma: PrismaService) => Promise<void>;
};

export type CoreQueryFilterHandler<TWhere> = (
  value: any,
  matchMode: string | undefined,
  params: QueryParamsType<TWhere>,
) => TWhere;

export type CoreQuerySortHandler<TOrderBy> = (direction: 'asc' | 'desc') => TOrderBy;

export type CoreQueryHydratorHandler = {
  hydrate: (rows: Record<string, any>[], prisma: PrismaService) => Promise<void>;
};
