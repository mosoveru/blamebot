import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { GitProviders } from '@constants';

export interface ExternalGitSystemDataFetcher {
  fetchUserData(info: RequiredInfo): Promise<ApiResponse>;
}

export interface DatabaseService {
  saveTgUser(info: TelegramUserInfo): Promise<void>;
  getTgUserInfo(id: string): Promise<TelegramUserInfo | null>;
  saveInstanceUser(info: RemoteUserData): Promise<void>;
  getInstanceUserInfo(instanceUserId: string, instanceId: string): Promise<RemoteUserData | null>;

  saveInstance(info: RemoteServiceInfo): Promise<void>;
  getInstanceInfo(instanceId: string): Promise<RemoteServiceInfo | null>;
  findInstanceInfoByUrl(url: string): Promise<RemoteServiceInfo | null>;
}

export interface GitApiHandler {
  readonly meantFor: GitProviders;
  requestUserData(origin: string, token: string): Promise<ApiResponse>;
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

type RequiredInfo = {
  origin: string;
  provider: GitProviders;
  token: string;
};

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

type ParserFlavor<C extends Context> = C & {
  fetcher: ExternalGitSystemDataFetcher;
};

export type BlamebotContext = ParserFlavor<DatabaseServiceFlavor<ConversationFlavor<Context>>>;

export type ConversationInsideContext = ParserFlavor<DatabaseServiceFlavor<Context>>;

export type BlamebotConversation = Conversation<BlamebotContext, ConversationInsideContext>;

type SuccessfulResponse = {
  ok: true;
  instanceUserId: string;
  username: string;
  email: string;
  pathname: string;
};

type FailedResponse = {
  ok: false;
  cause: string;
  message: string;
};

export type ApiResponse = SuccessfulResponse | FailedResponse;
