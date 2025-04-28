import { Controller, Post } from '@nestjs/common';
import { Payload } from '../decorators/event-payload';
import { NotificationService } from '../services/notification/notification.service';
import { EventPayload } from '../types';

@Controller()
export class WebhookController {
  constructor(private readonly mediator: NotificationService) {}

  @Post()
  async handleWebhookEvent(@Payload() eventPayload: EventPayload<any> | null) {
    if (eventPayload) {
      await this.mediator.notify(eventPayload);
    }
  }
}
