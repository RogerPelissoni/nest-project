import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CoreController } from 'src/core/core.controller';

@Controller('user')
export class UserController extends CoreController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
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
