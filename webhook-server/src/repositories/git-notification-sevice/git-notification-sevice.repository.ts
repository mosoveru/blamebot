import { Injectable } from '@nestjs/common';
import { GitNotificationService, GitNotificationServiceRepository } from '../../types';

@Injectable()
export class GitNotificationHandlers implements GitNotificationServiceRepository {
  private services = new Map([['GITLAB', 'SOMESERVICE LINK']]);
  parseGitNotificationService(serviceType: string): GitNotificationService {
    console.log(this.services.get(serviceType));
  }
}
