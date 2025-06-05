import { DatabaseService, LinkClientRequiredData, LinkingService } from '@types';

export class Linker implements LinkingService {
  constructor(private readonly dbService: DatabaseService) {}

  async linkClient(data: LinkClientRequiredData) {
    try {
      const instance = await this.dbService.findInstanceInfoByUrl(data.instanceUrl);
      if (!instance) {
        console.log('Инстанса не было найдено', data.instanceUrl);
        return false;
        // TODO: Возвращать нормальную ошибку
        // TODO: Поменять схему данных. Сделать опциональными username и name в TelegramUser
      }
      await this.dbService.saveTgUser({
        telegramUserId: data.telegramUserId,
        username: data.telegramUsername,
        name: data.telegramName,
      });
      console.log('Телеграм юзер сохранился');
      await this.dbService.saveInstanceUser({
        instanceId: instance.instanceId,
        instanceUserId: data.instanceUserId,
        telegramUserId: data.telegramUserId,
        username: data.instanceUsername,
        email: data.email,
        pathname: data.pathname,
      });
      console.log('Инстанс юзер сохранился');
      return true;
    } catch (error) {
      console.log('Что-то пошло не так при связывании');
      return false;
    }
  }
}
