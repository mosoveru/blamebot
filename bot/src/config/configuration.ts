import 'dotenv/config';
import { BadConfigurationException } from '../exceptions';
import { ConfigOptions, DatabaseDrivers } from '../types';

export default (): ConfigOptions => {
  const botSecretToken = process.env.BOT_SECRET_TOKEN;
  const databaseDriver = process.env.DB_DRIVER;
  if (botSecretToken && checkDatabaseDriver(databaseDriver)) {
    return {
      DB_DRIVER: databaseDriver,
      DB_HOST: process.env.DB_HOST ?? 'localhost',
      DB_USER_LOGIN: process.env.DB_USER_LOGIN ?? 'git_event_db_admin',
      DB_USER_PASSWORD: process.env.DB_USER_PASSWORD ?? '12345678',
      DB_PORT: Number(process.env.DB_PORT ?? 5432),
      DB_NAME: process.env.DB_NAME ?? 'git_event_subscribers',
      BOT_SECRET_TOKEN: botSecretToken,
    };
  } else {
    throw new BadConfigurationException();
  }
};

const checkDatabaseDriver = (driver?: string): driver is DatabaseDrivers => {
  switch (driver) {
    case 'postgres': {
      return true;
    }
    default: {
      return false;
    }
  }
};
