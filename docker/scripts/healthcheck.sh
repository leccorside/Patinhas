#!/bin/sh
set -e

echo "Verificando saúde dos serviços Patinhas..."

# Checar banco
pg_isready -h postgres -p 5432 -U patinhas_user -d patinhas_db || exit 1

echo "PostgreSQL + PostGIS OK!"

