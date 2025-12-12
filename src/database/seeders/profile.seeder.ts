import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import DTO from 'src/core/utils/dto.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    const obProfile = await this.prisma.profile.create({
      data: DTO.normalize<Prisma.ProfileCreateInput>({
        name: 'Administrador',
        ds_description: 'Possui acesso irrestrito',
        company_id: 1,
      }),
    });

    const obResources = await this.prisma.resource.findMany();

    for (const paramsResource of obResources) {
      await this.prisma.profilePermission.create({
        data: DTO.normalize<Prisma.ProfilePermissionCreateInput>({
          profile_id: obProfile.id,
          resource_id: paramsResource.id,
          permission_level: 4,
          company_id: 1,
        }),
      });
    }
  }
}
