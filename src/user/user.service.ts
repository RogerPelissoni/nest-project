import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from 'prisma/generated/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findAll(params: Prisma.UserFindManyArgs) {
    return await this.prisma.user.findMany(params);
  }

  async create(dtoUser: CreateUserDto) {
    // const idCompanyFromSession = Number(dtoUser.company_id);
    const hashedPassword = dtoUser.password;

    const obUser = this.prisma.user.create({
      data: {
        name: dtoUser.name,
        email: dtoUser.email,
        password: hashedPassword,
        profile_id: Number(dtoUser.profile_id),
        // company_id: idCompanyFromSession,
        person_id: Number(dtoUser.person_id),
      },
    });

    return obUser;
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
