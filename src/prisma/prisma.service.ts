import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from 'prisma/generated/client';
import { RequestContext } from 'src/common/context/request-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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

              const currentModel = paramsOperation.model;
              const modelsWithoutCompany = ['Company', 'Resource'];

              const insertAuditableFields = !modelsWithoutCompany.includes(currentModel);

              if (tpOperation === 'findMany' || tpOperation === 'findFirst' || tpOperation === 'findUnique') {
                if (insertAuditableFields) {
                  paramsOperation.args.where = {
                    ...paramsOperation.args.where,
                    company_id: obCurrentUser?.company_id,
                  };
                }
              } else if (tpOperation === 'create') {
                const data: any = { ...paramsOperation.args.data };

                if (insertAuditableFields && obCurrentUser?.company_id) {
                  data.company = { connect: { id: obCurrentUser.company_id } };
                }

                data.created_at = dtNow;
                data.updated_at = dtNow;

                if (insertAuditableFields) {
                  data.createdBy = { connect: { id: obCurrentUser?.id } };
                  data.updatedBy = { connect: { id: obCurrentUser?.id } };
                }

                paramsOperation.args.data = data;
              } else if (tpOperation === 'update' || tpOperation === 'updateMany') {
                paramsOperation.args.data = {
                  ...paramsOperation.args.data,
                  updated_at: dtNow,
                  ...(insertAuditableFields && {
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
