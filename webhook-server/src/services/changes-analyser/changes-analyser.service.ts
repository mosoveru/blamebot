import { Injectable } from '@nestjs/common';
import { EventPayload } from '../../types';
import { DataParsersRepository } from '../../repositories/data-parsers-repository/data-parsers.repository';

@Injectable()
export class ChangesAnalyserService {
  constructor(private readonly changesParsersRepository: DataParsersRepository) {}

  parseEventChanges(eventPayload: EventPayload<any>) {
    const changeParser = this.changesParsersRepository.getDataParser(eventPayload.service, eventPayload.eventType);

    if (!changeParser) {
      return null;
    }

    const eventMembersIds = changeParser.parseEventMembersIds(eventPayload);

    return changeParser.parseEventChanges({
      eventMembersIds,
      eventPayload,
    });
  }
}
