import { Controller, Post, Body } from '@nestjs/common';
import { RetrieveMultipleDto } from '../resource/dto/retrieve-multiple.dto';
import { RetrieveResponse, RetrieveService } from './retrieve.service';

@Controller('retrieve')
export class RetrieveController {
  constructor(private retrieveService: RetrieveService) {}

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
  ): Promise<RetrieveResponse> {
    return this.retrieveService.getMultipleResources(dto.resources);
  }
}
