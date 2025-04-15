import { Injectable } from '@nestjs/common';
import { Api } from 'grammy';

@Injectable()
export class TelegramService {
  constructor(private readonly telegramApi: Api) {}

  async sendNotification(message: string, chatId: string) {
    await this.telegramApi.sendMessage(chatId, message);
  }
}
