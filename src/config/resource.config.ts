import { CoreResourceConfig } from 'src/core/config/coreResource.config';

export class ResourceConfig extends CoreResourceConfig {
  protected static resources() {
    return [
      // { name: 'Clientes', signature: 'client' },
      // { name: 'Movimentações de Conta', signature: 'accountmovement' },
      // { name: 'Contas a Pagar', signature: 'accountpayable' },
      // { name: 'Contas a Receber', signature: 'accountreceivable' },
      // { name: 'Eventos de Calendário', signature: 'event' },
      // { name: 'Profissionais', signature: 'professional' },
    ];
  }
}
