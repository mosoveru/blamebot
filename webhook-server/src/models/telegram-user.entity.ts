import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { InstanceUser } from './instanceUser.entity';

@Entity({
  name: 'telegram_users',
})
export class TelegramUser {
  @PrimaryColumn()
  telegramUserId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => InstanceUser, (instanceUser) => instanceUser.telegramUser)
  instanceUsers: InstanceUser[];
}
