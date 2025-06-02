import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Instance } from './instance.entity';

@Entity({
  name: 'projects',
})
export class Project {
  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  instanceId: string;

  @OneToOne(() => Instance)
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;

  @Column()
  name: string;

  @Column()
  pathname: string;
}
