import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriber } from '../../models/subscriber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriberService {
  constructor(@InjectRepository(Subscriber) private readonly subscriberRepository: Repository<Subscriber>) {}

  async findTelegramUser(telegramUserId: string) {
    return this.subscriberRepository.findOneBy({
      telegramUserId: telegramUserId,
    });
  }
}
