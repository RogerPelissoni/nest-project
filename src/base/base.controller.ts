import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
export class BaseController {
  constructor() {}
}
