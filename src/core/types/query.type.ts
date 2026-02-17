type MatchModeType =
  | 'eq'
  | 'equals'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'like'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull';

export type QueryFilter = {
  field: string;
  value: any;
  matchMode?: MatchModeType;
  operator?: 'and' | 'or';
};

export type QuerySort = {
  field: string;
  direction: 'asc' | 'desc';
};

export interface QueryParams {
  filters?: QueryFilter[];
  sort?: QuerySort;
  page?: number;
  perPage?: number;
  appends?: string[];
}

export type QueryParamsType<TWhere> = {
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  where?: TWhere;
  fields?: string[] | string;
  appends?: string[] | string;
  hydrators?: string[] | string;
  filters?: QueryFilters;
};

export type QueryFilters = Record<
  string,
  {
    value: any;
    matchMode?: MatchModeType;
  }
>;
