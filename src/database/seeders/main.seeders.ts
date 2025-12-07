import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { UserSeeder } from './user.seeder';
import { ResourceService } from 'src/core/resource/resource.service';
import { CompanySeeder } from './company.seeder';
import { ProfileSeeder } from './profile.seeder';
import { PrismaService } from 'src/prisma/prisma.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);

  try {
    console.log('Running seeders...');

    const prisma = appContext.get(PrismaService);
    await resetDatabase(prisma);

    const companySeeder = appContext.get(CompanySeeder);
    await companySeeder.run();

    const profileSeeder = appContext.get(ProfileSeeder);
    await profileSeeder.run();

    const userSeeder = appContext.get(UserSeeder);
    await userSeeder.run();

    const resourceSeeder = appContext.get(ResourceService);
    await resourceSeeder.sync();

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
    }

    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  });

  await connection;

  console.log('Database cleaned.');
}

bootstrap();
