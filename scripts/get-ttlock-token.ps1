# PowerShell script to get TTLock Access Token
$clientId = "7d00ffcd55a146a3a981626227b375fb"
$clientSecret = "215d2828bbd9ff32a4656e979bf15d24"

Write-Host "Getting Access Token from TTLock..." -ForegroundColor Cyan
Write-Host ""

$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    grant_type = "client_credentials"
}

try {
    # Try US endpoint first
    Write-Host "Trying US endpoint (api.ttlock.com)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://api.ttlock.com/oauth2/token" `
            -Method Post `
            -ContentType "application/x-www-form-urlencoded" `
            -Body $body
    } catch {
        Write-Host "US endpoint failed, trying EU endpoint..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "https://euopen.ttlock.com/oauth2/token" `
            -Method Post `
            -ContentType "application/x-www-form-urlencoded" `
            -Body $body
    }

    Write-Host "Full Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 5)
    Write-Host ""
    
    if ($response.access_token) {
        Write-Host "SUCCESS! Access Token:" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host "Access Token: " -NoNewline
        Write-Host $response.access_token -ForegroundColor Yellow
        Write-Host "Expires in: $($response.expires_in) seconds ($([Math]::Floor($response.expires_in / 86400)) days)"
        Write-Host "Token Type: $($response.token_type)"
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Copy to .env.local:" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host "TTLOCK_CLIENT_ID=$clientId"
        Write-Host "TTLOCK_CLIENT_SECRET=$clientSecret"
        Write-Host "TTLOCK_ACCESS_TOKEN=$($response.access_token)"
        Write-Host "========================================" -ForegroundColor Gray
    } else {
        Write-Host "WARNING: No access_token in response!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception
}
