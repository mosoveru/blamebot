FROM postgres:17.5

LABEL org.opencontainers.image.source=https://github.com/mosoveru/blamebot
LABEL org.opencontainers.image.description="Pre-defined Postgres Schema for the Blamebot application"
LABEL org.opencontainers.image.licenses=MIT

COPY init.sh schema.sql.template /docker-entrypoint-initdb.d/