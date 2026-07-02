---
title: ELK로 서버 로그를 모아 장애 원인 추적하기
label: 운영 기록
date: 2026.06
readTime: 7 min read
desc: Nginx, WAS, DB 로그를 한곳에 모으고 Kibana에서 장애 단서를 찾는 과정을 운영 관점으로 정리했습니다.
img: images/arch_03.png
tags: ELK, Nginx, MariaDB, Logstash, Kibana
links: 3-Tier ELK 프로젝트 가이드|assets/docs/01-3tier-elk-project-guide.pdf
---

서비스가 여러 계층으로 나뉘면 장애 원인을 한 서버 안에서만 찾기 어렵습니다. 그래서 로그를 중앙으로 모으는 구조가 필요합니다.

Filebeat 또는 Rsyslog로 로그를 수집하고, Logstash에서 필드를 정리한 뒤 Elasticsearch에 저장하면 Kibana에서 시간대별 요청 흐름을 확인할 수 있습니다.

### 실습 초점

- 웹 응답 지연
- DB slow query
- 방화벽 차단
- 시간대별 요청 흐름 비교
