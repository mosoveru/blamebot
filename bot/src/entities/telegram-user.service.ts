import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'telegram_users',
})
export class TelegramUser {
  @PrimaryColumn()
  telegramUserId: string;

  @Column()
  username: string;

  @Column()
  name: string;
}
