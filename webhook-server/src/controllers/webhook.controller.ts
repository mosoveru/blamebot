import { Controller, Post } from '@nestjs/common';
import { GitWebhookServiceName, GitWebhookServiceType } from '../types';
import { ServiceType } from '../decorators/service-type';
import { ServiceName } from '../decorators/service-name';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';

@Controller()
export class WebhookController {
  constructor(private readonly mediator: NotificationMediatorService) {}

  @Post()
  async notifyUsers(
    @ServiceType() serviceType: GitWebhookServiceType<any>,
    @ServiceName() serviceName: GitWebhookServiceName,
  ) {
    if (serviceType && serviceName) {
      await this.mediator.notify(serviceName, serviceType);
    }
  }
}
