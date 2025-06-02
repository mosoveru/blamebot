import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'instances',
})
export class Instance {
  @PrimaryColumn()
  instanceId: string;

  @Column()
  instanceName: string;

  @Column()
  gitProvider: string;

  @Column()
  serviceBaseUrl: string;
}
