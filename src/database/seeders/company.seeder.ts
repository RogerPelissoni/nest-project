import { Injectable } from '@nestjs/common';
import { CompanyService } from 'src/modules/company/company.service';
import DTO from 'src/core/utils/dto.util';

@Injectable()
export class CompanySeeder {
  constructor(private readonly companyService: CompanyService) {}

  async run() {
    await this.companyService.create(
      DTO.normalize({
        id: 1,
        name: 'Empresa Teste',
        tp_company: 'Mecânica',
        ds_email: 'mecanica@teste.com',
        ds_phone: '5599999999',
        ds_address: 'Endereço Teste',
      }),
    );
  }
}
