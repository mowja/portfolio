document.documentElement.classList.add('js-ready');

/* ── 카드뉴스 슬라이드 ── */
const slides = Array.from(document.querySelectorAll('.deck-slide'));
const slideButtons = Array.from(document.querySelectorAll('button[data-slide]'));
const slideCounter = document.getElementById('slideCounter');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');
let currentSlide = 0;

function normalizeSlideIndex(index) {
  return (index + slides.length) % slides.length;
}

function showSlide(index) {
  currentSlide = normalizeSlideIndex(index);
  slides.forEach(function(slide, slideIndex) {
    slide.classList.toggle('active', slideIndex === currentSlide);
  });
  slideButtons.forEach(function(button) {
    button.classList.toggle('active', Number(button.dataset.slide) === currentSlide);
  });
  if (slideCounter) {
    slideCounter.textContent = String(currentSlide + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  }
}

slideButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    showSlide(Number(button.dataset.slide));
  });
});

if (prevSlideBtn) {
  prevSlideBtn.addEventListener('click', function() {
    showSlide(currentSlide - 1);
  });
}

if (nextSlideBtn) {
  nextSlideBtn.addEventListener('click', function() {
    showSlide(currentSlide + 1);
  });
}

if (slides.length) {
  showSlide(0);
}

/* ── 모달 데이터 ── */
const projects = [
  {
    num: '01',
    badge: '<span class="p-badge b-cloud">AWS Cloud</span><span class="p-badge b-award">🏆 최우수팀상</span>',
    title: 'AWS VDI · 3-Tier Web · AI Knowledge Base 통합 플랫폼',
    overview: '방산 제조 기업을 가정한 업무 환경에서 고객 웹 서비스, VDI 서비스, 내부 3-Tier 웹 서비스, AI 문서 검색 서비스, 로그 분석 서비스를 하나의 AWS 아키텍처로 연결했습니다. WorkSpaces 기반 업무 환경에서 Kendra와 Bedrock을 연동해 사내 문서를 검색하고 자연어 답변을 제공하는 RAG형 AI 챗봇을 구현했으며, MegaZone Cloud 최우수팀상을 수상했습니다.',
    archIcon: '☁️',
    archImg: 'images/arch_01.png',
    archDesc: 'Customer Web, VDI, Internal Web, AI, Logging 서비스를 분리하고 VPC Peering, API Gateway, Lambda, Kendra, Bedrock, CloudWatch 기반 로그 흐름으로 연결한 통합 구성도입니다.',
    myRole: [
      'AI 서비스 파트 설계 및 구현 담당',
      'Kendra, Bedrock, Lambda, API Gateway 기반 RAG 파이프라인 구성',
      'Office365 Connector 연동 구조 및 인증 흐름 설계',
      '전체 서비스 흐름도와 아키텍처 문서화'
    ],
    services: [
      { title: '고객 웹 서비스', desc: 'Route53, CloudFront, S3, API Gateway를 통해 외부 사용자 요청과 이벤트 접수 흐름을 구성했습니다.' },
      { title: 'VDI 서비스', desc: 'WorkSpaces, Managed Microsoft AD, NAT Gateway, Storage Gateway, FSx를 활용해 업무용 가상 데스크톱 흐름을 설계했습니다.' },
      { title: '내부 웹 서비스', desc: 'VPC Peering으로 VDI VPC와 내부 웹 VPC를 연결하고, ALB, ASG, Web/WAS, RDS Multi-AZ 구조를 구성했습니다.' },
      { title: 'AI 서비스', desc: 'Kendra 검색 결과를 Lambda에서 문맥으로 구성한 뒤 Bedrock Claude 모델로 답변을 생성하는 흐름을 구현했습니다.' },
      { title: 'Logging 서비스', desc: 'CloudWatch, Kinesis Data Firehose, S3, Glue, Athena를 활용해 배치와 실시간 로그 분석 흐름을 정리했습니다.' }
    ],
    detailImages: [
      { title: 'AI 질의 처리 흐름', src: 'images/aws_ai_qa_flow.png', desc: '브라우저 질의 입력부터 Kendra 검색, Bedrock 답변 생성, DOM 출력까지의 처리 흐름' },
      { title: '프론트엔드 라인', src: 'images/aws_ai_frontend_flow.png', desc: 'Route53, CloudFront, S3 정적 웹 배포와 API Gateway 호출 구조' },
      { title: 'API/AI 백엔드', src: 'images/aws_ai_backend_flow.png', desc: 'API Gateway, Lambda, Kendra, Bedrock을 연결한 백엔드 처리 구조' },
      { title: 'Kendra Knowledge Base', src: 'images/aws_ai_kendra_flow.png', desc: 'OneDrive, Exchange, Teams 데이터를 Kendra에 수집·인덱싱하는 흐름' },
      { title: 'Bedrock 답변 생성', src: 'images/aws_ai_bedrock_flow.png', desc: 'Claude 3.7 Sonnet 호출 후 웹 인터페이스에 답변을 표시하는 흐름' },
      { title: 'WorkSpaces 흐름도', src: 'images/aws_workspaces_flow.png', desc: 'WorkSpaces 인증, 세션, 스토리지, 내부 서비스 연결 흐름' },
      { title: '웹서비스 흐름도', src: 'images/aws_webservice_flow.png', desc: '내부 도메인, VPC Peering, WEB/WAS/DB 3-Tier 고가용성 흐름' }
    ],
    features: [
      'WorkSpaces 기반 VDI와 내부 웹 서비스를 VPC Peering으로 연결하는 업무 환경 설계',
      'MS365(Teams, OneDrive, Exchange)와 S3 문서를 Kendra로 통합 인덱싱하는 구조 설계',
      'Lambda 기반 RAG 파이프라인 구현: Kendra 검색 → 문맥 구성 → Bedrock 답변 생성',
      'API Gateway를 통한 챗봇 REST API 엔드포인트 구성 및 키 기반 접근 제어 적용',
      'Microsoft Entra ID 앱 등록 및 OAuth 권한 설정으로 MS365 연동 처리',
      'Secrets Manager를 활용한 인증 정보 분리 관리 — 비밀값을 코드에서 분리',
      'CloudWatch, Firehose, S3, Athena 기반 로그 수집·분석 흐름 문서화',
      'S3 + CloudFront 기반 정적 웹사이트 배포 구성 참여',
      'Kendra 문서 동기화, API 호출 흐름, Bedrock 응답 형태 직접 검증'
    ],
    troubleshooting: [
      'WorkSpaces 내부 DNS 해석 문제: WorkSpaces가 Route53 PHZ가 아니라 AD DNS를 우선 사용한다는 점을 확인하고 내부 도메인 질의 흐름을 재설계',
      'AD DNS ↔ AWS DNS 연동 문제: 내부 도메인은 AD DNS가 관리하고 ALB DNS의 Private IP 해석은 AWS DNS가 담당하도록 역할 분리',
      'VPC Peering 라우팅 문제: Peering 생성만으로는 통신이 되지 않아 양쪽 Route Table과 보안 그룹을 상대 CIDR 기준으로 재정리',
      'Kendra / Office365 권한 문제: Entra ID App Registration, OAuth Client Credentials, Graph API 권한 범위를 기준으로 커넥터 인증 구조 정리',
      'Bedrock 호출 권한 문제: Lambda 실행 역할에 Kendra Query와 Bedrock InvokeModel 권한이 모두 필요하다는 점을 확인하고 IAM 권한 구성'
    ],
    stack: ['Amazon WorkSpaces', 'Managed Microsoft AD', 'VPC Peering', 'ALB', 'ASG', 'RDS MySQL', 'Amazon Kendra', 'Amazon Bedrock (Claude 3.7)', 'AWS Lambda', 'API Gateway', 'S3', 'CloudFront', 'CloudWatch', 'Kinesis Firehose', 'Athena', 'Secrets Manager', 'Microsoft Entra ID', 'IAM']
  },
  {
    num: '02',
    badge: '<span class="p-badge b-onprem">On-Premises</span>',
    title: '패션 이커머스 서버 인프라 고가용성 전환 구축',
    overview: '온프레미스 환경에서 네트워크, 서버, DB를 직접 구성해 3-Tier 쇼핑몰 서비스를 구축한 프로젝트입니다. L2/L3 스위치, 방화벽, Web·WAS·DB 서버, ELK 기반 로그 분석 환경까지 연계하여 실제 서비스 운영 흐름과 장애 대응을 경험했습니다.',
    archIcon: '🖥️',
    archImg: 'images/arch_02.png', /* 예: 'images/arch_02.png' */
    archDesc: '클라이언트 → L2/L3 스위치 → 방화벽 → Web 서버(Nginx) → WAS 서버(PHP) → DB 서버(MariaDB) / 각 서버 로그 → ELK 수집·분석',
    features: [
      'L2/L3 스위치 기반 네트워크 구성 및 VLAN 분리',
      '라우팅 설정을 통한 서버 구간 간 통신 구성',
      '방화벽 정책 설정 및 서버 간 허용 포트 점검',
      'Web 서버(Nginx) 구축 및 WAS 연동 구성',
      'WAS 서버(PHP) 구축 및 쇼핑몰 서비스 배포',
      'DB 서버(MariaDB) 구축 및 WAS-DB 연동',
      '3-Tier 구조 전 구간 통신 테스트 및 접속 흐름 검증',
      'ELK Stack 기반 로그 통합 수집·분석 환경 구축',
      'Nginx 응답 로그 및 DB Slow Query 로그 확인 환경 구성',
      '장애 발생 시 원인 분석 및 트러블슈팅 수행'
    ],
    stack: ['Linux', 'Nginx', 'PHP', 'MariaDB', 'L2 Switch', 'L3 Switch', 'VLAN', 'Routing', 'Firewall', 'Elasticsearch', 'Logstash', 'Kibana'],
    highlights: [
      '네트워크, 서버, DB를 포함한 온프레미스 3-Tier 쇼핑몰 인프라를 직접 구성했습니다.',
      'Web-PHP-MariaDB 구조를 실제 서비스 흐름에 맞게 구현하며 인프라 전 구간 이해도를 높였습니다.',
      '단순 서비스 배포를 넘어, 로그 분석 환경까지 포함한 운영 기반을 함께 마련했습니다.'
    ],
    operations: [
      '여러 서버에 분산된 로그를 통합해 웹 응답과 DB 쿼리 흐름을 함께 확인할 수 있도록 구성했습니다.',
      '장애 원인을 추측이 아닌 로그 기반으로 분석할 수 있는 운영 환경을 마련했습니다.',
      '서비스 운영 과정에서 원인 분석 속도와 점검 효율을 높일 수 있었습니다.'
    ]
  },
  {
    num: '03',
    badge: '<span class="p-badge b-iot">IoT / AI</span><span class="p-badge b-award">🏆 연구노트상</span><span class="p-badge b-award">🏆 캡스톤 경진대회</span>',
    title: '잉여 전력 활용을 위한 태양광 발전 예측 모델 비교 분석',
    overview: '태양광 패널의 잉여 전력을 효율적으로 활용하기 위해, 발전량을 예측하고 수전해 장치 및 스마트팜 제어와 연동한 IoT·AI 통합 시스템입니다. ESP8266으로 센서 데이터를 수집하고, Raspberry Pi 기반 Django 서버에서 Simple RNN 모델로 발전량을 예측해 실시간 대시보드로 시각화했습니다.',
    archIcon: '☀️',
    archImg: 'images/arch_03.png',
    archDesc: 'ESP8266 + 센서(INA219·BMP180·토양수분) → Wi-Fi → Raspberry Pi (Django 서버·MariaDB·AI 모델) → 웹 대시보드 / 수전해 장치·스마트팜 피드백 제어',
    features: [
      'ESP8266 + INA219·BMP180·토양수분 센서 배선 및 데이터 수집 구성',
      'Raspberry Pi 기반 Django 웹 서버 구축 및 MariaDB 연동',
      'Simple RNN 기반 태양광 발전량 예측 모델 구현 (평가: MAE/MSE)',
      '예측 결과 웹 시각화 및 PNG 저장·이메일 전송 기능 구현',
      '수전해 장치 및 스마트팜 피드백 구동 연동',
      '실시간 대시보드를 통한 센서 데이터 및 예측값 모니터링'
    ],
    troubleshooting: [
      'Wi-Fi 연결 불안정으로 실시간 데이터 전송이 어려웠고, 전력 제약으로 추가 저장 모듈 장착도 불가 → 내부 저장소에 CSV 형식으로 저장하는 배치 처리 구조로 전환하여 해결',
      '저장 용량 한계로 1초 단위 원본 데이터를 모두 저장하기 어려웠음 → 일정 시간 단위 평균값을 저장하는 방식으로 저장 주기와 데이터 정확도 사이의 최적값을 조정'
    ],
    stack: ['Raspberry Pi', 'ESP8266', 'INA219', 'BMP180', '토양수분 센서', 'Django', 'MariaDB', 'Python', 'Simple RNN', 'Wi-Fi']
  }
];

const architectureCards = [
  {
    title: 'AWS VDI · Web · AI · Logging 통합 구성도',
    label: '대표 프로젝트',
    desc: '고객 웹 서비스, VDI 서비스, 내부 3-Tier 웹, AI 문서 검색, 로그 분석 흐름을 한 장으로 정리한 통합 아키텍처입니다.',
    img: 'images/arch_01.png',
    tags: ['WorkSpaces', 'Kendra', 'Bedrock', '3-Tier', 'Logging']
  },
  {
    title: 'On-Premises 3-Tier Logging Platform',
    label: '온프레미스',
    desc: 'Nginx, PHP, MariaDB 기반 3-Tier 서비스와 ELK, Metricbeat, Rsyslog를 연결한 중앙 로그 구성도입니다.',
    img: 'images/arch_02.png',
    tags: ['Nginx', 'PHP', 'MariaDB', 'ELK', 'Metricbeat']
  },
  {
    title: 'IoT Smart Farm AI Prediction System',
    label: 'IoT / AI',
    desc: 'ESP8266 센서 데이터, Raspberry Pi Django 서버, MariaDB, 태양광 발전 예측 모델을 연결한 스마트팜 구조입니다.',
    img: 'images/arch_03.png',
    tags: ['ESP8266', 'Raspberry Pi', 'Django', 'MariaDB', 'Simple RNN']
  }
];

const architectureGrid = document.getElementById('architectureGrid');
if (architectureGrid) {
  architectureGrid.innerHTML = architectureCards.map(function(card) {
    return '<button class="arch-card" type="button" data-lightbox-src="' + card.img + '" data-lightbox-alt="' + card.title + '">' +
      '<span class="arch-card-thumb"><img src="' + card.img + '" alt="' + card.title + '"></span>' +
      '<span class="arch-card-body">' +
        '<span class="arch-card-kicker">' + card.label + '</span>' +
        '<span class="arch-card-title">' + card.title + '</span>' +
        '<span class="arch-card-desc">' + card.desc + '</span>' +
        '<span class="arch-card-tags">' + card.tags.map(function(tag) { return '<span>' + tag + '</span>'; }).join('') + '</span>' +
      '</span>' +
    '</button>';
  }).join('');
}

/* ── 모달 열기/닫기 ── */
const overlay = document.getElementById('modalOverlay');

function openModal(idx) {
  const p = projects[idx];
  document.getElementById('modalNum').textContent = 'Project ' + p.num;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalBadges').innerHTML = p.badge;
  document.getElementById('modalOverview').textContent = p.overview;
  const roleWrap = document.getElementById('modalRoleWrap');
  const roleEl = document.getElementById('modalRole');
  if (p.myRole && p.myRole.length) {
    roleEl.innerHTML = p.myRole.map(function(role) { return '<li>' + role + '</li>'; }).join('');
    roleWrap.style.display = 'block';
  } else {
    roleWrap.style.display = 'none';
  }
  const archEl = document.getElementById('modalArch');
  if (p.archImg) {
    archEl.innerHTML = '<img class="modal-arch-img" src="' + p.archImg + '" data-lightbox-src="' + p.archImg + '" data-lightbox-alt="' + p.title + ' 아키텍처 구성도" alt="' + p.title + ' 아키텍처 구성도">' +
      (p.archDesc ? '<p class="modal-arch-desc">' + p.archDesc.replace(/\n/g, '<br>') + '</p>' : '');
  } else {
    archEl.innerHTML = '<span class="modal-arch-placeholder">' + p.archIcon + '</span>' + p.archDesc;
  }
  const servicesWrap = document.getElementById('modalServicesWrap');
  const servicesEl = document.getElementById('modalServices');
  if (p.services && p.services.length) {
    servicesEl.innerHTML = p.services.map(function(service) {
      return '<div class="modal-service-card"><div class="modal-service-title">' + service.title + '</div><p>' + service.desc + '</p></div>';
    }).join('');
    servicesWrap.style.display = 'block';
  } else {
    servicesWrap.style.display = 'none';
  }
  const detailImagesWrap = document.getElementById('modalDetailImagesWrap');
  const detailImagesEl = document.getElementById('modalDetailImages');
  if (p.detailImages && p.detailImages.length) {
    detailImagesEl.innerHTML = p.detailImages.map(function(item) {
      return '<button class="modal-image-card" type="button" data-lightbox-src="' + item.src + '" data-lightbox-alt="' + item.title + '">' +
        '<img src="' + item.src + '" alt="' + item.title + '">' +
        '<span class="modal-image-caption"><span class="modal-image-title">' + item.title + '</span><span class="modal-image-desc">' + item.desc + '</span></span>' +
      '</button>';
    }).join('');
    detailImagesWrap.style.display = 'block';
  } else {
    detailImagesWrap.style.display = 'none';
  }
  document.getElementById('modalFeatures').innerHTML =
    p.features.map(f => '<li>' + f + '</li>').join('');
  const tsEl = document.getElementById('modalTroubleshooting');
  const tsWrap = document.getElementById('modalTsWrap');
  if (p.troubleshooting && p.troubleshooting.length) {
    tsEl.innerHTML = p.troubleshooting.map(t => '<li>' + t + '</li>').join('');
    tsWrap.style.display = 'block';
  } else {
    tsWrap.style.display = 'none';
  }
  const hlWrap = document.getElementById('modalHlWrap');
  const hlEl = document.getElementById('modalHighlights');
  if (p.highlights && p.highlights.length) {
    hlEl.innerHTML = p.highlights.map(h => '<li>' + h + '</li>').join('');
    hlWrap.style.display = 'block';
  } else {
    hlWrap.style.display = 'none';
  }
  const opWrap = document.getElementById('modalOpWrap');
  const opEl = document.getElementById('modalOperations');
  if (p.operations && p.operations.length) {
    opEl.innerHTML = p.operations.map(o => '<li>' + o + '</li>').join('');
    opWrap.style.display = 'block';
  } else {
    opWrap.style.display = 'none';
  }
  document.getElementById('modalStack').innerHTML =
    p.stack.map(s => '<span class="modal-tag">' + s + '</span>').join('');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-project-index]').forEach(function(card) {
  card.addEventListener('click', function() {
    openModal(Number(card.dataset.projectIndex));
  });
});

document.getElementById('modalClose').addEventListener('click', closeModal);

overlay.addEventListener('click', function(e) {
  if (e.target === overlay) closeModal();
});

/* ── 이메일 복사 ── */
var emailBtn = document.getElementById('emailBtn');
if (emailBtn) {
  emailBtn.addEventListener('click', function() {
    var emailAddress = ['mowja', 'naver.com'].join('@');
    navigator.clipboard.writeText(emailAddress).then(function() {
      emailBtn.innerHTML = '✓ <span>복사됐습니다!</span>';
      setTimeout(function() { emailBtn.textContent = '이메일 복사'; }, 2000);
    });
  });
}

/* ── 라이트박스 ── */
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');

document.addEventListener('click', function(e) {
  const lightboxTarget = e.target.closest('[data-lightbox-src]');
  if (lightboxTarget) {
    lightboxImg.src = lightboxTarget.getAttribute('data-lightbox-src');
    lightboxImg.alt = lightboxTarget.getAttribute('data-lightbox-alt') || '아키텍처 확대';
    lightboxOverlay.classList.add('open');
  }
});

lightboxOverlay.addEventListener('click', function() {
  lightboxOverlay.classList.remove('open');
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    lightboxOverlay.classList.remove('open');
    closeModal();
    return;
  }
  if (overlay.classList.contains('open') || lightboxOverlay.classList.contains('open')) {
    return;
  }
  if (e.key === 'ArrowLeft') {
    showSlide(currentSlide - 1);
  }
  if (e.key === 'ArrowRight') {
    showSlide(currentSlide + 1);
  }
});
