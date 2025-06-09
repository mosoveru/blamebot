import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Instance } from './instance.entity';

@Entity({
  name: 'projects',
})
@Unique(['projectId', 'instanceId'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  projectId: string;

  @Column()
  instanceId: string;

  @OneToOne(() => Instance)
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;

  @Column()
  name: string;

  @Column()
  pathname: string;
}
