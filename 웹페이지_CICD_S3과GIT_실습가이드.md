# 웹페이지 CI/CD, S3와 Git 실습 매뉴얼

이 문서는 정적 포트폴리오 웹사이트를 Git으로 버전관리하고, GitHub에 업로드한 뒤, GitHub Actions를 이용해 AWS S3와 CloudFront로 자동 배포하는 실습 매뉴얼입니다.

설명만 읽는 문서가 아니라, 처음부터 끝까지 순서대로 따라 하면서 결과를 검증할 수 있도록 작성합니다.

---

## 목차

1. 문서 사용 방법
2. 실습 완성 결과
3. 핵심 개념 정리
4. 실습 전 준비사항
5. 실습 정보 표 작성
6. 로컬 웹사이트 파일 준비
7. Git 로컬 저장소 설정
8. GitHub 저장소 생성
9. GitHub 원격 저장소 연결
10. 작업 브랜치 생성과 푸시
11. AWS S3 버킷 생성
12. CloudFront 배포 생성
13. IAM 배포 사용자 생성
14. GitHub Secrets 등록
15. GitHub Actions 배포 파일 작성
16. 자동 배포 실행
17. 배포 결과 검증
18. 변경 작업 운영 방법
19. 비용 및 보안 정리
20. 최종 체크리스트
21. 실습 결과 정리
TS. 문제 해결

---

## 1. 문서 사용 방법

### 1.1 대상

이 문서는 아래 상황의 실습자를 기준으로 합니다.

- Git, GitHub, AWS S3, CloudFront를 한 번에 연결해보고 싶은 사람
- 수동으로 파일을 올리는 방식이 아니라, `git push` 후 자동 배포되는 구조를 만들고 싶은 사람
- 포트폴리오 사이트를 AWS 기반 정적 웹사이트로 배포하고 싶은 사람
- CLI 명령어만으로 진행하기보다는, AWS와 GitHub 화면을 보면서 설정하고 싶은 사람

### 1.2 진행 방식

각 단계는 아래 형식으로 작성합니다.

- **목적**: 이 단계에서 만드는 것
- **작업**: 실제로 클릭하거나 입력할 내용
- **정상 결과**: 성공했을 때 보여야 하는 상태
- **검증**: 다음 단계로 넘어가기 전 확인할 명령 또는 화면

### 1.3 기준 배포 방식

이 문서는 아래 방식을 기본으로 사용합니다.

- GitHub: 소스 코드 저장소
- GitHub Actions: 자동 배포 실행
- S3: 정적 파일 저장소
- CloudFront: HTTPS, CDN, 캐시 처리
- S3 공개 여부: **비공개**
- CloudFront 접근 방식: **Origin Access Control(OAC)**

S3 버킷을 공개로 여는 방식도 가능하지만, 이 매뉴얼에서는 보안상 더 안전한 `S3 비공개 + CloudFront OAC` 방식을 사용합니다.

---

## 2. 실습 완성 결과

실습이 끝나면 아래 구조가 완성됩니다.

```text
로컬 PC
  └─ 포트폴리오 웹사이트 파일
      ├─ index.html
      ├─ style.css
      ├─ main.js
      ├─ images/
      ├─ Fonts/
      └─ assets/

GitHub Repository
  ├─ main 브랜치
  ├─ 작업 브랜치
  └─ .github/workflows/deploy-s3.yml

AWS
  ├─ S3 Bucket
  │   └─ 정적 웹사이트 파일 저장
  └─ CloudFront
      ├─ HTTPS 접속
      ├─ CDN 캐시
      └─ S3 비공개 접근
```

사용자는 최종적으로 CloudFront 배포 도메인 또는 연결한 개인 도메인으로 웹사이트에 접속합니다.

```text
https://CloudFront배포도메인
```

또는

```text
https://개인도메인
```

---

## 3. 핵심 개념 정리

### 3.1 정적 웹사이트

정적 웹사이트는 서버에서 별도 프로그램을 실행하지 않고, 미리 작성된 파일을 그대로 전달하는 웹사이트입니다.

대표 파일은 다음과 같습니다.

| 파일 | 역할 |
|---|---|
| `index.html` | 웹페이지 구조 |
| `style.css` | 디자인, 배치, 반응형 |
| `main.js` | 버튼, 슬라이드, 모달 같은 동작 |
| `images/` | 이미지 파일 |
| `Fonts/` | 웹폰트 파일 |
| `assets/` | 문서, 발표자료, 기타 정적 파일 |

포트폴리오 사이트처럼 로그인, 게시판, 서버 DB 처리가 필요 없는 경우 S3와 CloudFront만으로 운영할 수 있습니다.

### 3.2 Git

Git은 로컬 PC에서 파일 변경 이력을 관리하는 도구입니다.

Git을 사용하면 아래 작업이 가능합니다.

- 어떤 파일이 바뀌었는지 확인
- 변경사항을 커밋으로 저장
- 이전 버전과 비교
- 작업 브랜치를 나누어 main을 보호

### 3.3 GitHub

GitHub는 Git 저장소를 인터넷에 올려 관리하는 서비스입니다.

이 실습에서 GitHub는 아래 역할을 합니다.

- 포트폴리오 사이트 파일 보관
- 커밋 이력 확인
- 브랜치 관리
- GitHub Actions 실행
- AWS 배포용 Secret 보관

### 3.4 CI/CD

CI/CD는 코드 변경 이후 배포까지의 과정을 자동화하는 방식입니다.

이 실습에서는 아래 흐름이 CI/CD입니다.

```text
로컬 파일 수정
  → git commit
  → git push
  → GitHub Actions 실행
  → S3 업로드
  → CloudFront 캐시 무효화
  → 웹사이트 반영
```

### 3.5 S3

S3는 AWS의 객체 스토리지입니다.

이 실습에서는 `index.html`, `style.css`, `main.js`, 이미지, 폰트 파일을 S3 버킷에 저장합니다.

### 3.6 CloudFront

CloudFront는 AWS의 CDN 서비스입니다.

이 실습에서 CloudFront는 아래 역할을 합니다.

- HTTPS 접속 제공
- 사용자에게 더 빠른 웹페이지 응답
- S3 파일 캐싱
- S3 비공개 버킷에 안전하게 접근

### 3.7 Route 53과 도메인

개인 도메인을 사용할 경우 Route 53 또는 외부 도메인 서비스에서 DNS 레코드를 설정합니다.

도메인 연결은 필수 실습이 아닙니다. 먼저 CloudFront 기본 도메인으로 접속이 되는지 확인한 뒤 진행합니다.

---

## 4. 실습 전 준비사항

### 4.1 계정 준비

| 구분 | 필요한 상태 |
|---|---|
| GitHub 계정 | 로그인 가능, Repository 생성 가능, Actions 사용 가능 |
| AWS 계정 | 로그인 가능, 결제수단 등록 완료, S3/CloudFront/IAM 접근 가능 |
| 이메일 | GitHub 인증 메일 수신 가능 |
| 도메인 | 선택사항, 개인 도메인 연결 시 필요 |

AWS 루트 계정으로 실습을 계속 진행하는 것은 권장하지 않습니다. 루트 계정은 최초 설정에만 사용하고, 실습은 IAM 사용자 또는 권한을 부여받은 계정으로 진행합니다.

### 4.2 로컬 PC 준비

아래 프로그램이 필요합니다.

| 도구 | 용도 |
|---|---|
| Git | 버전관리와 GitHub 업로드 |
| VS Code 또는 Codex | 파일 수정 |
| PowerShell | 명령어 실행 |
| 브라우저 | GitHub와 AWS 콘솔 접속 |

설치 확인 명령어:

```powershell
git --version
```

정상 예시:

```text
git version 2.x.x
```

### 4.3 AWS 리전 결정

이 매뉴얼에서는 S3 버킷 리전을 아래로 통일합니다.

```text
ap-northeast-2
```

`ap-northeast-2`는 서울 리전입니다.

CloudFront는 글로벌 서비스이므로 리전 선택 화면이 따로 다르게 보일 수 있습니다.

### 4.4 필요한 AWS 권한

GitHub Actions에서 AWS로 배포하려면 배포용 IAM User 또는 Role에 아래 권한이 필요합니다.

- S3 버킷 목록 읽기
- S3 오브젝트 읽기
- S3 오브젝트 업로드
- S3 오브젝트 삭제
- CloudFront 캐시 무효화

권한 이름 기준으로는 아래 작업이 필요합니다.

```text
s3:ListBucket
s3:GetObject
s3:PutObject
s3:DeleteObject
cloudfront:CreateInvalidation
```

---

## 5. 실습 정보 표 작성

실습 중 같은 값을 여러 번 입력합니다. 먼저 아래 표를 채우고 진행합니다.

| 항목 | 예시 | 내 실습 값 |
|---|---|---|
| GitHub 사용자명 | `mowja` |  |
| GitHub 저장소명 | `portfolio` |  |
| 기본 브랜치 | `main` |  |
| 작업 브랜치 | `0611_PWJ` |  |
| AWS 리전 | `ap-northeast-2` |  |
| S3 버킷명 | `my-portfolio-site-2026` |  |
| CloudFront 배포 ID | `E123EXAMPLE` |  |
| CloudFront 도메인 | `dxxxxx.cloudfront.net` |  |
| 개인 도메인 | `www.example.com` | 선택 |

S3 버킷명은 전 세계에서 고유해야 합니다. 이미 사용 중인 이름이면 생성이 실패합니다.

---

## 6. 로컬 웹사이트 파일 준비

### 6.1 목적

배포할 정적 웹사이트 파일을 하나의 작업 폴더에 준비합니다.

### 6.2 작업

작업 폴더 예시:

```text
C:\Users\사용자명\Documents\포폴사이트 제작기
```

폴더 안에 최소 아래 파일이 있어야 합니다.

```text
index.html
style.css
main.js
```

이미지, 폰트, 문서가 있다면 아래처럼 하위 폴더에 정리합니다.

```text
images/
Fonts/
assets/
```

### 6.3 정상 결과

작업 폴더가 아래처럼 구성되어 있으면 정상입니다.

```text
포폴사이트 제작기
├─ index.html
├─ style.css
├─ main.js
├─ images/
├─ Fonts/
└─ assets/
```

### 6.4 검증

PowerShell에서 작업 폴더로 이동한 뒤 파일 목록을 확인합니다.

```powershell
cd "C:\Users\사용자명\Documents\포폴사이트 제작기"
dir
```

`index.html`, `style.css`, `main.js`가 보여야 합니다.

---

## 7. Git 로컬 저장소 설정

### 7.1 목적

작업 폴더를 Git으로 관리할 수 있게 만듭니다.

### 7.2 Git 사용자 정보 설정

최초 1회만 설정합니다.

```powershell
git config --global user.name "GitHub사용자명"
git config --global user.email "GitHub이메일"
```

설정 확인:

```powershell
git config --global --list
```

정상 결과:

```text
user.name=GitHub사용자명
user.email=GitHub이메일
```

### 7.3 Git 저장소 초기화

작업 폴더에서 실행합니다.

```powershell
git init
```

기본 브랜치명을 `main`으로 맞춥니다.

```powershell
git branch -M main
```

### 7.4 첫 커밋 생성

현재 파일 상태 확인:

```powershell
git status
```

전체 파일을 스테이징합니다.

```powershell
git add .
```

커밋을 생성합니다.

```powershell
git commit -m "포트폴리오 사이트 초기 파일 추가"
```

커밋 메시지는 한글로 작성합니다.

### 7.5 검증

```powershell
git log --oneline
```

정상 예시:

```text
abc1234 포트폴리오 사이트 초기 파일 추가
```

---

## 8. GitHub 저장소 생성

### 8.1 목적

로컬 Git 저장소를 업로드할 GitHub Repository를 만듭니다.

### 8.2 작업

GitHub 웹사이트에서 진행합니다.

1. GitHub 로그인
2. 오른쪽 위 `+` 버튼 클릭
3. `New repository` 클릭
4. Repository name 입력
5. Public 또는 Private 선택
6. `Add a README file`은 체크하지 않음
7. `Create repository` 클릭

### 8.3 주의사항

로컬에 이미 `README.md`가 있거나 첫 커밋이 있는 경우, GitHub에서 README를 자동 생성하지 않는 것이 충돌을 줄입니다.

### 8.4 정상 결과

생성 후 아래와 같은 Repository 주소가 보입니다.

```text
https://github.com/GitHub사용자명/저장소명.git
```

---

## 9. GitHub 원격 저장소 연결

### 9.1 목적

로컬 저장소와 GitHub 저장소를 연결합니다.

### 9.2 작업

원격 저장소를 등록합니다.

```powershell
git remote add origin https://github.com/GitHub사용자명/저장소명.git
```

이미 `origin`이 있다면 아래 명령으로 주소를 수정합니다.

```powershell
git remote set-url origin https://github.com/GitHub사용자명/저장소명.git
```

### 9.3 검증

```powershell
git remote -v
```

정상 예시:

```text
origin  https://github.com/GitHub사용자명/저장소명.git (fetch)
origin  https://github.com/GitHub사용자명/저장소명.git (push)
```

---

## 10. 작업 브랜치 생성과 푸시

### 10.1 목적

`main` 브랜치를 바로 수정하지 않고, 작업 브랜치에서 변경사항을 관리합니다.

### 10.2 브랜치 전략

이 매뉴얼의 기본 전략은 아래와 같습니다.

```text
main
  └─ 실제 배포 기준 브랜치

작업 브랜치
  └─ 수정, 실험, 검토용 브랜치
```

예시 작업 브랜치명:

```text
0611_PWJ
```

### 10.3 작업 브랜치 생성

```powershell
git switch -c 0611_PWJ
```

브랜치 확인:

```powershell
git branch
```

현재 브랜치 앞에 `*` 표시가 있으면 해당 브랜치에서 작업 중입니다.

### 10.4 GitHub로 푸시

```powershell
git push -u origin 0611_PWJ
```

### 10.5 정상 결과

GitHub Repository의 Branches 화면에서 `0611_PWJ` 브랜치가 보입니다.

`Ahead 1` 또는 `Ahead 2`처럼 표시되면 `main`보다 작업 브랜치에 커밋이 더 있다는 뜻입니다. 이것은 main이 자동으로 바뀌었다는 뜻이 아닙니다.

---

## 11. AWS S3 버킷 생성

### 11.1 목적

웹사이트 정적 파일을 저장할 S3 버킷을 만듭니다.

### 11.2 작업

AWS 콘솔에서 진행합니다.

1. AWS 콘솔 로그인
2. `S3` 검색 후 이동
3. `Create bucket` 클릭
4. Bucket name 입력
5. AWS Region 선택: `Asia Pacific (Seoul) ap-northeast-2`
6. Object Ownership: `ACLs disabled` 유지
7. Block Public Access: 전체 차단 유지
8. Bucket Versioning: 선택사항
9. `Create bucket` 클릭

### 11.3 설정 기준

| 항목 | 값 |
|---|---|
| 버킷 공개 여부 | 비공개 |
| ACL | 비활성화 |
| Public Access Block | 활성화 |
| Static website hosting | 사용하지 않음 |

CloudFront OAC를 사용할 것이므로 S3 정적 웹사이트 호스팅을 켜지 않아도 됩니다.

### 11.4 정상 결과

S3 버킷 목록에 생성한 버킷이 표시됩니다.

---

## 12. CloudFront 배포 생성

### 12.1 목적

S3에 저장된 정적 파일을 HTTPS로 서비스할 CloudFront 배포를 만듭니다.

### 12.2 작업

AWS 콘솔에서 진행합니다.

1. `CloudFront` 검색 후 이동
2. `Create distribution` 클릭
3. Origin domain에서 생성한 S3 버킷 선택
4. Origin access에서 `Origin access control settings` 선택
5. OAC가 없다면 `Create new OAC` 클릭 후 생성
6. Viewer protocol policy: `Redirect HTTP to HTTPS`
7. Allowed HTTP methods: `GET, HEAD`
8. Cache policy: `CachingOptimized`
9. Default root object: `index.html`
10. `Create distribution` 클릭

### 12.3 S3 버킷 정책 연결

CloudFront 배포 생성 후, 화면에 S3 버킷 정책을 업데이트하라는 안내가 나올 수 있습니다.

안내에서 제공하는 정책을 복사해 S3 버킷 정책에 붙여넣습니다.

예시:

```json
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::버킷이름/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::AWS계정ID:distribution/CloudFront배포ID"
        }
      }
    }
  ]
}
```

### 12.4 정상 결과

CloudFront 배포 상태가 `Enabled`가 되고, 아래 형식의 배포 도메인이 생성됩니다.

```text
dxxxxx.cloudfront.net
```

처음 생성 직후에는 배포가 완료될 때까지 몇 분 정도 걸릴 수 있습니다.

---

## 13. IAM 배포 사용자 생성

### 13.1 목적

GitHub Actions가 S3와 CloudFront에 접근할 수 있도록 배포 전용 IAM 사용자를 만듭니다.

### 13.2 작업

AWS 콘솔에서 진행합니다.

1. `IAM` 검색 후 이동
2. `Users` 클릭
3. `Create user` 클릭
4. User name 입력: `github-actions-s3-deploy`
5. AWS Management Console access는 체크하지 않음
6. 권한 설정 단계에서 `Attach policies directly` 또는 `Create inline policy` 선택
7. 아래 정책을 배포 대상 버킷명과 CloudFront 배포 ID에 맞게 수정해 연결

### 13.3 최소 권한 정책 예시

아래 값은 반드시 본인 환경에 맞게 수정합니다.

- `버킷이름`
- `AWS계정ID`
- `CloudFront배포ID`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListDeployBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::버킷이름"
      ]
    },
    {
      "Sid": "WriteDeployObjects",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::버킷이름/*"
      ]
    },
    {
      "Sid": "InvalidateCloudFrontCache",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": [
        "arn:aws:cloudfront::AWS계정ID:distribution/CloudFront배포ID"
      ]
    }
  ]
}
```

### 13.4 Access Key 생성

1. 생성한 IAM User 클릭
2. `Security credentials` 탭 클릭
3. `Create access key` 클릭
4. Use case는 `Command Line Interface` 또는 `Other` 선택
5. Access Key ID와 Secret Access Key 저장

Secret Access Key는 생성 직후 한 번만 확인할 수 있습니다. 외부에 노출되면 즉시 삭제하고 새로 발급합니다.

---

## 14. GitHub Secrets 등록

### 14.1 목적

GitHub Actions가 AWS에 접속할 때 필요한 값을 안전하게 저장합니다.

### 14.2 작업

GitHub Repository에서 진행합니다.

1. Repository 접속
2. `Settings` 클릭
3. `Secrets and variables` 클릭
4. `Actions` 클릭
5. `New repository secret` 클릭
6. 아래 값을 하나씩 등록

### 14.3 등록할 Secret

| Secret 이름 | 값 |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM User Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Access Key |
| `AWS_REGION` | `ap-northeast-2` |
| `S3_BUCKET` | S3 버킷명 |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront 배포 ID |

### 14.4 정상 결과

GitHub Secrets 목록에 Secret 이름만 표시됩니다. Secret 값은 다시 볼 수 없습니다.

---

## 15. GitHub Actions 배포 파일 작성

### 15.1 목적

GitHub에 push가 발생하면 자동으로 S3 업로드와 CloudFront 캐시 무효화를 실행하게 만듭니다.

### 15.2 폴더 생성

작업 폴더에 아래 경로를 만듭니다.

```text
.github/workflows/
```

### 15.3 워크플로 파일 생성

아래 파일을 생성합니다.

```text
.github/workflows/deploy-s3.yml
```

내용:

```yaml
name: Deploy static website to S3

on:
  push:
    branches:
      - main

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

      - name: Upload static files to S3
        run: |
          aws s3 sync . "s3://${{ secrets.S3_BUCKET }}" \
            --delete \
            --exclude ".git/*" \
            --exclude ".github/*" \
            --exclude "*.md" \
            --exclude "*.docx" \
            --exclude "CNAME"

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id "${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}" \
            --paths "/*"
```

### 15.4 작업 브랜치에서 바로 배포하고 싶을 때

`main`이 아니라 작업 브랜치 push 때도 배포하고 싶다면 branches에 작업 브랜치를 추가합니다.

```yaml
on:
  push:
    branches:
      - main
      - 0611_PWJ
```

단, 이 경우 작업 브랜치의 미완성 내용도 실제 웹사이트에 배포될 수 있습니다. main을 안정 배포용으로 남기고 싶다면 `main`만 유지합니다.

### 15.5 커밋

```powershell
git add .github/workflows/deploy-s3.yml
git commit -m "S3 자동 배포 워크플로 추가"
```

---

## 16. 자동 배포 실행

### 16.1 목적

GitHub Actions가 실제로 S3와 CloudFront 배포를 실행하는지 확인합니다.

### 16.2 main 기준 배포

현재 작업 브랜치에서 검토가 끝났다면 main으로 병합한 뒤 push합니다.

```powershell
git switch main
git merge 0611_PWJ
git push origin main
```

### 16.3 작업 브랜치 기준 배포

워크플로에서 작업 브랜치를 허용했다면 아래 명령으로 실행됩니다.

```powershell
git push origin 0611_PWJ
```

### 16.4 GitHub Actions 확인

GitHub Repository에서 확인합니다.

1. `Actions` 탭 클릭
2. 최신 workflow 실행 클릭
3. `deploy` job 클릭
4. 각 step이 초록색 체크인지 확인

### 16.5 정상 결과

아래 step이 모두 성공해야 합니다.

- Checkout repository
- Configure AWS credentials
- Upload static files to S3
- Invalidate CloudFront cache

---

## 17. 배포 결과 검증

### 17.1 S3 파일 확인

AWS S3 콘솔에서 버킷에 접속합니다.

아래 파일이 업로드되어 있어야 합니다.

```text
index.html
style.css
main.js
images/
Fonts/
assets/
```

`.git`, `.github`, `.md`, `.docx` 파일은 업로드되지 않는 것이 정상입니다.

### 17.2 CloudFront 접속 확인

브라우저에서 CloudFront 배포 도메인으로 접속합니다.

```text
https://dxxxxx.cloudfront.net
```

정상 결과:

- 웹사이트 첫 화면이 표시됨
- CSS가 적용되어 있음
- 이미지가 깨지지 않음
- 버튼과 슬라이드가 동작함

### 17.3 캐시 반영 확인

수정사항이 바로 보이지 않으면 GitHub Actions의 CloudFront invalidation step이 성공했는지 확인합니다.

CloudFront 콘솔에서도 확인할 수 있습니다.

1. CloudFront 배포 선택
2. `Invalidations` 탭 클릭
3. 최신 invalidation 상태 확인

정상 상태:

```text
Completed
```

---

## 18. 변경 작업 운영 방법

### 18.1 일반 수정 흐름

웹사이트를 수정할 때는 아래 순서로 진행합니다.

```text
작업 브랜치 생성 또는 이동
  → 파일 수정
  → 로컬 확인
  → git status 확인
  → git add
  → 한글 커밋
  → git push
  → Pull Request 또는 main 병합
  → GitHub Actions 배포 확인
  → CloudFront 접속 확인
```

### 18.2 자주 쓰는 명령어

현재 상태 확인:

```powershell
git status
```

변경 내용 확인:

```powershell
git diff
```

커밋 이력 확인:

```powershell
git log --oneline
```

원격 저장소 확인:

```powershell
git remote -v
```

브랜치 확인:

```powershell
git branch -vv
```

### 18.3 커밋 메시지 규칙

커밋 메시지는 한글로 작성합니다.

좋은 예시:

```text
자기소개 섹션 프로필 이미지 추가
이메일 복사 버튼으로 개인정보 노출 방지
S3 자동 배포 워크플로 추가
실습 매뉴얼 기본판 구조 개편
```

나쁜 예시:

```text
update
fix
asdf
final
```

---

## 19. 비용 및 보안 정리

### 19.1 비용 주의

이 실습에서 비용이 발생할 수 있는 항목은 아래와 같습니다.

| 서비스 | 비용 발생 가능 요소 |
|---|---|
| S3 | 저장 용량, 요청 수 |
| CloudFront | 데이터 전송량, 요청 수, 캐시 무효화 요청 |
| Route 53 | Hosted Zone, 도메인 등록 |
| ACM | 퍼블릭 인증서는 일반적으로 무료, 연결 서비스 비용은 별도 |

실습 후 더 이상 사용하지 않으면 CloudFront 배포와 S3 버킷을 정리합니다.

### 19.2 보안 주의

- AWS 루트 계정 Access Key를 만들지 않습니다.
- GitHub에 `AWS_SECRET_ACCESS_KEY` 값을 직접 커밋하지 않습니다.
- Secret 값은 반드시 GitHub Secrets에 저장합니다.
- IAM 권한은 필요한 버킷과 CloudFront 배포로 제한합니다.
- Access Key가 노출되면 즉시 비활성화 후 삭제합니다.

---

## 20. 최종 체크리스트

아래 항목이 모두 충족되면 기본 실습이 완료된 상태입니다.

### 20.1 GitHub

- [ ] GitHub Repository가 생성되어 있다.
- [ ] 로컬 저장소와 `origin`이 연결되어 있다.
- [ ] `main`과 작업 브랜치 전략을 이해했다.
- [ ] 한글 커밋 메시지로 커밋했다.
- [ ] GitHub에 push가 완료되었다.
- [ ] `.github/workflows/deploy-s3.yml` 파일이 있다.
- [ ] GitHub Actions 실행 기록이 있다.

### 20.2 AWS

- [ ] S3 버킷이 생성되어 있다.
- [ ] S3 버킷은 public access block이 켜져 있다.
- [ ] CloudFront 배포가 생성되어 있다.
- [ ] CloudFront OAC가 S3 버킷에 연결되어 있다.
- [ ] S3 버킷 정책에 CloudFront 접근 권한이 있다.
- [ ] IAM 배포 사용자가 최소 권한으로 구성되어 있다.
- [ ] GitHub Secrets에 AWS 배포 값이 등록되어 있다.

### 20.3 배포

- [ ] GitHub Actions가 성공했다.
- [ ] S3에 정적 파일이 업로드되었다.
- [ ] CloudFront invalidation이 완료되었다.
- [ ] CloudFront 도메인으로 웹사이트가 열린다.
- [ ] 이미지, 폰트, JavaScript 동작이 정상이다.

---

## 21. 실습 결과 정리

실습 완료 후 아래 형식으로 결과를 정리합니다.

| 항목 | 결과 |
|---|---|
| GitHub Repository | `https://github.com/사용자명/저장소명` |
| 작업 브랜치 | `0611_PWJ` |
| S3 버킷명 | `버킷이름` |
| CloudFront 배포 ID | `배포ID` |
| CloudFront 접속 주소 | `https://dxxxxx.cloudfront.net` |
| 개인 도메인 | 선택 |
| 마지막 배포 커밋 | `커밋해시 커밋메시지` |

---

## TS. 문제 해결

### TS.1 `git push`가 거절되는 경우

증상:

```text
rejected
non-fast-forward
```

원인:

- GitHub 원격 저장소에 로컬에 없는 커밋이 있음
- GitHub에서 README를 먼저 생성했음

해결:

```powershell
git pull --rebase origin main
git push origin main
```

작업 브랜치라면 브랜치명을 맞춥니다.

```powershell
git pull --rebase origin 0611_PWJ
git push origin 0611_PWJ
```

### TS.2 `origin already exists`가 나오는 경우

원인:

- 이미 원격 저장소 이름 `origin`이 등록되어 있음

해결:

```powershell
git remote -v
git remote set-url origin https://github.com/GitHub사용자명/저장소명.git
```

### TS.3 GitHub Actions에서 AWS 인증이 실패하는 경우

증상:

```text
The security token included in the request is invalid
```

확인할 것:

- `AWS_ACCESS_KEY_ID` 값이 맞는지
- `AWS_SECRET_ACCESS_KEY` 값이 맞는지
- Secret 이름에 오타가 없는지
- IAM User의 Access Key가 활성 상태인지

### TS.4 S3 업로드 권한 오류가 나는 경우

증상:

```text
AccessDenied
```

확인할 것:

- IAM 정책에 `s3:ListBucket`이 있는지
- IAM 정책에 `s3:PutObject`가 있는지
- IAM 정책에 `s3:DeleteObject`가 있는지
- Resource ARN이 버킷명과 정확히 일치하는지

버킷 자체 권한:

```text
arn:aws:s3:::버킷이름
```

버킷 내부 파일 권한:

```text
arn:aws:s3:::버킷이름/*
```

### TS.5 CloudFront 캐시 무효화가 실패하는 경우

증상:

```text
AccessDenied
```

확인할 것:

- IAM 정책에 `cloudfront:CreateInvalidation`이 있는지
- `CLOUDFRONT_DISTRIBUTION_ID` 값이 맞는지
- CloudFront 배포 ID와 ARN이 일치하는지

### TS.6 CloudFront 접속 시 403이 나오는 경우

가능한 원인:

- S3 버킷 정책에 CloudFront OAC 접근 권한이 없음
- CloudFront Origin이 잘못된 S3 버킷을 보고 있음
- `index.html`이 S3 버킷 루트에 없음

확인 순서:

1. S3 버킷에 `index.html`이 있는지 확인
2. CloudFront의 Default root object가 `index.html`인지 확인
3. S3 버킷 정책에 CloudFront 배포 ARN이 들어 있는지 확인
4. CloudFront 배포가 `Enabled` 상태인지 확인

### TS.7 수정했는데 웹사이트가 안 바뀌는 경우

가능한 원인:

- GitHub Actions가 실행되지 않음
- S3 업로드가 실패함
- CloudFront 캐시가 남아 있음
- 브라우저 캐시가 남아 있음

확인 순서:

1. GitHub Actions 실행 성공 여부 확인
2. S3 버킷에서 파일 수정 시간이 바뀌었는지 확인
3. CloudFront Invalidation 상태가 `Completed`인지 확인
4. 브라우저에서 강력 새로고침 실행

강력 새로고침:

```text
Ctrl + F5
```

### TS.8 이미지 또는 폰트가 깨지는 경우

확인할 것:

- 파일명이 실제 파일명과 정확히 일치하는지
- 대소문자가 일치하는지
- 경로에 공백이나 한글이 있어도 브라우저에서 정상 인코딩되는지
- GitHub Actions의 `aws s3 sync`에서 해당 폴더를 제외하지 않았는지

예시:

```html
<img src="images/profile.jpg" alt="프로필 사진">
```

실제 파일:

```text
images/profile.jpg
```

### TS.9 GitHub Pages와 AWS 배포가 헷갈리는 경우

GitHub Pages와 AWS S3/CloudFront 배포는 서로 다른 방식입니다.

| 구분 | GitHub Pages | AWS S3 + CloudFront |
|---|---|---|
| 배포 위치 | GitHub | AWS S3 |
| HTTPS | GitHub 제공 | CloudFront 제공 |
| 캐시 제어 | 제한적 | CloudFront에서 제어 |
| 권한 설정 | 단순 | IAM, S3, CloudFront 필요 |
| 비용 | Public repo 기준 무료 가능 | 사용량에 따라 과금 가능 |

이 매뉴얼은 AWS S3 + CloudFront 배포를 기준으로 합니다.
