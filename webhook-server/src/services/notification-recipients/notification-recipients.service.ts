import { Injectable } from '@nestjs/common';
import { Subscription } from 'src/models/subscription.entity';
import { EventPayload } from '../../types';
import { SubscriptionService } from '../subscription/subscription.service';
import { ServiceUserService } from '../service-user/service-user.service';
import { DataParsersRepository } from '../../repositories/data-parsers-repository/data-parsers-repository.service';
import { ObservableObjectService } from '../observable-object/observable-object.service';

@Injectable()
export class NotificationRecipientsService {
  constructor(
    private readonly serviceUserService: ServiceUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dataParsersRepository: DataParsersRepository,
    private readonly observableObjectService: ObservableObjectService,
  ) {}

  async retrieveRecipientsList(eventPayload: EventPayload<any>) {
    const handler = this.dataParsersRepository.getDataParser(eventPayload.service, eventPayload.eventType);

    if (!handler) {
      return null;
    }

    const eventMembersIds = handler.parseEventMembersIds(eventPayload);
    const eventInitiatorId = handler.parseEventInitiatorId(eventPayload);
    const observableObject = handler.parseObservableObjectInfo(eventPayload);

    await this.observableObjectService.ensureExists(observableObject);
    await this.subscriptionService.subscribeNewEventMembers(observableObject, eventMembersIds);

    const activeSubscriptions = await this.subscriptionService.retrieveActiveSubscriptions(observableObject);

    return this.excludeInitiator(activeSubscriptions, eventInitiatorId);
  }

  private excludeInitiator(subscriptions: Subscription[], initiatorId: string) {
    return subscriptions.filter((subscription) => subscription.serviceUserId !== initiatorId);
  }
}
