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