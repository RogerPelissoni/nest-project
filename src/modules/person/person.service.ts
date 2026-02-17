import { Injectable } from '@nestjs/common';
import { Person, Prisma } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';
import { QueryParamsType } from 'src/core/types/query.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonQuery } from './person.query';

@Injectable()
export class PersonService extends CoreService<
  Person,
  Prisma.PersonWhereUniqueInput,
  Prisma.PersonWhereInput,
  Prisma.PersonCreateInput,
  Prisma.PersonUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'person');
  }

  findAll(params: QueryParamsType<Prisma.PersonWhereInput>): any {
    return PersonQuery.init(this.prisma, params).paginate();
  }
}
