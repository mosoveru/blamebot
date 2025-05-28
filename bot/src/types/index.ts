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
  getTgUserInfo(id: string): Promise<TelegramUserInfo>;
  saveRemoteUser(info: RemoteUserData): Promise<void>;
  getRemoteUserInfo(serviceUserId: string, serviceId: string): Promise<RemoteUserData>;
  saveRemoteServiceInfo(info: RemoteServiceInfo): Promise<void>;
  getRemoteServiceInfo(serviceId: string): Promise<RemoteServiceInfo>;
  findRemoteServiceInfo(url: string): Promise<RemoteServiceInfo>;
}
