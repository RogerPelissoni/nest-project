import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Profile, Prisma } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';
import { ResourceService } from 'src/core/resource/resource.service';
import DTO from 'src/core/utils/dto.util';
import { CreateProfileDto, PermissionRequestDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  async createWithDto(data: CreateProfileDto) {
    const obProfile = await super.create(
      DTO.normalize({
        name: data.name,
        ds_description: data.ds_description,
      }),
    );

    if (data.profilePermission) {
      await this.syncPermissions(Number(obProfile.id), data.profilePermission);
    }

    return obProfile;
  }

  async updateWithDto(id: number, data: UpdateProfileDto) {
    const obProfile = await super.update(id, {
      name: data.name,
      ds_description: data.ds_description,
    });

    if (data.profilePermission) {
      await this.syncPermissions(Number(obProfile.id), data.profilePermission);
    }

    return obProfile;
  }

  async getPermissionsByProfile(idProfile: number) {
    await this.resourceService.sync();

    const obProfilePermission = await this.prisma.resource.findMany({
      select: {
        id: true,
        name: true,
        profilePermission: {
          where: {
            profile_id: idProfile,
          },
          select: {
            id: true,
            permission_level: true,
          },
        },
      },
    });

    const obProfilePermissionFixed = obProfilePermission.map((obResouce) => {
      const obProfilePermission = obResouce.profilePermission[0] ?? null;

      return {
        profile_permission_id: obProfilePermission?.id ?? null,
        permission_level: obProfilePermission?.permission_level ?? 0,
        resource_id: obResouce.id,
        ds_resource: obResouce.name,
      };
    });

    return obProfilePermissionFixed;
  }

  async syncPermissions(idProfile: number, obPermissions: PermissionRequestDto[]) {
    for (const paramsPermission of obPermissions) {
      const idProfilePermission = Number(paramsPermission.profile_permission_id);
      const permissionLevel = Number(paramsPermission.permission_level ?? 1);

      if (idProfilePermission) {
        await this.prisma.profilePermission.update({
          where: { id: idProfilePermission },
          data: { permission_level: permissionLevel },
        });
      } else {
        const idResource = paramsPermission.resource_id;

        await this.prisma.profilePermission.create({
          data: DTO.normalize<Prisma.ProfilePermissionCreateInput>({
            profile_id: idProfile,
            resource_id: idResource,
            permission_level: permissionLevel,
          }),
        });
      }
    }
  }
}
