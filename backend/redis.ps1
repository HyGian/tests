$rc = "C:\Program Files\Redis\redis-cli.exe"
function r { & $rc @args }
function rc { r keys "*" }                     # List ALL cache
function rp { r keys "product:*" }             # Product cache  
function ru { r keys "user:*" }                # USER cache 
function rd { r flushall; "Cache cleared" }    # Clear cache
function rt { 
    $result = & $rc ping  
    if ($result -eq "PONG") { 
        "OK" 
    } else { 
        "fail: $result" 
    }
}        # Test

Write-Host "Redis tools: r, rc, rp, ru, rd, rt" -ForegroundColor Green
rt