#!/bin/sh
set -e

# Habilita extensões PostGIS e UUID no banco de dados principal
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "postgis";
    CREATE EXTENSION IF NOT EXISTS "postgis_topology";
EOSQL

echo "Extensões UUID e PostGIS ativadas com sucesso em $POSTGRES_DB!"

