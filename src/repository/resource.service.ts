import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface KeyValueResult {
  id: string | number;
  name: string;
}

export interface ResourceRequest {
  resource: 'company' | 'profile' | 'user' | 'person';
  keyValue?: boolean;
  alias?: string;
}

export interface ResourceResponse {
  [key: string]: any;
}

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca dados de um resource específico
   * Se keyValue for true, retorna [{chave: valor}]
   * Se keyValue for false, retorna todos os campos
   */
  async getResourceData(
    resource: string,
    keyValue: boolean = true,
  ): Promise<any[]> {
    const allowedResources = ['company', 'profile', 'user', 'person'];

    if (!allowedResources.includes(resource)) {
      throw new BadRequestException(`Resource '${resource}' not found`);
    }

    try {
      if (keyValue) {
        // Retorna [{chave: valor}]
        const data = await this.prisma[resource].findMany({
          select: {
            id: true,
            name: true,
          },
        });

        return data.map((item) => ({
          [item.id]: item.name,
        }));
      } else {
        // Retorna todos os campos
        const data = await this.prisma[resource].findMany();
        return data;
      }
    } catch (error) {
      throw new BadRequestException(
        `Error fetching ${resource}: ${error.message}`,
      );
    }
  }

  /**
   * Busca múltiplos resources em uma única chamada
   * Suporta tanto keyValue quanto dados completos
   */
  async getMultipleResources(
    requests: ResourceRequest[],
  ): Promise<ResourceResponse> {
    const response: ResourceResponse = {};

    for (const request of requests) {
      const alias = request.alias || request.resource;
      const keyValue = request.keyValue !== false; // default true

      response[alias] = await this.getResourceData(request.resource, keyValue);
    }

    return response;
  }
}
