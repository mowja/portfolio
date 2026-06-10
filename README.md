# Portfolio

Infrastructure practice portfolio site for GitHub Pages.

## Repository name

Recommended repository name: `portfolio`

Expected Pages URL after setup:

```text
https://mowja.github.io/portfolio/
```

## Contents

- Portfolio presentation PPTX
- 3Tier ELK project guide PDF
- DHCP Web NAT practice guide PDF
- 3Tier DNS DHCP NAT practice guide PDF
- Docker DNS application practice guide PDF

## Publish

1. Create a new public GitHub repository named `portfolio`.
2. Do not initialize it with README, `.gitignore`, or license.
3. Run:

```powershell
.\deploy.ps1 https://github.com/mowja/portfolio.git
```

4. Enable GitHub Pages:
   - Repository `Settings`
   - `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`

GitHub Pages usually becomes available within a few minutes.
