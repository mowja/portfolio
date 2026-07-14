---
title: 3-Tier + ELK 프로젝트 기술가이드
label: 프로젝트 기술가이드
date: 2026.06
readTime: PDF 문서
desc: Web/WAS/DB 분리 구조에 Redis 세션 공유와 ELK 로그 수집을 더해 운영 관점으로 확장한 프로젝트형 문서입니다.
img: images/arch_03.png
tags: 3-Tier, ELK, Redis, Nginx, MariaDB
links: PDF 열기|assets/docs/01-3tier-elk-project-guide.pdf
---

3-Tier 아키텍처 기반 서비스 환경에 Redis 세션 공유와 ELK 로그 수집을 추가해 운영 관점까지 확장한 프로젝트형 기술가이드입니다.

### 문서 범위

- Nginx 기반 Web Server 구성
- Apache2, PHP 기반 WAS Server 구성
- MariaDB 기반 DB Server 구성
- Redis 세션 공유 구조
- ELK Stack과 Metricbeat 기반 로그/지표 수집
- GNS3 Router 기반 내부 서비스망, 관리망, 외부 연결망 구성

### 검증한 것

- 계층별 서비스 상태
- 웹 요청과 WAS/DB 연동 흐름
- 세션 공유 동작
- 로그 수집과 Kibana 시각화
- 서버별 설치, 설정, 검증 절차

이 문서는 단일 서비스 구축에서 끝내지 않고, 장애 분석과 운영 확인을 위한 로그/모니터링 구조까지 함께 정리한 기록입니다.
