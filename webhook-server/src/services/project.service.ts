import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from '../types';
import { Project } from '../models/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private readonly projectRepository: Repository<Project>) {}

  async ensureExists({ projectId, serviceId, name, projectUrl }: ProjectEntity) {
    const projectEntity = await this.projectRepository.findOne({
      where: {
        projectId,
        serviceId,
      },
    });
    if (!projectEntity) {
      await this.projectRepository.insert({
        projectId,
        serviceId,
        name,
        projectUrl,
      });
    }
  }
}
