import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Service } from '../entities/service.entity';
import { TelegramUser } from '../entities/telegram-user.service';
import { ServiceUser } from '../entities/service-user.entity';
import Config from '../config';

export const AppDataSource = new DataSource({
  type: Config.get('DB_DRIVER'),
  host: Config.get('DB_HOST'),
  port: Config.get('DB_PORT'),
  username: Config.get('DB_USER_LOGIN'),
  password: Config.get('DB_USER_PASSWORD'),
  database: Config.get('DB_NAME'),
  synchronize: false,
  entities: [Service, TelegramUser, ServiceUser],
});
