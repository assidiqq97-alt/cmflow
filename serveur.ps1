# CMFlow Local Static Web Server (PowerShell .NET HttpListener)
$candidatePorts = @(3000, 8000, 5000, 8081, 8080)
$path = $PSScriptRoot
$listener = $null
$activePort = $null

foreach ($p in $candidatePorts) {
    try {
        $candidateListener = New-Object System.Net.HttpListener
        $candidateListener.Prefixes.Add("http://localhost:$p/")
        $candidateListener.Prefixes.Add("http://127.0.0.1:$p/")
        $candidateListener.Start()
        $listener = $candidateListener
        $activePort = $p
        break
    } catch {
        if ($candidateListener) {
            $candidateListener.Close()
        }
    }
}

if (-not $listener) {
    Write-Host "Impossible de démarrer le serveur sur les ports ($($candidatePorts -join ', '))." -ForegroundColor Red
    exit 1
}

Write-Host "=================================================" -ForegroundColor Green
Write-Host "🚀 Serveur CMFlow demarre avec succes !" -ForegroundColor Green
Write-Host "👉 URL Principale : http://localhost:$activePort/" -ForegroundColor Green
Write-Host "👉 Dashboard      : http://localhost:$activePort/dashboard.html" -ForegroundColor Green
Write-Host "👉 Inscription    : http://localhost:$activePort/register.html" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawUrl) -or $rawUrl -eq "/") {
            $rawUrl = "index.html"
        }
        elseif ($rawUrl.StartsWith("v/") -or $rawUrl.StartsWith("approve/")) {
            $rawUrl = "client-review.html"
        }
        elseif ($rawUrl -eq "register" -or $rawUrl -eq "register/") {
            $rawUrl = "register.html"
        }
        elseif ($rawUrl -eq "login" -or $rawUrl -eq "login/") {
            $rawUrl = "login.html"
        }
        elseif ($rawUrl -eq "admin" -or $rawUrl -eq "admin/" -or $rawUrl.StartsWith("admin/")) {
            $rawUrl = "admin.html"
        }
        elseif ($rawUrl -eq "dashboard" -or $rawUrl -eq "dashboard/") {
            $rawUrl = "dashboard.html"
        }
        elseif ($rawUrl -eq "billing" -or $rawUrl -eq "billing/") {
            $rawUrl = "billing.html"
        }
        elseif ($rawUrl -eq "planning" -or $rawUrl -eq "planning/") {
            $rawUrl = "planning.html"
        }
        elseif ($rawUrl -eq "settings" -or $rawUrl -eq "settings/") {
            $rawUrl = "settings.html"
        }
        elseif ($rawUrl -eq "analytics" -or $rawUrl -eq "analytics/") {
            $rawUrl = "analytics.html"
        }
        elseif ($rawUrl -eq "inbox" -or $rawUrl -eq "inbox/") {
            $rawUrl = "inbox.html"
        }
        elseif ($rawUrl -eq "clients" -or $rawUrl -eq "clients/") {
            $rawUrl = "clients.html"
        }
        elseif ($rawUrl -eq "media" -or $rawUrl -eq "media/") {
            $rawUrl = "media.html"
        }
        elseif ($rawUrl -eq "startpage" -or $rawUrl -eq "startpage/" -or $rawUrl -eq "bio" -or $rawUrl -eq "bio/") {
            $rawUrl = "startpage.html"
        }
        elseif ($rawUrl -eq "validation" -or $rawUrl -eq "validation/") {
            $rawUrl = "validation.html"
        }
        elseif ($rawUrl.StartsWith("api/")) {
            # Dispatcher API Local Mock pour tests immédiats sans Next.js
            $response.ContentType = "application/json; charset=utf-8"
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Headers", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.OutputStream.Close()
                continue
            }

            $jsonResponse = "{}"
            if ($rawUrl -like "api/billing/wave/checkout*") {
                $jsonResponse = '{"success":true,"wave_launch_url":"https://pay.wave.com/m/mock_checkout_cmflow","amount":15000,"currency":"XOF"}'
            }
            elseif ($rawUrl -like "api/billing/om/confirm*") {
                $jsonResponse = '{"success":true,"status":"ACTIVE","message":"Prélèvement Orange Money validé avec succès ! Votre compte est actif.","orderId":"OM_CMF_LOCAL_CONFIRMED"}'
            }
            elseif ($rawUrl -like "api/billing/om/checkout*") {
                $jsonResponse = '{"success":true,"payment_url":"https://webpayment.orange-money.com/pay?token=om_ptk_mock_123","pay_token":"om_ptk_mock_123","order_id":"OM_CMF_LOCAL_123","currency":"OUV","ussd_code":"#144#391#"}'
            }
            elseif ($rawUrl -like "api/cron/publish*") {
                $jsonResponse = '{"success":true,"message":"Publication automatique exécutée.","publishedCount":2}'
            }
            elseif ($rawUrl -like "api/health/env*") {
                $jsonResponse = '{"isValid":true,"status":"OK","configuredCount":15,"totalCount":15}'
            }
            else {
                $jsonResponse = '{"success":true,"status":"OK"}'
            }

            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Close()
            continue
        }

        $localFile = Join-Path $path $rawUrl
        $fullPath = [System.IO.Path]::GetFullPath($localFile)
        $rootPath = [System.IO.Path]::GetFullPath($path)

        # Protection Anti-Path Traversal : interdire l'accès hors du dossier racine
        if (-not $fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $forbidden = [System.Text.Encoding]::UTF8.GetBytes("<h1>403 Forbidden - Access Denied</h1>")
            $response.ContentType = "text/html"
            $response.ContentLength64 = $forbidden.Length
            $response.OutputStream.Write($forbidden, 0, $forbidden.Length)
            $response.OutputStream.Close()
            continue
        }

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("X-Content-Type-Options", "nosniff")
            $response.AddHeader("X-Frame-Options", "SAMEORIGIN")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1>")
            $response.ContentType = "text/html"
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # continue loop
    }
}
