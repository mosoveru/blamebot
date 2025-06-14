#!/bin/bash
set -e

echo "📌 Создание пользователя и базы данных..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER $DB_USER_LOGIN WITH ENCRYPTED PASSWORD '$DB_USER_PASSWORD';
    CREATE DATABASE $DB_NAME OWNER $DB_USER_LOGIN;
EOSQL

echo "✅ Пользователь и база данных созданы."

echo "📥 Применение DDL к базе $DB_NAME..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" < /docker-entrypoint-initdb.d/schema.sql.template

echo "✅ DDL успешно применён к $DB_NAME."

echo "📥 Инициализируем начальные значения в $DB_NAME..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    INSERT INTO object_types VALUES ('request'), ('issue');
    INSERT INTO telegram_users ("telegramUserId", "isAdmin") VALUES ('$TG_ADMIN_ID', true);
EOSQL

echo "✅ База $DB_NAME успешно проинициализирована."