import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { ServiceUser } from './service-user.entity';
import { Service } from './service.entity';
import { JoinColumn } from 'typeorm/browser';
import { Project } from './project.entity';
import { ObjectType, ObservableObject } from './observable-object.entity';

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

  @PrimaryColumn({
    type: 'enum',
    enum: ObjectType,
  })
  objectType: string;

  @OneToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @OneToOne(() => ServiceUser)
  @JoinColumn({ name: 'serviceUserId' })
  serviceUser: ServiceUser;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToOne(() => ObservableObject)
  @JoinColumn({ name: 'objectId' })
  object: ObservableObject;

  @Column()
  isSubscribed: boolean;
}
