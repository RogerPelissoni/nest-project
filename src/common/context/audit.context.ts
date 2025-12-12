import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContextData {
  auditEnabled: boolean;
}

export class AuditContext {
  private static storage = new AsyncLocalStorage<AuditContextData>();

  static run(data: AuditContextData, callback: () => Promise<any>) {
    return this.storage.run(data, async () => {
      return await callback();
    });
  }

  static get(): boolean {
    return this.storage.getStore()?.auditEnabled ?? true;
  }
}
