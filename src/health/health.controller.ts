import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
