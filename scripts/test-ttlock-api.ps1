# Test TTLock API - Try different approaches

$clientId = "7d00ffcd55a146a3a981626227b375fb"
$clientSecret = "215d2828bbd9ff32a4656e979bf15d24"
$date = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()

Write-Host "=== TEST 1: Try lock/list with clientId only ===" -ForegroundColor Cyan
try {
    $params = @{
        clientId = $clientId
        date = $date
    }
    
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $url = "https://api.sciener.com/v3/lock/list?$queryString"
    
    Write-Host "URL: $url" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n=== TEST 2: Try with MD5 signature ===" -ForegroundColor Cyan
try {
    # Some APIs use MD5(client_id + timestamp + client_secret)
    $signStr = "$clientId$date$clientSecret"
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $hash = $md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signStr))
    $signature = [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
    
    $params = @{
        clientId = $clientId
        accessToken = $signature
        date = $date
    }
    
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $url = "https://api.sciener.com/v3/lock/list?$queryString"
    
    Write-Host "Signature: $signature" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST 3: Check what lock/list really needs ===" -ForegroundColor Cyan
Write-Host "According to docs, lock/list needs:" -ForegroundColor Yellow
Write-Host "- clientId: $clientId"
Write-Host "- accessToken: ???"
Write-Host "- date: $date"
Write-Host "`nWe need to find where accessToken comes from!" -ForegroundColor Red
