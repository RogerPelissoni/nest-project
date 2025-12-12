import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { UserSeeder } from './user.seeder';
import { ResourceService } from 'src/core/resource/resource.service';
import { CompanySeeder } from './company.seeder';
import { ProfileSeeder } from './profile.seeder';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestContext, RequestContextData } from 'src/common/context/request-context';
import { AuditContext } from 'src/common/context/audit.context';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);

  try {
    console.log('Running seeders...');

    const prisma = appContext.get(PrismaService);
    await resetDatabase(prisma);

    // Instâncias dos seeders
    const companySeeder = appContext.get(CompanySeeder);
    const profileSeeder = appContext.get(ProfileSeeder);
    const userSeeder = appContext.get(UserSeeder);
    const resourceService = appContext.get(ResourceService);

    const defaultContext: RequestContextData = {
      user: {
        id: 1,
        company_id: 1,
        profile_id: 1,
      },
    };

    await RequestContext.run(defaultContext, async () => {
      await companySeeder.run();
      await resourceService.sync();

      await AuditContext.run({ auditEnabled: false }, async () => {
        await userSeeder.run();
      });

      await AuditContext.run({ auditEnabled: true }, async () => {
        await profileSeeder.run();

        await prisma.user.update({
          where: { id: 1 },
          data: { profile_id: 1, created_by: 1, updated_by: 1 },
        });
      });
    });

    console.log('Seeders executed successfully.');
  } catch (err) {
    console.error('Error running seeders:', err);
  } finally {
    await appContext.close();
  }
}

async function resetDatabase(prisma: PrismaService) {
  console.log('Auto cleaning database...');

  const tables = await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
    SELECT TABLE_NAME
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      AND TABLE_NAME NOT IN ('_prisma_migrations');
  `;

  console.log('Tables found:', tables.map((t) => t.TABLE_NAME).join(', '));

  const connection = prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`Clearing table: ${tableName}`);

      await tx.$executeRawUnsafe(`DELETE FROM \`${tableName}\``);
      await tx.$executeRawUnsafe(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`);
    }

    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  });

  await connection;

  console.log('Database cleaned.');
}

bootstrap();
