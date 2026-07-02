---
title: 3-Tier 인프라에서 DNS, DHCP, NAT 흐름 잡기
label: 네트워크 노트
date: 2026.06.27
readTime: 6 min read
desc: 웹, WAS, DB 계층을 분리한 뒤 DNS, DHCP, NAT가 실제 접속 흐름에서 어떤 역할을 하는지 정리한 글입니다.
img: images/arch_02.png
tags: 3-Tier, DNS, DHCP, NAT, Routing
links: 3-Tier DNS/DHCP/NAT PDF|assets/docs/03-3tier-dns-dhcp-nat-guide.pdf; DHCP Web NAT PDF|assets/docs/02-dhcp-web-nat-guide.pdf
---

3-Tier 구성은 서버를 나누는 것에서 끝나지 않고, 사용자의 요청이 어느 네트워크 경로로 이동하는지 설명할 수 있어야 의미가 있습니다.

이 글은 클라이언트 주소 할당, 도메인 이름 해석, 내부 서버 접근, 외부 통신을 위한 NAT 흐름을 하나의 실습 시나리오로 묶어 정리합니다.

### 장애 확인 순서

- IP 할당 여부
- DNS 응답
- 라우팅 테이블
- 방화벽 정책
