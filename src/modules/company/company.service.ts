import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Company, Prisma } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';

@Injectable()
export class CompanyService extends CoreService<
  Company,
  Prisma.CompanyWhereUniqueInput,
  Prisma.CompanyWhereInput,
  Prisma.CompanyCreateInput,
  Prisma.CompanyUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'company');
  }
}
