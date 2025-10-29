# Test TTLock API with REAL credentials
$clientId = "7d00ffcd55a146a3a981626227b375fb"
$clientSecret = "215d2828bbd9ff32a4656e979bf15d24"
$username = "haycubatdau@gmail.com"
$password = "Chill2025@"
$lockId = "26183042"  # Vung Tau - ChillCine (REAL ID)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TTLock API Test - REAL MODE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Access Token
Write-Host "[1/3] Getting Access Token..." -ForegroundColor Yellow

# MD5 hash password
$md5 = [System.Security.Cryptography.MD5]::Create()
$hash = $md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
$md5Password = [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()

Write-Host "Username: $username" -ForegroundColor Gray
Write-Host "Password (MD5): $md5Password" -ForegroundColor Gray
Write-Host ""

$tokenBody = @{
    client_id = $clientId
    client_secret = $clientSecret
    username = $username
    password = $md5Password
    grant_type = "password"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri "https://api.sciener.com/oauth2/token" `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $tokenBody

    Write-Host "SUCCESS! Access Token received:" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host "Access Token: " -NoNewline
    Write-Host $tokenResponse.access_token -ForegroundColor Yellow
    Write-Host "User ID: $($tokenResponse.uid)"
    Write-Host "Expires in: $($tokenResponse.expires_in) seconds ($([Math]::Floor($tokenResponse.expires_in / 86400)) days)"
    Write-Host "Scope: $($tokenResponse.scope)"
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host ""

    $accessToken = $tokenResponse.access_token

    # Step 2: Get Lock List
    Write-Host "[2/3] Getting Lock List..." -ForegroundColor Yellow
    
    $listParams = @{
        clientId = $clientId
        accessToken = $accessToken
        pageNo = "1"
        pageSize = "20"
        date = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    }

    $queryString = ($listParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $listUrl = "https://api.sciener.com/v3/lock/list?$queryString"

    $lockList = Invoke-RestMethod -Uri $listUrl -Method Get

    if ($lockList.list) {
        Write-Host "SUCCESS! Found $($lockList.list.Count) locks:" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Gray
        foreach ($lock in $lockList.list) {
            Write-Host "Lock ID: $($lock.lockId)" -ForegroundColor Cyan
            Write-Host "  Name: $($lock.lockName)"
            Write-Host "  Alias: $($lock.lockAlias)"
            Write-Host "  MAC: $($lock.lockMac)"
            Write-Host "  Battery: $($lock.electricQuantity)%"
            Write-Host ""
        }
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host ""
    }

    # Step 3: Unlock Door
    Write-Host "[3/3] Unlocking Door (Lock ID: $lockId)..." -ForegroundColor Yellow
    Write-Host "WARNING: This will actually unlock the door if gateway is online!" -ForegroundColor Red
    Write-Host ""
    
    $confirm = Read-Host "Continue? (y/n)"
    
    if ($confirm -eq "y") {
        $unlockBody = @{
            clientId = $clientId
            accessToken = $accessToken
            lockId = $lockId
            date = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }

        $unlockResponse = Invoke-RestMethod -Uri "https://api.sciener.com/v3/lock/unlock" `
            -Method Post `
            -ContentType "application/x-www-form-urlencoded" `
            -Body $unlockBody

        Write-Host "========================================" -ForegroundColor Gray
        if ($unlockResponse.errcode -eq 0) {
            Write-Host "SUCCESS! Door Unlocked!" -ForegroundColor Green
            Write-Host "Message: $($unlockResponse.errmsg)"
        } else {
            Write-Host "FAILED! Error code: $($unlockResponse.errcode)" -ForegroundColor Red
            Write-Host "Message: $($unlockResponse.errmsg)"
            Write-Host "Description: $($unlockResponse.description)"
        }
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Full Response:" -ForegroundColor Yellow
        Write-Host ($unlockResponse | ConvertTo-Json -Depth 5)
    } else {
        Write-Host "Unlock cancelled by user" -ForegroundColor Yellow
    }

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
