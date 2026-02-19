# Deploy Task Manager to Oracle VM (Steps 6-8)
# Run: .\scripts\deploy-vm.ps1
# Ensure SSH key and VM are accessible first.

$ErrorActionPreference = "Stop"
$KeyPath = "C:\Users\saleh\Downloads\ssh-key-2026-02-19.key"
$VMUser = "ubuntu"
$VMHost = "152.70.53.27"
$ProjectPath = "/home/ubuntu/task-manager-fullstack"
$ComposeCmd = "docker compose --env-file deploy/oracle/.env.prod -f deploy/oracle/docker-compose.prod.yml"

function Invoke-SSH {
    param([string]$Command)
    ssh -i $KeyPath -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 "${VMUser}@${VMHost}" "cd $ProjectPath && $Command"
}

Write-Host "=== Step 6: Starting docker compose stack ===" -ForegroundColor Cyan
Invoke-SSH "$ComposeCmd up -d --build"

Write-Host "`nWaiting 20s for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "`n=== Step 7: Init database and JWT ===" -ForegroundColor Cyan
Invoke-SSH "$ComposeCmd exec -T backend php bin/console doctrine:database:create --if-not-exists"
Invoke-SSH "$ComposeCmd exec -T backend php bin/console doctrine:schema:update --force"
Invoke-SSH "$ComposeCmd exec -T backend php bin/console lexik:jwt:generate-keypair --skip-if-exists"

Write-Host "`n=== Step 8: Verify endpoints ===" -ForegroundColor Cyan
Invoke-SSH "$ComposeCmd ps"
Invoke-SSH "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api" | ForEach-Object { Write-Host "API status: $_" }
Invoke-SSH "curl -s -o /dev/null -w '%{http_code}' http://localhost:4200" | ForEach-Object { Write-Host "Frontend status: $_" }

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Frontend:  http://${VMHost}:4200"
Write-Host "Backend:   http://${VMHost}:8000/api"
Write-Host "HF Space:  https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard"
