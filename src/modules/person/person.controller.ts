import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Permission } from 'src/common/decorators/permission.decorator';
import { Resource } from 'src/common/decorators/resource.decorator';
import { CoreController } from 'src/core/core.controller';
import DTO from 'src/core/utils/dto.util';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonService } from './person.service';

@Resource('person')
@Controller('person')
export class PersonController extends CoreController<PersonService> {
  constructor(private readonly personService: PersonService) {
    super(personService);
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
