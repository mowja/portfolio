---
title: CloudWatch 로그를 읽을 때 먼저 보는 것
label: 테스트 글
date: 2026.06.27
readTime: 5 min read
desc: Lambda와 API Gateway 로그를 볼 때 시간대, 요청 ID, 에러 메시지를 기준으로 따라가는 테스트용 글입니다.
img: images/aws_ai_backend_flow.png
tags: CloudWatch, Lambda, API Gateway, Logs
links: AI Backend Flow|images/aws_ai_backend_flow.png
---

CloudWatch 로그는 양이 많아서 처음부터 전체를 읽으면 시간이 오래 걸립니다. 먼저 시간대를 좁히고, 같은 요청 ID를 따라가며 흐름을 확인하는 방식이 효율적입니다.

### 관찰 포인트

- 요청이 API Gateway까지 도착했는지
- Lambda가 실행됐는지
- 외부 서비스 호출에서 timeout이 났는지
- 응답 코드가 어디서 바뀌었는지

로그 메시지를 직접 남길 때는 입력값 전체보다 상태와 식별자를 남기는 쪽이 운영에 유리합니다.
