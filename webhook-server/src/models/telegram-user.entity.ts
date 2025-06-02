import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { InstanceUser } from './instanceUser.entity';

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

  @OneToMany(() => InstanceUser, (instanceUser) => instanceUser.telegramUser)
  instanceUsers: InstanceUser[];
}
