import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { Permission } from 'src/common/decorators/permission.decorator';
import { Resource } from 'src/common/decorators/resource.decorator';
import { CoreController } from 'src/core/core.controller';
import { QueryParamsType } from 'src/core/types/query.type';
import DTO from 'src/core/utils/dto.util';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonScreen } from './person.screen';
import { PersonService } from './person.service';

@Resource('person')
@Controller('person')
export class PersonController extends CoreController<PersonService> {
  constructor(
    private readonly personService: PersonService,
    private readonly personScreen: PersonScreen,
  ) {
    super(personService);
  }

  @Get('screen')
  @Permission('read')
  screen(@Query() query: QueryParamsType<Prisma.PersonWhereInput>) {
    return this.personScreen.handle(this.parseQuery<Prisma.PersonWhereInput>(query));
  }

  @Post()
  @Permission('create')
  create(@Body() dto: CreatePersonDto) {
    return this.personService.create(DTO.normalize(dto));
  }

  @Patch(':id')
  @Permission('update')
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    return this.personService.update(Number(id), dto);
  }
}
