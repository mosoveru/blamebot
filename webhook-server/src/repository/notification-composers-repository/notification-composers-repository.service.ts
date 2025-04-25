import { Injectable } from '@nestjs/common';
import { NotificationComposer, NotificationComposerConstructor } from '../../types';
import { RemoteGitServices } from '../../constants/enums';

@Injectable()
export class NotificationComposersRepository {
  private readonly store: Map<string, NotificationComposer<any>> = new Map();

  registerComposers(composers: NotificationComposerConstructor[]) {
    for (const Composer of composers) {
      const instantiatedComposer = new Composer();
      this.store.set(`${instantiatedComposer.gitProvider}:${instantiatedComposer.eventType}`, instantiatedComposer);
    }
  }

  getNotificationComposer(gitProvider: RemoteGitServices, eventType: string) {
    return this.store.get(`${gitProvider}:${eventType}`);
  }
}
