---
title: Nginx, Apache, PHP, MariaDB, ELK Stack 구성 실습
label: 실습 가이드
readTime: PDF 문서
desc: Nginx, WAS(Apache+PHP), MariaDB로 3-Tier 웹 아키텍처를 구성하고, Redis로 WAS 서버 간 세션을 공유하며, ELK Stack과 Rsyslog, Metricbeat로 중앙집중식 로그 수집과 리소스 모니터링 환경을 구축한 실습입니다.
img: images/arch_02.png
tags: Nginx, Apache, PHP, MariaDB, ELK Stack
links: PDF 열기|assets/docs/01-3tier-elk-project-guide.pdf
---

본 실습은 Nginx, WAS(Apache+PHP) 이중화, MariaDB로 3-Tier 웹 아키텍처를 구성하고, Redis를 통한 세션 공유와 ELK Stack 기반 중앙집중식 로깅 환경까지 함께 구축하는 과정을 다룹니다. GNS3로 라우터를 시뮬레이션하고 VirtualBox VM으로 각 서버 역할을 분리했습니다.

### 실습 목적

- Nginx, WAS(Apache+PHP) 이중화, MariaDB로 3-Tier 웹 아키텍처 구성
- Redis를 이용한 WAS 서버 간 세션 공유(세션 클러스터링) 검증
- Rsyslog와 ELK Stack(Elasticsearch, Logstash, Kibana)을 통한 중앙집중식 로그 수집, 저장, 시각화 환경 구축
- 로그 유형별 태깅과 보존 정책 수립을 통한 실무형 로깅 정책 설계
- Metricbeat를 통한 서버별 리소스(CPU, 메모리, 디스크, 네트워크) 모니터링

### 구성 흐름

GNS3로 시뮬레이션한 라우터가 WEB, WAS, DB, Bastion 4개 서브넷의 게이트웨이 역할을 하고, 각 VirtualBox VM은 Host-Only 어댑터로 해당 서브넷에 연결됩니다. WEB 서버(Nginx)는 정적 콘텐츠를 직접 제공하면서 동적 요청을 WAS1, WAS2 두 대의 WAS 서버(Apache+PHP)로 분산 프록시하고, WAS 서버는 애플리케이션 로직을 처리한 뒤 DB 서버(MariaDB)에서 데이터를 조회, 갱신합니다. 세션 정보는 WEB 서버에 위치한 Redis에 중앙 저장되어, 요청이 WAS1과 WAS2 어느 쪽으로 분산되더라도 동일한 세션이 유지됩니다. Bastion Host는 관리용 서버이자 동시에 로깅/모니터링 서버 역할을 겸해 Elasticsearch, Logstash, Kibana를 운영하며, 나머지 서버들은 Rsyslog로 시스템 로그를 Logstash에 전달하고 Metricbeat로 리소스 지표를 Elasticsearch에 전송해 Kibana에서 시각화합니다.

### 주요 설정

- Netplan 고정 IP 및 라우팅: WEB(192.168.1.10), WAS1(192.168.2.10), WAS2(192.168.2.20), DB(192.168.3.10) 각 서버의 enp0s3에 정적 IP와 해당 서브넷 게이트웨이로의 기본 라우트를 지정하고, Bastion Host는 enp0s3(고정 IP, 내부망)와 enp0s8(DHCP, 외부망) 두 어댑터를 분리해 관리망과 인터넷 연결을 구분
- 라우터 인터페이스 설정: GNS3 라우터(C3600)의 FastEthernet 1/0~1/3에 각각 WEB, WAS, DB, Bastion 서브넷의 게이트웨이 IP(192.168.1.250, 192.168.2.250, 192.168.3.250, 192.168.4.250)를 부여하고 no shutdown으로 활성화
- Nginx 로드밸런싱: /etc/nginx/conf.d/3tier.conf에 upstream was_backend { server 192.168.2.10; server 192.168.2.20; }를 정의하고, /api/ 요청을 이 업스트림으로 proxy_pass해 WAS 이중화 트래픽을 분산
- PHP-Redis 세션 연동: WAS1, WAS2 양쪽의 php.ini에서 session.save_handler = redis, session.save_path = "tcp://192.168.1.10:6379?auth=********"로 지정해 두 WAS가 WEB 서버의 Redis를 동일한 세션 저장소로 공유
- Redis 외부 접속 허용: /etc/redis/redis.conf에서 bind 0.0.0.0, requirepass ******** 설정 후 redis-cli에서 AUTH로 인증 동작 확인
- MariaDB 외부 접속 허용 및 계정 분리: bind-address를 0.0.0.0으로 변경하고, 로컬 관리 계정, WAS 전용 접속 계정(was_user), Bastion 전용 접속 계정(bastion_user)을 목적별로 분리 생성
- Rsyslog 로그 전달: 모든 서버의 /etc/rsyslog.d/50-remote.conf에 *.* @192.168.4.10:5140을 추가해 로그를 Bastion(Logstash)으로 전송
- Elasticsearch, Kibana 외부 접속 허용: elasticsearch.yml의 network.host: 0.0.0.0, http.host: 0.0.0.0과 kibana.yml의 server.host: "0.0.0.0" 설정으로 Bastion 외부에서 접근 가능하도록 구성
- Logstash 로그 태깅 및 인덱스 분리: /etc/logstash/conf.d/remote-syslog.conf에서 program 필드를 nginx, apache2|php, mariadb|mysqld, iptables|firewalld|ufw, sshd, metricbeat|systemd|kernel|syslog 등으로 매칭해 web_log, was_log, db_log, firewall_log, ssh_log, system_resource_log 태그를 부여하고, 태그별로 web-logs-*, was-logs-*, db-logs-*, firewall-logs-*, ssh-logs-*, system-resource-logs-* 인덱스에 분리 저장, 매칭되지 않는 로그는 drop 처리
- Metricbeat 설정: 각 서버의 metricbeat.yml에서 output.elasticsearch.hosts와 setup.kibana.host를 Bastion(192.168.4.10)으로 지정하고 system 모듈을 활성화(metricbeat modules enable system, metricbeat setup)해 CPU, 메모리, 디스크, 네트워크 지표를 수집

### 트러블슈팅

#### GNS3 라우터에서 VM이 외부와 통신되지 않음
VM 어댑터를 라우터에 연결한 직후에는 패키지 설치를 위한 외부 인터넷 연결이 되지 않았습니다. GNS3에서 라우터가 인터넷과 연결된 포트가 DHCP로 IP를 받아오지 못하도록 제한되어 있어, 라우터를 경유하는 VM들이 외부 통신을 할 수 없는 구조였기 때문입니다. 패키지 설치가 필요한 초반 구간에서만 VM 네트워크 어댑터를 NAT로 임시 전환해 외부 저장소에 접근한 뒤, 설치가 끝나면 다시 Host-Only 어댑터로 되돌려 내부망 구성을 유지했습니다.

#### VirtualBox 디스크 용량 부족
ELK 스택을 설치할 Bastion Host(ELK) VM에서 디스크 공간이 부족한 상황이 발생했습니다. 이미 생성된 VM은 VirtualBox GUI에서 vdi 파일 크기를 직접 늘릴 수 없다는 제약이 원인이었습니다. 명령 프롬프트에서 VBoxManage modifyhd 명령으로 vdi 파일 크기를 먼저 확장한 뒤, Ubuntu 내부에서 lvextend -l +100%FREE와 resize2fs를 순서대로 실행해 LVM 파티션과 파일시스템 용량을 함께 확장했습니다.

#### Logstash 필터에서 일부 로그가 누락됨
로깅 정책을 적용한 뒤 방화벽이나 DB 데몬 관련 로그 일부가 색인되지 않고 사라지는 현상이 있었습니다. 초기 grok/program 매칭 조건이 apache2, mariadb, ufw 등 실제 리눅스 데몬 프로세스명과 정확히 일치하지 않아 drop 처리 분기에 걸려 로그가 삭제된 것이 원인이었습니다. program 필드의 정규식을 apache2|php, mariadb|mysqld, iptables|firewalld|ufw 등으로 확장 재정의해 대상 로그가 올바른 태그로 분류되도록 수정했습니다.

#### Metricbeat 일부 대시보드가 비어있음
Kibana의 Host Services Overview, Overview ECS, Containers overview 대시보드에 데이터가 표시되지 않았습니다. 각각 system 모듈의 service metricset, vsphere 모듈, 컨테이너 관련 설정이 비활성 상태였던 것이 원인이었습니다. 별도 모듈 활성화 없이는 확인이 불가능한 한계로 남겨두고, Host overview 대시보드에서 host.name 필터로 서버별 리소스 지표만 개별 확인하는 방식으로 대체했습니다.

### 검증한 것

- WEB 서버(192.168.1.10) 접속 시 정적 페이지와 img_shop.php 페이지가 정상적으로 노출됨을 확인
- 새로고침으로 요청이 WAS1, WAS2에 번갈아 분산되어도 Redis 덕분에 Session ID는 동일하게 유지되고, 컨테이너 식별자만 WAS1-S, WAS2-S로 전환됨을 확인
- redis-cli에서 AUTH 인증 후 PHPREDIS_SESSION 키가 정상적으로 저장되어 있음을 확인
- Kibana Discover에서 인덱스 패턴(remote-syslog-*)을 통해 Rsyslog로 수집된 로그가 정상 조회됨을 확인
- 로깅 정책 적용 후 web-logs-*, was-logs-*, db-logs-*, firewall-logs-*, ssh-logs-* 인덱스로 로그 유형이 분리 저장됨을 확인
- Metricbeat를 통해 WEB, WAS1, WAS2, DB, Bastion 서버별 CPU, 메모리, 디스크, 네트워크 트래픽을 Kibana 대시보드에서 개별 조회 가능함을 확인

### 정리

Nginx의 로드밸런싱과 Redis 세션 공유를 결합해 WAS 이중화 환경에서도 사용자 세션이 끊기지 않는 3-Tier 구조를 완성했고, 여기에 Rsyslog와 ELK Stack, Metricbeat를 더해 여러 서버의 로그와 리소스를 한 곳에서 관리하는 흐름까지 구현했습니다. 특히 로그를 무분별하게 쌓지 않고 유형별로 태깅, 분리, 보존 기간을 정하는 과정에서 운영 관점의 로그 관리 설계를 직접 경험할 수 있었습니다.
