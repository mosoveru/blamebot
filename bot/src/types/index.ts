import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

export interface GitRemoteApiHandler {
  setAccessToken(token: string): void;
  setOrigin(origin: string): void;
  fetchUserData(): RemoteUserData;
}

export type RemoteUserData = {
  instanceUserId: string;
  instanceId: string;
  telegramUserId: string;
  username: string;
  email: string;
  pathname: string;
};

export type TelegramUserInfo = {
  telegramUserId: string;
  username: string;
  name: string;
};

export type RemoteServiceInfo = {
  instanceId: string;
  instanceName: string;
  gitProvider: string;
  serviceBaseUrl: string;
};

export interface DatabaseService {
  saveTgUser(info: TelegramUserInfo): Promise<void>;
  getTgUserInfo(id: string): Promise<TelegramUserInfo | null>;
  saveInstanceUser(info: RemoteUserData): Promise<void>;
  getInstanceUserInfo(instanceUserId: string, instanceId: string): Promise<RemoteUserData | null>;

  saveInstance(info: RemoteServiceInfo): Promise<void>;
  getInstanceInfo(instanceId: string): Promise<RemoteServiceInfo | null>;
  findInstanceInfoByUrl(url: string): Promise<RemoteServiceInfo | null>;
}

export type DatabaseDrivers = 'postgres';

export type ConfigOptions = {
  DB_DRIVER: DatabaseDrivers;
  DB_USER_LOGIN: string;
  DB_USER_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  BOT_SECRET_TOKEN: string;
};

type DatabaseServiceFlavor<C extends Context> = C & {
  dbService: DatabaseService;
};

export type BlamebotContext = DatabaseServiceFlavor<ConversationFlavor<Context>>;

export type ConversationInsideContext = DatabaseServiceFlavor<Context>;

export type BlamebotConversation = Conversation<BlamebotContext, ConversationInsideContext>;
