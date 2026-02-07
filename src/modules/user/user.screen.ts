import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { CoreScreen } from 'src/core/core.screen';
import { QueryParamsType } from 'src/core/types/generic.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyService } from '../company/company.service';
import { ProfileService } from '../profile/profile.service';
import { UserService } from './user.service';

@Injectable()
export class UserScreen extends CoreScreen {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly userService: UserService,
    protected readonly profileService: ProfileService,
    protected readonly companyService: CompanyService,
  ) {
    super();
  }

  async handle(queryParams: QueryParamsType<Prisma.UserWhereInput>) {
    // Paraleliza as queries para melhor performance
    const [obUser, kvProfile, kvCompany] = await Promise.all([
      this.userService.findAll(queryParams),
      this.profileService.getKeyValue(),
      this.companyService.getKeyValue(),
    ]);

    return {
      obUser,
      kvProfile,
      kvCompany,
      kvPerson: [], // TODO: Needs to implements Person model
    };
  }
}
