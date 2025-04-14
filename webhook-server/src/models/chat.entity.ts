import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ChatEntity {
  @PrimaryColumn()
  service: string;

  @PrimaryColumn()
  username: string;

  @Column()
  chat_id: string;
}
