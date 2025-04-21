import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceUser } from '../../models/service-user.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class ServiceUserService {
  constructor(@InjectRepository(ServiceUser) private readonly serviceUserRepository: Repository<ServiceUser>) {}

  async ensureServiceUsersExists(serviceUserIds: string[], serviceId: string) {
    return await this.serviceUserRepository.find({
      where: {
        serviceUserId: In(serviceUserIds),
        serviceId,
      },
    });
  }

  async retrieveTelegramIds(
    serviceUserIds: string[],
    serviceId: string,
  ): Promise<Pick<ServiceUser, 'telegramUserId'>[]> {
    return await this.serviceUserRepository.find({
      where: {
        serviceUserId: In(serviceUserIds),
        serviceId,
      },
      select: {
        telegramUserId: true,
      },
    });
  }
}
