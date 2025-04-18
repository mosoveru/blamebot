import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriber } from '../../models/subscriber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriberService {
  constructor(@InjectRepository(Subscriber) private readonly subscriberRepository: Repository<Subscriber>) {}

  async findChat(serviceName: string, username: string) {
    // TODO: Change subscriber query logic due to database schema change

    return this.subscriberRepository.findOneBy({
      telegramUserId: serviceName,
    });
  }
}
