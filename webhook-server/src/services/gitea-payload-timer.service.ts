import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { GiteaEvents, GiteaEventsWithIssue } from '../types/gitea';
import { GiteaPayloadCombiningService } from './gitea-payload-combining.service';
import { GiteaPullRequestEvent } from '../types/gitea/pull_request';
import { GiteaIssueCommentEvent } from '../types/gitea/issue_comment';

@Injectable()
export class GiteaPayloadTimerService {
  private waitingBuffer: Map<string, EventPayload<any>[]> = new Map();
  private eventTypesMap = {
    issues: 'issues',
    issue_comment: 'issues',
    pull_request: 'request',
    pull_request_rejected: 'request',
    pull_request_approved: 'request',
    pull_request_comment: 'request',
  };

  constructor(private readonly combiningService: GiteaPayloadCombiningService) {}

  waitBeforeProcessing(eventPayload: EventPayload<GiteaEvents>) {
    const meantFor = this.checkMeantFor(eventPayload);
    if (!meantFor) {
      console.log('There is unknown event type for incoming request in Gitea Timer Service');
      return;
    }
    const key = this.createBufferKey(eventPayload, meantFor);
    if (this.waitingBuffer.has(key)) {
      const payloadList = this.waitingBuffer.get(key)!;
      payloadList.push(eventPayload);
    } else {
      this.waitingBuffer.set(key, [eventPayload]);
      setTimeout(() => {
        console.log(this.waitingBuffer.get(key));
        this.combiningService.combinePayloads(this.waitingBuffer.get(key)!);
        this.waitingBuffer.delete(key);
      }, 1000);
    }
  }

  private createBufferKey(eventPayload: EventPayload<GiteaEvents>, meantFor: 'issues' | 'request'): string {
    const tempString: string[] = [];
    if (meantFor === 'issues') {
      tempString.push(`INS=${eventPayload.instanceId};`);
      tempString.push(`OBJ=${(eventPayload as EventPayload<GiteaEventsWithIssue>).eventPayload.issue.id};`);
      tempString.push(`USR=${eventPayload.eventPayload.sender.id};`);
      tempString.push(`TYPE=${eventPayload.eventType};`);
    } else {
      tempString.push(`INS=${eventPayload.instanceId};`);
      tempString.push(`OBJ=${(eventPayload as EventPayload<GiteaPullRequestEvent>).eventPayload.pull_request.id};`);
      tempString.push(`USR=${eventPayload.eventPayload.sender.id};`);
      tempString.push(`TYPE=${eventPayload.eventType};`);
    }
    return tempString.join('');
  }

  private checkMeantFor(eventPayload: EventPayload<GiteaEvents>): 'request' | 'issues' | undefined {
    if (
      eventPayload.eventType === 'issue_comment' &&
      (eventPayload as EventPayload<GiteaIssueCommentEvent>).eventPayload.is_pull
    ) {
      return 'request';
    } else {
      return this.eventTypesMap[eventPayload.eventType];
    }
  }
}
