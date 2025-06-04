/**
 * @file Data Source file for typeorm migrations
 * Почему-то, TypeORM не может использовать путь в поле entities для поиска сущностей.
 * Пришлось прокидывать вручную, чтобы миграции могли быть сгенерированы с помощью migration:generate
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as migrations from './migration-classes';
import * as entities from '../src/models';

export const AppDataSource = new DataSource({
  type: process.env.DB_DRIVER as 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_LOGIN,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [...Object.values(entities)],
  migrations: [...Object.values(migrations)],
  synchronize: false,
});
