import { Injectable } from '@nestjs/common';
import { UserSubscription } from 'src/models/userSubscription.entity';
import { EventPayload } from '../types';
import { SubscriptionService } from './subscription.service';
import { DataParsersRepository } from '../data-parsers/data-parsers.repository';
import { ObservableObjectService } from './observable-object.service';
import { ProjectService } from './project.service';

@Injectable()
export class NotificationRecipientsService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly dataParsersRepository: DataParsersRepository,
    private readonly observableObjectService: ObservableObjectService,
    private readonly projectService: ProjectService,
  ) {}

  async retrieveRecipientsList(eventPayload: EventPayload<any>) {
    const handler = this.dataParsersRepository.getDataParser(eventPayload.service, eventPayload.eventType);

    if (!handler) {
      return null;
    }

    const eventMembersIds = handler.parseEventMembersIds(eventPayload);
    const eventInitiatorId = handler.parseEventInitiatorId(eventPayload);
    const project = handler.parseProjectInfo(eventPayload);
    const observableObject = handler.parseObservableObjectInfo(eventPayload);

    await this.projectService.ensureExists(project);
    await this.observableObjectService.ensureExists(observableObject);
    await this.subscriptionService.subscribeNewEventMembers(observableObject, eventMembersIds);

    const activeSubscriptions = await this.subscriptionService.retrieveActiveSubscriptions(observableObject);

    return this.excludeInitiator(activeSubscriptions, eventInitiatorId);
  }

  private excludeInitiator(subscriptions: UserSubscription[], initiatorId: string) {
    return subscriptions.filter((subscription) => subscription.instanceUserId !== initiatorId);
  }
}
