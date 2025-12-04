import { Body, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
export class CoreController<TService, TCreateDto, TUpdateDto> {
  constructor(protected readonly service: TService) {}

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

  @Post()
  create(@Body() dto: TCreateDto) {
    return (this.service as any).create(dto);
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: TUpdateDto) {
    return (this.service as any).update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return (this.service as any).remove(Number(id));
  }
}
