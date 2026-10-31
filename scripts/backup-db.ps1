# ==============================================================================
# Script de Backup Automatizado do PostgreSQL / PostGIS (Patinhas) - PowerShell
# ==============================================================================

param(
    [string]$ContainerName = "patinhas_postgres",
    [string]$DbName = "patinhas_db",
    [string]$DbUser = "patinhas_user",
    [string]$BackupDir = "./backups"
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $BackupDir "patinhas_backup_$Timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Iniciando backup do banco '$DbName' a partir de '$ContainerName'..." -ForegroundColor Cyan

docker exec -t $ContainerName pg_dump -U $DbUser -d $DbName --clean --if-exists | Out-File -FilePath $BackupPath -Encoding utf8

if (Test-Path $BackupPath) {
    $Size = (Get-Item $BackupPath).Length / 1KB
    $Rounded = [math]::Round($Size, 2)
    Write-Host "Backup concluido com sucesso!" -ForegroundColor Green
    Write-Host "Arquivo gerado: $BackupPath ($Rounded KB)" -ForegroundColor Yellow
} else {
    Write-Host "Falha ao gerar o arquivo de backup." -ForegroundColor Red
}
