---
title: VPC Peering 연결 확인 체크리스트
label: 테스트 글
date: 2026.06.27
readTime: 4 min read
desc: VPC Peering을 만들었는데 통신이 안 될 때 확인할 항목을 짧게 정리한 테스트용 글입니다.
img: images/aws_webservice_flow.png
tags: VPC, Peering, Route Table, Security Group
links: AWS 웹 서비스 흐름도|images/aws_webservice_flow.png
---

VPC Peering은 연결 객체를 생성하는 것만으로 끝나지 않습니다. 양쪽 VPC의 라우팅 테이블, 보안 그룹, NACL이 함께 맞아야 실제 통신이 됩니다.

### 확인 순서

- Peering 상태가 active인지 확인
- 양쪽 Route Table에 상대 CIDR 경로가 있는지 확인
- Security Group에서 상대 대역을 허용했는지 확인
- NACL에서 inbound와 outbound가 모두 열려 있는지 확인

장애가 반복되면 ping보다 먼저 TCP 포트 기준으로 확인하는 편이 좋습니다.
