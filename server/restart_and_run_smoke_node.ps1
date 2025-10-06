$port = 3001
$owner = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if($owner){ Write-Host "Killing process $owner"; Stop-Process -Id $owner -Force }
Start-Sleep -Seconds 1
Write-Host 'Starting server'
Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory "$PSScriptRoot" -WindowStyle Hidden
Write-Host 'Waiting for server to respond on /api/docs'
$ready = $false
for($i=0;$i -lt 20; $i++){
	try{
		$r = Invoke-WebRequest -Uri 'http://localhost:3001/api/docs' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
		if($r.StatusCode -eq 200){ $ready = $true; break }
	} catch { Start-Sleep -Milliseconds 500 }
}
if(-not $ready){ Write-Host 'Server did not become ready in time'; }
else { Write-Host 'Server ready, running node smoke'; node "$PSScriptRoot\smoke_node.js" }
Write-Host 'Done'
