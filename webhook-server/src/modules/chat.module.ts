import { Module } from '@nestjs/common';
import { Subscriber } from '../models/subscriber.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  providers: [],
})
export class ChatModule {}
