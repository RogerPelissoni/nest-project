import { Get, Delete, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
export class CoreController<TService> {
  constructor(protected readonly service: TService) {}

  @Get()
  findAll(@Query() query: any) {
    return (this.service as any).findAll({
      ...this.parsePagination(query),
      ...this.parseSorting(query),
      filters: this.parseFilters(query),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return (this.service as any).findOne(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return (this.service as any).remove(Number(id));
  }

  protected parsePagination(query: any) {
    return {
      skip: Number(query.skip) || 0,
      take: Number(query.take) || 10,
    };
  }

  protected parseSorting(query: any) {
    return {
      sortBy: query.sortBy,
      sortOrder: query.sortOrder || 'asc',
    };
  }

  protected parseFilters(query: any) {
    try {
      return query.filters ? JSON.parse(query.filters) : {};
    } catch {
      return {};
    }
  }
}
