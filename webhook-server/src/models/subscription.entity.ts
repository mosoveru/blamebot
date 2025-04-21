import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { ServiceUser } from './service-user.entity';
import { Service } from './service.entity';
import { Project } from './project.entity';
import { ObservableObject } from './observable-object.entity';
import { ObjectType } from './object-type.entity';

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

  @OneToOne(() => ObjectType)
  @JoinColumn({ name: 'objectType' })
  objectTypeRelation: ObjectType;

  @Column()
  isSubscribed: boolean;
}
