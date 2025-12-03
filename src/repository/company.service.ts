import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Company } from 'prisma/generated/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    where?: Prisma.CompanyWhereInput;
  }) {
    const { skip = 0, take = 10, sortBy, sortOrder = 'asc', where } = params;

    const orderBy: Prisma.CompanyOrderByWithRelationInput | undefined = sortBy
      ? { [sortBy]: sortOrder }
      : undefined;

    const data = await this.prisma.company.findMany({
      skip,
      take,
      where,
      orderBy,
    });

    const total = await this.prisma.company.count({ where });

    return {
      data,
      total,
      skip,
      take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(
    companyWhereUniqueInput: Prisma.CompanyWhereUniqueInput,
  ): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: companyWhereUniqueInput,
    });
  }

  async create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return this.prisma.company.create({
      data,
    });
  }

  async update(
    where: Prisma.CompanyWhereUniqueInput,
    data: Prisma.CompanyUpdateInput,
  ): Promise<Company> {
    return this.prisma.company.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.CompanyWhereUniqueInput): Promise<Company> {
    return this.prisma.company.delete({
      where,
    });
  }

  /**
   * Busca keyValue (id e name) de todas as companies
   */
  async getKeyValue() {
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
