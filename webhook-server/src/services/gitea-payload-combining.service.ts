import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { AdditionalProperties, GiteaEvents, GiteaEventsWithIssue } from '../types/gitea';
import { NotificationService } from './notification.service';
import { GiteaPullRequestEvent } from '../types/gitea/pull_request';

type Handler = (properties: AdditionalProperties, payload?: EventPayload<GiteaEvents>) => AdditionalProperties;

@Injectable()
export class GiteaPayloadCombiningService {
  private commonHandlers: Record<Partial<GiteaEvents['action']>, Handler> = {
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
  private handlersForIssues: Record<Partial<GiteaEvents['action']>, Handler> = {
    assigned: (properties: AdditionalProperties, payload: EventPayload<GiteaEventsWithIssue>): AdditionalProperties => {
      if (properties.assigned && payload.eventPayload?.issue && payload.eventPayload?.issue?.assignee) {
        properties.assigned.push(payload.eventPayload.issue.assignee!);
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
    ...this.commonHandlers,
  };
  private handlersForPullRequest: Record<Partial<GiteaEvents['action']>, Handler> = {
    assigned: (
      properties: AdditionalProperties,
      payload: EventPayload<GiteaPullRequestEvent>,
    ): AdditionalProperties => {
      if (properties.assigned && payload.eventPayload?.pull_request && payload.eventPayload?.pull_request?.assignee) {
        properties.assigned.push(payload.eventPayload?.pull_request?.assignee);
        return {
          ...properties,
        };
      } else {
        return {
          assigned: payload.eventPayload.pull_request.assignee ? [payload.eventPayload.pull_request.assignee] : [],
          ...properties,
        };
      }
    },
    review_requested: (
      properties: AdditionalProperties,
      payload: EventPayload<GiteaPullRequestEvent>,
    ): AdditionalProperties => {
      if (properties.addedReviewers && payload.eventPayload.requested_reviewer) {
        properties.addedReviewers.push(payload.eventPayload.requested_reviewer);
        return {
          ...properties,
        };
      } else {
        return {
          addedReviewers: payload.eventPayload.requested_reviewer ? [payload.eventPayload.requested_reviewer] : [],
          ...properties,
        };
      }
    },
    review_request_removed: (
      properties: AdditionalProperties,
      payload: EventPayload<GiteaPullRequestEvent>,
    ): AdditionalProperties => {
      if (properties.deletedReviewers && payload.eventPayload.requested_reviewer) {
        properties.deletedReviewers.push(payload.eventPayload.requested_reviewer);
        return {
          ...properties,
        };
      } else {
        return {
          deletedReviewers: payload.eventPayload.requested_reviewer ? [payload.eventPayload.requested_reviewer] : [],
          ...properties,
        };
      }
    },
    ...this.commonHandlers,
  };
  private handlersForAdditionalProperties = {
    issues: this.handlersForIssues,
    issue_comment: this.handlersForIssues,
    pull_request: this.handlersForPullRequest,
  };

  constructor(private readonly notificationService: NotificationService) {}

  async combinePayloads(payloads: EventPayload<GiteaEvents>[]) {
    if (!payloads.length) {
      return;
    }
    const additionalProperties = payloads.reduce<AdditionalProperties>((acc, payload) => {
      const action = payload.eventPayload.action;
      const eventType = payload.eventType;
      if (this.handlersForAdditionalProperties?.[eventType]?.[action]) {
        return this.handlersForAdditionalProperties[eventType][action](acc, payload);
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
