import { Injectable } from '@nestjs/common';
import { Api, InlineKeyboard } from 'grammy';
import { SubscriptionInfo } from '../types';

type NotificationData = {
  message: string;
  chatId: string;
  subscriptionInfo: SubscriptionInfo;
};

@Injectable()
export class TelegramService {
  constructor(private readonly telegramApi: Api) {}

  async sendNotification({ message, chatId, subscriptionInfo }: NotificationData) {
    const keyboard = new InlineKeyboard();
    const callbackQueryString = `UNSUB=${subscriptionInfo.uuid}`;
    keyboard.text('Отписаться', callbackQueryString);
    console.log('Trying to send notification');
    console.log(
      await this.telegramApi.sendMessage(chatId, message, {
        reply_markup: keyboard,
        parse_mode: 'HTML',
      }),
    );
  }
}
