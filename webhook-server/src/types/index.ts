import { IncomingHttpHeaders } from 'http';

type GitServiceAndEventType = {
  service: string;
  eventType: string;
};

export interface GitServiceTypeParser {
  parseGitServiceAndEventType(headers: IncomingHttpHeaders): GitServiceAndEventType | null;
}

/**
 * Сервис, который хранит информацию об инстанцах сервисов гит
 * Он по ключу названия сервиса должен отдавать инстанс сервиса уже по обработке
 * События и body запроса
 */

export interface GitNotificationServiceRepository {
  parseGitNotificationService(serviceType: string): GitNotificationService;
}

export interface GitNotificationService {
  handleGitEvent(eventType: string, eventPayload: any): void;
}
