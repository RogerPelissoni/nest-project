import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from 'prisma/generated/client';

// TODO: Isso deve ser retornado da 'sessão' do usuário
const COMPANY_ID = 1;
const USER_ID = 1;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
    });

    super({ adapter });

    Object.assign(
      this,
      this.$extends({
        query: {
          $allModels: {
            async $allOperations(paramsOperation) {
              const tpOperation = paramsOperation.operation;
              const dtNow = new Date();

              const modelInfo = this._runtimeData?.datamodel?.models?.find(
                (m) => m.name === paramsOperation.model,
              );
              const modelFields = modelInfo?.fields?.map((f) => f.name) ?? [];
              const hasField = (field: string) => modelFields.includes(field);

              if (
                tpOperation === 'findMany' ||
                tpOperation === 'findFirst' ||
                tpOperation === 'findUnique'
              ) {
                if (hasField('company_id')) {
                  paramsOperation.args.where = {
                    ...paramsOperation.args.where,
                    company_id: COMPANY_ID,
                  };
                }
              }

              if (tpOperation === 'create') {
                paramsOperation.args.data = {
                  ...paramsOperation.args.data,
                  ...(hasField('company_id') && { company_id: COMPANY_ID }),
                  created_at: dtNow,
                  updated_at: dtNow,
                  ...(hasField('created_by') && { created_by: USER_ID }),
                  ...(hasField('updated_by') && { updated_by: USER_ID }),
                };
              } else if (
                tpOperation === 'update' ||
                tpOperation === 'updateMany'
              ) {
                paramsOperation.args.data = {
                  ...paramsOperation.args.data,
                  updated_at: dtNow,
                  ...(hasField('updated_by') && { updated_by: USER_ID }),
                };
              }

              return paramsOperation.query(paramsOperation.args);
            },
          },
        },
      }),
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
