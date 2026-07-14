---
title: Docker Web/DNS 서비스 응용 실습
label: 실습 가이드
date: 2026.06
readTime: PDF 문서
desc: Docker 컨테이너로 웹 서비스를 구성하고 이미지 배포, Private Registry, BIND DNS 컨테이너까지 확장한 실습 문서입니다.
img: images/arch_01.png
tags: Docker, Nginx, Registry, BIND9, DNS
links: PDF 열기|assets/docs/04-docker-dns-application-guide.pdf
---

Docker 기반 웹 컨테이너 구성에서 시작해 이미지 생성, Registry 배포, DNS 컨테이너 응용까지 연결한 실습 가이드입니다.

### 실습 목적

- `docker run`, `create`, `start`, `exec`, `attach` 차이 정리
- Nginx 컨테이너 생성과 웹 페이지 수정
- `docker commit`을 통한 이미지 생성
- Docker Hub와 Local Private Registry 배포 검증
- BIND9 DNS 컨테이너 기반 도메인 조회 구성

### 검증한 것

- `docker ps`, `docker images` 상태 확인
- `curl localhost` 웹 응답 확인
- Registry catalog API 확인
- `named-checkconf`, `named-checkzone` 기반 DNS 설정 검사
- `dig @127.0.0.1 www.team3.com` 조회 확인

이 문서는 컨테이너를 실행하는 수준에서 끝내지 않고, 이미지 배포와 DNS 서비스 구성까지 이어 본 응용 실습 기록입니다.
