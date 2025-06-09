import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'instances',
})
export class Instance {
  @PrimaryGeneratedColumn('uuid')
  instanceId: string;

  @Column()
  instanceName: string;

  @Column({ enum: ['GITLAB', 'GITEA'], enumName: 'GitProviders', type: 'enum' })
  gitProvider: string;

  @Column({ unique: true })
  serviceBaseUrl: string;
}
