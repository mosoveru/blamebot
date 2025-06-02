import { Injectable } from '@nestjs/common';
import { Api, InlineKeyboard } from 'grammy';
import { SubscriptionIdentifier } from '../types';

type NotificationData = {
  message: string;
  chatId: string;
  subscriptionInfo: SubscriptionIdentifier;
};

@Injectable()
export class TelegramService {
  constructor(private readonly telegramApi: Api) {}

  async sendNotification({ message, chatId, subscriptionInfo }: NotificationData) {
    const keyboard = new InlineKeyboard();
    const callbackQueryString = this.createCallbackQueryString(subscriptionInfo);
    keyboard.text('Отписаться', callbackQueryString);
    await this.telegramApi.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    });
  }

  private createCallbackQueryString(subscriptionInfo: SubscriptionIdentifier) {
    const callbackQueryString: string[] = [];
    callbackQueryString.push('UNSUB;');
    callbackQueryString.push(`USR=${subscriptionInfo.instanceUserId};`);
    callbackQueryString.push(`OBJ=${subscriptionInfo.objectId};`);
    callbackQueryString.push(`SRV=${subscriptionInfo.instanceId};`);
    callbackQueryString.push(`PROJ=${subscriptionInfo.projectId};`);
    callbackQueryString.push(`TYPE=${subscriptionInfo.objectType};`);
    return callbackQueryString.join('');
  }
}
