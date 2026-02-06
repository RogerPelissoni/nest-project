import { Injectable } from '@nestjs/common';
import { CoreScreen } from 'src/core/core.screen';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { CompanyService } from '../company/company.service';
import { UserService } from './user.service';
import { QueryParamsType } from 'src/core/types/generic.type';
import { Prisma } from 'prisma/generated/client';

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
    return {
      obUser: await this.userService.findAll(queryParams),
      kvProfile: await this.profileService.getKeyValue(),
      kvCompany: await this.companyService.getKeyValue(),
      kvPerson: [], // TODO: Needs to implements Person model
    };
  }
}
