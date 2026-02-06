import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CoreController } from 'src/core/core.controller';
import { Permission } from 'src/common/decorators/permission.decorator';
import { UserScreen } from './user.screen';
import { QueryParamsType } from 'src/core/types/generic.type';
import { Prisma } from 'prisma/generated/client';

@Controller('user')
export class UserController extends CoreController<UserService> {
  constructor(
    private readonly userService: UserService,
    private readonly userScreen: UserScreen,
  ) {
    super(userService);
  }

  @Get('screen')
  @Permission('read')
  screen(@Query() query: QueryParamsType<Prisma.UserWhereInput>) {
    return this.userScreen.handle(this.parseQuery<Prisma.UserWhereInput>(query));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(Number(id), dto);
  }
}
