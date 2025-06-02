import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Instance } from './instance.entity';
import { TelegramUser } from './telegram-user.service';

@Entity({
  name: 'instance_users',
})
export class InstanceUser {
  @PrimaryColumn()
  instanceUserId: string;

  @PrimaryColumn()
  instanceId: string;

  @Column()
  telegramUserId: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  pathname: string;

  @ManyToOne(() => TelegramUser)
  @JoinColumn({
    name: 'telegramUserId',
    referencedColumnName: 'telegramUserId',
  })
  telegramUser: TelegramUser;

  @OneToOne(() => Instance)
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;
}
