import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface KeyValueResult {
  id: string | number;
  name: string;
}

export interface RetrieveRequest {
  resource: 'company' | 'profile' | 'user' | 'person';
  keyValue?: boolean;
  alias?: string;
}

export interface RetrieveResponse {
  [key: string]: any;
}

@Injectable()
export class RetrieveService {
  constructor(private prisma: PrismaService) {}

  async getResourceData(resource: string, keyValue: boolean = true): Promise<any> {
    const allowedResources = ['company', 'profile', 'user', 'person'];

    if (!allowedResources.includes(resource)) {
      throw new BadRequestException(`Resource '${resource}' not found`);
    }

    try {
      if (keyValue) {
        // Retorna um objeto no formato { id: name, ... }
        const data = await (this.prisma as any)[resource].findMany({
          select: {
            id: true,
            name: true,
          },
        });

        const result: Record<string | number, any> = {};
        for (const item of data) {
          // Usa o id como chave (converte para string internamente quando necessário)
          result[item.id] = item.name;
        }

        return result;
      } else {
        // Retorna todos os campos
        const data = await (this.prisma as any)[resource].findMany();
        return data;
      }
    } catch (error) {
      throw new BadRequestException(`Error fetching ${resource}: ${error.message}`);
    }
  }

  async getMultipleResources(requests: RetrieveRequest[]): Promise<RetrieveResponse> {
    const response: RetrieveResponse = {};

    for (const request of requests) {
      const alias = request.alias || request.resource;
      const keyValue = request.keyValue !== false; // default true

      response[alias] = await this.getResourceData(request.resource, keyValue);
    }

    return response;
  }
}
