# 웹페이지 CI/CD, S3와 Git 실습가이드_CLI

이 문서는 Windows PowerShell 기준 CLI 실습가이드입니다. GitHub 계정 생성, AWS 계정 생성, MFA, 결제수단, 최초 IAM Access Key 생성, GitHub Secrets 등록처럼 CLI만으로 처리하기 어렵거나 초보자에게 위험한 항목은 GUI 예외 단계로 표시합니다.

예시의 `계정명`, `저장소명`, `버킷이름`, `배포ID`, `CloudFront도메인`은 그대로 복사하지 말고 본인 값으로 바꿉니다. Secret 값과 Access Key는 코드, 문서, 커밋 이력에 남기지 않습니다.

## 목차

0. GUI로 필요한 최초 준비
1. 실습 목표
2. 개념 파트
3. CLI 실습 환경 준비
4. Git 로컬 저장소 구성
5. GitHub 원격 저장소 연결
6. S3 CLI 구성
7. CloudFront CLI 구성
8. GitHub Actions CI/CD 구성
9. 배포 검증
10. 캐시 갱신과 운영
11. 리소스 정리
12. 최종 점검 체크리스트
13. 실습 결과
TS. 문제 해결

## 0. GUI로 필요한 최초 준비

CLI 중심 실습이지만 계정 생성과 최초 보안 설정은 GUI에서 진행합니다. 사전 준비의 기준은 "계정을 가지고 있다"가 아니라 "바로 실습을 실행할 수 있다"입니다.

### 0.1 GitHub 계정 준비

GitHub 웹에서 아래 상태까지 완료합니다.

- GitHub 계정 생성
- 이메일 인증 완료
- 새 Repository 생성 가능
- GitHub Actions 사용 가능
- Repository Settings 접근 가능
- Repository Secrets 등록 권한 보유

확인 기준:

- GitHub에 로그인했을 때 새 저장소를 만들 수 있어야 합니다.
- 저장소의 `Settings > Secrets and variables > Actions` 메뉴에 접근할 수 있어야 합니다.

실패하면 `TS.8 GitHub Actions Secrets 또는 권한 문제가 나는 경우`로 이동합니다.

### 0.2 AWS 계정 준비

AWS 콘솔에서 아래 상태까지 완료합니다.

- AWS 계정 생성
- 결제 수단 등록 완료
- 루트 계정 MFA 설정
- 실습 리전 결정: `ap-northeast-2`
- S3, CloudFront, IAM 서비스 화면 접근 가능
- 가능하면 비용 알림 또는 Budget 생성

주의:

- 루트 계정으로 Access Key를 만들지 않습니다.
- 루트 계정은 결제, MFA, 계정 복구 같은 최초 관리 작업에만 사용합니다.
- 실습 진행과 CLI 인증은 IAM 사용자 또는 IAM Identity Center 사용자를 사용합니다.

확인 기준:

- AWS 콘솔에서 `S3`, `CloudFront`, `IAM`, `Billing and Cost Management` 메뉴를 열 수 있어야 합니다.
- MFA가 설정된 계정으로 다시 로그인할 수 있어야 합니다.

### 0.3 IAM Access Key 생성

이 실습은 초보자가 따라 하기 쉽도록 `aws configure`와 Access Key 방식을 사용합니다. 운영 환경에서는 GitHub Actions OIDC 방식이 더 안전하지만, 이 문서에서는 Access Key 방식을 기준으로 설명합니다.

AWS 콘솔에서 진행:

1. `IAM > Users`로 이동합니다.
2. 실습용 IAM 사용자가 없다면 `Create user`를 선택합니다.
3. 사용자 이름 예시: `portfolio-cli-user`
4. 처음 계정에서 리소스를 직접 생성해야 한다면 실습 진행자용 사용자는 S3, CloudFront, IAM 설정 권한이 필요합니다.
5. `Security credentials > Access keys > Create access key`를 선택합니다.
6. 사용 목적은 `Command Line Interface (CLI)`를 선택합니다.
7. 생성된 `Access key ID`와 `Secret access key`를 안전한 임시 위치에 보관합니다.

보안 기준:

- `Secret access key`는 생성 직후 한 번만 확인할 수 있습니다.
- 잃어버렸다면 기존 키를 비활성화하거나 삭제하고 새로 만듭니다.
- 키 값을 GitHub, Git 커밋, 문서, 메신저에 붙여넣지 않습니다.
- GitHub Actions에는 실습 진행자 키가 아니라 배포 전용 IAM 사용자 키를 등록하는 것을 권장합니다.

실패하면 `TS.2 AWS CLI 인증 실패 또는 AccessDenied가 나는 경우`로 이동합니다.

### 0.4 GitHub Secrets 등록 위치 확인

GitHub Secrets 등록은 GUI 예외 단계입니다. 저장소를 만든 뒤 아래 위치에서 등록합니다.

```text
Repository > Settings > Secrets and variables > Actions > New repository secret
```

나중에 등록할 값:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BUCKET
CLOUDFRONT_DISTRIBUTION_ID
```

확인 기준:

- 값 자체는 다시 보이지 않아야 정상입니다.
- Secrets 목록에는 Secret 이름만 보여야 합니다.

### 0.5 비용 및 보안 주의사항

- S3, CloudFront, Route 53, 도메인, CloudFront 무효화 요청은 과금될 수 있습니다.
- 실습 목적의 S3 퍼블릭 버킷은 외부에서 파일을 읽을 수 있습니다.
- 운영 권장 방식은 S3 비공개 버킷과 CloudFront OAC입니다.
- Access Key는 최소 권한으로 만들고 실습 후 비활성화하거나 삭제합니다.
- 사용하지 않는 S3 버킷과 CloudFront Distribution은 정리합니다.

## 1. 실습 목표

정적 포트폴리오 웹페이지를 로컬에서 제작하고 Git으로 버전 관리한 뒤 GitHub 저장소에 업로드합니다. 이후 GitHub Actions와 AWS CLI를 이용해 S3로 자동 배포하고, CloudFront를 통해 HTTPS 기반 정적 웹사이트로 서비스하는 CI/CD 흐름을 구성합니다.

완료 기준:

- 로컬 작업 폴더가 Git 저장소로 관리됩니다.
- GitHub 원격 저장소에 작업 브랜치가 푸시됩니다.
- S3 버킷에 `index.html`, `style.css`, `main.js`, 이미지 파일이 업로드됩니다.
- CloudFront URL에서 HTTPS로 웹페이지가 열립니다.
- GitHub Actions가 push 후 자동으로 S3 동기화와 CloudFront 캐시 무효화를 실행합니다.

## 2. 개념 파트

### 2.1 정적 웹사이트

정적 웹사이트는 서버에서 별도 프로그램을 실행하지 않고 HTML, CSS, JavaScript, 이미지 파일을 그대로 전달하는 웹사이트입니다. 포트폴리오 사이트처럼 로그인, 데이터베이스, 사용자별 화면 처리가 필요 없는 경우 S3와 CloudFront만으로도 운영할 수 있습니다.

- HTML: 화면 구조
- CSS: 디자인과 반응형 레이아웃
- JavaScript: 버튼, 모달, 슬라이드 등 동작
- 이미지/SVG/폰트: 시각 자료와 브랜드 요소

### 2.2 버전관리

버전관리는 파일의 변경 이력을 기록하고 필요할 때 이전 상태를 확인하거나 복구할 수 있게 하는 방식입니다.

- 변경 내역 추적
- 이전 버전 확인
- 실수 발생 시 복구
- 브랜치 기반 작업 분리

### 2.3 Git, GitHub, GitLab

- Git: 로컬 PC에서 변경 이력을 관리하는 도구
- GitHub: Git 저장소를 원격에서 관리하고 Actions를 제공하는 플랫폼
- GitLab: Git 저장소와 CI/CD 기능을 제공하는 플랫폼
- Repository: 프로젝트 파일과 변경 이력이 저장되는 공간
- Branch: `main`을 보존하면서 별도 작업을 진행하는 분기

### 2.4 CI/CD

CI/CD는 코드 변경 이후 검사, 빌드, 배포 과정을 자동화하는 방식입니다.

- CI: Continuous Integration, 변경사항 통합 및 검사
- CD: Continuous Delivery 또는 Continuous Deployment, 검증된 결과물 배포

본 실습에서는 `git push`를 트리거로 GitHub Actions가 실행되고, S3 동기화와 CloudFront 캐시 무효화가 자동으로 수행됩니다.

### 2.5 S3, CloudFront, Route 53

- S3: 정적 웹 파일 저장소
- CloudFront: CDN, HTTPS, 캐시 처리
- Route 53: AWS DNS 서비스
- 외부 도메인 서비스: Gabia 같은 도메인 구매/관리 서비스
- ACM: CloudFront HTTPS 인증서 발급 서비스, CloudFront용 인증서는 `us-east-1`에서 발급 필요

이번 CLI 문서에서는 도메인 연결 절차를 자세히 다루지 않습니다. 도메인 연결은 CloudFront 배포가 정상 동작한 뒤 별도 문서에서 진행합니다.

### 2.6 전체 흐름

```text
로컬 PC
  └─ Git 작업 폴더
      ├─ index.html
      ├─ style.css
      ├─ main.js
      └─ images/

GitHub Repository
  ├─ 0611_PWJ 또는 main 브랜치
  └─ GitHub Actions Workflow

AWS
  ├─ S3 Bucket: 정적 웹 파일 저장
  └─ CloudFront: HTTPS, CDN, 캐시
```

## 3. CLI 실습 환경 준비

### 3.1 PowerShell 기준

이 문서의 명령어는 Windows PowerShell 기준입니다.

- 줄 끝의 백틱 문자인 `` ` `` 은 PowerShell 줄바꿈 문자입니다.
- 백틱 뒤에는 공백을 넣지 않습니다.
- macOS/Linux에서는 백틱 대신 `\`를 사용하거나 한 줄로 실행합니다.
- Windows PowerShell에서 `curl`은 별칭일 수 있으므로 이 문서에서는 `curl.exe`를 사용합니다.

### 3.2 로컬 도구 설치와 확인

이미 설치되어 있다면 확인 명령어만 실행합니다.

설치 예시:

```powershell
winget install --id Git.Git -e
winget install --id Amazon.AWSCLI -e
winget install --id GitHub.cli -e
```

설치 후 PowerShell을 새로 열고 확인합니다.

```powershell
git --version
aws --version
gh --version
```

성공 기준:

- `git version 2.x.x` 형식의 출력이 보입니다.
- `aws-cli/2.x.x` 형식의 출력이 보입니다.
- GitHub CLI를 설치했다면 `gh version` 출력이 보입니다.

실패하면 `TS.3 CLI 도구가 인식되지 않는 경우`로 이동합니다.

### 3.3 Git 사용자 정보 설정

```powershell
git config --global user.name "사용자이름"
git config --global user.email "GitHub이메일"
```

확인:

```powershell
git config --global user.name
git config --global user.email
```

성공 기준:

- 사용자 이름과 이메일이 각각 한 줄씩 출력됩니다.
- 커밋 메시지는 항상 한글로 작성합니다.

### 3.4 AWS CLI 인증 설정

Access Key 방식 예시:

```powershell
aws configure
```

입력 값:

```text
AWS Access Key ID: IAM 사용자 Access Key ID
AWS Secret Access Key: IAM 사용자 Secret Access Key
Default region name: ap-northeast-2
Default output format: json
```

설정 확인:

```powershell
aws configure list
aws sts get-caller-identity --output table
```

성공 기준:

- `aws configure list`에서 region이 `ap-northeast-2`로 보입니다.
- `aws sts get-caller-identity` 출력에 `Account`, `Arn`, `UserId`가 보입니다.
- `Arn`이 루트 계정이 아니라 IAM 사용자 또는 역할이어야 합니다.

실패하면 `TS.2 AWS CLI 인증 실패 또는 AccessDenied가 나는 경우`로 이동합니다.

### 3.5 실습 변수 지정

아래 값은 실습 내내 사용합니다. 버킷 이름은 전 세계에서 고유해야 하며 소문자, 숫자, 하이픈만 사용하는 것이 안전합니다.

```powershell
$REGION="ap-northeast-2"
$BRANCH="0611_PWJ"
$BUCKET="portfolio-static-site-본인고유값"
```

확인:

```powershell
Write-Host $REGION
Write-Host $BRANCH
Write-Host $BUCKET
```

성공 기준:

- 세 값이 본인이 정한 값으로 출력됩니다.
- `$BUCKET`에는 공백, 밑줄, 한글, 대문자가 없어야 합니다.

### 3.6 AWS 권한 구분

실습에는 두 종류의 권한이 등장합니다.

| 구분 | 용도 | 권장 |
|---|---|---|
| 실습 진행자 CLI 권한 | S3 버킷 생성, CloudFront 생성, IAM 정책 확인 | 처음 실습에서는 넓은 권한이 필요할 수 있음 |
| GitHub Actions 배포 권한 | S3 파일 동기화, CloudFront 무효화 | 최소 권한 IAM 사용자 또는 OIDC Role 권장 |

GitHub Actions 배포용 최소 권한 예시:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::버킷이름"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::버킷이름/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": ["arn:aws:cloudfront::계정ID:distribution/배포ID"]
    }
  ]
}
```

처음에는 `버킷이름`, `계정ID`, `배포ID`를 모르기 때문에 S3와 CloudFront 리소스를 만든 뒤 배포용 권한을 확정합니다.

계정 ID 확인:

```powershell
aws sts get-caller-identity --query Account --output text
```

## 4. Git 로컬 저장소 구성

### 4.1 프로젝트 폴더 이동

```powershell
cd "C:\Users\mowja\Documents\포폴사이트 제작기"
```

확인:

```powershell
Get-Location
```

성공 기준:

- 출력 경로가 `C:\Users\mowja\Documents\포폴사이트 제작기`입니다.

### 4.2 Git 저장소 확인

```powershell
git status
git branch -vv
git remote -v
```

Git 저장소가 아니라는 메시지가 나오면 초기화합니다.

```powershell
git init
git status
```

성공 기준:

- `git status`가 현재 브랜치와 변경 파일 목록을 보여줍니다.
- `fatal: not a git repository`가 나오지 않습니다.

### 4.3 브랜치 생성 또는 전환

`main`은 보존하고 작업 브랜치에서 수정합니다.

브랜치가 없다면:

```powershell
git switch -c $BRANCH
```

이미 브랜치가 있다면:

```powershell
git switch $BRANCH
```

현재 브랜치 확인:

```powershell
git branch --show-current
```

성공 기준:

- 출력이 `0611_PWJ`입니다.

### 4.4 커밋 전 변경사항 확인

```powershell
git status
git diff --stat
```

확인 기준:

- 배포 대상 웹 파일과 설정 파일만 변경 목록에 있어야 합니다.
- Access Key, Secret, `.env`, 임시 JSON에 비밀 값이 있으면 커밋하지 않습니다.
- 포트폴리오 사이트 코드가 아닌 실습가이드만 수정하는 작업에서는 `index.html`, `style.css`, `main.js`를 건드리지 않습니다.

### 4.5 변경사항 커밋

실습자는 아래처럼 커밋합니다. 커밋 메시지는 한글로 작성합니다.

```powershell
git add .
git commit -m "포트폴리오 사이트 초기 구성"
```

커밋 기록 확인:

```powershell
git log --oneline -3
```

성공 기준:

- 방금 작성한 한글 커밋 메시지가 가장 위에 보입니다.

## 5. GitHub 원격 저장소 연결

### 5.1 GitHub CLI 로그인

GitHub CLI를 사용할 수 있다면 CLI로 로그인합니다.

```powershell
gh auth login
```

권장 선택:

```text
GitHub.com
HTTPS
Login with a web browser
```

확인:

```powershell
gh auth status
```

성공 기준:

- 현재 GitHub 계정으로 로그인되어 있다는 메시지가 보입니다.

GitHub CLI를 사용하지 않는다면 GitHub 웹에서 빈 저장소를 만들고 `5.3 원격 저장소 직접 연결`로 진행합니다.

### 5.2 GitHub CLI로 저장소 생성

저장소 이름 예시:

```powershell
$REPO="portfolio-site"
```

비공개 저장소 생성 예시:

```powershell
gh repo create $REPO --private --source . --remote origin
```

공개 저장소로 만들려면 `--private` 대신 `--public`을 사용합니다.

확인:

```powershell
git remote -v
```

성공 기준:

- `origin`이 GitHub 저장소 URL을 가리킵니다.

### 5.3 원격 저장소 직접 연결

GitHub 웹에서 저장소를 이미 만든 경우:

```powershell
git remote add origin https://github.com/계정명/저장소명.git
```

이미 연결된 원격을 바꿔야 한다면:

```powershell
git remote set-url origin https://github.com/계정명/저장소명.git
```

확인:

```powershell
git remote -v
```

성공 기준:

- fetch와 push URL이 같은 GitHub 저장소를 가리킵니다.

### 5.4 GitHub로 푸시

최초 푸시:

```powershell
git push -u origin $BRANCH
```

이후 푸시:

```powershell
git push
```

확인:

```powershell
git branch -vv
```

성공 기준:

- 현재 브랜치 오른쪽에 `origin/0611_PWJ`가 표시됩니다.
- GitHub 저장소에서 브랜치와 커밋을 확인할 수 있습니다.

실패하면 `TS.1 Git push가 거절되는 경우`로 이동합니다.

### 5.5 원격 변경이 있을 때

원격에 로컬에 없는 변경이 있으면 먼저 가져와 재정렬합니다.

```powershell
git fetch origin $BRANCH
git rebase origin/$BRANCH
git push
```

주의:

- 실습 단계에서는 강제 푸시를 사용하지 않습니다.
- 충돌이 나면 어떤 파일에서 충돌이 났는지 확인하고 해결한 뒤 `git rebase --continue`를 실행합니다.

## 6. S3 CLI 구성

### 6.1 S3 공개 방식과 CloudFront OAC 방식 차이

초보자 실습에서는 절차가 단순한 S3 퍼블릭 읽기 방식을 기본 경로로 사용합니다. 운영 환경에서는 CloudFront OAC와 S3 비공개 버킷을 권장합니다.

| 항목 | S3 퍼블릭 방식 | CloudFront OAC 방식 |
|---|---|---|
| S3 직접 접근 | 가능 | 차단 |
| S3 Public Access Block | 일부 해제 필요 | 유지 |
| CloudFront Origin | S3 REST endpoint 또는 website endpoint | S3 REST endpoint |
| 보안 수준 | 낮음, 실습용 | 높음, 운영 권장 |
| 초보자 난이도 | 낮음 | 높음 |
| 이 문서 처리 | CLI 기본 실습 | 차이와 검증 기준만 설명 |

중요:

- S3 website endpoint는 OAC와 함께 사용할 수 없습니다.
- OAC 방식은 S3 REST endpoint를 Origin으로 사용하고 버킷은 비공개로 둡니다.
- OAC Distribution 생성은 JSON 설정이 길고 정책 연결 순서가 복잡하므로 AWS 콘솔 생성 후 CLI 검증으로 진행해도 됩니다.

### 6.2 S3 버킷 생성

버킷 이름과 리전을 다시 확인합니다.

```powershell
Write-Host $BUCKET
Write-Host $REGION
```

버킷 생성:

```powershell
aws s3api create-bucket `
  --bucket $BUCKET `
  --region $REGION `
  --create-bucket-configuration LocationConstraint=$REGION
```

생성 확인:

```powershell
aws s3api head-bucket --bucket $BUCKET
aws s3 ls
```

성공 기준:

- `head-bucket` 명령이 오류 없이 종료됩니다.
- `aws s3 ls` 목록에 `$BUCKET` 값이 보입니다.

실패하면 `TS.4 S3 버킷 생성 또는 리전 오류가 나는 경우`로 이동합니다.

### 6.3 정적 웹사이트 호스팅 설정

S3 단독 접속 검증을 위해 정적 웹사이트 호스팅을 켭니다.

```powershell
aws s3 website s3://$BUCKET/ `
  --index-document index.html `
  --error-document index.html
```

설정 확인:

```powershell
aws s3api get-bucket-website --bucket $BUCKET
```

성공 기준:

- `IndexDocument`의 `Suffix`가 `index.html`입니다.
- `ErrorDocument`의 `Key`가 `index.html`입니다.

### 6.4 실습용 퍼블릭 읽기 정책 설정

정적 웹사이트 endpoint로 직접 접속하려면 퍼블릭 읽기 정책이 필요합니다. 이 설정은 실습용입니다.

Public Access Block 해제:

```powershell
aws s3api put-public-access-block `
  --bucket $BUCKET `
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
```

버킷 정책 파일 생성:

```powershell
$POLICY_FILE="bucket-policy.json"

@"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticWebsitePractice",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
"@ | Set-Content -Encoding utf8 $POLICY_FILE
```

정책 적용:

```powershell
aws s3api put-bucket-policy `
  --bucket $BUCKET `
  --policy file://$POLICY_FILE
```

확인:

```powershell
aws s3api get-public-access-block --bucket $BUCKET
aws s3api get-bucket-policy --bucket $BUCKET
```

성공 기준:

- `BlockPublicPolicy`와 `RestrictPublicBuckets`가 `false`입니다.
- 정책에 `s3:GetObject`와 `arn:aws:s3:::버킷이름/*`가 포함됩니다.

실패하면 `TS.5 S3 403 AccessDenied가 나는 경우`로 이동합니다.

### 6.5 파일 업로드

먼저 실제 업로드 없이 대상 파일을 확인합니다.

```powershell
aws s3 sync . s3://$BUCKET `
  --delete `
  --exclude ".git/*" `
  --exclude ".github/*" `
  --exclude "*.md" `
  --exclude "*.docx" `
  --exclude "bucket-policy.json" `
  --exclude "cf-*.json" `
  --dryrun
```

확인 기준:

- `index.html`, `style.css`, `main.js`, `images/` 파일이 업로드 대상으로 보입니다.
- `.git`, `.github`, 문서 파일, Access Key가 포함된 파일은 업로드 대상으로 보이면 안 됩니다.

실제 업로드:

```powershell
aws s3 sync . s3://$BUCKET `
  --delete `
  --exclude ".git/*" `
  --exclude ".github/*" `
  --exclude "*.md" `
  --exclude "*.docx" `
  --exclude "bucket-policy.json" `
  --exclude "cf-*.json"
```

업로드 확인:

```powershell
aws s3 ls s3://$BUCKET
aws s3api head-object --bucket $BUCKET --key index.html
```

성공 기준:

- `aws s3 ls` 결과에 `index.html`, `style.css`, `main.js`가 보입니다.
- `head-object` 결과에 `ContentLength`, `ContentType`, `LastModified`가 보입니다.

실패하면 `TS.6 S3 업로드 파일이 누락되는 경우`로 이동합니다.

### 6.6 S3 website endpoint 검증

```powershell
$S3_WEBSITE="http://${BUCKET}.s3-website.${REGION}.amazonaws.com"
curl.exe -I $S3_WEBSITE
```

성공 기준:

- `HTTP/1.1 200 OK` 또는 `HTTP/1.1 304 Not Modified`가 보입니다.
- 403이 나오면 퍼블릭 접근 차단이나 버킷 정책 문제입니다.

실패하면 `TS.5 S3 403 AccessDenied가 나는 경우`로 이동합니다.

## 7. CloudFront CLI 구성

### 7.1 CloudFront 생성 방식 선택

이 문서의 기본 CLI 경로는 S3 REST endpoint를 Origin으로 사용하는 간단한 CloudFront Distribution 생성입니다.

```powershell
$S3_REST_ORIGIN="${BUCKET}.s3.${REGION}.amazonaws.com"
Write-Host $S3_REST_ORIGIN
```

참고:

- 이 경로는 초보자 실습용으로 간단합니다.
- S3 버킷은 `6.4 실습용 퍼블릭 읽기 정책 설정`이 되어 있어야 합니다.
- 운영 권장 OAC 방식은 S3 버킷을 비공개로 유지하고 CloudFront에 OAC를 연결합니다.
- OAC 방식 Distribution을 AWS 콘솔에서 생성했다면 `7.3 Distribution 조회`부터 CLI 검증을 진행합니다.

### 7.2 CloudFront Distribution 생성

간단 생성:

```powershell
aws cloudfront create-distribution `
  --origin-domain-name $S3_REST_ORIGIN `
  --default-root-object index.html `
  --query "Distribution.{Id:Id,DomainName:DomainName,Status:Status}" `
  --output table
```

출력 예시:

```text
-----------------------------------------------
|             CreateDistribution              |
+----------------+----------------------------+
| DomainName     | dxxxxxxxxxxxxx.cloudfront.net |
| Id             | EXXXXXXXXXXXXX              |
| Status         | InProgress                  |
+----------------+----------------------------+
```

출력된 값을 변수에 저장합니다.

```powershell
$CF_ID="배포ID"
$CF_DOMAIN="CloudFront도메인"
```

예시:

```powershell
$CF_ID="EXXXXXXXXXXXXX"
$CF_DOMAIN="dxxxxxxxxxxxxx.cloudfront.net"
```

성공 기준:

- `Id`가 `E`로 시작하는 형태로 출력됩니다.
- `DomainName`이 `cloudfront.net`으로 끝납니다.
- 생성 직후 `Status`는 보통 `InProgress`입니다.

실패하면 `TS.7 CloudFront 403, 404, InProgress 문제가 나는 경우`로 이동합니다.

### 7.3 Distribution 조회

전체 목록:

```powershell
aws cloudfront list-distributions `
  --query "DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status,Enabled:Enabled}" `
  --output table
```

특정 Distribution 확인:

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.{Id:Id,DomainName:DomainName,Status:Status,Enabled:DistributionConfig.Enabled}" `
  --output table
```

성공 기준:

- `$CF_ID`에 해당하는 Distribution이 조회됩니다.
- `Enabled`가 `True`입니다.

### 7.4 배포 완료 대기

CloudFront는 생성 직후 바로 사용할 수 없습니다. 상태가 `Deployed`가 될 때까지 기다립니다.

```powershell
aws cloudfront wait distribution-deployed --id $CF_ID
```

상태 확인:

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.Status" `
  --output text
```

성공 기준:

- 출력이 `Deployed`입니다.

### 7.5 기본 루트 객체와 Origin 확인

```powershell
aws cloudfront get-distribution-config --id $CF_ID `
  --query "DistributionConfig.{DefaultRootObject:DefaultRootObject,Origins:Origins.Items[].DomainName,Enabled:Enabled}" `
  --output table
```

확인 기준:

- `DefaultRootObject`가 `index.html`입니다.
- Origin이 `${BUCKET}.s3.${REGION}.amazonaws.com` 또는 본인이 설정한 S3 Origin입니다.
- `Enabled`가 `True`입니다.

### 7.6 CloudFront URL 검증

```powershell
curl.exe -I "https://$CF_DOMAIN/"
```

성공 기준:

- `HTTP/2 200` 또는 `HTTP/1.1 200 OK`가 보입니다.
- `server: CloudFront` 또는 `x-cache` 헤더가 보입니다.
- 첫 요청은 `Miss from cloudfront`, 이후 요청은 `Hit from cloudfront`가 나올 수 있습니다.

실패하면 `TS.7 CloudFront 403, 404, InProgress 문제가 나는 경우`로 이동합니다.

### 7.7 캐시 무효화

```powershell
$INVALIDATION_ID = aws cloudfront create-invalidation `
  --distribution-id $CF_ID `
  --paths "/*" `
  --query "Invalidation.Id" `
  --output text
```

무효화 완료 대기:

```powershell
aws cloudfront wait invalidation-completed `
  --distribution-id $CF_ID `
  --id $INVALIDATION_ID
```

상태 확인:

```powershell
aws cloudfront list-invalidations --distribution-id $CF_ID `
  --query "InvalidationList.Items[0].{Id:Id,Status:Status,CreateTime:CreateTime}" `
  --output table
```

성공 기준:

- 최신 Invalidation의 `Status`가 `Completed`입니다.

## 8. GitHub Actions CI/CD 구성

### 8.1 GitHub Secrets 준비

GitHub 저장소 GUI에서 아래 값을 등록합니다.

```text
Repository > Settings > Secrets and variables > Actions > New repository secret
```

등록할 Secret:

| Secret 이름 | 값 |
|---|---|
| `AWS_ACCESS_KEY_ID` | 배포용 IAM 사용자 Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | 배포용 IAM 사용자 Secret Access Key |
| `AWS_REGION` | `ap-northeast-2` |
| `S3_BUCKET` | `$BUCKET` 값 |
| `CLOUDFRONT_DISTRIBUTION_ID` | `$CF_ID` 값 |

확인 기준:

- Secrets 목록에 위 5개 이름이 보입니다.
- Secret 값은 화면에 다시 표시되지 않습니다.

GitHub CLI가 준비되어 있다면 아래 방식도 사용할 수 있습니다.

```powershell
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION --body $REGION
gh secret set S3_BUCKET --body $BUCKET
gh secret set CLOUDFRONT_DISTRIBUTION_ID --body $CF_ID
```

Secret 목록 확인:

```powershell
gh secret list
```

실패하면 `TS.8 GitHub Actions Secrets 또는 권한 문제가 나는 경우`로 이동합니다.

### 8.2 Workflow 파일 생성

폴더 생성:

```powershell
New-Item -ItemType Directory -Force ".github\workflows"
```

파일 경로:

```text
.github/workflows/deploy-s3.yml
```

파일 내용:

```yaml
name: Deploy static portfolio to S3

on:
  push:
    branches:
      - main
      - 0611_PWJ

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Check AWS identity
        run: aws sts get-caller-identity

      - name: Sync files to S3
        run: |
          aws s3 sync . s3://${{ secrets.S3_BUCKET }} \
            --delete \
            --exclude ".git/*" \
            --exclude ".github/*" \
            --exclude "*.md" \
            --exclude "*.docx" \
            --exclude "bucket-policy.json" \
            --exclude "cf-*.json"

      - name: Invalidate CloudFront cache
        run: |
          INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*" \
            --query "Invalidation.Id" \
            --output text)
          aws cloudfront wait invalidation-completed \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --id "$INVALIDATION_ID"
```

확인:

```powershell
git status
```

성공 기준:

- `.github/workflows/deploy-s3.yml` 파일이 변경 목록에 보입니다.
- YAML 들여쓰기가 공백 2칸 기준으로 유지됩니다.

### 8.3 Workflow 커밋과 푸시

```powershell
git add .github/workflows/deploy-s3.yml
git commit -m "S3 자동 배포 워크플로 추가"
git push
```

성공 기준:

- 커밋 메시지가 한글입니다.
- push 후 GitHub Actions가 자동 실행됩니다.

### 8.4 CI/CD 실행 확인

GitHub CLI:

```powershell
gh run list --workflow deploy-s3.yml --limit 5
```

최신 실행 로그 확인:

```powershell
gh run view --log
```

GitHub GUI:

```text
Repository > Actions > Deploy static portfolio to S3
```

성공 기준:

- `Checkout repository` 성공
- `Configure AWS credentials` 성공
- `Check AWS identity` 성공
- `Sync files to S3` 성공
- `Invalidate CloudFront cache` 성공

실패하면 `TS.8 GitHub Actions Secrets 또는 권한 문제가 나는 경우`로 이동합니다.

## 9. 배포 검증

### 9.1 Git 검증

```powershell
git status
git log --oneline -3
git branch -vv
git remote -v
```

성공 기준:

- `git status`에 커밋할 변경사항이 없거나 의도한 변경만 남아 있습니다.
- 최신 커밋 메시지가 한글입니다.
- 현재 브랜치가 `origin/0611_PWJ`를 추적합니다.

실패하면 `TS.1 Git push가 거절되는 경우`로 이동합니다.

### 9.2 S3 검증

```powershell
aws s3 ls s3://$BUCKET
aws s3api head-object --bucket $BUCKET --key index.html
aws s3api head-object --bucket $BUCKET --key style.css
aws s3api head-object --bucket $BUCKET --key main.js
```

이미지 폴더가 있다면:

```powershell
aws s3 ls s3://$BUCKET/images/
```

성공 기준:

- `index.html` 존재
- `style.css` 존재
- `main.js` 존재
- 이미지 파일을 사용한다면 `images/` 하위 파일 존재

실패하면 `TS.6 S3 업로드 파일이 누락되는 경우`로 이동합니다.

### 9.3 CloudFront 검증

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.{Status:Status,DomainName:DomainName,Enabled:DistributionConfig.Enabled}" `
  --output table
```

```powershell
curl.exe -I "https://$CF_DOMAIN/"
```

성공 기준:

- CloudFront 상태가 `Deployed`입니다.
- `Enabled`가 `True`입니다.
- HTTP 상태 코드가 `200`입니다.
- 응답 헤더에 `x-cache` 또는 `CloudFront` 관련 값이 보입니다.

실패하면 `TS.7 CloudFront 403, 404, InProgress 문제가 나는 경우`로 이동합니다.

### 9.4 GitHub Actions 검증

```powershell
gh run list --limit 5
gh run view --log
```

성공 기준:

- 최신 workflow 결과가 `completed`와 `success`입니다.
- S3 sync 단계에 AccessDenied가 없습니다.
- CloudFront invalidation 단계가 완료됩니다.

실패하면 `TS.8 GitHub Actions Secrets 또는 권한 문제가 나는 경우`로 이동합니다.

### 9.5 최종 접속 검증

브라우저 또는 CLI에서 CloudFront URL을 확인합니다.

```powershell
curl.exe -I "https://$CF_DOMAIN/"
```

수정한 화면이 반영되지 않으면:

```powershell
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
```

성공 기준:

- 브라우저에서 HTTPS 주소로 포트폴리오 첫 화면이 열립니다.
- CSS와 JS가 적용되어 있습니다.
- 이미지가 깨지지 않습니다.

화면이 이전 버전이면 `TS.9 배포했는데 화면이 안 바뀌는 경우`로 이동합니다.

## 10. 캐시 갱신과 운영

### 10.1 CloudFront Invalidation

전체 무효화:

```powershell
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
```

특정 파일만 무효화:

```powershell
aws cloudfront create-invalidation `
  --distribution-id $CF_ID `
  --paths "/index.html" "/style.css" "/main.js"
```

상태 확인:

```powershell
aws cloudfront list-invalidations --distribution-id $CF_ID `
  --query "InvalidationList.Items[0].{Id:Id,Status:Status,CreateTime:CreateTime}" `
  --output table
```

운영 기준:

- HTML은 자주 무효화할 수 있습니다.
- CSS, JS, 이미지 파일은 파일명 또는 쿼리 문자열 버전을 바꾸는 방식이 안전합니다.
- 전체 무효화 `/*`는 편하지만 과금될 수 있으므로 남발하지 않습니다.

### 10.2 파일 버전 전략

CSS와 JS가 캐시에 남아 있으면 버전 쿼리를 사용합니다.

```html
<link rel="stylesheet" href="style.css?v=20260614">
<script src="main.js?v=20260614"></script>
```

이미지는 파일명을 바꾸는 방식도 사용할 수 있습니다.

```text
profile_v2.jpg
career_timeline_v2.svg
```

확인 기준:

- HTML에서 참조하는 파일명과 실제 S3 파일명이 일치합니다.
- 파일명 대소문자가 정확히 일치합니다.

### 10.3 운영 시 보안 기준

- Access Key는 주기적으로 교체합니다.
- GitHub Actions 배포 권한은 필요한 S3 버킷과 CloudFront Distribution으로 제한합니다.
- 운영 환경에서는 S3 Public Access Block을 유지하고 CloudFront OAC 방식을 사용합니다.
- GitHub Actions 로그에 Secret 값이 출력되지 않게 합니다.
- 삭제 전에는 반드시 `$BUCKET`, `$CF_ID`, `$CF_DOMAIN` 값을 다시 확인합니다.

## 11. 리소스 정리

실습 후 사용하지 않는 리소스는 삭제하거나 비활성화합니다. 삭제 명령은 되돌리기 어렵기 때문에 먼저 대상 값을 출력하고 확인합니다.

### 11.1 삭제 대상 확인

```powershell
Write-Host "S3 Bucket: $BUCKET"
Write-Host "CloudFront Distribution ID: $CF_ID"
Write-Host "CloudFront Domain: $CF_DOMAIN"
```

S3 내용 확인:

```powershell
aws s3 ls s3://$BUCKET --recursive
```

CloudFront 확인:

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.{Id:Id,DomainName:DomainName,Status:Status,Enabled:DistributionConfig.Enabled}" `
  --output table
```

### 11.2 S3 파일 삭제

먼저 dry run으로 삭제 대상을 확인합니다.

```powershell
aws s3 rm s3://$BUCKET --recursive --dryrun
```

문제가 없으면 삭제합니다.

```powershell
aws s3 rm s3://$BUCKET --recursive
```

성공 기준:

- 삭제 후 `aws s3 ls s3://$BUCKET --recursive` 결과가 비어 있습니다.

### 11.3 S3 버킷 정책과 버킷 삭제

버킷 정책 삭제:

```powershell
aws s3api delete-bucket-policy --bucket $BUCKET
```

버킷 삭제:

```powershell
aws s3api delete-bucket --bucket $BUCKET --region $REGION
```

삭제 확인:

```powershell
aws s3api head-bucket --bucket $BUCKET
```

성공 기준:

- 삭제 후 `head-bucket`은 오류가 나야 정상입니다.
- 버킷이 비어 있지 않다는 오류가 나면 `TS.11 S3 버킷 삭제가 실패하는 경우`로 이동합니다.

### 11.4 CloudFront 비활성화

CloudFront는 바로 삭제되지 않습니다. 먼저 `Enabled`를 `false`로 바꾸고 `Deployed` 상태가 될 때까지 기다립니다.

현재 설정 가져오기:

```powershell
$DIST_CONFIG = aws cloudfront get-distribution-config --id $CF_ID | ConvertFrom-Json
$ETAG = $DIST_CONFIG.ETag
$DIST_CONFIG.DistributionConfig.Enabled = $false
$DIST_CONFIG.DistributionConfig | ConvertTo-Json -Depth 100 | Set-Content -Encoding utf8 "cf-disable.json"
```

비활성화 적용:

```powershell
aws cloudfront update-distribution `
  --id $CF_ID `
  --if-match $ETAG `
  --distribution-config file://cf-disable.json
```

대기:

```powershell
aws cloudfront wait distribution-deployed --id $CF_ID
```

확인:

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.DistributionConfig.Enabled" `
  --output text
```

성공 기준:

- 출력이 `False`입니다.

### 11.5 CloudFront 삭제

비활성화가 완료된 뒤 삭제합니다.

```powershell
$DIST_CONFIG = aws cloudfront get-distribution-config --id $CF_ID | ConvertFrom-Json
$DELETE_ETAG = $DIST_CONFIG.ETag

aws cloudfront delete-distribution `
  --id $CF_ID `
  --if-match $DELETE_ETAG
```

삭제 확인:

```powershell
aws cloudfront get-distribution --id $CF_ID
```

성공 기준:

- 삭제 후에는 Distribution을 찾을 수 없다는 오류가 나야 정상입니다.

### 11.6 Access Key와 GitHub Secrets 정리

배포용 IAM 사용자 이름 예시:

```powershell
$IAM_USER="portfolio-deploy-user"
```

Access Key 목록 확인:

```powershell
aws iam list-access-keys --user-name $IAM_USER
```

키 비활성화:

```powershell
aws iam update-access-key `
  --user-name $IAM_USER `
  --access-key-id AccessKeyId값 `
  --status Inactive
```

키 삭제:

```powershell
aws iam delete-access-key `
  --user-name $IAM_USER `
  --access-key-id AccessKeyId값
```

GitHub CLI로 Secrets 삭제:

```powershell
gh secret delete AWS_ACCESS_KEY_ID
gh secret delete AWS_SECRET_ACCESS_KEY
gh secret delete AWS_REGION
gh secret delete S3_BUCKET
gh secret delete CLOUDFRONT_DISTRIBUTION_ID
```

GUI로 삭제할 수도 있습니다.

```text
Repository > Settings > Secrets and variables > Actions
```

## 12. 최종 점검 체크리스트

- [ ] GitHub 계정 이메일 인증이 완료되었는가
- [ ] AWS 계정 MFA와 결제수단 설정이 완료되었는가
- [ ] 루트 계정 Access Key를 사용하지 않았는가
- [ ] `git --version`, `aws --version` 확인이 성공했는가
- [ ] `aws sts get-caller-identity` 확인이 성공했는가
- [ ] Git 사용자 이름과 이메일이 설정되었는가
- [ ] 현재 브랜치가 `0611_PWJ`인가
- [ ] 커밋 메시지를 한글로 작성했는가
- [ ] GitHub 원격 저장소가 연결되었는가
- [ ] 최신 커밋이 GitHub에 푸시되었는가
- [ ] S3 버킷 이름이 고유하고 리전이 `ap-northeast-2`인가
- [ ] S3에 `index.html`, `style.css`, `main.js`, 이미지 파일이 업로드되었는가
- [ ] CloudFront Distribution 상태가 `Deployed`인가
- [ ] CloudFront URL에서 HTTP 상태 코드 `200`이 확인되는가
- [ ] GitHub Secrets 5개가 등록되었는가
- [ ] GitHub Actions가 성공했는가
- [ ] CloudFront 캐시 무효화가 완료되었는가
- [ ] Access Key가 코드, 문서, Git 이력에 노출되지 않았는가
- [ ] 실습 후 불필요한 리소스 정리 계획이 있는가

## 13. 실습 결과

이 실습을 완료하면 로컬에서 제작한 정적 포트폴리오 웹페이지를 Git으로 관리하고, GitHub Actions를 통해 AWS S3와 CloudFront에 자동 배포하는 CLI 중심 CI/CD 흐름을 구성할 수 있습니다.

최종 산출물:

- GitHub 원격 저장소
- S3 정적 파일 저장 버킷
- CloudFront HTTPS 배포 URL
- GitHub Actions 배포 workflow
- CLI 기반 검증 명령어와 문제 해결 기준

## TS. 문제 해결

### TS.1 Git push가 거절되는 경우

증상:

```text
rejected
fetch first
non-fast-forward
```

원인:

- 원격 브랜치에 로컬에 없는 커밋이 있습니다.
- GitHub 웹에서 README를 만들었거나 다른 PC에서 먼저 push했습니다.

해결:

```powershell
git fetch origin $BRANCH
git rebase origin/$BRANCH
git push
```

충돌이 나면:

```powershell
git status
```

충돌 파일을 수정한 뒤:

```powershell
git add 충돌해결파일
git rebase --continue
git push
```

### TS.2 AWS CLI 인증 실패 또는 AccessDenied가 나는 경우

증상:

```text
Unable to locate credentials
The security token included in the request is invalid
AccessDenied
```

확인:

```powershell
aws configure list
aws sts get-caller-identity --output table
```

점검 항목:

- `aws configure`에 Access Key ID와 Secret Access Key를 반대로 입력하지 않았는가
- Access Key가 비활성화되었거나 삭제되지 않았는가
- 기본 리전이 `ap-northeast-2`인가
- IAM 사용자에게 S3 또는 CloudFront 권한이 있는가
- 루트 계정 Access Key를 만들려고 하지 않았는가

해결 기준:

- `aws sts get-caller-identity`가 Account, Arn, UserId를 출력해야 다음 단계로 진행합니다.

### TS.3 CLI 도구가 인식되지 않는 경우

증상:

```text
git : The term 'git' is not recognized
aws : The term 'aws' is not recognized
gh : The term 'gh' is not recognized
```

해결:

```powershell
winget install --id Git.Git -e
winget install --id Amazon.AWSCLI -e
winget install --id GitHub.cli -e
```

PowerShell을 완전히 닫고 새로 연 뒤 다시 확인합니다.

```powershell
git --version
aws --version
gh --version
```

계속 실패하면 설치 경로가 PATH에 등록되어 있는지 확인합니다.

```powershell
$env:Path -split ";"
```

### TS.4 S3 버킷 생성 또는 리전 오류가 나는 경우

증상:

```text
BucketAlreadyExists
BucketAlreadyOwnedByYou
IllegalLocationConstraintException
InvalidBucketName
```

해결:

- `BucketAlreadyExists`: 버킷 이름은 전 세계 고유값이므로 다른 이름을 사용합니다.
- `BucketAlreadyOwnedByYou`: 이미 만든 버킷이므로 `head-bucket`으로 확인 후 재사용합니다.
- `IllegalLocationConstraintException`: `$REGION`과 `LocationConstraint`가 같은지 확인합니다.
- `InvalidBucketName`: 소문자, 숫자, 하이픈만 사용합니다.

확인:

```powershell
Write-Host $BUCKET
Write-Host $REGION
aws s3api head-bucket --bucket $BUCKET
```

### TS.5 S3 403 AccessDenied가 나는 경우

증상:

```text
HTTP/1.1 403 Forbidden
AccessDenied
```

확인:

```powershell
aws s3api get-public-access-block --bucket $BUCKET
aws s3api get-bucket-policy --bucket $BUCKET
aws s3api get-bucket-website --bucket $BUCKET
```

점검 항목:

- Public Access Block에서 `BlockPublicPolicy`가 `false`인가
- 버킷 정책에 `s3:GetObject`가 있는가
- 정책 Resource가 `arn:aws:s3:::버킷이름/*` 형식인가
- `index.html`이 실제로 업로드되었는가

검증:

```powershell
aws s3api head-object --bucket $BUCKET --key index.html
curl.exe -I "http://${BUCKET}.s3-website.${REGION}.amazonaws.com"
```

### TS.6 S3 업로드 파일이 누락되는 경우

증상:

- S3에 `index.html` 또는 이미지가 없습니다.
- CloudFront에서는 404가 나옵니다.

확인:

```powershell
Get-ChildItem
aws s3 sync . s3://$BUCKET --dryrun
aws s3 ls s3://$BUCKET --recursive
```

점검 항목:

- 현재 폴더가 프로젝트 루트인가
- `--exclude` 조건이 필요한 파일까지 제외하지 않았는가
- 이미지 폴더명이 `images`인지, HTML에서 참조하는 경로와 일치하는가
- 파일명 대소문자가 일치하는가

해결:

```powershell
aws s3 sync . s3://$BUCKET `
  --delete `
  --exclude ".git/*" `
  --exclude ".github/*" `
  --exclude "*.md" `
  --exclude "*.docx"
```

### TS.7 CloudFront 403, 404, InProgress 문제가 나는 경우

증상:

```text
HTTP/2 403
HTTP/2 404
Status: InProgress
```

확인:

```powershell
aws cloudfront get-distribution --id $CF_ID `
  --query "Distribution.{Status:Status,DomainName:DomainName,Enabled:DistributionConfig.Enabled}" `
  --output table

aws cloudfront get-distribution-config --id $CF_ID `
  --query "DistributionConfig.{DefaultRootObject:DefaultRootObject,Origins:Origins.Items[].DomainName}" `
  --output table
```

점검 항목:

- `Status`가 `Deployed`인가
- `Enabled`가 `True`인가
- `DefaultRootObject`가 `index.html`인가
- Origin DomainName이 실제 S3 버킷을 가리키는가
- S3에 `index.html`이 업로드되어 있는가
- 퍼블릭 방식이면 S3 버킷 정책이 읽기를 허용하는가
- OAC 방식이면 S3 버킷 정책에 CloudFront Distribution ARN이 허용되어 있는가

해결:

```powershell
aws cloudfront wait distribution-deployed --id $CF_ID
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
curl.exe -I "https://$CF_DOMAIN/"
```

### TS.8 GitHub Actions Secrets 또는 권한 문제가 나는 경우

증상:

```text
Credentials could not be loaded
AccessDenied
The security token included in the request is invalid
NoSuchBucket
```

확인:

```powershell
gh secret list
gh run list --limit 5
gh run view --log
```

점검 항목:

- `AWS_ACCESS_KEY_ID` Secret 이름이 정확한가
- `AWS_SECRET_ACCESS_KEY` Secret 이름이 정확한가
- `AWS_REGION` 값이 `ap-northeast-2`인가
- `S3_BUCKET` 값이 실제 버킷 이름인가
- `CLOUDFRONT_DISTRIBUTION_ID` 값이 `E`로 시작하는 Distribution ID인가
- IAM 배포 사용자에게 `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, `cloudfront:CreateInvalidation` 권한이 있는가

해결 기준:

- GitHub Actions 로그에서 `aws sts get-caller-identity`가 성공해야 합니다.
- S3 sync 단계와 CloudFront invalidation 단계가 모두 성공해야 합니다.

### TS.9 배포했는데 화면이 안 바뀌는 경우

확인:

```powershell
gh run list --limit 5
aws s3api head-object --bucket $BUCKET --key index.html
aws cloudfront list-invalidations --distribution-id $CF_ID
curl.exe -I "https://$CF_DOMAIN/"
```

점검 항목:

- GitHub Actions 최신 실행이 성공했는가
- S3의 `LastModified`가 최근 시간인가
- CloudFront invalidation이 `Completed`인가
- 브라우저 캐시가 남아 있지 않은가
- CSS/JS 버전 쿼리를 바꿨는가

해결:

```powershell
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
```

브라우저에서는 강력 새로고침을 실행합니다.

```text
Ctrl + F5
```

### TS.10 이미지가 안 보이는 경우

확인:

```powershell
aws s3 ls s3://$BUCKET/images/ --recursive
```

점검 항목:

- HTML/CSS에서 참조한 경로가 실제 파일 경로와 같은가
- 대소문자가 정확히 일치하는가
- 파일명에 공백, 한글, 특수문자가 있어 URL 인코딩 문제가 나지 않는가
- `aws s3 sync`에서 이미지 폴더가 제외되지 않았는가

예시:

```html
<img src="images/profile.jpg" alt="프로필">
```

S3에도 같은 경로가 있어야 합니다.

```text
images/profile.jpg
```

### TS.11 S3 버킷 삭제가 실패하는 경우

증상:

```text
BucketNotEmpty
AccessDenied
```

확인:

```powershell
aws s3 ls s3://$BUCKET --recursive
```

해결:

```powershell
aws s3 rm s3://$BUCKET --recursive
aws s3api delete-bucket --bucket $BUCKET --region $REGION
```

버전 관리가 켜져 있던 버킷은 삭제 마커와 이전 버전까지 정리해야 합니다. 초보자 실습에서는 S3 버전 관리를 켜지 않는 것을 권장합니다.
