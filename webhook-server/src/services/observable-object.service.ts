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

  async ensureExists(objectInfo: ObservableObjectEntity) {
    const observableObject = await this.observableObjectRepository.findOne({
      where: {
        objectId: String(objectInfo.objectId),
        projectId: String(objectInfo.projectId),
        objectType: objectInfo.objectType,
        serviceId: objectInfo.serviceId,
      },
    });
    if (!observableObject) {
      await this.observableObjectRepository.insert({
        objectId: String(objectInfo.objectId),
        projectId: String(objectInfo.projectId),
        objectType: objectInfo.objectType,
        serviceId: objectInfo.serviceId,
        objectUrl: objectInfo.objectUrl,
      });
    }
  }
}
