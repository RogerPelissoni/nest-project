import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Profile } from 'prisma/generated/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    where?: Prisma.ProfileWhereInput;
  }) {
    const { skip = 0, take = 10, sortBy, sortOrder = 'asc', where } = params;

    const orderBy: Prisma.ProfileOrderByWithRelationInput | undefined = sortBy
      ? { [sortBy]: sortOrder }
      : undefined;

    const data = await this.prisma.profile.findMany({
      skip,
      take,
      where,
      orderBy,
    });

    const total = await this.prisma.profile.count({ where });

    return {
      data,
      total,
      skip,
      take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(
    profileWhereUniqueInput: Prisma.ProfileWhereUniqueInput,
  ): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: profileWhereUniqueInput,
    });
  }

  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return this.prisma.profile.create({
      data,
    });
  }

  async update(
    where: Prisma.ProfileWhereUniqueInput,
    data: Prisma.ProfileUpdateInput,
  ): Promise<Profile> {
    return this.prisma.profile.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.ProfileWhereUniqueInput): Promise<Profile> {
    return this.prisma.profile.delete({
      where,
    });
  }

  /**
   * Busca keyValue (id e name) de todos os profiles
   */
  async getKeyValue() {
    return this.prisma.profile.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
