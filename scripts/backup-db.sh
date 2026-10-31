#!/usr/bin/env bash
# ==============================================================================
# Script de Backup Automatizado do Banco de Dados PostgreSQL / PostGIS (Patinhas)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME=${CONTAINER_NAME:-"patinhas_postgres"}
DB_NAME=${DB_NAME:-"patinhas_db"}
DB_USER=${DB_USER:-"patinhas_user"}
FILENAME="${BACKUP_DIR}/patinhas_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "🐾 Iniciando backup do banco '${DB_NAME}' a partir do container '${CONTAINER_NAME}'..."

docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${FILENAME}"

echo "✅ Backup concluído com sucesso!"
echo "📁 Arquivo gerado: ${FILENAME} ($(du -h "${FILENAME}" | cut -f1))"

# Rotação: manter os últimos 7 backups diários
echo "🧹 Removendo backups com mais de 7 dias..."
find "${BACKUP_DIR}" -name "patinhas_backup_*.sql.gz" -mtime +7 -exec rm {} \;

echo "🎉 Procedimento finalizado com êxito."

