import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Profile, Prisma } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';
import { ResourceService } from 'src/core/resource/resource.service';

@Injectable()
export class ProfileService extends CoreService<
  Profile,
  Prisma.ProfileWhereUniqueInput,
  Prisma.ProfileWhereInput,
  Prisma.ProfileCreateInput,
  Prisma.ProfileUpdateInput
> {
  constructor(
    prisma: PrismaService,
    private readonly resourceService: ResourceService,
  ) {
    super(prisma, 'profile');
  }

  async getPermissionsByProfile(idProfile: number) {
    await this.resourceService.sync();

    const permissions = await this.prisma.profilePermission.findMany({
      where: { profile_id: idProfile },
      include: { resource: true },
    });

    return permissions;
  }
}
