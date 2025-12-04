import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from 'prisma/generated/client';
import { CoreService } from 'src/core/core.service';

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

  // Aqui você só sobrescreve o que for específico de User
  // Exemplo:
  // async create(data: Prisma.UserCreateInput) {
  //   // exemplo: hash de senha (caso você adicione depois)
  //   // data.password = await bcrypt.hash(data.password, 10);

  //   return super.create(data);
  // }
}
