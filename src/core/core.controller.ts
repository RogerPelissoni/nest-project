import { Get, Delete, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorator';
import { QueryParamsType } from './types/generic.type';

@ApiBearerAuth('jwt')
export class CoreController<TService> {
  constructor(protected readonly service: TService) {}

  @Get()
  @Permission('read')
  findAll(@Query() query: any) {
    return (this.service as any).findAll({
      ...this.parsePagination(query),
      ...this.parseSorting(query),
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

  protected parseQuery<TWhereInput>(queryParams: QueryParamsType<TWhereInput>) {
    return {
      ...this.parsePagination(queryParams),
      ...this.parseSorting(queryParams),
      filters: this.parseFilters(queryParams),
    };
  }
}
