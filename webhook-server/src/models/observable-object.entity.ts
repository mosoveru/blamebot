import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Service } from './service.entity';
import { Project } from './project.entity';

@Entity({
  name: 'observable_objects',
})
export class ObservableObject {
  @PrimaryColumn()
  objectId: string;

  @PrimaryColumn()
  serviceId: string;

  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  objectType: string;

  @OneToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  objectUrl: string;
}
