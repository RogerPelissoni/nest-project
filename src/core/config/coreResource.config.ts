export interface ResourceConfigItem {
  name: string;
  signature: string;
}

export abstract class CoreResourceConfig {
  protected static resources(): ResourceConfigItem[] {
    return [];
  }

  protected static defaultResources(): ResourceConfigItem[] {
    return [
      { name: 'Empresas', signature: 'company' },
      { name: 'Pessoa', signature: 'person' },
      { name: 'Perfil', signature: 'profile' },
      { name: 'Usuário', signature: 'user' },
    ];
  }

  static get(): ResourceConfigItem[] {
    return [...this.resources(), ...this.defaultResources()];
  }
}
