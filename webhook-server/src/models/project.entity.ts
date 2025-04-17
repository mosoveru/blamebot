import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Service } from './service.entity';
import { JoinColumn } from 'typeorm/browser';

@Entity({
  name: 'projects',
})
export class Project {
  @PrimaryColumn()
  projectId: string;

  @PrimaryColumn()
  serviceId: string;

  @OneToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  name: string;

  @Column()
  projectUrl: string;
}
