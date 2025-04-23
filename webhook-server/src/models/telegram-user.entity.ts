import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ServiceUser } from './service-user.entity';

@Entity({
  name: 'telegram_users',
})
export class TelegramUser {
  @PrimaryColumn()
  telegramUserId: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @OneToMany(() => ServiceUser, (serviceUser) => serviceUser.telegramUser)
  serviceUsers: ServiceUser[];
}
