# 오케스트레이션 시스템 사용 가이드

## 목차
1. [오케스트레이션이란?](#오케스트레이션이란)
2. [핵심 개념](#핵심-개념)
3. [사용 방법](#사용-방법)
4. [실전 예시](#실전-예시)
5. [에이전트 선택 기준](#에이전트-선택-기준)
6. [트러블슈팅](#트러블슈팅)

---

## 오케스트레이션이란?

**오케스트레이션(Orchestration)**은 여러 AI 에이전트를 자동으로 조합하여 복잡한 작업을 수행하는 시스템입니다.

### 핵심 가치
- **자동화**: 자연어 요청만으로 적합한 에이전트 조합을 자동 선택
- **효율성**: 병렬 실행으로 작업 시간 단축
- **전문성**: 각 에이전트의 전문 영역을 최대한 활용
- **일관성**: 정의된 워크플로우로 품질 보장

### 작동 원리
```
사용자 요청 (자연어)
    ↓
키워드 분석 (패턴 매칭)
    ↓
에이전트 선택 (단일/병렬/순차)
    ↓
작업 실행
    ↓
결과 통합 및 반환
```

---

## 핵심 개념

### 1. 단일 에이전트 호출
- **언제 사용**: 명확한 단일 전문 영역 작업
- **예시**: "지도 마커 클릭 이벤트 추가해줘" → map-engineer

### 2. 병렬 오케스트레이션
- **언제 사용**: 독립적인 작업을 동시 수행하여 시간 단축
- **예시**: "배포 전 최종 점검" → makeshop-specialist + code-reviewer + security-auditor (동시 실행)

### 3. 순차 체이닝
- **언제 사용**: 이전 단계의 출력이 다음 단계의 입력이 되는 경우
- **예시**: "새 기능 추가" → PM → 설계 → 구현 → 테스트 → 문서화 (순차 실행)

### 4. 복합 오케스트레이션
- **언제 사용**: 병렬과 순차를 조합한 복잡한 작업
- **예시**: "지도 클러스터링 추가 및 배포" → 설계(병렬) → 구현(순차) → 검증(병렬) → 배포

---

## 사용 방법

### 기본 문법
```
자연어로 요청하면 시스템이 자동으로 적합한 에이전트를 선택합니다.
특별한 명령어나 문법이 필요 없습니다.
```

### 키워드 활용 팁
1. **명확한 도메인 키워드 사용**
   - 좋은 예: "지도 마커 클러스터링"
   - 나쁜 예: "그거 그렇게 해줘"

2. **복합 작업은 구체적으로 설명**
   - 좋은 예: "파트너 검색 필터를 추가하고 메이크샵에 배포해줘"
   - 나쁜 예: "검색 기능"

3. **검증/점검 요청은 범위 명시**
   - 좋은 예: "메이크샵 제약사항 기준으로 코드 검증해줘"
   - 나쁜 예: "점검해줘"

---

## 실전 예시

### 예시 1: 단일 에이전트 (디자인)
```
📝 요청: "파트너맵 로고를 SVG로 디자인해줘"

🤖 자동 라우팅:
- 키워드 매칭: "로고", "SVG", "디자인"
- 선택된 에이전트: graphic-designer
- 실행 모드: 단일

📦 출력물:
- SVG 로고 파일
- 브랜드 컬러 가이드
- 로고 사용 규칙
```

### 예시 2: 단일 에이전트 (기술)
```
📝 요청: "지도 마커 클릭 시 파트너 정보 모달 표시해줘"

🤖 자동 라우팅:
- 키워드 매칭: "지도", "마커", "클릭", "모달"
- 선택된 에이전트: map-engineer + frontend-engineer
- 실행 모드: 협업 (2명)

📦 출력물:
- 마커 클릭 이벤트 핸들러 (map-engineer)
- 모달 UI 컴포넌트 (frontend-engineer)
- 통합 코드
```

### 예시 3: 병렬 오케스트레이션 (배포 전 검증)
```
📝 요청: "배포 전 최종 점검해줘"

🤖 자동 라우팅:
- 키워드 매칭: "배포", "최종 점검"
- 오케스트레이션 트리거: "배포 준비"
- 선택된 에이전트: makeshop-specialist + code-reviewer + security-auditor
- 실행 모드: 병렬 (3명 동시)

⚙️ 실행 과정:
[makeshop-specialist]
- ✅ 템플릿 리터럴 이스케이프 확인
- ✅ 이모지 제거 확인
- ✅ 파일 크기 30KB 이하 확인
- ✅ HTML 문자열 연결 10줄 이하 확인
- ❌ async/await 발견 → Promise 체이닝 제안

[code-reviewer]
- ✅ IIFE 패턴 적용 확인
- ✅ 이벤트 위임 사용 확인
- ⚠️ 변수명 일관성 개선 제안
- ✅ 코드 가독성 양호

[security-auditor]
- ✅ XSS 방어 (textContent 사용)
- ✅ API 키 환경 변수 처리
- ✅ CORS 정책 준수
- ⚠️ localStorage 암호화 권장

📦 통합 출력:
- 배포 가능 여부: ⚠️ 수정 필요 (async/await 1건)
- 수정 사항 목록
- 개선 제안 (선택 사항)
```

### 예시 4: 순차 체이닝 (새 기능 추가)
```
📝 요청: "현재 위치 기반으로 가까운 파트너 3곳을 표시해줘"

🤖 자동 라우팅:
- 키워드 매칭: "위치", "가까운", "파트너", "표시"
- 체이닝 트리거: "새 기능 추가"
- 실행 모드: 순차 (7단계)

⚙️ 실행 체인:

[1단계] product-manager
→ 요구사항 정의
- 사용자 스토리: "사용자가 '내 주변 파트너' 버튼을 클릭하면..."
- 수용 기준: 현재 위치 3km 이내, 거리순 정렬, 최대 3곳

[2단계] map-engineer
→ 지도 API 통합 설계
- Geolocation API로 현재 위치 감지
- 마커 필터링 로직
- 지도 bounds 자동 조정

[3단계] geo-expert
→ 거리 계산 자문
- Haversine 공식 적용
- 거리 계산 함수 제공
- 성능 최적화 (캐싱)

[4단계] graphic-designer
→ 마커 디자인
- 현재 위치 마커 SVG (Phosphor Icons: ph-crosshair)
- 가까운 파트너 하이라이트 색상
- 거리 표시 스타일

[5단계] frontend-engineer
→ UI 통합 구현
- "내 주변 파트너" 버튼
- 거리 표시 UI
- 로딩 상태 표시

[6단계] qa-engineer
→ 기능 테스트
- 브라우저 위치 권한 시나리오
- 거리 계산 정확도 검증
- 모바일 반응형 테스트

[7단계] technical-writer
→ 문서화
- MEMORY.md 업데이트
- 사용자 가이드 작성

📦 최종 출력:
- 완전히 구현된 기능 코드
- 테스트 결과 보고서
- 사용자 가이드 문서
```

### 예시 5: 복합 오케스트레이션 (디자인 + 배포)
```
📝 요청: "이모지를 Phosphor Icons로 바꾸고 메이크샵에 배포해줘"

🤖 자동 라우팅:
- 키워드 매칭: "이모지", "Phosphor", "메이크샵", "배포"
- 실행 모드: 복합 (병렬 + 순차)

⚙️ 실행 단계:

[1단계] 병렬 분석
graphic-designer + makeshop-specialist 동시 실행
- graphic-designer: 현재 사용 중인 이모지 분석 (📍, 📞, ❤️ 등)
- makeshop-specialist: 코드에서 이모지 사용 위치 파악

[2단계] 순차 설계
graphic-designer → frontend-engineer
- graphic-designer: 이모지 매핑표 생성
  - 📍 → <i class="ph ph-map-pin"></i>
  - 📞 → <i class="ph ph-phone"></i>
  - ❤️ → <i class="ph ph-heart"></i>
- frontend-engineer: Phosphor CDN 추가 전략

[3단계] 순차 구현
makeshop-specialist → frontend-engineer
- makeshop-specialist: 이모지 제거 + Phosphor 클래스 적용
- frontend-engineer: 아이콘 스타일 통합 (크기, 색상)

[4단계] 병렬 검증
code-reviewer + qa-engineer + security-auditor
- code-reviewer: 코드 품질 검증
- qa-engineer: 메이크샵 에디터 저장 테스트
- security-auditor: CDN SRI 해시 확인

[5단계] 배포
technical-writer
- 변경 사항 문서화
- MEMORY.md 업데이트 (이모지 대체 가이드)

📦 최종 출력:
- 메이크샵 호환 코드 (이모지 제거 완료)
- Phosphor Icons 통합 완료
- 배포 가능 상태
- 이모지 매핑 문서
```

### 예시 6: 디자인 시스템 구축
```
📝 요청: "파트너맵 디자인 시스템을 구축해줘 (색상, 타이포, 아이콘)"

🤖 자동 라우팅:
- 키워드 매칭: "디자인 시스템", "색상", "타이포", "아이콘"
- 오케스트레이션 트리거: "디자인 시스템 구축"
- 실행 모드: 복합

⚙️ 실행 단계:

[1단계] 병렬 디자인
ui-designer + graphic-designer
- ui-designer:
  - CSS 변수 시스템 설계
  - 타이포그래피 스케일 (12px ~ 24px)
  - 레이아웃 그리드 시스템
  - 브레이크포인트 정의
- graphic-designer:
  - 브랜드 색상 팔레트 (Primary, Secondary, Neutral)
  - 아이콘 세트 선정 (Phosphor Icons)
  - 아이콘 매핑표 (22개 아이콘)
  - SVG 커스텀 아이콘 제작

[2단계] 순차 통합
frontend-engineer → makeshop-specialist
- frontend-engineer:
  - CSS 변수를 코드에 통합
  - 아이콘 클래스 적용
  - 타이포그래피 적용
- makeshop-specialist:
  - CSS 스코핑 확인
  - 파일 크기 최적화
  - 메이크샵 호환성 검증

[3단계] 문서화
technical-writer
- 디자인 시스템 문서 작성
- 컴포넌트 사용 가이드
- 예제 코드 제공

📦 최종 출력:
- 완성된 디자인 시스템
  - colors.css (색상 팔레트)
  - typography.css (타이포그래피)
  - icons.css (아이콘 스타일)
- 디자인 시스템 문서
- 컴포넌트 라이브러리
```

### 예시 7: 긴급 디버깅
```
📝 요청: "배포 후 지도가 안 뜨는데 원인 찾아서 수정해줘"

🤖 자동 라우팅:
- 키워드 매칭: "배포", "지도", "안 뜨는", "수정"
- 실행 모드: 순차 (진단 → 수정 → 검증)

⚙️ 실행 체인:

[1단계] 진단
map-engineer
- 브라우저 콘솔 에러 확인
- 카카오맵 API 로드 상태 확인
- 초기화 코드 검토
- 발견: 카카오맵 API 키가 누락됨

[2단계] 제약사항 확인
makeshop-specialist
- 메이크샵 에디터에서 API 키 입력 가능 여부 확인
- 스크립트 로드 순서 검증
- 발견: 스크립트 순서 문제 (API 로드 전 초기화 실행)

[3단계] 수정
map-engineer + makeshop-specialist
- API 키 환경 변수로 분리
- 스크립트 로드 순서 조정 (async/defer 활용)
- 초기화 코드를 onload 이벤트로 래핑

[4단계] 검증
code-reviewer + qa-engineer
- 코드 변경 사항 리뷰
- 실제 메이크샵 환경에서 테스트
- 결과: ✅ 지도 정상 표시 확인

📦 최종 출력:
- 수정된 코드 (스크립트 로드 순서 개선)
- 배포 가이드 업데이트
- 트러블슈팅 문서 추가
```

### 예시 8: 성능 최적화
```
📝 요청: "파트너맵 로딩 속도를 개선해줘"

🤖 자동 라우팅:
- 키워드 매칭: "성능", "로딩 속도", "개선"
- 실행 모드: 병렬 분석 → 순차 개선

⚙️ 실행 단계:

[1단계] 병렬 분석
frontend-engineer + map-engineer + ui-designer
- frontend-engineer:
  - JavaScript 번들 크기 분석
  - 이벤트 리스너 최적화
  - debounce/throttle 적용 가능 구간
- map-engineer:
  - 마커 클러스터링 성능
  - 지도 타일 로딩 최적화
- ui-designer:
  - CSS 파일 크기
  - 폰트 로딩 전략

[2단계] 순차 개선
frontend-engineer → makeshop-specialist
- frontend-engineer:
  - Intersection Observer로 지연 로딩
  - 이벤트 위임으로 리스너 수 감소
  - debounce로 검색 최적화
- makeshop-specialist:
  - 파일 분할 최적화 (Critical Path 우선)
  - 불필요한 코드 제거

[3단계] 검증
qa-engineer
- Lighthouse 성능 측정
- 로딩 시간 비교 (Before/After)

📦 최종 출력:
- 최적화된 코드
- 성능 개선 보고서
  - 로딩 시간: 3.2s → 1.1s (65% 개선)
  - Lighthouse 점수: 72 → 94
```

### 예시 9: 접근성 개선
```
📝 요청: "파트너맵을 스크린 리더 사용자도 쓸 수 있게 개선해줘"

🤖 자동 라우팅:
- 키워드 매칭: "접근성", "스크린 리더"
- 실행 모드: 순차

⚙️ 실행 체인:

[1단계] 접근성 감사
ui-designer
- ARIA 레이블 누락 확인
- 키보드 내비게이션 테스트
- 색상 대비 비율 확인
- 발견: 버튼에 aria-label 누락, 지도는 키보드로 접근 불가

[2단계] 디자인 개선
ui-designer + graphic-designer
- ui-designer:
  - ARIA 레이블 추가
  - 키보드 포커스 스타일 설계
  - Skip to content 링크 추가
- graphic-designer:
  - 아이콘에 시각적 텍스트 추가 옵션
  - 색상 대비 개선 (WCAG AAA)

[3단계] 구현
frontend-engineer
- aria-label, role 속성 추가
- 키보드 이벤트 핸들러 (Tab, Enter, Escape)
- 포커스 트랩 (모달)

[4단계] 검증
qa-engineer
- 스크린 리더 테스트 (VoiceOver, NVDA)
- 키보드 전용 네비게이션 테스트
- axe DevTools 자동 검사

📦 최종 출력:
- 접근성 개선 코드
- WCAG 2.1 AA 준수 확인
- 접근성 가이드 문서
```

### 예시 10: 다국어 지원 추가
```
📝 요청: "파트너맵에 영어 언어 옵션을 추가해줘"

🤖 자동 라우팅:
- 키워드 매칭: "다국어", "영어"
- 실행 모드: 순차

⚙️ 실행 체인:

[1단계] 요구사항 분석
product-manager
- 다국어 범위 정의 (UI 텍스트만 vs 파트너 정보까지)
- 언어 전환 UI 위치 결정
- 기본 언어 설정 전략

[2단계] 기술 설계
frontend-engineer + makeshop-specialist
- frontend-engineer:
  - i18n 구조 설계 (객체 기반)
  - localStorage 언어 설정 저장
- makeshop-specialist:
  - 메이크샵 제약사항 확인 (특수 문자 처리)

[3단계] 번역 작업
technical-writer + ui-designer
- technical-writer:
  - 한국어 텍스트 추출 (UI 레이블, 버튼, 에러 메시지)
  - 영어 번역
- ui-designer:
  - 영어 텍스트 길이 고려한 UI 조정

[4단계] 구현
frontend-engineer
- i18n 객체 생성
- 언어 전환 버튼 추가
- 텍스트 동적 변경 로직

[5단계] 테스트
qa-engineer
- 언어 전환 시나리오
- localStorage 저장 확인
- 브라우저 언어 자동 감지

📦 최종 출력:
- 다국어 지원 코드
- 언어 리소스 파일 (ko.json, en.json)
- 번역 가이드 문서
```

### 예시 11: 모바일 앱 대응
```
📝 요청: "파트너맵을 PWA(Progressive Web App)로 만들어줘"

🤖 자동 라우팅:
- 키워드 매칭: "PWA", "모바일 앱"
- 실행 모드: 순차 + 병렬

⚙️ 실행 단계:

[1단계] PWA 요구사항 정의
product-manager + frontend-engineer
- 오프라인 지원 범위
- 설치 가능 여부
- 푸시 알림 필요 여부

[2단계] 병렬 구현
frontend-engineer + graphic-designer + makeshop-specialist
- frontend-engineer:
  - Service Worker 작성
  - manifest.json 생성
  - 캐싱 전략 (Cache First vs Network First)
- graphic-designer:
  - 앱 아이콘 제작 (512x512, 192x192)
  - 스플래시 스크린 디자인
- makeshop-specialist:
  - 메이크샵에 Service Worker 등록 가능 여부 확인

[3단계] 테스트
qa-engineer
- Lighthouse PWA 점검
- 오프라인 시나리오 테스트
- 설치 프롬프트 확인

📦 최종 출력:
- PWA 구성 파일 (manifest.json, service-worker.js)
- 앱 아이콘 세트
- PWA 설치 가이드
```

### 예시 12: 데이터 분석 추가
```
📝 요청: "파트너맵 사용 데이터를 수집하고 분석 대시보드를 만들어줘"

🤖 자동 라우팅:
- 키워드 매칭: "데이터 수집", "분석", "대시보드"
- 실행 모드: 순차 (기획 → 구현 → 시각화)

⚙️ 실행 체인:

[1단계] 데이터 전략 수립
product-manager
- 수집할 이벤트 정의
  - 지도 클릭
  - 파트너 상세 조회
  - 검색 키워드
  - 즐겨찾기 추가
- 개인정보 보호 정책 확인

[2단계] 분석 도구 선정
frontend-engineer + security-auditor
- frontend-engineer:
  - Google Analytics 4 vs Mixpanel 비교
  - 이벤트 트래킹 코드 설계
- security-auditor:
  - 쿠키 동의 배너 필요 여부
  - GDPR 준수 확인

[3단계] 구현
frontend-engineer
- 이벤트 트래킹 코드 삽입
- 사용자 동의 관리
- 데이터 전송 로직

[4단계] 대시보드 구현
ui-designer + frontend-engineer
- ui-designer:
  - 대시보드 레이아웃 설계
  - 차트 타입 선정 (파이, 막대, 선)
- frontend-engineer:
  - Chart.js 통합
  - 실시간 데이터 갱신

[5단계] 배포 및 문서화
makeshop-specialist + technical-writer
- 메이크샵 호환성 확인
- 대시보드 사용 가이드 작성

📦 최종 출력:
- 이벤트 트래킹 코드
- 분석 대시보드
- 데이터 정책 문서
```

---

## 에이전트 선택 기준

### 키워드 매칭 테이블

| 도메인 | 핵심 키워드 | 선택 에이전트 | 우선순위 |
|--------|-----------|-------------|---------|
| **기획** | 요구사항, 기획, 스토리, 유스케이스, 로드맵 | product-manager | 중간 |
| **메이크샵** | 메이크샵, 배포, 저장 실패, 에디터 오류, 템플릿 리터럴, 가상 태그 | makeshop-specialist | 높음 |
| **지도** | 지도, 카카오맵, 마커, 클러스터, 좌표, bounds, 줌 | map-engineer | 높음 |
| **프론트엔드** | JavaScript, 이벤트, 성능, 최적화, debounce, localStorage | frontend-engineer | 중간 |
| **UI 디자인** | CSS, 스타일, 레이아웃, 반응형, 접근성, ARIA, 애니메이션 | ui-designer | 중간 |
| **그래픽 디자인** | 아이콘, SVG, 색상, 컬러, 팔레트, 브랜드, 이모지 대체, Phosphor | graphic-designer | 중간 |
| **지리 정보** | 좌표, 거리, 지오코딩, 주소, 행정구역, 경계 | geo-expert | 중간 |
| **도메인** | 업종, 분류, 카테고리, 필터, 파트너, 도소매, 유통 | retail-expert | 낮음 |
| **코드 리뷰** | 코드 리뷰, 검토, 품질, 리팩토링, Best Practice | code-reviewer | 중간 |
| **보안** | 보안, XSS, CORS, API 키, 인증, 취약점 | security-auditor | 높음 |
| **QA** | 테스트, 검증, QA, 브라우저, 반응형, 모바일, 시나리오 | qa-engineer | 중간 |
| **문서화** | 문서화, MEMORY 업데이트, 가이드, README, 매뉴얼 | technical-writer | 낮음 |

### 우선순위 규칙

#### 높음 (즉시 호출)
- **makeshop-specialist**: 배포 관련, 에디터 오류
- **security-auditor**: 보안 취약점
- **map-engineer**: 지도 기능 오류

#### 중간 (일반 작업)
- 대부분의 개발/디자인 작업
- 기능 추가/개선

#### 낮음 (후순위)
- 문서화 (작업 완료 후)
- 도메인 자문 (필요시)

### 복합 작업 우선순위

1. **보안 > 기능**: 보안 이슈가 있으면 기능 개발보다 우선
2. **배포 > 최적화**: 배포 가능 상태를 먼저 만들고 최적화는 나중에
3. **핵심 > 부가**: 핵심 기능을 먼저 구현하고 부가 기능은 나중에

---

## 트러블슈팅

### 문제 1: 잘못된 에이전트가 호출되는 경우

#### 증상
```
요청: "지도 마커 색상 변경"
실제 호출: ui-designer
기대 호출: graphic-designer + map-engineer
```

#### 원인
- 키워드 매칭 우선순위 오판
- 모호한 요청 문구

#### 해결책
```
더 구체적으로 요청:
"지도 마커를 SVG 아이콘으로 디자인하고 색상을 브랜드 컬러로 변경해줘"

또는 에이전트 명시:
"@graphic-designer, @map-engineer: 지도 마커 색상 변경"
```

### 문제 2: 에이전트 간 협업 실패

#### 증상
```
map-engineer가 만든 마커를 graphic-designer가 알지 못함
→ 디자인이 코드에 반영되지 않음
```

#### 원인
- 순차 체이닝이 필요한데 병렬로 실행됨
- 에이전트 간 출력물 전달 누락

#### 해결책
```
명확한 단계 지정:
"1단계: graphic-designer가 마커 디자인을 SVG로 만들어줘
 2단계: map-engineer가 그 SVG를 지도에 적용해줘"
```

### 문제 3: 과도한 에이전트 호출

#### 증상
```
요청: "버튼 색상 변경"
실제 호출: ui-designer + graphic-designer + frontend-engineer + makeshop-specialist + code-reviewer
기대 호출: ui-designer (또는 graphic-designer)
```

#### 원인
- 시스템이 과도하게 보수적으로 판단
- "변경" 키워드가 전체 검증 프로세스를 트리거

#### 해결책
```
범위를 명확히:
"UI 버튼의 배경색만 #2196F3으로 변경해줘 (검증 불필요)"

또는:
"간단한 스타일 수정: 버튼 색상 변경"
```

### 문제 4: 메모리 관리 문제

#### 증상
```
에이전트가 이전 작업 내용을 기억하지 못함
→ 같은 질문을 반복하거나 중복 작업 수행
```

#### 원인
- 에이전트별 메모리 파일이 업데이트되지 않음
- technical-writer가 문서화 단계를 건너뜀

#### 해결책
```
작업 완료 후 명시적으로 문서화 요청:
"이 작업 내용을 MEMORY.md에 추가해줘"

또는 자동 문서화 포함:
"파트너 검색 기능 추가하고 MEMORY 업데이트까지 해줘"
```

### 문제 5: 무한 루프

#### 증상
```
code-reviewer → 수정 제안 → frontend-engineer → 코드 수정 → code-reviewer → 수정 제안 → ...
(계속 반복)
```

#### 원인
- 명확한 수용 기준 없음
- "완벽한 코드"를 목표로 설정

#### 해결책
```
수용 기준 명시:
"메이크샵 제약사항만 준수하면 배포 가능. 최적화 제안은 나중에"

또는 반복 제한:
"최대 2회 리뷰 사이클만 진행"
```

### 문제 6: 배포 실패 (메이크샵 에디터)

#### 증상
```
코드는 완벽한데 메이크샵 에디터에서 "데이터 수정 실패"
```

#### 원인
- makeshop-specialist가 체크리스트를 누락
- 템플릿 리터럴 이스케이프 (`\${variable}`) 누락
- 이모지가 여전히 남아 있음
- 파일 크기 30KB 초과

#### 해결책
```
배포 전 필수 점검:
"@makeshop-specialist: 메이크샵 제약사항 전체 체크리스트로 검증해줘"

또는 자동 배포 워크플로우:
"배포 준비 (최종 점검 포함)"
```

### 문제 7: 디자인 일관성 문제

#### 증상
```
ui-designer와 graphic-designer가 각각 다른 색상 팔레트 사용
→ 브랜드 일관성 깨짐
```

#### 원인
- 디자인 시스템이 정의되지 않음
- 두 에이전트가 독립적으로 작업

#### 해결책
```
디자인 시스템 먼저 구축:
"디자인 시스템 (색상, 타이포, 아이콘) 구축 후 적용해줘"

또는 명시적 협업:
"@ui-designer와 @graphic-designer가 협업해서 일관된 색상 팔레트 만들어줘"
```

### 문제 8: 성능 저하

#### 증상
```
모든 작업마다 전체 에이전트 조합을 호출하여 응답 시간이 너무 김
```

#### 원인
- 오케스트레이션이 과도하게 작동
- 단순 작업도 복합 워크플로우로 처리

#### 해결책
```
단순 작업은 명시적으로:
"간단한 작업: 버튼 텍스트만 변경해줘 (다른 검증 불필요)"

또는 에이전트 직접 지정:
"@ui-designer: 버튼 텍스트 '확인' → '저장' 변경"
```

---

## 고급 팁

### 팁 1: 에이전트 체이닝 커스터마이징
```
기본 체이닝을 건너뛰고 필요한 단계만:
"PM 단계 건너뛰고 map-engineer가 바로 구현해줘 (요구사항은 내가 이미 정의함)"
```

### 팁 2: 병렬 실행 강제
```
"다음 3개 작업을 동시에 진행해줘:
1. graphic-designer: 로고 디자인
2. map-engineer: 클러스터링 구현
3. frontend-engineer: 검색 UI 개발"
```

### 팁 3: 점진적 개선
```
"1단계: 최소 기능만 구현해서 배포 가능하게
 2단계: 사용자 피드백 받은 후 개선
 3단계: 최적화 및 고급 기능 추가"
```

### 팁 4: 컨텍스트 재사용
```
"이전에 graphic-designer가 만든 아이콘 세트를 재사용해서 새 기능에 적용해줘"
```

### 팁 5: 조건부 실행
```
"코드 리뷰해서 문제가 있으면 수정, 없으면 바로 배포"
```

---

## 참고 자료

- [Partner Map 조직도](./PARTNER_MAP_ORGANIZATION.md)
- [빠른 시작 가이드](./QUICKSTART.md)
- [메이크샵 개발 가이드](../../MAKESHOP-DEVELOPMENT-GUIDE.md)
- [프로젝트 메모리](../../.claude/memory/MEMORY.md)

---

## 버전 이력

- **v2.0** (2026-01-XX): 디자인팀 추가, 복합 오케스트레이션 예시 추가
- **v1.0** (2026-01-XX): 초기 버전
