import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from 'prisma/generated/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(
    @Body()
    bodyParams: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    },
  ) {
    return this.userService.findAll(bodyParams);
  }

  @Get(':id')
  findOne(@Param('id') id: Prisma.UserWhereUniqueInput) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: Prisma.UserWhereUniqueInput,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: Prisma.UserWhereUniqueInput) {
    return this.userService.remove(id);
  }
}
