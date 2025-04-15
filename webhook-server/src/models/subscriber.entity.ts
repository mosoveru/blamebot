import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'subscribers',
})
export class Subscriber {
  @PrimaryColumn()
  service: string;

  @PrimaryColumn()
  username: string;

  @Column()
  chat_id: string;
}
