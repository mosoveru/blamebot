import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { GiteaEvents } from '../types/gitea';
import { PayloadCombiningService } from './payload-combining.service';

@Injectable()
export class PayloadTimerService {
  private waitingBuffer: Map<string, EventPayload<any>[]> = new Map();

  constructor(private readonly combiningService: PayloadCombiningService) {}

  waitBeforeProcessing(eventPayload: EventPayload<GiteaEvents>) {
    const key = this.createBufferKey(eventPayload);
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

  private createBufferKey(eventPayload: EventPayload<GiteaEvents>): string {
    const tempString: string[] = [];
    tempString.push(`INS=${eventPayload.instanceId};`);
    tempString.push(`OBJ=${eventPayload.eventPayload.issue.id};`);
    tempString.push(`USR=${eventPayload.eventPayload.sender.id};`);
    tempString.push(`TYPE=${eventPayload.eventType};`);
    return tempString.join('');
  }
}
