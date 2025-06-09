import { Repository } from 'typeorm';
import { DatabaseService, RemoteServiceInfo, InstanceUserData, TelegramUserInfo } from '@types';
import { Instance } from '@entities';
import { InstanceUser } from '@entities';
import { TelegramUser } from '@entities';

class PostgresDatabaseService implements DatabaseService {
  constructor(
    private readonly telegramUserRepository: Repository<TelegramUser>,
    private readonly serviceUserRepository: Repository<InstanceUser>,
    private readonly serviceRepository: Repository<Instance>,
  ) {}

  async saveTgUser(info: TelegramUserInfo) {
    await this.telegramUserRepository.save(info);
  }

  async getTgUserInfo(id: string) {
    return await this.telegramUserRepository.findOneBy({
      telegramUserId: id,
    });
  }

  async saveInstanceUser(info: InstanceUserData) {
    await this.serviceUserRepository.save(info);
  }

  async getInstanceUserInfo(instanceUserId: string, instanceId: string) {
    return await this.serviceUserRepository.findOneBy({
      instanceUserId,
      instanceId,
    });
  }

  async saveInstance(info: RemoteServiceInfo) {
    await this.serviceRepository.save(info);
  }

  async getInstanceInfo(instanceId: string) {
    return await this.serviceRepository.findOneBy({
      instanceId,
    });
  }

  async findInstanceInfoByUrl(url: string) {
    return await this.serviceRepository.findOneBy({
      serviceBaseUrl: url,
    });
  }
}

export default PostgresDatabaseService;
