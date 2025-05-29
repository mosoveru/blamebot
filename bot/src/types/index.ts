import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

export interface GitRemoteApiHandler {
  setAccessToken(token: string): void;
  setOrigin(origin: string): void;
  fetchUserData(): RemoteUserData;
}

export type RemoteUserData = {
  serviceUserId: string;
  serviceId: string;
  telegramUserId: string;
  username: string;
  email: string;
  profileUrl: string;
};

export type TelegramUserInfo = {
  telegramUserId: string;
  username: string;
  name: string;
};

export type RemoteServiceInfo = {
  serviceId: string;
  remoteName: string;
  gitProvider: string;
  serviceUrl: string;
};

export interface DatabaseService {
  saveTgUser(info: TelegramUserInfo): Promise<void>;
  getTgUserInfo(id: string): Promise<TelegramUserInfo | null>;
  saveRemoteUser(info: RemoteUserData): Promise<void>;
  getRemoteUserInfo(serviceUserId: string, serviceId: string): Promise<RemoteUserData | null>;

  saveRemoteServiceInfo(info: RemoteServiceInfo): Promise<void>;
  getRemoteServiceInfo(serviceId: string): Promise<RemoteServiceInfo | null>;
  findRemoteServiceInfoByURL(url: string): Promise<RemoteServiceInfo | null>;
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
