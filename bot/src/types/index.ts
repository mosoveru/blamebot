export interface GitRemoteApiHandler {
  setAccessToken(token: string): void;
  setOrigin(origin: string): void;
  fetchUserData(): RemoteUserData;
}

export type RemoteUserData = {
  username: string;
  email: string;
  profileUrl: string;
  serviceUserId: string;
};
