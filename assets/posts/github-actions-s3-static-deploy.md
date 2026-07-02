---
title: GitHub Actions와 S3로 정적 웹페이지 배포하기
label: 실습 가이드
date: 2026.06
readTime: 8 min read
desc: Git 저장소 변경 사항을 GitHub Actions로 감지하고, S3와 CloudFront에 정적 웹페이지를 배포하는 흐름을 정리했습니다.
img: images/GitAction+S3Web.drawio-V2.png
tags: GitHub Actions, S3, CloudFront, CI/CD
links: 웹페이지 CI/CD 실습 가이드|웹페이지_CICD_S3과GIT_실습가이드.md; CLI 중심 실습 가이드|웹페이지_CICD_S3과GIT_실습가이드_CLI.md
---

정적 포트폴리오 사이트를 수동으로 업로드하지 않고, Git push 이후 자동으로 배포되도록 구성한 실습 기록입니다.

핵심은 GitHub Actions 워크플로에서 빌드 산출물을 만들고, AWS 인증 정보를 통해 S3 버킷에 동기화한 뒤 CloudFront 캐시 무효화를 수행하는 구조입니다.

### 확인한 것

- IAM 권한 범위
- S3 정적 호스팅 설정
- CloudFront 배포 연결
- 캐시 갱신 시점
