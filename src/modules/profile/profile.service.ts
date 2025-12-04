import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Profile, Prisma } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';

@Injectable()
export class ProfileService extends CoreService<
  Profile,
  Prisma.ProfileWhereUniqueInput,
  Prisma.ProfileWhereInput,
  Prisma.ProfileCreateInput,
  Prisma.ProfileUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'profile');
  }
}
