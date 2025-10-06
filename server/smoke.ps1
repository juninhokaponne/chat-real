# Smoke test for backend auth endpoints
$base = 'http://localhost:3001'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Dump($label, $obj){
    Write-Host "---- $label ----"
    if($null -eq $obj){ Write-Host "<null>"; return }
    try{ $json = $obj | ConvertTo-Json -Depth 6; Write-Host $json } catch { Write-Host $obj }
}

# Helper to POST JSON
function Post($path, $body){
    try{
        if($body -ne $null){
            return Invoke-RestMethod -Method Post -Uri ($base + $path) -Body (ConvertTo-Json $body -Compress) -ContentType 'application/json' -WebSession $session -ErrorAction Stop
        } else {
            return Invoke-RestMethod -Method Post -Uri ($base + $path) -ContentType 'application/json' -WebSession $session -ErrorAction Stop
        }
    } catch {
        $err = $_.Exception
        try{
            if($err.Response -ne $null){
                $resp = $err.Response
                $stream = $resp.GetResponseStream()
                if($stream -ne $null){
                    $sr = New-Object System.IO.StreamReader($stream)
                    $text = $sr.ReadToEnd()
                    return @{ status = $resp.StatusCode.value__; body = $text }
                }
            }
        } catch { }
        return @{ error = $err.Message }
    }
}

Start-Sleep -Seconds 2

# 1) Signup
$signupBody = @{ email = 'smoke+1@example.com'; password = 'Password123!'; displayName = 'Smoke Tester' }
$signup = Post '/auth/signup' $signupBody
Dump 'SIGNUP' $signup

# 2) Signin
$signinBody = @{ email = 'smoke+1@example.com'; password = 'Password123!' }
$signin = Post '/auth/signin' $signinBody
Dump 'SIGNIN' $signin

$access = $null
if($signin -ne $null -and $signin.access_token){ $access = $signin.access_token }

# 3) Profile (bearer)
try{
    $profile = Invoke-RestMethod -Method Get -Uri ($base + '/auth/profile') -Headers @{ Authorization = ('Bearer ' + $access) } -ErrorAction Stop
    Dump 'PROFILE' $profile
} catch {
    Write-Host 'PROFILE ERROR:'
    Dump 'PROFILE-ERR' ($_.Exception.Response | Select -ExpandProperty Content)
}

# 4) Refresh (uses cookie stored in WebSession). Provide userId from profile so controller can verify.
$refreshBody = $null
if($profile -ne $null -and $profile.userId){ $refreshBody = @{ userId = $profile.userId } }
$refresh = Post '/auth/refresh' $refreshBody
Dump 'REFRESH' $refresh

# 5) Logout (uses cookie). Provide userId to allow server to remove the refresh token.
$logoutBody = $null
if($profile -ne $null -and $profile.userId){ $logoutBody = @{ userId = $profile.userId } }
$logout = Post '/auth/logout' $logoutBody
Dump 'LOGOUT' $logout

Write-Host 'SMOKE TEST DONE'
