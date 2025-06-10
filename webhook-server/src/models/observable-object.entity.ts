import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
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

  @ManyToOne(() => Project)
  @JoinColumn([
    { name: 'projectId', referencedColumnName: 'projectId' },
    { name: 'instanceId', referencedColumnName: 'instanceId' },
  ])
  project: Project;

  @ManyToOne(() => ObjectType)
  @JoinColumn({ name: 'objectType', referencedColumnName: 'objectType' })
  objectTypeRelation: ObjectType;

  @Column()
  pathname: string;
}
