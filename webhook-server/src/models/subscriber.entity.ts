import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'subscribers',
})
export class Subscriber {
  @PrimaryColumn()
  telegramUserId: string;

  @Column()
  username: string;

  @Column()
  name: string;
}
