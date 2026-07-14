---
title: Docker, Container, DNS 응용 실습
label: 실습 가이드
readTime: PDF 문서
desc: Container로 Web Server와 DNS Server를 구축하고, 이미지를 Docker Hub와 Private Registry에 저장하며 물리 DNS와 컨테이너 DNS를 연동한 실습 문서입니다.
img: images/Guide_main/04-docker-dns.png
tags: Docker, Container, DNS
links: PDF 열기|assets/docs/04-docker-dns-application-guide.pdf
---

이 실습은 Web Server와 DNS Server를 각각 컨테이너로 구축하고, 만든 이미지를 Docker Hub와 Private Registry에 저장한 뒤, 물리 DNS가 컨테이너 DNS에 질의를 위임하는 구조까지 연결한 기록입니다.

### 실습 목적
- Container 개념을 이해하고 서비스에 직접 활용
- Container로 Web Server 구축
- Container로 DNS Server 구축
- 생성한 이미지를 Docker Hub(Public)와 Private Registry에 각각 저장
- 물리 DNS와 컨테이너 기반 DNS를 연동해 질의를 위임하는 구조 구성

### 구성 흐름
MainUS VM은 물리적 DNS 서버로 퍼블릭에 위치하며, forwarders 설정으로 사설 DNS인 SubUS에 질의를 넘기는 역할을 합니다. SubUS VM은 컨테이너로 띄운 논리적 DNS 서버로 사설망에 위치하고, 팀원들의 웹 컨테이너 정보를 담은 team3.com Zone을 관리합니다. Extra VM은 팀원이 Docker Hub에 올린 웹 이미지를 pull 받아 자신만의 웹 컨테이너를 구동합니다.

기본적으로 모든 VM은 MainUS를 DNS 서버로 지정하지만, 실제 질의 처리는 SubUS 컨테이너로 위임됩니다. 웹 컨테이너 쪽에서는 nginx 이미지를 pull 받아 컨테이너를 만들고, 내부에 직접 파일을 넣어 커스터마이징한 뒤 이미지를 commit해서 Docker Hub와 로컬 Private Registry에 각각 저장하는 흐름으로 진행했습니다.

### 주요 설정
- docker create, docker start로 nginx 컨테이너 생성 후 docker cp로 파일 주입, index.html 수정
- docker commit으로 커스터마이징한 컨테이너를 새 이미지로 저장
- docker tag, docker push로 Docker Hub(Public 영역) 업로드
- docker run으로 registry:2 컨테이너를 띄워 Private Registry 구성 후 태깅, push
- MainUS의 /etc/bind/named.conf.options에 forwarders 100.100.100.30(SubUS) 지정
- SubUS는 ubuntu/bind9 컨테이너로 구동, 포트 53 충돌 방지를 위해 호스트의 systemd-resolved 비활성화
- team3.com Zone 파일 작성 후 named-checkconf, named-checkzone으로 문법 검증

### 트러블슈팅

#### 53번 포트 충돌
호스트 VM의 systemd-resolved가 이미 53번 포트를 점유하고 있어 DNS 컨테이너가 정상적으로 바인딩되지 않았습니다. `sudo systemctl disable --now systemd-resolved`로 비활성화하고 /etc/resolv.conf를 127.0.0.1을 가리키도록 재작성한 뒤 컨테이너를 재시작해 해결했습니다.

#### Zone 파일 경로 오류
named.conf.local에 등록한 zone 파일 경로 뒤에 불필요한 점(.)이 붙어 있어 BIND가 파일을 찾지 못했습니다. named.conf 설정을 다시 확인해 경로를 정리하고 재시작한 뒤 정상 로드되는 것을 확인했습니다.

#### DNS 질의 실패
named-checkconf, named-checkzone을 모두 통과했는데도 dig 조회가 응답하지 않았습니다. listen-on과 allow-query 범위, 그리고 컨테이너 내부 /etc/resolv.conf가 127.0.0.1을 가리키고 있는지를 차례로 점검한 뒤 정상 응답을 받았습니다.

### 검증한 것
- docker version, docker info로 엔진 정상 동작 확인
- docker ps --filter name=duckweb으로 Web 컨테이너 Up 상태 확인
- curl http://localhost로 수정한 페이지 응답 확인
- docker images | grep duckweb으로 커밋한 이미지 확인
- docker push로 Docker Hub Public 업로드 및 Private Registry(catalog API) 저장 확인
- docker ps --filter name=dock_dns로 DNS 컨테이너 Up 상태 확인
- dig @127.0.0.1 www.team3.com으로 설정한 레코드 응답 확인

### 정리
Web 서버와 DNS 서버를 각각 컨테이너로 분리해서 구축하고, 물리 DNS(MainUS)가 컨테이너 DNS(SubUS)에 질의를 위임하는 구조까지 만들어본 실습이었습니다. 이미지를 commit하고 공개 저장소와 사설 저장소에 각각 올려보면서, 컨테이너 환경에서는 서비스 상태뿐 아니라 이미지 자체도 하나의 배포 단위로 관리된다는 것을 확인할 수 있었습니다. 포트 충돌이나 Zone 경로 오류처럼 이번에 겪은 문제 대부분은 호스트와 컨테이너가 같은 리소스를 두고 부딪히는 지점에서 나왔습니다. 이후 팀원과 각자의 네트워크(핫스팟) 환경에서 포트포워딩까지 연결해 DNS 질의와 HTTP 요청 흐름을 다시 검증해봤는데, 컨테이너 안에서 확인했던 원리가 물리적으로 분리된 네트워크에서도 그대로 적용된다는 것을 다시 확인할 수 있었습니다.
