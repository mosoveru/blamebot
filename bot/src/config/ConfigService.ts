import { ConfigOptions } from '@types';

class ConfigService {
  private readonly configuration: ConfigOptions;

  private constructor(configuration: ConfigOptions) {
    this.configuration = configuration;
  }

  static create(config: ConfigOptions): ConfigService {
    return new ConfigService(config);
  }

  get<C extends keyof ConfigOptions>(option: C): ConfigOptions[C] {
    return this.configuration[option];
  }

  set<C extends keyof ConfigOptions>(option: C, value: ConfigOptions[C]) {
    this.configuration[option] = value;
  }
}

export default ConfigService;
