import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
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

  @ManyToOne(() => Instance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instanceId', referencedColumnName: 'instanceId' })
  instance: Instance;

  @Column()
  name: string;

  @Column()
  pathname: string;
}
