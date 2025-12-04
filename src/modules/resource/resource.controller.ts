import { Controller, Post, Body } from '@nestjs/common';
import { RetrieveMultipleDto } from './dto/retrieve-multiple.dto';
import { ResourceResponse, ResourceService } from './resource.service';

@Controller('resources')
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  /**
   * Busca múltiplos resources em uma única chamada
   * POST /resources/retrieve-multiple
   *
   * keyValue: true (default) = retorna apenas id e name
   * keyValue: false = retorna todos os campos do resource
   */
  @Post('retrieve-multiple')
  async retrieveMultiple(
    @Body() dto: RetrieveMultipleDto,
  ): Promise<ResourceResponse> {
    return this.resourceService.getMultipleResources(dto.resources);
  }
}
