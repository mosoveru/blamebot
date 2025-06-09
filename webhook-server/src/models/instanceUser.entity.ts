import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Instance } from './instance.entity';
import { TelegramUser } from './telegram-user.entity';

@Entity({
  name: 'instance_users',
})
@Unique(['instanceUserId', 'instanceId'])
export class InstanceUser {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  instanceUserId: string;

  @Column()
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
