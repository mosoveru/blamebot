// Data Source File for typeorm migrations

import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: process.env.DB_DRIVER as 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_LOGIN,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../src/models/*.entity.{ts,js}'],
  migrations: [__dirname + './*.{ts,js}'],
  synchronize: false,
});
