import { Injectable } from '@nestjs/common';
import { EventPayload } from '../types';
import { DataParsersRepository } from '../data-parsers/data-parsers.repository';

@Injectable()
export class ChangesAnalyserService {
  constructor(private readonly changesParsersRepository: DataParsersRepository) {}

  parseEventChanges(payload: EventPayload<any>) {
    const changeParser = this.changesParsersRepository.getDataParser(payload.service, payload.eventType);

    if (!changeParser) {
      return null;
    }

    const eventMembersIds = changeParser.parseEventMembersIds(payload);

    return changeParser.parseEventChanges({
      eventMembersIds,
      eventPayload: payload.eventPayload,
    });
  }
}
