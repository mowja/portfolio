---
title: 3-Tier, DHCP, DNS, NAT 구성 실습
label: 실습 가이드
desc: Web, WAS, DB 3-Tier 분리부터 DHCP 주소 할당, DNS 이름 해석, NAT를 통한 외부 접근까지 하나의 온프레미스 네트워크 흐름으로 구성한 실습 기록입니다.
img: images/Guide_main/3tier_webVM에 DHCP와 DNS 추가하기.png
tags: 3-Tier, DHCP, DNS, NAT
---

이 실습은 Web, WAS, DB를 3-Tier로 분리한 뒤, 같은 환경에 DHCP, DNS, NAT를 순서대로 얹어 하나의 온프레미스 네트워크 흐름으로 완성한 기록입니다.
각 기능을 따로 확인하는 방식이 아니라, 앞선 설정이 다음 단계에서도 그대로 유지되는지를 함께 확인하는 데 초점을 맞췄습니다.

### 실습 목적
- Web, WAS, DB를 3-Tier로 분리해 각자의 역할만 수행하도록 구성
- Apache Reverse Proxy로 Web과 WAS 사이의 요청 흐름 연결
- DHCP 서버와 Relay를 구성해 서브넷 간 IP 자동 할당 확인
- MAC 주소 기반 고정 할당으로 동적 할당과 고정 IP를 함께 유지
- BIND9로 정방향, 역방향, 서브도메인 조회가 가능한 DNS 구성
- NAT(DNAT/SNAT)와 DNS View로 외부 클라이언트의 접근 흐름 검증

### 구성 흐름
Web VM은 Apache2 기반 웹 서버이자 이후 DHCP, DNS 서버 역할을 겸했고, WAS VM은 PHP로 Apache와 DB 사이의 요청을 처리했습니다. DB VM은 MariaDB로, 별도의 외부 접속 계정을 통해서만 WAS와 통신하도록 제한했습니다. Win VM은 사설망 바깥의 클라이언트로, Outer Router를 거쳐 내부로 접근합니다.

Outer Router는 외부 트래픽과 내부망의 경계를, Inner Router는 Web, WAS, DB 사이의 내부 통신을 담당합니다. Web과 WAS는 각각 두 개의 인터페이스를 가지고, 하나는 서비스 구간으로, 다른 하나는 Inner Router를 거쳐 DB 및 서로에게 닿는 내부 구간으로 나뉩니다. 이 구조를 그대로 유지한 채 DHCP, DNS, NAT를 순서대로 추가했습니다.

### 주요 설정
- Apache 000-default.conf에 ProxyPass, ProxyPassReverse로 리버스 프록시 구성
- PHP는 mysqli로 DB에 접속하며, 접속 정보는 /etc/environment의 환경 변수로 분리
- /etc/dhcp/dhcpd.conf에 서브넷별 range와 함께, MAC 주소 기반 host 블록으로 주요 서버 고정 IP 부여
- 라우터에 isc-dhcp-relay 설치, SERVERS와 INTERFACES에 DHCP 서버 방향 인터페이스까지 명시
- BIND9 정방향, 역방향 Zone 파일 작성 후 named.conf.local에 등록
- iptables PREROUTING(DNAT)과 POSTROUTING(SNAT)으로 내부 서버의 외부 공개 경로 구성
- named.conf.local에 ACL과 View를 나눠 클라이언트별로 다른 DNS 응답 반환

### 트러블슈팅

#### 서브넷 너머 클라이언트가 DHCP 주소를 받지 못함
라우터는 DHCP Discover 같은 브로드캐스트 패킷을 기본적으로 넘겨주지 않아, Web 서버의 DHCP를 다른 서브넷의 WAS, DB가 그대로는 받아올 수 없었습니다. 라우터에 isc-dhcp-relay를 설치하고, 클라이언트 요청이 들어오는 인터페이스뿐 아니라 DHCP 서버가 연결된 인터페이스까지 INTERFACES에 함께 넣어준 뒤 정상적으로 IP를 받아오는 것을 확인했습니다.

#### 문법 검사를 통과한 DNS 설정인데 응답을 못 받아옴
named-checkconf, named-checkzone까지 모두 통과했는데도 클라이언트가 이름을 해석하지 못했습니다. 원인은 /etc/bind/zones 디렉터리와 Zone 파일의 소유권, 권한이 bind 사용자가 읽을 수 없게 되어 있던 것이었고, chown과 chmod로 권한을 정리한 뒤 정상 동작을 확인했습니다.

#### NAT 적용 후 방향 설명이 반대로 되어 있음
POSTROUTING/MASQUERADE로 출발지를 바꾸는 규칙과 PREROUTING/DNAT로 목적지를 바꾸는 규칙의 설명을 서로 반대로 붙여둔 상태였습니다. PREROUTING은 라우팅 전에 목적지를 바꾸는 DNAT(외부에서 들어올 때), POSTROUTING은 나가기 직전에 출발지를 바꾸는 SNAT(내부에서 나갈 때)이라는 순서를 기준으로 정리한 뒤부터는 헷갈리지 않았습니다.

### 검증한 것
- 각 VM의 IP, 라우팅 테이블, 패킷 포워딩(ip_forward) 활성화 상태
- 서브넷 간 ping 통신
- 정적 페이지(개인 캐릭터 이미지)와 동적 페이지(DB 조회 결과) 접속
- IP, mzcloud.com, www.mzcloud.com 서브도메인 조회(정방향, 역방향 포함)
- Win VM에서 공인 IP(123.123.123.123)로 접속 시 DNAT, SNAT 동작
- Win VM과 내부 클라이언트가 같은 도메인을 조회할 때 View에 따라 다른 IP로 응답
- tcpdump로 캡처한 pcap을 Wireshark로 열어 Outer Router 구간에서 IP가 바뀌는 지점 확인

### 정리
3-Tier로 역할을 나눈 뒤 DHCP, DNS, NAT를 순서대로 얹으면서, 앞 단계의 설정이 다음 단계에서도 그대로 유지되는지를 계속 확인하는 과정이었습니다. DHCP Relay와 Reverse Proxy에서 반복해서 확인한 것은, 무언가를 대신 전달해주는 구성 요소는 요청이 들어오는 쪽과 실제 서버가 있는 쪽 양쪽을 모두 알고 있어야 동작한다는 점이었습니다.

설정 파일 문법이 맞는 것과 서비스가 실제로 동작하는 것은 별개라는 것도 DNS 권한 문제에서 확인했습니다. 이후 비슷한 구성에서 문제가 생기면 문법, 권한, 라우팅 경로 순서로 확인하면 원인을 좁혀갈 수 있을 것 같습니다.
