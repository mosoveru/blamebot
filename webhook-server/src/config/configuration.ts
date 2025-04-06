export default () => ({
  HTTP_SERVER_PORT: Number(process.env.HTTP_SERVER_PORT) ?? 3000,
  DB_DRIVER: process.env.DB_DRIVER,
  DB_HOST: process.env.DB_HOST,
  DB_USER_LOGIN: process.env.DB_USER_LOGIN,
  DB_USER_PASSWORD: process.env.DB_USER_PASSWORD,
  DB_PORT: Number(process.env.DB_PORT) ?? 5432,
  DB_NAME: process.env.DB_NAME,
});
