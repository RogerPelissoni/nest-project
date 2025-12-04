import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';
import * as argon2 from 'argon2';

@Injectable()
export class UserService extends CoreService<
  User,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async create(data: Prisma.UserCreateInput) {
    data.password = await argon2.hash(data.password);
    return super.create(data);
  }
}
