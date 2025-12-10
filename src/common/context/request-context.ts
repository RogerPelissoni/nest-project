import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  user?: {
    id: number;
    company_id: number;
    profile_id: number;
  };
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextData>();

  static run(data: RequestContextData, callback: () => void) {
    return this.storage.run(data, callback);
  }

  static get(): RequestContextData | undefined {
    return this.storage.getStore();
  }
}
