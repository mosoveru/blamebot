import { Column, Entity, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ServiceUser } from './service-user.entity';
import { ObservableObject } from './observable-object.entity';

@Entity({
  name: 'subscriptions',
})
export class Subscription {
  @PrimaryColumn()
  serviceUserId: string;

  @PrimaryColumn()
  objectId: string;

  @PrimaryColumn()
  serviceId: string;

  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  objectType: string;

  @ManyToOne(() => ObservableObject)
  @JoinColumn([
    { name: 'objectId', referencedColumnName: 'objectId' },
    { name: 'serviceId', referencedColumnName: 'serviceId' },
    { name: 'projectId', referencedColumnName: 'projectId' },
    { name: 'objectType', referencedColumnName: 'objectType' },
  ])
  observableObjects: ObservableObject;

  @ManyToOne(() => ServiceUser)
  @JoinColumn([
    { name: 'serviceId', referencedColumnName: 'serviceId' },
    { name: 'serviceUserId', referencedColumnName: 'serviceUserId' },
  ])
  serviceUsers: ServiceUser;

  @Column()
  isSubscribed: boolean;
}
