import 'dotenv/config';
import { BadConfigurationException } from '@exceptions';
import { ConfigOptions, DatabaseDrivers } from '@types';
import * as process from 'node:process';

type EnvVariables = Omit<ConfigOptions, 'DB_PORT'> & { DB_PORT: string };

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
  return checkDatabaseDriver(env.DB_DRIVER) && isDbHostDefined && isDbCredentialsDefined && isTgInfoDefined;
};
