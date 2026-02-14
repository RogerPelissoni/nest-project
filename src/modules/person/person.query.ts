import { Person } from 'prisma/generated/client';
import { CoreQuery, CoreQueryFilter, CoreQueryParams } from 'src/core/support/core-query.support';
import { PrismaService } from 'src/prisma/prisma.service';

type PersonSortDirection = 'asc' | 'desc';

export class PersonQuery extends CoreQuery<Person> {
  private static readonly KEY_JOIN_COMPANY = 'company';
  private static readonly APPEND_COMPANY = 'company';
  private static readonly APPEND_DS_COMPANY = 'ds_company';
  private static readonly HYDRATOR_COMPANY = 'company';

  constructor(prisma: PrismaService, params: CoreQueryParams) {
    super(prisma, params);

    this.registerJoin(PersonQuery.KEY_JOIN_COMPANY, () => this.joinCompany());
    this.registerHydrator(PersonQuery.HYDRATOR_COMPANY, this.hydrateCompany.bind(this));
    this.setDefaultSort('name', 'asc');
  }

  protected model() {
    return this.prisma.person;
  }

  protected baseWhere() {
    return {};
  }

  protected appendMap() {
    return {
      [PersonQuery.APPEND_COMPANY]: () => {
        this.requestHydrator(PersonQuery.HYDRATOR_COMPANY);
      },
      [PersonQuery.APPEND_DS_COMPANY]: () => {
        this.requestJoin(PersonQuery.KEY_JOIN_COMPANY);
      },
    };
  }

  protected filterMap() {
    return {
      ds_company: (where: Record<string, unknown>, filter: CoreQueryFilter) => {
        this.applyRelationStringFilter(where, 'company', 'name', filter, 'is');
      },
    };
  }

  protected sortMap() {
    return {
      ds_company: (orderBy: Record<string, unknown>, direction: PersonSortDirection) => {
        orderBy.company = { name: direction };
      },
    };
  }

  private joinCompany() {
    if (!this.requestedAppends.has(PersonQuery.APPEND_DS_COMPANY)) return;

    this.addInclude({
      company: {
        select: {
          name: true,
        },
      },
    });
  }

  private async hydrateCompany(items: Person[]) {
    if (!items.length) return;

    const companyIds = Array.from(new Set(items.map((item) => item.company_id)));

    const companies = await this.prisma.company.findMany({
      where: {
        id: {
          in: companyIds,
        },
      },
      select: {
        id: true,
        name: true,
        tp_company: true,
        ds_email: true,
        ds_phone: true,
        ds_address: true,
      },
    });

    const companyById = new Map(companies.map((company) => [company.id.toString(), company] as const));

    for (const item of items as Array<Person & { company?: (typeof companies)[number] | null }>) {
      item.company = companyById.get(item.company_id.toString()) ?? null;
    }
  }
}
