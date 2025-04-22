import { Controller, Post } from '@nestjs/common';
import { WebhookServiceName, WebhookEventPayload } from '../types';
import { EventPayload } from '../decorators/event-payload';
import { ServiceName } from '../decorators/service-name';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';

@Controller()
export class WebhookController {
  constructor(private readonly mediator: NotificationMediatorService) {}

  @Post()
  async handleWebhookEvent(
    @EventPayload() serviceType: WebhookEventPayload<any>,
    @ServiceName() serviceName: WebhookServiceName,
  ) {
    if (serviceType && serviceName) {
      await this.mediator.notify(serviceName, serviceType);
    }
  }
}
