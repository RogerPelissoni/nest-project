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
import { ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Prisma } from 'prisma/generated/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    const prismaData: Prisma.UserCreateInput = { ...createUserDto };
    return this.userService.create(prismaData);
  }

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  findAll(
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
    return this.userService.findAll(params);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  findOne(@Param('id') id: string) {
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.findOne(prismaId);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const prismaData: Prisma.UserUpdateInput = { ...updateUserDto };
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.update(prismaId, prismaData);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  remove(@Param('id') id: string) {
    const prismaId: Prisma.UserWhereUniqueInput = { id: Number(id) }; // ← converte para number
    return this.userService.remove(prismaId);
  }
}
