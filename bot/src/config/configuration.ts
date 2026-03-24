import 'dotenv/config';
import { ConfigOptions, DatabaseDrivers } from './types';
import { BadConfigurationException } from '@exceptions';

const checkDatabaseDriver = (driver?: string): driver is DatabaseDrivers => {
  return driver === 'postgres';
};

const checkEnvVariablesIsDefined = (env: NodeJS.ProcessEnv): boolean => {
  const isDbHostDefined = !!env.DB_HOST && !!env.DB_PORT && !!env.DB_NAME;
  const isDbCredentialsDefined = !!env.DB_USER_LOGIN && !!env.DB_USER_PASSWORD;
  const isTgInfoDefined = !!env.BOT_SECRET_TOKEN && !!env.TG_ADMIN_ID;
  const isPrivateJWTKeyDefined = !!env.PRIVATE_JWT_KEY;
  return (
    checkDatabaseDriver(env.DB_DRIVER) &&
    isDbHostDefined &&
    isDbCredentialsDefined &&
    isTgInfoDefined &&
    isPrivateJWTKeyDefined
  );
};

const buildProxyConnectionURL = () => {
  if (!process.env.USE_PROXY) return;
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  const hostname = process.env.PROXY_HOSTNAME;
  const port = process.env.PROXY_PORT;
  return [
    'socks',
    '://',
    username && encodeURIComponent(username),
    password && encodeURIComponent(password),
    username && '@',
    hostname,
    port && ':' + port,
  ]
    .filter(Boolean)
    .join('');
};

export default (): ConfigOptions => {
  if (checkEnvVariablesIsDefined(process.env)) {
    return {
      DB_DRIVER: process.env.DB_DRIVER as NonNullable<DatabaseDrivers>,
      DB_HOST: process.env.DB_HOST!,
      DB_USER_LOGIN: process.env.DB_USER_LOGIN!,
      DB_USER_PASSWORD: process.env.DB_USER_PASSWORD!,
      DB_PORT: Number(process.env.DB_PORT),
      DB_NAME: process.env.DB_NAME!,
      BOT_SECRET_TOKEN: process.env.BOT_SECRET_TOKEN!,
      TG_ADMIN_ID: process.env.TG_ADMIN_ID!,
      PRIVATE_JWT_KEY: process.env.PRIVATE_JWT_KEY!,
      USE_PROXY: Boolean(process.env.USE_PROXY),
      PROXY_URL: buildProxyConnectionURL(),
      PROXY_HOSTNAME: process.env.PROXY_HOSTNAME,
      PROXY_PORT: process.env.PROXY_PORT,
      PROXY_USERNAME: process.env.PROXY_USERNAME,
      PROXY_PASSWORD: process.env.PROXY_PASSWORD,
    };
  } else {
    throw new BadConfigurationException();
  }
};
