import { Module } from '@nestjs/common';
import { ChatEntity } from '../models/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity])],
  providers: [],
})
export class ChatModule {}
