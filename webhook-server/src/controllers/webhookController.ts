import { Controller, Logger, Post } from '@nestjs/common';
import { GitWebhookServiceName, GitWebhookServiceType } from '../types';
import { ServiceType } from '../decorators/service-type';
import { ServiceName } from '../decorators/service-name';
import { GitRemoteHandlersRepository } from '../repository/git-remote-handlers-repository/git-remote-handlers-repository';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly handlersRepository: GitRemoteHandlersRepository) {}

  @Post()
  printPayload(
    @ServiceType() serviceType: GitWebhookServiceType<any>,
    @ServiceName() serviceName: GitWebhookServiceName,
  ): void {
    if (serviceType && serviceName) {
      console.log(JSON.stringify(serviceName, null, 2), JSON.stringify(serviceType, null, 2));
      const handler = this.handlersRepository.getGitRemoteHandler(serviceType.service, serviceType.eventType);
      if (handler) {
        console.log(handler.composeNotification(serviceType));
        console.log(handler.parseRecipients(serviceType));
      } else {
        console.log("Handler isn't existing");
      }
    }
  }
}
