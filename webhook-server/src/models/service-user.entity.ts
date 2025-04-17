import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Service } from './service.entity';
import { JoinColumn } from 'typeorm/browser';
import { Subscriber } from './subscriber.entity';

@Entity({
  name: 'service_users',
})
export class ServiceUser {
  @PrimaryColumn()
  serviceUserId: string;

  @PrimaryColumn()
  serviceId: string;

  @OneToOne(() => Subscriber, { nullable: true })
  @JoinColumn({
    name: 'telegramUserId',
  })
  subscriber: Subscriber;

  @OneToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  profileUrl: string;
}
