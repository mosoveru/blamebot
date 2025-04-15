import { Controller, Logger, Post } from '@nestjs/common';
import { GitWebhookServiceName, GitWebhookServiceType } from '../types';
import { ServiceType } from '../decorators/service-type';
import { ServiceName } from '../decorators/service-name';
import { GitRemoteHandlersRepository } from '../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { ChatService } from '../services/chat/chat.service';
import { TelegramService } from '../services/telegram/telegram.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly handlersRepository: GitRemoteHandlersRepository,
    private readonly chatService: ChatService,
    private readonly telegramService: TelegramService,
  ) {}

  @Post()
  async printPayload(
    @ServiceType() serviceType: GitWebhookServiceType<any>,
    @ServiceName() serviceName: GitWebhookServiceName,
  ) {
    if (serviceType && serviceName) {
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
            const chat_id = subscriber?.chat_id;
            await this.telegramService.sendNotification(notification, chat_id);
          }
        }
      } else {
        console.log("Handler isn't existing");
      }
    }
  }
}
