import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Service } from './service.entity';
import { Project } from './project.entity';
import { ObjectType } from './object-type.entity';

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
  @JoinColumn({ name: 'serviceId', referencedColumnName: 'serviceId' })
  service: Service;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
  project: Project;

  @OneToOne(() => ObjectType)
  @JoinColumn({ name: 'objectType', referencedColumnName: 'objectType' })
  objectTypeRelation: ObjectType;

  @Column()
  objectUrl: string;
}
