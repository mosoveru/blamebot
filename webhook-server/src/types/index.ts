export type GitWebhookServiceType = {
  service: string;
  eventType: string;
  eventPayload: any;
} | null;

export type GitWebhookServiceName = {
  name: string;
} | null;

export interface NotificationMaker {
  composeNotification(webhookPayload: GitWebhookServiceType): void;
}

export interface Mediator {
  notify(eventType: string, eventPayload: any): void;
}
