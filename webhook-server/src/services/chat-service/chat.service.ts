import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriber } from '../../models/subscriber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(Subscriber) private readonly chatRepository: Repository<Subscriber>) {}

  async findChat(serviceName: string, username: string): Promise<Subscriber | null> {
    return this.chatRepository.findOneBy({
      service: serviceName,
      username: username,
    });
  }
}
