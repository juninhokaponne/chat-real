# Stop process on port 3001 if any, start server, then run smoke test
$port = 3001
$owner = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if($owner){ Write-Host "Killing process $owner"; Stop-Process -Id $owner -Force }
Start-Sleep -Seconds 1
# Start server in background
Write-Host 'Starting server (npm run start)'
Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory "$PSScriptRoot" -WindowStyle Hidden
Start-Sleep -Seconds 3
# Run smoke
Write-Host 'Running smoke test'
& "$PSScriptRoot\smoke.ps1"
Write-Host 'Done'
