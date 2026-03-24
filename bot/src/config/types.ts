export type DatabaseDrivers = 'postgres';

export type ConfigOptions = {
  DB_DRIVER: DatabaseDrivers;
  DB_USER_LOGIN: string;
  DB_USER_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  BOT_SECRET_TOKEN: string;
  TG_ADMIN_ID: string;
  PRIVATE_JWT_KEY: string;
  USE_PROXY?: boolean;
  PROXY_URL?: string;
  PROXY_HOSTNAME?: string;
  PROXY_PORT?: string;
  PROXY_USERNAME?: string;
  PROXY_PASSWORD?: string;
};

export type EnvVariables = Omit<ConfigOptions, 'DB_PORT'> & { DB_PORT: string };
