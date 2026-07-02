---
title: S3와 CloudFront 캐시 갱신 메모
label: 테스트 글
date: 2026.06.27
readTime: 4 min read
desc: 정적 파일을 바꿨는데 브라우저에 바로 반영되지 않을 때 확인할 캐시 계층을 정리했습니다.
img: images/arch_01.png
tags: S3, CloudFront, Cache, Deploy
links: 웹페이지 CI/CD 실습 가이드|웹페이지_CICD_S3과GIT_실습가이드.md
---

정적 사이트 배포 후 변경 내용이 바로 보이지 않으면 S3 업로드 실패보다 캐시 문제일 가능성도 큽니다.

### 확인할 캐시

- 브라우저 캐시
- CloudFront edge cache
- 파일명 변경 여부
- invalidation 실행 여부

자주 바뀌는 파일은 짧은 캐시 정책을 쓰고, 이미지처럼 안정적인 파일은 긴 캐시 정책을 쓰는 식으로 나눌 수 있습니다.
