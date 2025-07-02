import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { GitProviders } from '@constants';
import { PossibleCauses } from '@constants';
import { InstanceManagerFlavor } from '@services';

export interface ExternalGitSystemDataFetcher {
  fetchUserData(info: RequiredInfo): Promise<ApiResponse>;
}

export interface DatabaseService {
  saveTgUser(info: TelegramUserInfo): Promise<void>;
  getTgUserInfo(id: string): Promise<TelegramUserInfo | null>;
  isTgUserAdmin(id: string): Promise<boolean>;

  saveInstanceUser(info: InstanceUserData): Promise<void>;
  getInstanceUserInfo(instanceUserId: string, instanceId: string): Promise<InstanceUserData | null>;

  saveInstance(info: Omit<RemoteServiceInfo, 'instanceId'>): Promise<void>;
  getInstanceInfo(instanceId: string): Promise<RemoteServiceInfo | null>;
  findInstanceInfoByUrl(url: string): Promise<RemoteServiceInfo | null>;

  unsubscribeUser(uuid: string): Promise<void>;
  subscribeUser(uuid: string): Promise<void>;
}

export interface GitApiHandler {
  readonly meantFor: GitProviders;
  requestUserData(origin: string, token: string): Promise<ApiResponse>;
}

export interface LinkingService {
  linkClient(data: LinkClientRequiredData): Promise<LinkingServiceResponse>;
}

export type LinkingServiceResponse = LinkingServiceOKResponse | LinkingServiceErrorResponse;

type LinkingServiceOKResponse = {
  ok: true;
};

type LinkingServiceErrorResponse = {
  ok: false;
  cause: PossibleCauses;
};

export type RepliesForPossibleErrors<K extends keyof Record<string, string>> = {
  [Key in K]: string;
};

export type LinkClientRequiredData = {
  instanceUserId: string;
  instanceUsername: string;
  instanceUrl: string;
  email: string;
  pathname: string;
  telegramUserId?: string;
  telegramUsername?: string;
  telegramName?: string;
};

export type InstanceUserData = {
  instanceUserId: string;
  instanceId: string;
  telegramUserId: string;
  username: string;
  email: string;
  pathname: string;
};

export type TelegramUserInfo = {
  telegramUserId: string;
  username?: string;
  name?: string;
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

type DatabaseServiceFlavor<C extends Context> = C & {
  dbService: DatabaseService;
};

type ParserFlavor<C extends Context> = C & {
  fetcher: ExternalGitSystemDataFetcher;
};

type LinkerFlavor<C extends Context> = C & {
  linker: LinkingService;
};

export type BlamebotContext = InstanceManagerFlavor<
  LinkerFlavor<ParserFlavor<DatabaseServiceFlavor<ConversationFlavor<Context>>>>
>;

export type ConversationInsideContext = InstanceManagerFlavor<
  LinkerFlavor<ParserFlavor<DatabaseServiceFlavor<Context>>>
>;

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
  cause: PossibleCauses;
};

export type ApiResponse = SuccessfulResponse | FailedResponse;

export interface PgError extends Error {
  length: number;
  severity: string;
  code: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file: string;
  line: string;
  routine: string;
}
