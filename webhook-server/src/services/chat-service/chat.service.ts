import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from '../../models/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(@InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>) {}

  async findChat(serviceName: string, username: string): Promise<ChatEntity | null> {
    return this.chatRepository.findOneBy({
      service: serviceName,
      username: username,
    });
  }
}
