import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from 'prisma/generated/client';
import { RequestContext } from 'src/common/context/request-context';

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

              const requestContext = RequestContext.get();
              const obCurrentUser = requestContext?.user;

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
                    company_id: obCurrentUser?.company_id,
                  };
                }
              } else if (tpOperation === 'create') {
                const data: any = { ...paramsOperation.args.data };

                if (hasField('company_id') && obCurrentUser?.company_id) {
                  data.company_id = obCurrentUser.company_id;
                }

                data.created_at = dtNow;
                data.updated_at = dtNow;

                if (hasField('created_by')) data.created_by = obCurrentUser?.id;
                if (hasField('updated_by')) data.updated_by = obCurrentUser?.id;

                paramsOperation.args.data = data;
              } else if (
                tpOperation === 'update' ||
                tpOperation === 'updateMany'
              ) {
                paramsOperation.args.data = {
                  ...paramsOperation.args.data,
                  updated_at: dtNow,
                  ...(hasField('updated_by') && {
                    updated_by: obCurrentUser?.id,
                  }),
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
