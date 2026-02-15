import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { CoreScreen } from 'src/core/core.screen';
import { QueryParamsType } from 'src/core/types/query.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonService } from './person.service';

@Injectable()
export class PersonScreen extends CoreScreen {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly personService: PersonService,
  ) {
    super();
  }

  async handle(queryParams: QueryParamsType<Prisma.PersonWhereInput>) {
    const [obPerson] = await Promise.all([this.personService.findAll(queryParams)]);

    return {
      obPerson,
    };
  }
}
