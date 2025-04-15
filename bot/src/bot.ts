import { Bot } from 'grammy';
import 'dotenv/config';

const bot = new Bot(process.env.BOT_SECRET_TOKEN!);

bot.command('start', async (ctx) => {
  await ctx.reply(`Sender chat: ${ctx.chatId}`);
});

bot.start();
