import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Instance } from './instance.entity';

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

  @OneToOne(() => Instance)
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;
}
