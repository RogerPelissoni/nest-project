export type QueryParamsType<TWhere> = {
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  where?: TWhere;
  appends?: string[] | string;
  hydrators?: string[] | string;
  filters?: Record<
    string,
    {
      value: any;
      matchMode?: 'like' | 'equals' | 'startsWith' | 'endsWith' | 'eq' | 'in' | 'isNull';
    }
  >;
};
