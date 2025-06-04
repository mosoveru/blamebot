import { Repository } from 'typeorm';
import { DatabaseService, RemoteServiceInfo, RemoteUserData, TelegramUserInfo } from '@types';
import { Instance } from '@entities';
import { InstanceUser } from '@entities';
import { TelegramUser } from '@entities';
import { DuplicateRemoteServiceURLException } from '@exceptions';

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

  async saveRemoteUser(info: RemoteUserData) {
    await this.serviceUserRepository.save(info);
  }

  async getRemoteUserInfo(instanceUserId: string, instanceId: string) {
    return await this.serviceUserRepository.findOneBy({
      instanceUserId,
      instanceId,
    });
  }

  /**
   * @throws {DuplicateRemoteServiceURLException} Ошибка выбрасывается, если уже существует экземпляр с таким же serviceUrl
   */

  async saveRemoteServiceInfo(info: RemoteServiceInfo) {
    const isServiceWithSameUrlNotExist = await this.serviceRepository
      .find({
        where: {
          serviceBaseUrl: info.serviceBaseUrl,
        },
      })
      .then((services) => !services.length);
    if (isServiceWithSameUrlNotExist) {
      await this.serviceRepository.save(info);
    } else {
      throw new DuplicateRemoteServiceURLException();
    }
  }

  async getRemoteServiceInfo(instanceId: string) {
    return await this.serviceRepository.findOneBy({
      instanceId,
    });
  }

  async findRemoteServiceInfoByURL(url: string) {
    return await this.serviceRepository.findOneBy({
      serviceBaseUrl: url,
    });
  }
}

export default PostgresDatabaseService;
