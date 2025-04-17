import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Service } from './service.entity';
import { JoinColumn } from 'typeorm/browser';
import { Project } from './project.entity';

export enum ObjectType {
  REQUEST_OPEN = 'request_open',
  REQUEST_CLOSE = 'request_close',
  ISSUE_OPEN = 'issue_open',
  ISSUE_CLOSE = 'issue_close',
}

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

  @PrimaryColumn({
    type: 'enum',
    enum: ObjectType,
  })
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
