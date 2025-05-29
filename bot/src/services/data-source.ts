import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Service } from '../entities/service.entity';
import { TelegramUser } from '../entities/telegram-user.service';
import { ServiceUser } from '../entities/service-user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'git_event_db_admin',
  password: '12345678',
  database: 'git_event_subscribers',
  synchronize: false,
  entities: [Service, TelegramUser, ServiceUser],
});

// TODO: move hardcoded values to a config service
