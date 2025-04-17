import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'services',
})
export class Service {
  @PrimaryColumn()
  serviceId: string;

  @Column()
  remoteName: string;

  @Column()
  gitProvider: string;

  @Column()
  serviceUrl: string;
}
