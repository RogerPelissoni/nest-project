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
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
  ) {
    // Monta o objeto para o Prisma
    const params: Prisma.UserFindManyArgs = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy: orderBy
        ? { [orderBy]: 'asc' } // ajuste conforme necessidade
        : undefined,
    };

    return await this.userService.findAll(params);
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
