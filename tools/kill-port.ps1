# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {   
    Write-Warning "This script requires administrator privileges. Please run PowerShell as administrator."
    exit
}

$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess

if ($processId) {
    Write-Host "Found process using port $port. Attempting to kill process $processId..."
    try {
        Stop-Process -Id $processId -Force
        Write-Host "Successfully killed process on port $port"
    } catch {
        Write-Error "Failed to kill process: $_"
    }
} else {
    Write-Host "No process found using port $port"
} 