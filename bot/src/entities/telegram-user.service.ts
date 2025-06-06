import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'telegram_users',
})
export class TelegramUser {
  @PrimaryColumn()
  telegramUserId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  name: string;
}
