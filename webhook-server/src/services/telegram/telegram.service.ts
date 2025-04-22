import { Injectable } from '@nestjs/common';
import { Api, InlineKeyboard } from 'grammy';
import { TSubscriptionIdentifier } from '../../types';

type NotificationData = {
  message: string;
  chatId: string;
  subscriptionInfo: TSubscriptionIdentifier;
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

  private createCallbackQueryString(subscriptionInfo: TSubscriptionIdentifier) {
    const callbackQueryString: string[] = [];
    callbackQueryString.push('UNSUB;');
    callbackQueryString.push(`USR=${subscriptionInfo.serviceUserId};`);
    callbackQueryString.push(`OBJ=${subscriptionInfo.objectId};`);
    callbackQueryString.push(`SRV=${subscriptionInfo.serviceId};`);
    callbackQueryString.push(`PROJ=${subscriptionInfo.projectId};`);
    callbackQueryString.push(`TYPE=${subscriptionInfo.objectType};`);
    return callbackQueryString.join('');
  }
}
