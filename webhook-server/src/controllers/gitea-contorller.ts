import { Controller, Post } from '@nestjs/common';
import { GiteaPayloadTimerService } from '../services/gitea-payload-timer.service';
import { Payload } from '../decorators/event-payload';
import { EventPayload } from '../types';

@Controller()
export class GiteaController {
  constructor(private readonly payloadTimer: GiteaPayloadTimerService) {}

  @Post('/gitea')
  async handleWebhookEvent(@Payload() eventPayload: EventPayload<any> | null) {
    console.log(JSON.stringify(eventPayload, null, 2));
    if (eventPayload) {
      this.payloadTimer.waitBeforeProcessing(eventPayload);
    }
  }
}
