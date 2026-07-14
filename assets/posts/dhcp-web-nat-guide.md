---
title: DHCP, Web Server, NAT/PAT 구성 실습
label: 실습 가이드
readTime: PDF 문서
desc: DHCP 주소 할당, 웹 서버 접속, NAT/PAT, SSH 접근 제어를 하나의 네트워크 흐름으로 구성한 실습 문서입니다.
img: images/Guide_main/DHCP, Web Server, NAT, PAT, SSH.png
tags: DHCP, Web Server, NAT, PAT, SSH
links: PDF 열기|assets/docs/02-dhcp-web-nat-guide.pdf
---

이 실습은 내부 클라이언트가 DHCP로 IP를 할당받고, 웹 서버에 접근하며, NAT/PAT를 통해 외부 대역과 통신하는 흐름을 직접 구성한 기록입니다.

단일 기능만 따로 확인하는 방식이 아니라 DHCP Server, Web Server, Router, NAT/PAT, SSH 접근 제어가 실제 네트워크 안에서 어떤 순서로 맞물리는지 확인하는 데 초점을 맞췄습니다.

### 실습 목적

- DHCP 서버를 구성해 클라이언트 IP 자동 할당 확인
- DHCP Relay를 이용해 다른 서브넷의 클라이언트까지 주소 할당
- Nginx와 Apache2 기반 웹 서버 접속 흐름 확인
- Static NAT와 PAT를 통해 내부 서비스의 외부 접근 흐름 검증
- SSH 계정 생성과 키 기반 인증, 접근 권한 제한 방식 정리

### 구성 흐름

Ubuntu Server는 DHCP Server와 Nginx Web Server 역할을 담당하고, Ubuntu Desktop은 Apache2 Web Server로 구성했습니다. Windows VM은 DHCP Client와 웹 접속 테스트, SSH 접속 확인용 클라이언트로 사용했습니다.

라우터에서는 DHCP Relay, Static NAT, PAT를 설정해 내부망과 외부 대역 사이의 통신 흐름을 연결했습니다. 이 과정을 통해 IP 할당, 웹 접속, 포트 변환, SSH 접근이 각각 독립된 설정이 아니라 하나의 서비스 흐름 안에서 연결된다는 점을 확인했습니다.

### 주요 설정

- DHCP 서버 주소 풀과 게이트웨이 정보 설정
- 라우터 인터페이스의 DHCP Relay 설정
- Nginx와 Apache2 웹 서버 구동
- Static NAT를 통한 내부 웹 서버 공개
- PAT를 통한 내부 클라이언트 외부 통신 처리
- SSH 접속 계정과 키 기반 인증 설정

### 트러블슈팅

#### 클라이언트가 DHCP 주소를 받지 못함

DHCP 서버 설정만으로는 다른 서브넷의 클라이언트까지 주소가 전달되지 않았습니다. 라우터 인터페이스에 DHCP Relay 설정을 추가하고, 클라이언트에서 IP를 다시 요청해 정상적으로 주소를 받는 것을 확인했습니다.

#### 웹 서버 접속이 되지 않음

웹 서버 프로세스는 실행 중이었지만 다른 대역에서 접속되지 않았습니다. 서버 내부에서 먼저 웹 응답을 확인한 뒤, 라우터 경로와 방화벽 허용 범위를 점검해 접속 가능한 상태로 정리했습니다.

#### NAT/PAT 적용 후 외부 접속이 되지 않음

NAT/PAT 규칙만 추가한 상태에서는 외부 대역에서 내부 웹 서버로 접근되지 않았습니다. 변환 대상 IP와 포트, 라우터 인터페이스 방향을 다시 맞추고 내부 서버의 기본 게이트웨이를 확인해 외부 접속이 가능하도록 수정했습니다.

### 검증한 것

- 클라이언트 IP, Gateway, DNS 정보 확인
- 서브넷 간 `ping` 통신
- Nginx와 Apache2 웹 페이지 접속
- Static NAT/PAT 적용 후 외부 대역에서 웹 서비스 접근
- SSH 접속과 제한 권한 동작

### 정리

이 실습은 네트워크 기본 서비스가 실제 접속 과정에서 어떤 순서로 동작하는지 확인하기 위한 기초 실습입니다.

특히 DHCP 주소 할당, 라우팅, NAT/PAT, 웹 서버 접속을 한 번에 연결해 보면서 장애가 발생했을 때 어느 구간부터 확인해야 하는지 정리할 수 있었습니다.
