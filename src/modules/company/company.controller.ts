import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CoreController } from 'src/core/core.controller';
import { Resource } from 'src/common/decorators/resource.decorator';
import { Permission } from 'src/common/decorators/permission.decorator';

@Resource('company')
@Controller('company')
export class CompanyController extends CoreController<CompanyService> {
  constructor(private readonly companyService: CompanyService) {
    super(companyService);
  }

  @Post()
  @Permission('create')
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Patch(':id')
  @Permission('update')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(Number(id), dto);
  }
}
