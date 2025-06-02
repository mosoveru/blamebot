import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObservableObject } from '../models/observable-object.entity';
import { Repository } from 'typeorm';
import { ObservableObjectEntity } from '../types';

@Injectable()
export class ObservableObjectService {
  constructor(
    @InjectRepository(ObservableObject) private readonly observableObjectRepository: Repository<ObservableObject>,
  ) {}

  async ensureExists({ objectId, objectType, instanceId, projectId, objectUrl }: ObservableObjectEntity) {
    const observableObject = await this.observableObjectRepository.findOne({
      where: {
        objectId,
        projectId,
        objectType,
        instanceId,
      },
    });
    if (!observableObject) {
      const pathname = new URL(objectUrl).pathname;
      await this.observableObjectRepository.insert({
        objectId,
        projectId,
        objectType,
        instanceId,
        pathname,
      });
    }
  }
}
