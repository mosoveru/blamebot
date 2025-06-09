import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Project } from './project.entity';
import { ObjectType } from './object-type.entity';

@Entity({
  name: 'observable_objects',
})
@Unique(['objectId', 'instanceId', 'projectId', 'objectType'])
export class ObservableObject {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  objectId: string;

  @Column()
  instanceId: string;

  @Column()
  projectId: string;

  @Column()
  objectType: string;

  @OneToOne(() => Project)
  @JoinColumn([
    { name: 'projectId', referencedColumnName: 'projectId' },
    { name: 'instanceId', referencedColumnName: 'instanceId' },
  ])
  project: Project;

  @OneToOne(() => ObjectType)
  @JoinColumn({ name: 'objectType', referencedColumnName: 'objectType' })
  objectTypeRelation: ObjectType;

  @Column()
  pathname: string;
}
