import { Controller, Logger, Post } from '@nestjs/common';
import { GitWebhookServiceName, GitWebhookServiceType } from '../types';
import { ServiceType } from '../decorators/service-type';
import { ServiceName } from '../decorators/service-name';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  @Post()
  printPayload(
    @ServiceType() serviceType: GitWebhookServiceType,
    @ServiceName() serviceName: GitWebhookServiceName,
  ): void {
    console.log(serviceName, serviceType);
  }
}
