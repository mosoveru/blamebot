export default () => ({
  HTTP_SERVER_PORT: Number(process.env.HTTP_SERVER_PORT) ?? 3000,
  DB_DRIVER: process.env.DB_DRIVER ?? 'postgres',
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_USER_LOGIN: process.env.DB_USER_LOGIN ?? 'git_event_db_admin',
  DB_USER_PASSWORD: process.env.DB_USER_PASSWORD ?? '12345678',
  DB_PORT: Number(process.env.DB_PORT) ?? 5432,
  DB_NAME: process.env.DB_NAME ?? 'git_event_subscribers',
  PRIVATE_JWT_KEY: process.env.PRIVATE_JWT_KEY,
  BOT_SECRET_TOKEN: process.env.BOT_SECRET_TOKEN,
  USE_PROXY: process.env.USE_PROXY ?? false,
  PROXY_URL: process.env.USE_PROXY && buildProxyConnectionURL(),
  PROXY_HOSTNAME: process.env.PROXY_HOSTNAME ?? '127.0.0.1',
  PROXY_PORT: process.env.PROXY_PORT,
  PROXY_USERNAME: process.env.PROXY_USERNAME,
  PROXY_PASSWORD: process.env.PROXY_PASSWORD,
});

function buildProxyConnectionURL() {
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  const hostname = process.env.PROXY_HOSTNAME;
  const port = process.env.PROXY_PORT;
  return [
    'socks',
    '://',
    username && encodeURIComponent(username),
    password && encodeURIComponent(password),
    username && '@',
    hostname,
    port && ':' + port,
  ]
    .filter(Boolean)
    .join('');
}
