import { Module } from '@nestjs/common';
import { Subscriber } from '../models/subscriber.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberService } from '../services/subscriber/subscriber.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  providers: [SubscriberService],
  exports: [SubscriberService],
})
export class ChatModule {}
