# 포트폴리오 실습가이드 최종본

본 폴더는 네트워크, 3Tier Web 아키텍처, DNS/DHCP/NAT, Docker 기반 서비스 운영 실습을 정리한 포트폴리오용 최종 PDF 모음입니다. 각 문서는 단순 명령어 기록이 아니라 실습 목적, 구성 환경, 설정 절차, 검증 방법을 포함하도록 보완했습니다.

## 공통 실습 환경

- 가상화: Oracle VirtualBox, GNS3
- 운영체제: Ubuntu Server 22.04 LTS, Ubuntu Desktop, Windows VM
- 네트워크: NAT, Host-Only, NAT Network, GNS3 Router/Switch
- 주요 서버 역할: Web, WAS, DB, DNS, DHCP, Bastion/Logging
- 주요 기술: Nginx, Apache2, PHP, MariaDB, Redis, BIND9, isc-dhcp-server, Docker, Docker Registry, ELK Stack
- 검증 방식: `ping`, `curl`, 브라우저 접속, `dig`, `nslookup`, `systemctl status`, `docker ps`, `named-checkconf`, `named-checkzone`, NAT translation 확인

## 문서 목록

### 01_3Tier_ELK_프로젝트_기술가이드_곽덕연.pdf

- 주제: 3Tier 아키텍처 기반 프로젝트 기술가이드
- 구성 환경:
  - Web Server: Nginx, Redis
  - WAS Server: Apache2, PHP
  - DB Server: MariaDB
  - Logging/Monitoring: ELK Stack, Metricbeat
  - Network: GNS3 Router, 내부 서비스망, 관리망, 외부 연결망
- 핵심 내용:
  - 3Tier 구조 설계와 계층별 역할 분리
  - Redis 기반 세션 공유 구조
  - 중앙 집중식 로그 수집 및 시각화
  - 서버별 설치/설정/검증 절차
- 포트폴리오 포인트:
  - 단일 서비스 구축을 넘어 운영 관점의 로깅/모니터링까지 확장한 프로젝트형 문서

### 02_DHCP_Web_NAT_실습가이드_곽덕연.pdf

- 주제: DHCP, Web Server, NAT/PAT, SSH 접근 제어 실습
- 구성 환경:
  - Ubuntu Server: DHCP Server, Nginx
  - Ubuntu Desktop: Apache2 Web Server
  - Windows VM: DHCP Client, Web 접속 테스트, SSH Client
  - Router: DHCP Relay, Static NAT, PAT 설정
  - Network: `192.168.10.0/24`, `100.100.10.0/24`, 공인 IP 실습 대역
- 핵심 내용:
  - DHCP 서버 구축 및 클라이언트 IP 자동 할당
  - `ip helper-address` 기반 DHCP Relay 구성
  - Nginx/Apache2 웹 서버 접속 테스트
  - Static NAT/PAT를 통한 공인 IP 기반 Web 접근
  - SSH 계정 생성, 키 기반 인증, 안전한 권한 제한 방식
- 검증 포인트:
  - DHCP lease 확인
  - 서브넷 간 ping 확인
  - NAT/PAT 접속 확인
  - SSH 접속 및 제한 권한 확인

### 03_3Tier_DNS_DHCP_NAT_실습가이드_곽덕연.pdf

- 주제: 기존 3Tier Web 환경에 DNS, DHCP, NAT 기능을 추가한 확장 실습
- 구성 환경:
  - Web Server: DNS/DHCP 서비스 추가
  - WAS/DB Server: 기존 3Tier 구성 유지
  - Router VM: DHCP Relay, 패킷 포워딩
  - Windows VM: 외부 접속 및 DNS 응답 검증
  - DNS: BIND9, 정방향/역방향 Zone, View 설정
  - DHCP: MAC 주소 기반 고정 IP 할당
- 핵심 내용:
  - 기존 3Tier 동작 상태 점검
  - DHCP 서버와 Relay 설정
  - BIND9 기반 도메인 조회 구성
  - `mzcloud.com` 정방향/역방향 조회
  - Win VM 요청에 대해 다른 DNS 응답을 반환하는 View 설정
  - NAT를 통한 외부 대역 접근 처리
- 검증 포인트:
  - `dhcpd -t` DHCP 문법 검사
  - `named-checkconf`, `named-checkzone` DNS 설정 검사
  - `dig`, `nslookup` 정방향/역방향 조회
  - HTTP/DNS 패킷 흐름 확인

### 04_Docker_DNS_응용_실습가이드_곽덕연.pdf

- 주제: Docker Web 컨테이너, 이미지 배포, Private Registry, BIND DNS 컨테이너 응용
- 구성 환경:
  - Ubuntu Server VM
  - Docker Engine, Docker CLI
  - Nginx Web Container
  - Docker Hub Public Registry
  - Local Private Registry Container
  - BIND9 DNS Container
  - MainUS/SubUS/Extra VM 구조
- 핵심 내용:
  - `docker run`, `create`, `start`, `exec`, `attach` 차이 정리
  - Nginx 컨테이너 생성 및 웹 페이지 수정
  - `docker commit`으로 이미지 생성
  - Docker Hub Public Push
  - Local Private Registry 구축 및 Push 검증
  - BIND9 컨테이너를 이용한 `team3.com` DNS 서비스 구성
- 검증 포인트:
  - `docker ps`, `docker images` 상태 확인
  - `curl localhost` Web 응답 확인
  - Registry catalog API 확인
  - `named-checkconf`, `named-checkzone` 검사
  - `dig @127.0.0.1 www.team3.com` DNS 조회 확인

## 추천 열람 순서

1. `02_DHCP_Web_NAT_실습가이드_곽덕연.pdf`
2. `03_3Tier_DNS_DHCP_NAT_실습가이드_곽덕연.pdf`
3. `04_Docker_DNS_응용_실습가이드_곽덕연.pdf`
4. `01_3Tier_ELK_프로젝트_기술가이드_곽덕연.pdf`

기초 네트워크 서비스 구성에서 시작해 3Tier 확장, Docker 응용, 최종 프로젝트 기술가이드 순서로 읽으면 기술 성장 흐름이 자연스럽게 드러납니다.

## 제출 시 설명 포인트

- 네트워크 기본 서비스(DHCP/DNS/NAT)를 직접 구성하고 검증했습니다.
- Web/WAS/DB로 분리된 3Tier 구조를 이해하고 확장 구성했습니다.
- Docker 컨테이너 기반 Web/DNS 서비스와 이미지 배포 흐름을 실습했습니다.
- 프로젝트 문서에서는 3Tier 구조를 Redis 세션 공유와 ELK 모니터링까지 확장했습니다.
- 각 문서에는 문제 상황, 설정 절차, 검증 명령, 트러블슈팅을 포함해 재현 가능한 실습가이드 형태로 정리했습니다.
