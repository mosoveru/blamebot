import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'instances',
})
export class Instance {
  @PrimaryColumn()
  instanceId: string;

  @Column()
  instanceName: string;

  @Column({ enum: ['GITLAB', 'GITEA'], enumName: 'GitProviders' })
  gitProvider: string;

  @Column({ unique: true })
  serviceBaseUrl: string;
}
