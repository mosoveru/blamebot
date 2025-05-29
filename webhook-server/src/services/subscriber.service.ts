import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramUser } from '../models/telegram-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriberService {
  constructor(@InjectRepository(TelegramUser) private readonly subscriberRepository: Repository<TelegramUser>) {}

  async findTelegramUser(telegramUserId: string) {
    return this.subscriberRepository.findOneBy({
      telegramUserId: telegramUserId,
    });
  }
}
