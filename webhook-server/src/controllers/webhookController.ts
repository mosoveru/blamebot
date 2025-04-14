import { Controller, Logger, Post } from '@nestjs/common';
import { GitWebhookServiceName, GitWebhookServiceType } from '../types';
import { ServiceType } from '../decorators/service-type';
import { ServiceName } from '../decorators/service-name';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  @Post()
  printPayload(
    @ServiceType() serviceType: GitWebhookServiceType<any>,
    @ServiceName() serviceName: GitWebhookServiceName,
  ): void {
    console.log(JSON.stringify(serviceName, null, 2), JSON.stringify(serviceType, null, 2));
  }
}
