export type QueryFilter = {
  field: string;
  value: any;
  matchMode?: 'eq' | 'like' | 'in' | 'isNull';
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
