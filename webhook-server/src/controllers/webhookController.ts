import { Controller, Inject, Logger, Post } from '@nestjs/common';
import { GitWebhookRequestPayload, Mediator } from '../types';
import { TOKENS } from '../constants/tokens';
import { ServiceType } from '../decorators/service-type';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(@Inject(TOKENS.MEDIATOR) private readonly notificationServiceMediator: Mediator) {}

  @Post()
  printPayload(@ServiceType() service: GitWebhookRequestPayload): void {
    console.log(service);
  }
}
