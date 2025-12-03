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

  async findAll(params: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    where?: Prisma.UserWhereInput;
    filters?: Record<string, { value: any; matchMode?: string }>;
  }) {
    const { skip = 0, take = 10, sortBy, sortOrder = 'asc', where, filters } = params;

    // Constrói o objeto where com os filtros
    const whereConditions: Prisma.UserWhereInput = { ...where };

    if (filters) {
      Object.keys(filters).forEach((key) => {
        const filter = filters[key];
        const { value, matchMode = 'like' } = filter;

        // Processa diferentes tipos de matchMode
        switch (matchMode) {
          case 'like':
            whereConditions[key] = { contains: value };
            break;
          case 'equals':
            whereConditions[key] = value;
            break;
          case 'startsWith':
            whereConditions[key] = { startsWith: value };
            break;
          case 'endsWith':
            whereConditions[key] = { endsWith: value };
            break;
          default:
            whereConditions[key] = { contains: value };
        }
      });
    }

    // Constrói o objeto de ordenação dinamicamente
    const orderBy: Prisma.UserOrderByWithRelationInput | undefined = sortBy
      ? { [sortBy]: sortOrder }
      : undefined;

    // Busca os dados com paginação e ordenação
    const data = await this.prisma.user.findMany({
      skip,
      take,
      where: whereConditions,
      orderBy,
    });

    // Busca o total de registros (sem paginação, respeitando filtros)
    const total = await this.prisma.user.count({ where: whereConditions });

    return {
      data,
      total,
      skip,
      take,
      totalPages: Math.ceil(total / take),
    };
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
