import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { InstanceUser } from './instanceUser.entity';
import { ObservableObject } from './observable-object.entity';

@Entity({
  name: 'subscriptions',
})
@Unique(['instanceUserId', 'objectId', 'instanceId', 'projectId', 'objectType'])
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  instanceUserId: string;

  @Column()
  objectId: string;

  @Column()
  instanceId: string;

  @Column()
  projectId: string;

  @Column()
  objectType: string;

  @ManyToOne(() => ObservableObject, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'objectId', referencedColumnName: 'objectId' },
    { name: 'instanceId', referencedColumnName: 'instanceId' },
    { name: 'projectId', referencedColumnName: 'projectId' },
    { name: 'objectType', referencedColumnName: 'objectType' },
  ])
  observableObjects: ObservableObject;

  @ManyToOne(() => InstanceUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'instanceId', referencedColumnName: 'instanceId' },
    { name: 'instanceUserId', referencedColumnName: 'instanceUserId' },
  ])
  instanceUsers: InstanceUser;

  @Column()
  isSubscribed: boolean;
}
