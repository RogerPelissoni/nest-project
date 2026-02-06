export type QueryParamsType<TWhere> = {
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  where?: TWhere;
  filters?: Record<string, { value: any; matchMode?: 'like' | 'equals' | 'startsWith' | 'endsWith' }>;
};
