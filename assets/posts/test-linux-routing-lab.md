---
title: Linux 라우팅 실습 메모
label: 테스트 글
date: 2026.06.27
readTime: 3 min read
desc: Linux에서 기본 게이트웨이와 정적 라우트를 확인하는 명령을 정리한 테스트용 글입니다.
img: images/arch_02.png
tags: Linux, Routing, Gateway, ip route
links: 3-Tier DNS/DHCP/NAT PDF|assets/docs/03-3tier-dns-dhcp-nat-guide.pdf
---

라우팅 문제를 볼 때는 목적지 IP로 향하는 경로가 어떤 인터페이스를 타는지 먼저 확인합니다.

### 자주 쓰는 명령

- ip route
- ip addr
- ping
- traceroute

기본 게이트웨이가 틀리면 DNS가 정상이어도 외부 통신은 실패할 수 있습니다.
