import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstanceUser } from '../models';
import { Repository, In } from 'typeorm';

@Injectable()
export class ServiceUserService {
  constructor(@InjectRepository(InstanceUser) private readonly serviceUserRepository: Repository<InstanceUser>) {}

  async ensureServiceUsersExists(serviceUserIds: string[], instanceId: string) {
    return await this.serviceUserRepository.find({
      where: {
        instanceUserId: In(serviceUserIds),
        instanceId,
      },
    });
  }
}
