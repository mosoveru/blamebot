/**
 * @file Data Source file for typeorm migrations
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const entitiesPath = 'src/models';
const migrationsPath = 'migrations/migration-classes';

export const AppDataSource = new DataSource({
  type: process.env.DB_DRIVER as 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_LOGIN,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', entitiesPath, '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', migrationsPath, '*{.ts,.js}')],
  synchronize: false,
});
