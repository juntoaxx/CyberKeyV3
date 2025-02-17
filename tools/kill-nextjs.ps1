$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Write-Host "Found process using port $port. Attempting to kill process $processId..."
    taskkill /F /PID $processId
} else {
    Write-Host "No process found using port $port"
} 