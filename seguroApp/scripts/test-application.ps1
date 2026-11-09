<#!
.SYNOPSIS
  Executa um teste de uso visivel da API SeguroChain, sem alterar o ledger local do projeto.

.DESCRIPTION
  O script compila uma copia temporaria da aplicacao, inicia o servidor em uma porta livre
  e demonstra dois fluxos: sinistro aprovado/pago e sinistro rejeitado por falta de cobertura.
#>

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("segurochain-test-" + [guid]::NewGuid())
$port = Get-Random -Minimum 18080 -Maximum 28080
$baseUrl = "http://localhost:$port"
$server = $null

function Write-Result([string]$label, [string]$value) {
  Write-Host ("[OK] {0}: {1}" -f $label, $value) -ForegroundColor Green
}

function Assert-Equal($actual, $expected, [string]$label) {
  if ($actual -ne $expected) {
    throw "$label. Esperado: '$expected'. Recebido: '$actual'."
  }
  Write-Result $label $actual
}

function Invoke-Api([string]$path, [string]$method = 'GET', [hashtable]$form = $null) {
  $params = @{ Uri = "$baseUrl$path"; Method = $method; ContentType = 'application/x-www-form-urlencoded' }
  if ($null -ne $form) { $params.Body = $form }
  Invoke-RestMethod @params
}

try {
  New-Item -ItemType Directory -Force $testRoot | Out-Null
  foreach ($item in 'src', 'blockchain', 'contract', 'model', 'web') {
    Copy-Item -Recurse -Force (Join-Path $projectRoot $item) (Join-Path $testRoot $item)
  }
  Copy-Item -Force (Join-Path $projectRoot 'Main.java') $testRoot
  Copy-Item -Force (Join-Path $projectRoot 'ServidorSeguroChain.java') $testRoot

  Push-Location $testRoot
  & javac -encoding UTF-8 -d bin src\*.java blockchain\*.java contract\*.java model\*.java Main.java ServidorSeguroChain.java
  if ($LASTEXITCODE -ne 0) { throw 'A compilacao da aplicacao falhou.' }

  $server = Start-Process -WindowStyle Hidden -FilePath java -ArgumentList '-cp', 'bin', 'ServidorSeguroChain', $port -PassThru
  $deadline = (Get-Date).AddSeconds(15)
  do {
    try { $null = Invoke-Api '/api/state'; break } catch { Start-Sleep -Milliseconds 250 }
  } while ((Get-Date) -lt $deadline)
  if ((Get-Date) -ge $deadline) { throw 'O servidor nao respondeu em 15 segundos.' }

  Write-Host "`n=== SeguroChain: teste de uso da aplicacao ===" -ForegroundColor Cyan

  $policy = Invoke-Api '/api/policies' 'POST' @{
    client = 'Cliente de Teste'; wallet = '0xTESTE'; plate = 'TES1T23'; vehicle = 'Veiculo de Teste'; year = '2024'
    coverageValue = '50000.00'; franchise = '2000.00'; start = '2026-01-01'; end = '2026-12-31'
    cover_COLISAO = 'true'; cover_ROUBO = 'true'; cover_INCENDIO = 'false'
  }
  Write-Result 'Apolice emitida' $policy.id

  $approvedClaim = Invoke-Api '/api/claims' 'POST' @{ policy = $policy.id; type = 'COLISAO'; amount = '10000.00'; date = '2026-06-15' }
  $null = Invoke-Api "/api/claims/$($approvedClaim.id)/analyse" 'POST'
  $state = Invoke-Api '/api/state'
  $approved = $state.claims | Where-Object id -eq $approvedClaim.id
  Assert-Equal $approved.status 'APROVADO' 'Sinistro de colisao aprovado'
  Assert-Equal ([string]$approved.indemnity) '8000.00' 'Indenizacao com franquia calculada'
  $null = Invoke-Api "/api/claims/$($approvedClaim.id)/pay" 'POST'

  $rejectedClaim = Invoke-Api '/api/claims' 'POST' @{ policy = $policy.id; type = 'INCENDIO'; amount = '5000.00'; date = '2026-06-16' }
  $null = Invoke-Api "/api/claims/$($rejectedClaim.id)/analyse" 'POST'
  $state = Invoke-Api '/api/state'
  $rejected = $state.claims | Where-Object id -eq $rejectedClaim.id
  Assert-Equal $rejected.status 'REJEITADO' 'Sinistro sem cobertura rejeitado'

  $ledger = Invoke-Api '/api/ledger'
  Assert-Equal $ledger.valid $true 'Blockchain integra'
  Assert-Equal $ledger.blocks.Count 7 'Eventos registrados na blockchain'
  Write-Host "`nTeste concluido: o fluxo aprovado, o pagamento, a rejeicao e a auditoria funcionaram." -ForegroundColor Cyan
}
finally {
  if ($null -ne $server -and -not $server.HasExited) { Stop-Process -Id $server.Id -Force }
  Pop-Location -ErrorAction SilentlyContinue
  if (Test-Path $testRoot) { Remove-Item -Recurse -Force $testRoot }
}
