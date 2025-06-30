import { Controller, Post } from '@nestjs/common';
import { Payload } from '../decorators/event-payload';
import { NotificationService } from '../services/notification.service';
import { EventPayload } from '../types';

@Controller()
export class GitlabController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/gitlab')
  async handleWebhookEvent(@Payload() eventPayload: EventPayload<any> | null) {
    console.log(JSON.stringify(eventPayload, null, 2));
    if (eventPayload) {
      await this.notificationService.notify(eventPayload);
    }
  }
}
