# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

partner-map 프로젝트 - [프로젝트 설명을 여기에 작성하세요]

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# Lint
npm run lint

# 프로덕션 서버
npm run start
```

## 기술 스택

- [사용할 기술 스택을 여기에 작성하세요]

## 아키텍처

[아키텍처 설명을 여기에 작성하세요]

## 핵심 규칙

### 코딩 컨벤션
- **한국어**: 커밋 메시지, 코드 주석, UI 텍스트
- **영어 식별자**: 변수명 camelCase, 타입명 PascalCase
- 경로 별칭: `@/*` → `./src/*`

## AI 전문가 조직 (25개 에이전트 + coordinator)

> 상세: `.claude/agents/REFERENCE.md` 참조

```
coordinator (총괄) — cyan
├── 기술본부 (9명) — blue
│   fullstack-architect, frontend-engineer, backend-engineer, ui-designer
│   db-architect, devops-engineer, code-reviewer, qa-engineer, security-auditor
├── 사업본부 (4명) — green
│   product-manager, marketing-strategist, sales-analyst, crm-specialist
├── 경영지원본부 (7명) — yellow
│   hr-labor-expert(opus), payroll-tax-expert(opus), accounting-expert
│   document-admin-expert, tax-incentive-expert, employment-subsidy-expert(opus)
│   sme-policy-expert
├── 콘텐츠/교육본부 (3명) — magenta
│   content-strategist, curriculum-designer, product-merchandiser
└── 데이터/지식 (2명) — white
    data-analyst, technical-writer(haiku)
```

### 워크플로우 체계 (2-Tier)
- **원자 워크플로우(AW)**: 2~3명 소단위 재사용 블록 (AW-01~AW-12)
- **복합 워크플로우(CW)**: AW를 조합한 엔드-투-엔드 프로세스 (CW-01~CW-08)
- **게이트**: 기획/설계 결과물 생성 직후 사용자 확인 필수
- **실패 복구**: 빌드 실패/리뷰 불합격 시 피드백 루프, 3회 실패 시 에스컬레이션
