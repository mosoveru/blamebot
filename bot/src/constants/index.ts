import 'dotenv/config';

const TOKEN = process.env.BOT_SECRET_TOKEN!;

if (!TOKEN) {
  throw new Error('Telegram Secret Token is not defined in .env file');
}

export const regexForURL =
  /^https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?(?:\/[^\s]*)?$/;

export const SECRET_TOKEN = TOKEN;
