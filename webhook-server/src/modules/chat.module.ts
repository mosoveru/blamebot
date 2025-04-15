import { Module } from '@nestjs/common';
import { Subscriber } from '../models/subscriber.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from '../services/chat/chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
