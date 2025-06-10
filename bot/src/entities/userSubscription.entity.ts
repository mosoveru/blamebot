import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InstanceUser } from './instanceUser.entity';

@Entity({
  name: 'subscriptions',
})
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

  @Column()
  isSubscribed: boolean;

  @ManyToOne(() => InstanceUser)
  @JoinColumn([
    { name: 'instanceId', referencedColumnName: 'instanceId' },
    { name: 'instanceUserId', referencedColumnName: 'instanceUserId' },
  ])
  instanceUsers: InstanceUser;
}
