param(
  [Parameter(Mandatory = $true)]
  [string]$RepositoryUrl
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path '.git')) {
  git init
  git branch -M main
}

$existingRemote = git remote
if ($existingRemote -contains 'origin') {
  git remote set-url origin $RepositoryUrl
} else {
  git remote add origin $RepositoryUrl
}

git add .
$changes = git status --short
if ($changes) {
  git commit -m 'Update portfolio GitHub Pages site'
}

git branch -M main
git push -u origin main

Write-Host ''
Write-Host 'Push complete.'
Write-Host 'GitHub Pages 설정: Repository Settings > Pages > Build and deployment > Deploy from a branch > main / root'
