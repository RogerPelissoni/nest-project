import { Prisma } from 'prisma/generated/client';
import { CoreQuery } from 'src/core/support/core-query.support';
import {
  CoreQueryAppendHandler,
  CoreQueryFilterHandler,
  CoreQueryHydratorHandler,
  CoreQuerySortHandler,
} from 'src/core/types/core-query.type';
import { QueryParamsType } from 'src/core/types/query.type';
import { PrismaService } from 'src/prisma/prisma.service';

export type PersonAppends = 'ds_company';
export type PersonHydrators = 'personPhone';

export class PersonQuery extends CoreQuery<
  Prisma.PersonDelegate,
  Prisma.PersonSelect,
  Prisma.PersonWhereInput,
  Prisma.PersonOrderByWithRelationInput,
  Prisma.PersonInclude,
  PersonAppends,
  PersonHydrators
> {
  private constructor(
    prisma: PrismaService,
    protected readonly params: QueryParamsType<Prisma.PersonWhereInput>,
  ) {
    super(prisma, params, prisma.person);
  }

  static init(prisma: PrismaService, params: QueryParamsType<Prisma.PersonWhereInput>) {
    return new PersonQuery(prisma, params);
  }

  // ===== BASE =====

  protected baseSelect(): Prisma.PersonSelect {
    return {
      id: true,
      name: true,
      ds_document: true,
      ds_email: true,
      ds_phone: true,
      da_birth: true,
      tp_gender: true,
      ds_address_street: true,
      ds_address_number: true,
      ds_address_complement: true,
      ds_address_district: true,
      ds_address_city: true,
      ds_address_state: true,
      ds_address_zipcode: true,
      fl_active: true,
    };
  }

  protected baseWhere(): Prisma.PersonWhereInput {
    return {
      // name: 'test',
    };
  }

  protected baseOrderBy(): Prisma.PersonOrderByWithRelationInput {
    return {
      name: 'asc',
    };
  }

  // ===== MAPS =====

  protected appendMap(): Record<PersonAppends, CoreQueryAppendHandler<Prisma.PersonSelect>> {
    return {
      ds_company: {
        select: () => ({
          company: {
            select: { name: true },
          },
        }),
        resolve: (row: any) => ({
          ds_company: row.company?.name ?? null,
        }),
        cleanup: ['company'],
      },
    };
  }

  protected filterMap(): Record<string, CoreQueryFilterHandler<Prisma.PersonWhereInput>> {
    return {
      ds_company: (value) => ({
        company: {
          name: { contains: value },
        },
      }),
    };
  }

  protected sortMap(): Record<string, CoreQuerySortHandler<Prisma.PersonOrderByWithRelationInput>> {
    return {
      ds_company: (direction) => ({
        company: {
          name: direction,
        },
      }),
    };
  }

  protected hydratorMap(): Record<PersonHydrators, CoreQueryHydratorHandler> {
    return {
      personPhone: {
        hydrate: async (rows: Array<{ id: bigint | number } & Record<string, any>>, prisma: PrismaService) => {
          await this.hydrateHasMany(rows, prisma.personPhone, 'person_id', 'person_phone', {
            id: true,
            person_id: true,
            ds_phone: true,
          });
        },
      },
    };
  }

  // ===== FLUENT =====

  withPersonPhone() {
    return this.withHydrators('personPhone');
  }
}
