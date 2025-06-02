import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from '../types';
import { Project } from '../models/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private readonly projectRepository: Repository<Project>) {}

  async ensureExists({ projectId, instanceId, name, projectUrl }: ProjectEntity) {
    const projectEntity = await this.projectRepository.findOne({
      where: {
        projectId,
        instanceId,
      },
    });
    if (!projectEntity) {
      const pathname = new URL(projectUrl).pathname;
      await this.projectRepository.insert({
        projectId,
        instanceId,
        name,
        pathname,
      });
    }
  }
}
