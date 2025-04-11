import { Request } from 'express';

export type GitWebhookRequestPayload = {
  service: string;
  eventType: string;
  eventPayload: any;
} | null;

/**
 * Сервис, который хранит информацию об инстанцах сервисов гит
 * Он по ключу названия сервиса должен отдавать инстанс сервиса уже по обработке
 * События и body запроса
 */

export interface GitNotificationServiceRepository {
  parseGitNotificationService(serviceType: string): void;
}

export interface NotificationMaker {
  composeNotification(webhookPayload: GitWebhookRequestPayload): void;
}

export interface Mediator {
  notify(eventType: string, eventPayload: any): void;
}
