import { Column, Entity, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { InstanceUser } from './instanceUser.entity';
import { ObservableObject } from './observable-object.entity';

@Entity({
  name: 'subscriptions',
})
export class UserSubscription {
  @PrimaryColumn()
  instanceUserId: string;

  @PrimaryColumn()
  objectId: string;

  @PrimaryColumn()
  instanceId: string;

  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  objectType: string;

  @ManyToOne(() => ObservableObject)
  @JoinColumn([
    { name: 'objectId', referencedColumnName: 'objectId' },
    { name: 'instanceId', referencedColumnName: 'instanceId' },
    { name: 'projectId', referencedColumnName: 'projectId' },
    { name: 'objectType', referencedColumnName: 'objectType' },
  ])
  observableObjects: ObservableObject;

  @ManyToOne(() => InstanceUser)
  @JoinColumn([
    { name: 'instanceId', referencedColumnName: 'instanceId' },
    { name: 'instanceUserId', referencedColumnName: 'instanceUserId' },
  ])
  instanceUsers: InstanceUser;

  @Column()
  isSubscribed: boolean;
}
