import { Repository } from 'typeorm';
import { DatabaseService, RemoteServiceInfo, InstanceUserData, TelegramUserInfo } from '@types';
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

  async saveInstanceUser(info: InstanceUserData) {
    await this.serviceUserRepository.save(info);
  }

  async getInstanceUserInfo(instanceUserId: string, instanceId: string) {
    return await this.serviceUserRepository.findOneBy({
      instanceUserId,
      instanceId,
    });
  }

  /**
   * @throws {DuplicateRemoteServiceURLException} Ошибка выбрасывается, если уже существует экземпляр с таким же serviceUrl
   */

  async saveInstance(info: RemoteServiceInfo) {
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
      // TODO: В банке уже есть Unique Constraint. Переписать на try catch
      throw new DuplicateRemoteServiceURLException();
    }
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
