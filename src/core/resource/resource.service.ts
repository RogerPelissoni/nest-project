import { Injectable, Logger } from '@nestjs/common';
import { ResourceConfig } from 'src/config/resource.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);
  private syncing = false; // Lock simples para evitar execuções simultâneas

  constructor(private readonly prisma: PrismaService) {}

  async sync() {
    if (this.syncing) {
      this.logger.log('Sync already in progress, skipping...');
      return;
    }

    this.syncing = true;

    try {
      const resources = ResourceConfig.get();

      await this.prisma.$transaction(async (transaction) => {
        for (const item of resources) {
          await transaction.resource.upsert({
            where: { signature: item.signature },
            create: { name: item.name, signature: item.signature },
            update: { name: item.name },
          });
        }

        // Remove unused resource
        const signatures = resources.map((r) => r.signature);
        await transaction.resource.deleteMany({
          where: { signature: { notIn: signatures } },
        });
      });

      this.logger.log('Resource sync completed.');
    } catch (err) {
      this.logger.error('Error during resource sync', err);
      throw err;
    } finally {
      this.syncing = false;
    }
  }
}
