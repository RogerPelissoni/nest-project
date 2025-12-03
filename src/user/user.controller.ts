import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from 'prisma/generated/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseController } from 'src/base/base.controller';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  create(@Body() dtoUser: CreateUserDto) {
    return this.userService.create(dtoUser);
  }

  @Get()
  async findAll(
    @Query() queryParams: any,
  ) {
    const skip = Number(queryParams.skip) || 0;
    const take = Number(queryParams.take) || 10;
    const sortBy = queryParams.sortBy;
    const sortOrder = queryParams.sortOrder || 'asc';

    // Parseia os filtros do JSON
    let filters: Record<string, any> = {};
    if (queryParams.filters) {
      try {
        filters = JSON.parse(queryParams.filters);
      } catch (error) {
        filters = {};
      }
    }

    return this.userService.findAll({
      skip,
      take,
      sortBy,
      sortOrder,
      filters,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.findOne(prismaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const prismaData: Prisma.UserUpdateInput = { ...updateUserDto };
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.update(prismaId, prismaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.remove(prismaId);
  }
}
