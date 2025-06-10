import 'dotenv/config';
import { ConfigOptions, DatabaseDrivers, EnvVariables } from './types';
import { BadConfigurationException } from '@exceptions';

export default (): ConfigOptions => {
  if (checkEnvVariablesIsDefined(process.env)) {
    return {
      DB_DRIVER: process.env.DB_DRIVER,
      DB_HOST: process.env.DB_HOST,
      DB_USER_LOGIN: process.env.DB_USER_LOGIN,
      DB_USER_PASSWORD: process.env.DB_USER_PASSWORD,
      DB_PORT: Number(process.env.DB_PORT),
      DB_NAME: process.env.DB_NAME,
      BOT_SECRET_TOKEN: process.env.BOT_SECRET_TOKEN,
      TG_ADMIN_ID: process.env.TG_ADMIN_ID,
      PRIVATE_JWT_KEY: process.env.PRIVATE_JWT_KEY,
    };
  } else {
    throw new BadConfigurationException();
  }
};

const checkDatabaseDriver = (driver?: string): driver is DatabaseDrivers => {
  return driver === 'postgres';
};

const checkEnvVariablesIsDefined = (env: NodeJS.ProcessEnv): env is EnvVariables => {
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
