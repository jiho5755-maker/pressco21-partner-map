# 프레스코21 AI 전문가 조직 — 에이전트 카탈로그

> 25개 에이전트 + 1 coordinator = 총 26개

## 조직도

```
coordinator (총괄 코디네이터) — cyan
│
├── 기술본부 (Technology) ─── 9명 — blue
│   ├── fullstack-architect     아키텍처 설계 (Read-only, sonnet)
│   ├── frontend-engineer       페이지/컴포넌트 구현 (Read+Write, sonnet)
│   ├── backend-engineer        API/데이터 연동 (Read+Write, sonnet)
│   ├── ui-designer             UI/UX 디자인 시스템 (Read+Write, sonnet)
│   ├── db-architect            DB 설계 (Read+Write, sonnet)
│   ├── devops-engineer         빌드/배포/인프라 (Read+Write, sonnet)
│   ├── code-reviewer           코드 품질 리뷰 (Read+Write, sonnet)
│   ├── qa-engineer             QA/테스트 (Read+Write, sonnet)
│   └── security-auditor        보안 감사 (Read-only, sonnet)
│
├── 사업본부 (Business) ─── 4명 — green
│   ├── product-manager         기획/전략/로드맵 (Read-only, sonnet)
│   ├── marketing-strategist    SEO/SNS/프로모션 (Read-only, sonnet)
│   ├── sales-analyst           매출 분석/B2B 영업 (Read-only, sonnet)
│   └── crm-specialist          고객 관리/리텐션 (Read-only, sonnet)
│
├── 경영지원본부 (Corporate) ─── 7명 — yellow
│   ├── hr-labor-expert         인사/노무 (Read-only, opus)
│   ├── payroll-tax-expert      급여/세무 (Read-only, opus)
│   ├── accounting-expert       회계/재무 (Read+Write, sonnet)
│   ├── document-admin-expert   문서/행정 (Read+Write, sonnet)
│   ├── tax-incentive-expert    세제혜택 (Read-only, sonnet)
│   ├── employment-subsidy-expert 고용지원금 (Read-only, opus)
│   └── sme-policy-expert       중소기업 정책자금 (Read-only, sonnet)
│
├── 콘텐츠/교육본부 (Content & Education) ─── 3명 — magenta
│   ├── content-strategist      콘텐츠 기획/시즌 (Read-only, sonnet)
│   ├── curriculum-designer     교육 커리큘럼/강사 (Read-only, sonnet)
│   └── product-merchandiser    상품 MD/재료 조합 (Read-only, sonnet)
│
└── 데이터/지식 (Data & Knowledge) ─── 2명 — white
    ├── data-analyst            매출/웹 분석/대시보드 (Read-only, sonnet)
    └── technical-writer        문서화/MEMORY 관리 (Read+Write, haiku)
```

## 모델 배분 요약

| 모델 | 에이전트 수 | 에이전트 | 근거 |
|------|-----------|---------|------|
| opus (3) | 3 | hr-labor-expert, payroll-tax-expert, employment-subsidy-expert | 법적 정확성 필수 |
| haiku (1) | 1 | technical-writer | 경량 문서 정리 |
| sonnet (22) | 22 | 나머지 전부 + coordinator | 최적 균형 |

## 권한 분류

### Read-only (자문/분석) — 15개
`tools: Read, Grep, Glob`
- fullstack-architect, security-auditor
- product-manager, marketing-strategist, sales-analyst, crm-specialist
- hr-labor-expert, payroll-tax-expert, tax-incentive-expert, employment-subsidy-expert, sme-policy-expert
- content-strategist, curriculum-designer, product-merchandiser
- data-analyst

### Read+Write (구현) — 10개
`tools: Read, Write, Edit, Grep, Glob, Bash`
- frontend-engineer, backend-engineer, ui-designer, db-architect
- devops-engineer, code-reviewer, qa-engineer
- accounting-expert, document-admin-expert
- technical-writer (Bash 제외)

## 산출물 계약 (Artifact Contracts)

에이전트 간 전달되는 산출물 타입. I/O 계약으로 워크플로우 연결의 근거가 된다.

| 코드 | 산출물명 | 생산 에이전트 | 소비 에이전트 |
|------|---------|-------------|-------------|
| BRIEF | 기획 브리프 | product-manager, content-strategist | 설계/구현 에이전트 전체 |
| REQUIREMENTS | 요구사항 명세 | product-manager | fullstack-architect, ui-designer |
| CONTENT_PLAN | 콘텐츠 기획안 | content-strategist | product-merchandiser, frontend-engineer |
| PRODUCT_SPEC | 상품/조합 기획서 | product-merchandiser | frontend-engineer, sales-analyst |
| CURRICULUM | 교육 커리큘럼 | curriculum-designer | product-merchandiser, content-strategist |
| TECH_DESIGN | 기술 설계서 | fullstack-architect | frontend-engineer, backend-engineer |
| UI_SPEC | UI 설계서 | ui-designer | frontend-engineer |
| DB_SCHEMA | DB 스키마 설계 | db-architect | backend-engineer |
| CODE | 구현된 코드 | frontend-engineer, backend-engineer | code-reviewer, qa-engineer |
| REVIEW_REPORT | 코드 리뷰 리포트 | code-reviewer | frontend-engineer, backend-engineer |
| SECURITY_REPORT | 보안 감사 리포트 | security-auditor | devops-engineer |
| BUILD_RESULT | 빌드/테스트 결과 | qa-engineer, devops-engineer | coordinator |
| SEO_AUDIT | SEO 감사 리포트 | marketing-strategist | frontend-engineer |
| DOCUMENT | 법률/행정 문서 | hr-labor-expert, document-admin-expert | 사용자 |
| FINANCIAL | 급여/세무 산출물 | payroll-tax-expert, accounting-expert | 사용자 |
| SUBSIDY_REPORT | 지원금/세제혜택 리포트 | employment-subsidy-expert, tax-incentive-expert | 사용자 |
| ANALYSIS | 데이터 분석 리포트 | data-analyst, sales-analyst | product-manager |
| MARKETING_PLAN | 마케팅 전략서 | marketing-strategist | content-strategist |
| CRM_INSIGHT | 고객 인사이트 | crm-specialist | product-manager, marketing-strategist |

## 원자 워크플로우 (Atomic Workflows — AW)

재사용 가능한 2~3명 소단위. 복합 워크플로우의 빌딩 블록.

| 코드 | 이름 | 에이전트 | IN | OUT |
|------|------|---------|-----|-----|
| AW-01 | 콘텐츠 기획 | content-strategist → product-merchandiser | 사용자 요청 | CONTENT_PLAN + PRODUCT_SPEC |
| AW-02 | 기술 설계 | fullstack-architect + ui-designer + db-architect (병렬) | REQUIREMENTS 또는 CONTENT_PLAN | TECH_DESIGN + UI_SPEC + DB_SCHEMA |
| AW-03 | 프론트엔드 구현 | frontend-engineer | TECH_DESIGN + UI_SPEC + CONTENT_PLAN | CODE |
| AW-04 | 백엔드 구현 | backend-engineer | TECH_DESIGN + DB_SCHEMA | CODE |
| AW-05 | 품질 게이트 | code-reviewer → security-auditor (순차) | CODE | REVIEW_REPORT + SECURITY_REPORT |
| AW-06 | 빌드 검증 | qa-engineer + devops-engineer (병렬) | CODE | BUILD_RESULT |
| AW-07 | SEO 감사 | marketing-strategist | CODE (배포된 페이지) | SEO_AUDIT |
| AW-08 | 문서화 | technical-writer | 완료된 작업 결과 | MEMORY.md 갱신 |
| AW-09 | 인사/노무 자문 | hr-labor-expert → payroll-tax-expert (순차) | 사용자 질의 | DOCUMENT + FINANCIAL |
| AW-10 | 지원금 탐색 | employment-subsidy-expert + tax-incentive-expert + sme-policy-expert (병렬) | 사용자 상황 | SUBSIDY_REPORT |
| AW-11 | 고객/매출 분석 | data-analyst + crm-specialist (병렬) | 분석 요청 | ANALYSIS + CRM_INSIGHT |
| AW-12 | 마케팅 전략 | marketing-strategist + crm-specialist (병렬) | CONTENT_PLAN 또는 사용자 요청 | MARKETING_PLAN + CRM_INSIGHT |

## 복합 워크플로우 (Composite Workflows — CW)

원자 워크플로우를 조합한 엔드-투-엔드 비즈니스 프로세스. `[GATE]`는 사용자 확인 필요 지점.

| 코드 | 이름 | 흐름 | 시나리오 예시 |
|------|------|------|-------------|
| CW-01 | 시즌 캠페인 런칭 | AW-01 → [GATE] → AW-02 → [GATE] → AW-03+AW-04(병렬) → AW-05 → AW-06 → AW-07+AW-12(병렬) → AW-08 | "봄 시즌 캠페인을 전체 기획해줘" |
| CW-02 | 새 튜토리얼 발행 | AW-01 → [GATE] → AW-03 → AW-06 → AW-07 → AW-08 | "벚꽃 액자 만들기 튜토리얼을 추가해줘" |
| CW-03 | 신규 기능 개발 | PM→REQUIREMENTS → [GATE] → AW-02 → [GATE] → AW-03+AW-04(병렬) → AW-05 → AW-06 → AW-08 | "셀프 견적서 기능을 만들어줘" |
| CW-04 | B2B 기관 거래 | sales-analyst→ANALYSIS → product-merchandiser→PRODUCT_SPEC → document-admin-expert→DOCUMENT → [GATE] | "복지관에 보낼 교육 키트 견적서를 만들어줘" |
| CW-05 | 교육 프로그램 개설 | curriculum-designer→CURRICULUM → [GATE] → AW-01 → AW-03 → AW-06 → AW-12 | "초급 압화 정규반 8회 과정을 개설해줘" |
| CW-06 | 프로모션/이벤트 | AW-12 → [GATE] → product-merchandiser→PRODUCT_SPEC → AW-03 → AW-06 → AW-07 | "크리스마스 한정 세트 프로모션 페이지를 만들어줘" |
| CW-07 | 신규 채용 & 행정 | AW-09 + AW-10(병렬) → document-admin-expert→DOCUMENT → [GATE] | "새 직원 채용 시 서류와 지원금을 정리해줘" |
| CW-08 | 월간 비즈니스 리뷰 | AW-11 → product-manager→BRIEF | "이번 달 매출/고객 현황을 분석해줘" |

## 게이트 프로토콜 & 실패 복구

### 게이트 (사용자 확인 필요 지점)
- 기획/설계 결과물 생성 직후 (고비용 구현 전 확인)
- 최종 산출물 전달 전 (PDF, 리포트)
- 외부 발송 전 (이메일, 견적서)
- **승인** → 다음 단계 / **수정 요청** → 해당 AW 재실행 / **취소** → 종료

### 빌드 실패 루프
```
AW-06 FAIL → 에러 분석 → AW-03/AW-04 수정 → AW-06 재검증
└ 3회 실패 시 → 사용자 에스컬레이션
```

### 리뷰 불합격 루프
```
AW-05 CRITICAL → AW-03/AW-04 수정 → AW-05 재리뷰
AW-05 MINOR → 경고 기록 후 다음 단계 진행
```
