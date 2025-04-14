import { RemoteGitServices } from '../constants/enums';

export type GitWebhookServiceType<T> = {
  service: RemoteGitServices;
  eventType: string;
  eventPayload: T;
} | null;

export type GitWebhookServiceName = {
  name: string;
} | null;

export interface GitRemoteHandler<T> {
  readonly eventType: string;
  parseRecipients(serviceType: GitWebhookServiceType<T>): string[] | null;
  composeNotification(serviceType: GitWebhookServiceType<T>): string;
}

export interface GitRemoteHandlerConstructor {
  new (): GitRemoteHandler<any>;
}
