import { Injectable } from '@nestjs/common';
import { GitRemoteHandlersRepository } from '../../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { SubscriberService } from '../subscriber/subscriber.service';
import { TelegramService } from '../telegram/telegram.service';
import { ServiceName, ServiceType } from '../../types';

@Injectable()
export class NotificationMediatorService {
  constructor(
    private readonly handlersRepository: GitRemoteHandlersRepository,
    private readonly chatService: SubscriberService,
    private readonly telegramService: TelegramService,
  ) {}

  async notify(serviceName: ServiceName, serviceType: ServiceType<any>) {
    console.log(JSON.stringify(serviceName, null, 2), JSON.stringify(serviceType, null, 2));
    const handler = this.handlersRepository.getGitRemoteHandler(serviceType.service, serviceType.eventType);
    if (handler) {
      const recipients = handler.parseRecipients(serviceType);
      const notification = handler.composeNotification(serviceType);
      console.log(notification);
      console.log(recipients);
      for (const recipient of recipients) {
        const subscriber = await this.chatService.findChat(serviceName.name, recipient);
        if (subscriber) {
          const chat_id = subscriber.chat_id;
          await this.telegramService.sendNotification(notification, chat_id);
        }
      }
    } else {
      console.log("Handler isn't existing");
    }
  }
}
