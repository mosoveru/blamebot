import { Repository } from 'typeorm';
import { DatabaseService, RemoteServiceInfo, RemoteUserData, TelegramUserInfo } from '@types';
import { Service } from '@entities';
import { ServiceUser } from '@entities';
import { TelegramUser } from '@entities';
import { DuplicateRemoteServiceURLException } from '@exceptions';

class PostgresDatabaseService implements DatabaseService {
  constructor(
    private readonly telegramUserRepository: Repository<TelegramUser>,
    private readonly serviceUserRepository: Repository<ServiceUser>,
    private readonly serviceRepository: Repository<Service>,
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

  async getRemoteUserInfo(serviceUserId: string, serviceId: string) {
    return await this.serviceUserRepository.findOneBy({
      serviceUserId,
      serviceId,
    });
  }

  /**
   * @throws {DuplicateRemoteServiceURLException} Ошибка выбрасывается, если уже существует экземпляр с таким же serviceUrl
   */

  async saveRemoteServiceInfo(info: RemoteServiceInfo) {
    const isServiceWithSameUrlNotExist = await this.serviceRepository
      .find({
        where: {
          serviceUrl: info.serviceUrl,
        },
      })
      .then((services) => !services.length);
    if (isServiceWithSameUrlNotExist) {
      await this.serviceRepository.save(info);
    } else {
      throw new DuplicateRemoteServiceURLException();
    }
  }

  async getRemoteServiceInfo(serviceId: string) {
    return await this.serviceRepository.findOneBy({
      serviceId,
    });
  }

  async findRemoteServiceInfoByURL(url: string) {
    return await this.serviceRepository.findOneBy({
      serviceUrl: url,
    });
  }
}

export default PostgresDatabaseService;
