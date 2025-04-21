import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Service } from './service.entity';
import { Subscriber } from './subscriber.entity';

@Entity({
  name: 'service_users',
})
export class ServiceUser {
  @PrimaryColumn()
  serviceUserId: string;

  @PrimaryColumn()
  serviceId: string;

  @PrimaryColumn()
  telegramUserId: string;

  @OneToOne(() => Subscriber)
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
