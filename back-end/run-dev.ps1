# PowerShell script to run backend server
Set-Location $PSScriptRoot
& .\venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

















