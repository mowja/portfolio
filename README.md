# 곽덕연 포트폴리오

Cloud & Infrastructure Engineer 포지션 지원을 위한 포트폴리오 사이트입니다.

온프레미스 3-Tier 인프라, AWS 기반 VDI 및 AI Knowledge Base, IoT/AI 스마트팜 프로젝트를 중심으로 구성했습니다. 단순 결과물 나열보다 아키텍처 흐름, 구현 역할, 문제 해결 과정을 함께 보여주는 것을 목표로 했습니다.

## 배포 주소

GitHub Pages 설정 후 아래 주소에서 확인할 수 있습니다.

```text
https://mowja.github.io/portfolio/
```

## 주요 구성

- `index.html`: 포트폴리오 메인 페이지
- `style.css`: 전체 레이아웃 및 반응형 스타일
- `main.js`: 프로젝트 모달, 아키텍처 갤러리, 라이트박스 동작
- `images/`: 포트폴리오 사이트에 표시되는 아키텍처 이미지
- `assets/docs/`: 실습가이드 PDF 문서
- `assets/slides/`: 포트폴리오 발표 자료
- `GUIDES.md`: 실습가이드 문서 설명

## 대표 프로젝트

### 1. AWS VDI · 3-Tier Web · AI Knowledge Base 통합 플랫폼

WorkSpaces 기반 VDI, 내부 3-Tier 웹 서비스, Kendra와 Bedrock 기반 RAG 챗봇, 로그 분석 흐름을 통합한 AWS 아키텍처 프로젝트입니다.

### 2. On-Premises 3-Tier Logging Platform

Nginx, PHP, MariaDB 기반 3-Tier 서비스와 ELK Stack, Metricbeat, Rsyslog를 연결한 온프레미스 인프라 프로젝트입니다.

### 3. IoT Smart Farm AI Prediction System

ESP8266 센서 데이터, Raspberry Pi Django 서버, MariaDB, 태양광 발전량 예측 모델을 연결한 IoT/AI 졸업 프로젝트입니다.

## GitHub Pages 배포 방법

GitHub 저장소 `Settings`에서 Pages를 아래처럼 설정합니다.

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

설정 후 몇 분 정도 지나면 GitHub Pages 주소가 활성화됩니다.

## 작업 메모

- 커밋 메시지는 한글로 작성합니다.
- 포트폴리오 사이트는 정적 HTML/CSS/JavaScript로 구성되어 별도 빌드 과정 없이 실행됩니다.
- 로컬에서는 `index.html` 파일을 브라우저로 열어 바로 확인할 수 있습니다.
