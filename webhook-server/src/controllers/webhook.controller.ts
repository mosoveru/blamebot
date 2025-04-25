import { Controller, Post } from '@nestjs/common';
import { Payload } from '../decorators/event-payload';
import { NotificationMediatorService } from '../services/notification-mediator/notification-mediator.service';
import { EventPayload } from '../types';

@Controller()
export class WebhookController {
  constructor(private readonly mediator: NotificationMediatorService) {}

  @Post()
  async handleWebhookEvent(@Payload() eventPayload: EventPayload<any> | null) {
    if (eventPayload) {
      await this.mediator.notify(eventPayload);
    }
  }
}
