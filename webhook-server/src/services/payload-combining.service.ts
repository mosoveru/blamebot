import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { AdditionalProperties, GiteaEvents } from '../types/gitea';
import { GiteaIssuesEvent } from '../types/gitea/issues';
import { NotificationService } from './notification.service';

type Handler = (properties: AdditionalProperties, payload?: EventPayload<GiteaEvents>) => AdditionalProperties;

@Injectable()
export class PayloadCombiningService {
  private updateAdditionalProperties: Record<Partial<GiteaEvents['action']>, Handler> = {
    assigned: (properties: AdditionalProperties, payload: EventPayload<GiteaIssuesEvent>): AdditionalProperties => {
      if (properties.assigned && payload.eventPayload.issue.assignee) {
        properties.assigned.push(payload.eventPayload.issue.assignee);
        return {
          ...properties,
        };
      } else {
        return {
          assigned: payload.eventPayload.issue.assignee ? [payload.eventPayload.issue.assignee] : [],
          ...properties,
        };
      }
    },
    unassigned: (properties: AdditionalProperties): AdditionalProperties => {
      return {
        ...properties,
        unassigned: true,
      };
    },
    opened: (properties: AdditionalProperties): AdditionalProperties => {
      return {
        ...properties,
        opened: true,
      };
    },
  };

  constructor(private readonly notificationService: NotificationService) {}

  async combinePayloads(payloads: EventPayload<GiteaEvents>[]) {
    if (!payloads.length) {
      return;
    }
    const additionalProperties = payloads.reduce<AdditionalProperties>((acc, payload) => {
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
    } else {
      const payload = payloads.pop()!;
      await this.notificationService.notify(payload);
    }
  }
}
