import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Instance } from './instance.entity';
import { Project } from './project.entity';
import { ObjectType } from './object-type.entity';

@Entity({
  name: 'observable_objects',
})
export class ObservableObject {
  @PrimaryColumn()
  objectId: string;

  @PrimaryColumn()
  instanceId: string;

  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  objectType: string;

  @OneToOne(() => Instance)
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId', referencedColumnName: 'projectId' })
  project: Project;

  @OneToOne(() => ObjectType)
  @JoinColumn({ name: 'objectType', referencedColumnName: 'objectType' })
  objectTypeRelation: ObjectType;

  @Column()
  pathname: string;
}
