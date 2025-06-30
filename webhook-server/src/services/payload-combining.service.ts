import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { AdditionalProperties, CombinedProperties, GiteaEvents, GiteaFlavor } from '../types/gitea';
import { GiteaIssuesEvent } from '../types/gitea/issues';
import { NotificationService } from './notification.service';

@Injectable()
export class PayloadCombiningService {
  private updateAdditionalProperties = {
    assigned: (properties: AdditionalProperties, payload: EventPayload<GiteaIssuesEvent>) => {
      if (properties.assigned?.added) {
        properties.assigned.added.push(payload.eventPayload.issue.assignee);
        return {
          ...properties,
        };
      } else {
        return {
          assigned: {
            added: [payload.eventPayload.issue.assignee],
          },
          ...properties,
        };
      }
    },
    unassigned: (properties: AdditionalProperties) => {
      return {
        ...properties,
        unassigned: true,
      };
    },
  };

  constructor(private readonly notificationService: NotificationService) {}

  async combinePayloads(payloads: EventPayload<GiteaEvents>[]) {
    if (!payloads.length) {
      return;
    }
    if (payloads.length === 1) {
      await this.notificationService.notify(payloads.pop()!);
    }
    const additionalProperties = payloads.reduce<CombinedProperties>((acc, payload, index, payloads) => {
      const action = payload.eventPayload.action;
      if (this.updateAdditionalProperties[action]) {
        return this.updateAdditionalProperties[action](acc, payload);
      }
      return acc;
    }, {});
    if (Object.keys(additionalProperties).length) {
      const payload = payloads.pop()!;
      const combinedPayload = {
        ...payload,
        eventPayload: {
          ...payload.eventPayload,
          combinedProperties: {
            ...additionalProperties,
          },
        },
      };
      await this.notificationService.notify(combinedPayload);
    }
  }
}
