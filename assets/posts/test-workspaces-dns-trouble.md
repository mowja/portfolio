---
title: WorkSpaces 내부 DNS 이슈 정리
label: 테스트 글
date: 2026.06.27
readTime: 6 min read
desc: WorkSpaces에서 내부 도메인 접근이 안 될 때 AD DNS와 Route 53 Private Hosted Zone을 구분해 보는 테스트용 글입니다.
img: images/aws_workspaces_flow.png
tags: WorkSpaces, DNS, Active Directory, Route 53
links: WorkSpaces Flow|images/aws_workspaces_flow.png
---

WorkSpaces 환경에서는 일반 EC2와 다르게 AD DNS를 먼저 보게 되는 경우가 많습니다. 그래서 Private Hosted Zone만 만들었다고 내부 도메인이 바로 해석되지 않을 수 있습니다.

### 점검 항목

- WorkSpaces가 참조하는 DNS 서버
- AD DNS 조건부 전달자 설정
- Route 53 Private Hosted Zone 연결 VPC
- 내부 ALB DNS 해석 결과

이 문제는 네트워크 단절처럼 보이지만 실제로는 이름 해석 실패인 경우가 많습니다.
