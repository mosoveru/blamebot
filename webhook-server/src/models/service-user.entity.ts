import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Service } from './service.entity';
import { TelegramUser } from './telegram-user.entity';

@Entity({
  name: 'service_users',
})
export class ServiceUser {
  @PrimaryColumn()
  serviceUserId: string;

  @PrimaryColumn()
  serviceId: string;

  @Column()
  telegramUserId: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  profileUrl: string;

  @ManyToOne(() => TelegramUser)
  @JoinColumn({
    name: 'telegramUserId',
    referencedColumnName: 'telegramUserId',
  })
  telegramUser: TelegramUser;

  @OneToOne(() => Service)
  @JoinColumn({ name: 'serviceId', referencedColumnName: 'serviceId' })
  service: Service;
}
