# Partner Map AI 조직도 v2.0

## 🏢 조직 구조 (12명의 전문가)

```
                          ┌─────────────────────────┐
                          │   CEO (당신)            │
                          │   자연어로 지시         │
                          └───────────┬─────────────┘
                                      │
                    ┌─────────────────┼─────────────────┬─────────────────┐
                    │                 │                 │                 │
            ┌───────▼────────┐  ┌─────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
            │  기획실         │  │ 기술본부    │  │ 디자인팀     │  │  품질본부    │
            │  PM (1명)       │  │ 3명         │  │ 2명          │  │  4명         │
            └─────────────────┘  └─────┬──────┘  └──────────────┘  └──────────────┘
                                       │
                              ┌────────┼────────┐
                              │                 │
                       ┌──────▼──────┐   ┌──────▼──────┐
                       │ 메이크샵팀   │   │ 지도/도메인팀│
                       │ 1명          │   │ 2명          │
                       └──────────────┘   └──────────────┘
```

---

## 📋 부서별 에이전트 상세

### 1️⃣ 기획실 (Planning Division)

#### product-manager
- **역할**: 요구사항 분석, 사용자 스토리 작성, Phase 계획 수립
- **모델**: sonnet
- **색상**: green
- **호출 트리거 키워드**:
  - "요구사항", "기획", "스토리", "기능 정의"
  - "Phase X 계획", "로드맵", "우선순위"
  - "사용자 시나리오", "유스케이스"
- **출력물**: 요구사항 명세서, 사용자 스토리, 수용 기준, Phase 계획
- **협업**:
  - → makeshop-specialist (플랫폼 제약사항 확인)
  - → map-engineer (기술 설계 위임)
  - → retail-expert (도메인 자문)
  - → ui-designer (UI 요구사항 전달)
  - → graphic-designer (비주얼 디자인 요청)

---

### 2️⃣ 기술본부 (Technical Division)

#### makeshop-specialist (메이크샵 통합 전문가)
- **역할**: 메이크샵 D4 플랫폼 제약사항 준수, 배포 최적화
- **모델**: sonnet
- **색상**: blue
- **전문 영역**:
  - 템플릿 리터럴 이스케이프 (`\${variable}`)
  - 이모지 제거 및 HTML 엔티티 변환
  - 파일 크기 제한 (30-40KB)
  - HTML 문자열 연결 길이 제한 (10줄 이하)
  - 가상 태그 보존 (`<!-- -->`, `{$치환코드}`)
  - async/await → Promise 체이닝 변환
  - 인라인 이벤트 핸들러 → 이벤트 위임
- **호출 트리거 키워드**:
  - "메이크샵", "배포", "저장 실패", "에디터 오류"
  - "템플릿 리터럴", "이모지", "파일 크기"
  - "가상 태그", "치환코드"
- **출력물**: 메이크샵 호환 코드, 분할 전략, 배포 가이드
- **협업**:
  - ← product-manager (제약사항 전달)
  - ↔ frontend-engineer (코드 검증)
  - ↔ graphic-designer (이모지 대체 아이콘 협의)
  - → code-reviewer (배포 전 검증)

#### map-engineer (지도 엔지니어)
- **역할**: 카카오맵 API 통합, 마커 클러스터링, 지오코딩
- **모델**: sonnet
- **색상**: blue
- **전문 영역**:
  - 카카오맵 JavaScript API v3
  - 마커 생성/관리 (CustomOverlay 포함)
  - 지도 이벤트 (클릭, 줌, 드래그)
  - 마커 클러스터링 최적화
  - 경계 영역(bounds) 계산
- **호출 트리거 키워드**:
  - "지도", "카카오맵", "마커", "클러스터"
  - "좌표", "위치", "bounds", "줌 레벨"
  - "CustomOverlay", "InfoWindow"
- **출력물**: 지도 통합 코드, 마커 관리 로직, 이벤트 핸들러
- **협업**:
  - ← product-manager (지도 요구사항 수신)
  - ↔ geo-expert (좌표 변환 자문)
  - ↔ graphic-designer (마커 디자인 협의)
  - → frontend-engineer (UI 통합)

#### frontend-engineer (프론트엔드 엔지니어)
- **역할**: Vanilla JS 구현, 성능 최적화, 반응형 인터랙션
- **모델**: sonnet
- **색상**: blue
- **전문 영역**:
  - Vanilla JavaScript (ES6+)
  - 이벤트 위임 패턴
  - Intersection Observer
  - debounce/throttle
  - localStorage 관리
  - DOM 최적화
- **호출 트리거 키워드**:
  - "JavaScript", "이벤트", "성능", "최적화"
  - "debounce", "throttle", "Intersection Observer"
  - "localStorage", "상태 관리"
- **출력물**: JS 모듈, 이벤트 핸들러, 상태 관리 로직
- **협업**:
  - ← map-engineer (지도 모듈 수신)
  - ↔ ui-designer (UI 인터랙션 협의)
  - ↔ graphic-designer (아이콘 통합)
  - → qa-engineer (테스트 케이스 전달)

---

### 3️⃣ 디자인팀 (Design Division) ⭐ 신규 부서

#### ui-designer (UI/UX 디자이너)
- **역할**: 반응형 레이아웃, CSS 스코핑, 접근성, 인터랙션 디자인
- **모델**: sonnet
- **색상**: magenta
- **전문 영역**:
  - 반응형 디자인 (768px/992px/1200px)
  - CSS 스코핑 (컨테이너 ID 기반)
  - Flexbox/Grid 레이아웃
  - CSS 변수 (커스텀 프로퍼티)
  - 접근성 (ARIA, 키보드 내비게이션)
  - 애니메이션 (transition/transform)
  - 인터랙션 디자인 (호버, 포커스, 액티브 상태)
- **호출 트리거 키워드**:
  - "CSS", "스타일", "레이아웃", "반응형"
  - "디자인", "접근성", "ARIA"
  - "애니메이션", "transition", "인터랙션"
- **출력물**: CSS 파일, 스타일 가이드, 반응형 브레이크포인트, 인터랙션 명세
- **협업**:
  - ← product-manager (UI 요구사항 수신)
  - ↔ graphic-designer (비주얼 일관성 협의)
  - ↔ frontend-engineer (UI 구현 협의)
  - → qa-engineer (접근성 테스트 요청)

#### graphic-designer (그래픽 디자이너) ⭐ 신규
- **역할**: 아이콘 디자인, 브랜딩, 비주얼 에셋, 이모지 대체 솔루션
- **모델**: sonnet
- **색상**: magenta
- **전문 영역**:
  - SVG 아이콘 제작 및 최적화
  - 색상 팔레트 설계 (브랜드 컬러)
  - 타이포그래피 시스템
  - 지도 마커 디자인 (CustomOverlay)
  - 이모지 대체 아이콘 (메이크샵 제약사항 대응)
  - 아이콘 라이브러리 추천 (Phosphor Icons, Heroicons, Lucide)
  - 로고/브랜딩 디자인
  - 비주얼 계층 구조 (Visual Hierarchy)
- **호출 트리거 키워드**:
  - "아이콘", "SVG", "그래픽", "비주얼"
  - "색상", "컬러", "팔레트", "브랜드"
  - "이모지 대체", "마커 디자인", "로고"
  - "Phosphor", "Heroicons", "Lucide"
- **출력물**:
  - SVG 아이콘 세트
  - 색상 팔레트 (CSS 변수 형태)
  - 마커 디자인 (카카오맵 CustomOverlay)
  - 이모지 대체 매핑표
  - 브랜딩 가이드
- **협업**:
  - ← product-manager (비주얼 요구사항 수신)
  - ↔ ui-designer (디자인 시스템 일관성)
  - ↔ makeshop-specialist (이모지 제약사항 협의)
  - ↔ map-engineer (마커 디자인 협의)
  - → frontend-engineer (아이콘 통합 가이드)

---

### 4️⃣ 도메인 자문단 (Domain Experts)

#### geo-expert (지리 정보 전문가)
- **역할**: 좌표 변환, 주소 검색, 거리 계산, 지오코딩
- **모델**: sonnet
- **색상**: yellow
- **전문 영역**:
  - WGS84/EPSG:4326 좌표계
  - 카카오 로컬 API (주소 검색, 좌표 변환)
  - Haversine 거리 계산
  - 지오해싱(Geohashing)
  - 행정구역 경계 데이터
- **호출 트리거 키워드**:
  - "좌표", "위도", "경도", "주소"
  - "거리 계산", "지오코딩", "지오해싱"
  - "행정구역", "경계"
- **출력물**: 좌표 변환 로직, 거리 계산 함수, 지오코딩 API 연동
- **협업**:
  - ↔ map-engineer (좌표 데이터 검증)
  - → frontend-engineer (검색 기능 통합)

#### retail-expert (유통/도소매 전문가)
- **역할**: 유통 업체 분류, 파트너 정보 구조화, 검색 필터 설계
- **모델**: sonnet
- **색상**: yellow
- **전문 영역**:
  - 도소매/유통 업종 분류
  - 파트너 정보 스키마 설계
  - 지역/업종 필터링 전략
  - 검색 키워드 추천
  - 즐겨찾기/공유 UX
- **호출 트리거 키워드**:
  - "업종", "분류", "카테고리", "필터"
  - "파트너", "도소매", "유통"
  - "검색", "필터링", "태그"
- **출력물**: 데이터 스키마, 필터링 로직, 검색 전략
- **협업**:
  - ← product-manager (도메인 요구사항 수신)
  - → frontend-engineer (필터 UI 통합)
  - → ui-designer (필터 UI 디자인 협의)

---

### 5️⃣ 품질본부 (Quality Assurance)

#### code-reviewer (코드 리뷰어)
- **역할**: 코드 품질, 메이크샵 패턴 준수, 리팩토링 제안
- **모델**: sonnet
- **색상**: cyan
- **점검 항목**:
  - 템플릿 리터럴 이스케이프 누락
  - 이모지 사용 여부
  - 파일 크기 초과
  - HTML 문자열 연결 길이
  - async/await 사용 여부
  - 전역 변수 오염
  - 이벤트 위임 패턴 준수
  - 코드 가독성 및 유지보수성
- **호출 트리거 키워드**:
  - "코드 리뷰", "검토", "품질", "패턴"
  - "리팩토링", "개선", "Best Practice"
- **출력물**: 코드 리뷰 보고서, 개선 제안, 체크리스트
- **협업**:
  - ← makeshop-specialist (제약사항 체크리스트)
  - ← 모든 기술팀 (코드 검증 요청)
  - → qa-engineer (테스트 필요 항목 전달)

#### security-auditor (보안 감사)
- **역할**: 보안 취약점, XSS 방어, CORS 대응, API 키 보안
- **모델**: sonnet
- **색상**: cyan
- **점검 항목**:
  - XSS (innerHTML vs textContent)
  - CORS 정책 위반
  - API 키 노출 위험
  - localStorage 보안
  - 외부 CDN 무결성 (SRI)
  - 사용자 입력 검증
- **호출 트리거 키워드**:
  - "보안", "XSS", "CORS", "취약점"
  - "API 키", "인증", "권한"
  - "보안 점검", "취약점 스캔"
- **출력물**: 보안 감사 보고서, 취약점 목록, 개선 방안
- **협업**:
  - ← frontend-engineer (보안 검토 요청)
  - → code-reviewer (보안 개선 사항 전달)

#### qa-engineer (QA 엔지니어)
- **역할**: 브라우저 테스트, 반응형 검증, 지도 인터랙션 테스트
- **모델**: sonnet
- **색상**: cyan
- **테스트 영역**:
  - 크로스 브라우저 (Chrome, Safari, Edge, Firefox)
  - 반응형 브레이크포인트 (768px/992px/1200px)
  - 지도 마커 클릭/드래그
  - 필터링/검색 시나리오
  - 즐겨찾기/공유 기능
  - 접근성 (키보드 내비게이션, 스크린 리더)
- **호출 트리거 키워드**:
  - "테스트", "검증", "QA", "테스트 케이스"
  - "브라우저", "반응형", "모바일"
  - "시나리오", "엣지케이스"
- **출력물**: 테스트 시나리오, 버그 보고서, 테스트 체크리스트
- **협업**:
  - ← code-reviewer (테스트 필요 항목 수신)
  - ← ui-designer (접근성 테스트 요청 수신)
  - ← 모든 기술팀 (기능 테스트 요청)

#### technical-writer (기술 문서 작성자)
- **역할**: MEMORY.md 갱신, 문서화, 배포 가이드 작성
- **모델**: haiku (비용 최적화)
- **색상**: white
- **문서화 영역**:
  - MEMORY.md 업데이트 (실전 경험 축적)
  - 메이크샵 배포 가이드
  - API 연동 문서
  - 트러블슈팅 가이드
  - 디자인 시스템 문서
- **호출 트리거 키워드**:
  - "문서화", "MEMORY 업데이트", "가이드"
  - "README", "매뉴얼", "정리"
  - "문서 작성", "가이드 업데이트"
- **출력물**: 업데이트된 MEMORY.md, 기술 문서, 가이드
- **협업**:
  - ← 모든 부서 (작업 완료 후 문서화 요청)

---

## 🔄 자동 라우팅 규칙

### 단일 에이전트 호출 규칙

| 키워드 패턴 | 호출 에이전트 | 우선순위 |
|------------|-------------|---------|
| 메이크샵, 배포, 저장 실패, 템플릿 리터럴 | makeshop-specialist | 높음 |
| 지도, 카카오맵, 마커, 클러스터 | map-engineer | 높음 |
| 좌표, 거리, 지오코딩, 주소 | geo-expert | 중간 |
| 업종, 필터, 검색, 파트너 분류 | retail-expert | 중간 |
| JavaScript, 이벤트, 성능, 최적화 | frontend-engineer | 중간 |
| CSS, 스타일, 레이아웃, 반응형 | ui-designer | 중간 |
| 아이콘, SVG, 색상, 브랜드, 이모지 대체 | graphic-designer | 중간 |
| 보안, XSS, CORS, API 키 | security-auditor | 높음 |
| 테스트, QA, 브라우저, 검증 | qa-engineer | 중간 |

### 오케스트레이션 트리거 (병렬 실행)

| 트리거 키워드 | 호출 에이전트 조합 | 목적 |
|-------------|-----------------|-----|
| **"배포 준비", "최종 점검"** | makeshop-specialist + code-reviewer + security-auditor | 배포 전 검증 |
| **"전체 리뷰", "코드 검토"** | code-reviewer + security-auditor + qa-engineer | 품질 게이트 |
| **"지도 기능 구현"** | map-engineer + geo-expert + frontend-engineer | 지도 팀 |
| **"UI 개선"** | ui-designer + graphic-designer + frontend-engineer | 디자인 팀 |
| **"검색 기능 구현"** | retail-expert + frontend-engineer + qa-engineer | 검색 팀 |
| **"디자인 시스템 구축"** | ui-designer + graphic-designer | 디자인 표준화 |
| **"아이콘 통합"** | graphic-designer + makeshop-specialist + frontend-engineer | 아이콘 시스템 |

### 체이닝 트리거 (순차 실행)

| 트리거 키워드 | 체인 순서 | 목적 |
|-------------|----------|-----|
| **"새 기능 추가"** | PM → Architect → Dev → QA → Writer | 전체 개발 사이클 |
| **"지도 마커 추가"** | PM → map-engineer → geo-expert → graphic-designer → frontend-engineer → QA | 지도 기능 개발 |
| **"필터 기능 추가"** | PM → retail-expert → ui-designer → frontend-engineer → QA | 검색/필터 개발 |
| **"메이크샵 배포"** | makeshop-specialist → code-reviewer → security-auditor → Writer | 배포 프로세스 |
| **"디자인 리뉴얼"** | PM → ui-designer → graphic-designer → frontend-engineer → QA | 디자인 개선 |

---

## 🎯 실전 사용 예시

### 예시 1: 단일 에이전트
```
요청: "파트너맵 로고를 SVG로 디자인해줘"

자동 라우팅:
- 키워드 매칭: "로고", "SVG", "디자인"
- 선택된 에이전트: graphic-designer
- 실행: Task(graphic-designer)
- 출력: SVG 로고 파일, 브랜드 가이드
```

### 예시 2: 오케스트레이션 (병렬)
```
요청: "배포 전 최종 점검해줘"

자동 라우팅:
- 키워드 매칭: "배포", "최종 점검"
- 오케스트레이션 트리거: "배포 준비"
- 선택된 에이전트: makeshop-specialist + code-reviewer + security-auditor
- 실행: 3개 에이전트 병렬 실행
  1. makeshop-specialist: 메이크샵 제약사항 준수 확인
  2. code-reviewer: 코드 품질 검증
  3. security-auditor: 보안 취약점 점검
```

### 예시 3: 체이닝 (순차)
```
요청: "현재 위치 기반 가까운 파트너 표시 기능을 추가해줘"

자동 라우팅:
- 키워드 매칭: "위치", "파트너", "기능 추가"
- 체이닝 트리거: "새 기능 추가"
- 체인 순서:
  1. product-manager (요구사항 정의)
     → 출력: 사용자 스토리, 수용 기준
  2. map-engineer (지도 API 통합 설계)
     → 출력: 현재 위치 감지, 마커 표시 로직
  3. geo-expert (거리 계산 자문)
     → 출력: Haversine 거리 계산 함수
  4. graphic-designer (마커 디자인)
     → 출력: 현재 위치 마커 SVG
  5. frontend-engineer (UI 통합 구현)
     → 출력: 현재 위치 버튼, 거리 표시 UI
  6. qa-engineer (기능 테스트)
     → 출력: 테스트 시나리오, 검증 결과
  7. technical-writer (문서화)
     → 출력: MEMORY.md 업데이트
```

### 예시 4: 복합 오케스트레이션
```
요청: "지도에 마커 클러스터링을 추가하고 메이크샵에 배포해줘"

자동 라우팅:
- 1단계 (병렬): 설계 팀
  - map-engineer: 클러스터링 로직 설계
  - geo-expert: 클러스터 경계 계산 자문
  - graphic-designer: 클러스터 마커 디자인
  - frontend-engineer: 클러스터 UI 인터랙션

- 2단계 (순차): 구현
  - 통합 코드 작성

- 3단계 (병렬): 배포 전 검증
  - makeshop-specialist: 메이크샵 제약사항 준수 확인
  - code-reviewer: 코드 품질 검증
  - qa-engineer: 클러스터링 기능 테스트

- 4단계: 배포
  - technical-writer: 배포 가이드 업데이트
```

### 예시 5: 디자인 시스템 구축 ⭐ 신규
```
요청: "파트너맵 디자인 시스템을 구축해줘 (색상, 타이포, 아이콘)"

자동 라우팅:
- 오케스트레이션 트리거: "디자인 시스템 구축"
- 1단계 (병렬): 디자인 팀
  - ui-designer: CSS 변수, 타이포그래피, 레이아웃 시스템
  - graphic-designer: 색상 팔레트, 아이콘 세트, 브랜드 가이드

- 2단계 (순차): 통합
  - frontend-engineer: 디자인 토큰 통합
  - makeshop-specialist: 메이크샵 호환성 확인

- 3단계: 문서화
  - technical-writer: 디자인 시스템 문서 작성
```

### 예시 6: 이모지 대체 작업 ⭐ 신규
```
요청: "파트너 목록의 이모지를 메이크샵 호환 아이콘으로 바꿔줘"

자동 라우팅:
- 키워드 매칭: "이모지", "메이크샵 호환", "아이콘"
- 1단계: graphic-designer
  - 이모지 분석 (📍, 📞, ❤️, 🔗)
  - 대체 솔루션 제안:
    1. Phosphor Icons 추천 (CDN)
    2. 커스텀 SVG 아이콘 제작
    3. HTML 엔티티 (♥, ♡)
  - 매핑표 생성

- 2단계: makeshop-specialist
  - 이모지 제거
  - Phosphor Icons CDN 추가
  - 아이콘 클래스 적용

- 3단계: frontend-engineer
  - 아이콘 통합 및 스타일링

- 4단계: qa-engineer
  - 메이크샵 에디터 저장 테스트
  - 브라우저 렌더링 확인
```

---

## 📝 메이크샵 특화 체크리스트

### 배포 전 필수 확인 항목 (makeshop-specialist + code-reviewer)

#### 1. 코드 패턴
- [ ] 템플릿 리터럴 이스케이프 (`\${variable}`)
- [ ] 이모지 제거 (Phosphor Icons 또는 HTML 엔티티 대체)
- [ ] async/await → Promise 체이닝 변환
- [ ] 인라인 이벤트 핸들러 제거 (이벤트 위임)
- [ ] IIFE 패턴으로 전역 변수 격리

#### 2. 파일 구조
- [ ] 단일 파일 크기 30KB 이하
- [ ] HTML 문자열 연결 10줄 이하
- [ ] 기능별 모듈 분할 (9-Part 구조)

#### 3. HTML/CSS
- [ ] 가상 태그 보존 (`<!-- -->`, `{$치환코드}`)
- [ ] CSS 스코핑 (컨테이너 ID 기반)
- [ ] 외부 CDN 링크 유효성 확인 (Phosphor Icons, Kakao Map)
- [ ] SRI (Subresource Integrity) 해시 추가 (선택)

#### 4. 보안
- [ ] XSS 방어 (textContent 사용)
- [ ] API 키 노출 방지
- [ ] localStorage 보안 처리
- [ ] CORS 정책 준수

#### 5. 디자인 ⭐ 신규
- [ ] 이모지 완전 제거 확인
- [ ] Phosphor Icons CDN 로드 확인
- [ ] 아이콘 크기/색상 일관성
- [ ] 접근성 (aria-label, role)
- [ ] 반응형 브레이크포인트 테스트

---

## 🎨 디자인 시스템 가이드 ⭐ 신규

### 색상 팔레트 (graphic-designer)
```css
:root {
  /* Primary Colors */
  --pm-primary: #2196F3;      /* 지도/브랜드 */
  --pm-primary-dark: #1976D2;
  --pm-primary-light: #64B5F6;

  /* Secondary Colors */
  --pm-secondary: #FF9800;    /* 액센트 */
  --pm-success: #4CAF50;      /* 즐겨찾기 */
  --pm-warning: #FFC107;
  --pm-error: #F44336;

  /* Neutral Colors */
  --pm-gray-900: #212121;     /* 텍스트 */
  --pm-gray-700: #616161;
  --pm-gray-500: #9E9E9E;
  --pm-gray-300: #E0E0E0;     /* 보더 */
  --pm-gray-100: #F5F5F5;     /* 배경 */
}
```

### 아이콘 매핑표 (graphic-designer)

| 이모지 | Phosphor Icon | 용도 |
|-------|--------------|------|
| 📍 | `<i class="ph ph-map-pin"></i>` | 위치 마커 |
| 📞 | `<i class="ph ph-phone"></i>` | 전화번호 |
| ❤️ | `<i class="ph ph-heart"></i>` | 즐겨찾기 (빈) |
| ❤️ (채움) | `<i class="ph-fill ph-heart"></i>` | 즐겨찾기 (채움) |
| 🔗 | `<i class="ph ph-link"></i>` | 공유 링크 |
| 🔍 | `<i class="ph ph-magnifying-glass"></i>` | 검색 |
| ✕ | `<i class="ph ph-x"></i>` | 닫기 |
| 🏢 | `<i class="ph ph-buildings"></i>` | 업종 |
| 📱 | `<i class="ph ph-device-mobile"></i>` | 모바일 |
| 🗺️ | `<i class="ph ph-map-trifold"></i>` | 지도 |

### Phosphor Icons CDN (graphic-designer)
```html
<!-- Phosphor Icons v2.0 (메이크샵 호환) -->
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css">
```

### 타이포그래피 (ui-designer)
```css
:root {
  /* Font Sizes */
  --pm-text-xs: 0.75rem;    /* 12px */
  --pm-text-sm: 0.875rem;   /* 14px */
  --pm-text-base: 1rem;     /* 16px */
  --pm-text-lg: 1.125rem;   /* 18px */
  --pm-text-xl: 1.25rem;    /* 20px */
  --pm-text-2xl: 1.5rem;    /* 24px */

  /* Font Weights */
  --pm-font-normal: 400;
  --pm-font-medium: 500;
  --pm-font-semibold: 600;
  --pm-font-bold: 700;
}
```

---

## 🔧 유지보수 가이드

### 정기 점검 항목 (월 1회)

- [ ] MEMORY.md 검토 (200줄 초과 시 분리)
- [ ] 메이크샵 제약사항 업데이트 (플랫폼 변경 사항 반영)
- [ ] 카카오맵 API 버전 확인
- [ ] Phosphor Icons 버전 확인
- [ ] 라우팅 규칙 최적화 (오판 사례 수정)
- [ ] 에이전트 협업 패턴 효율성 분석
- [ ] 디자인 시스템 일관성 검토

### 성능 최적화

- **Sonnet 기본**: 대부분의 작업
- **Haiku 활용**: 문서화(technical-writer), 간단한 정리
- **Opus 사용 금지**: 이 프로젝트에서는 불필요

### 에이전트별 메모리 관리

| 에이전트 | 메모리 파일 위치 | 주요 내용 |
|---------|----------------|----------|
| makeshop-specialist | `.claude/memory/makeshop-specialist.md` | 배포 실패 사례, 제약사항 업데이트 |
| map-engineer | `.claude/memory/map-engineer.md` | 카카오맵 API 변경, 마커 최적화 |
| graphic-designer | `.claude/memory/graphic-designer.md` | 이모지 매핑, 아이콘 라이브러리 |
| ui-designer | `.claude/memory/ui-designer.md` | 디자인 패턴, 반응형 이슈 |

---

## 📚 참고 문서

- [메이크샵 개발 가이드](../../MAKESHOP-DEVELOPMENT-GUIDE.md)
- [에이전트 시스템 완벽 가이드](./AGENT_SYSTEM_GUIDE.md)
- [프로젝트 메모리](../../.claude/memory/MEMORY.md)
- [오케스트레이션 가이드](./ORCHESTRATION_GUIDE.md)
- [디자인 시스템 문서](../../docs/DESIGN_SYSTEM.md) ⭐ 신규

---

## 🚀 빠른 시작 가이드

### 1. 단일 작업
```
"지도 마커를 클릭하면 파트너 상세 정보가 모달로 표시되게 해줘"
→ map-engineer + frontend-engineer 자동 호출
```

### 2. 복잡한 작업
```
"파트너 검색 필터(지역/업종)를 추가하고 메이크샵에 배포해줘"
→ PM → retail-expert → ui-designer → frontend-engineer → makeshop-specialist → QA → Writer
```

### 3. 검증 작업
```
"현재 코드를 메이크샵 제약사항 기준으로 검증해줘"
→ makeshop-specialist + code-reviewer + security-auditor (병렬)
```

### 4. 긴급 수정
```
"배포 후 지도가 안 뜨는데 원인 찾아서 수정해줘"
→ map-engineer (진단) → makeshop-specialist (제약사항 확인) → code-reviewer (수정 검증)
```

### 5. 디자인 작업 ⭐ 신규
```
"이모지를 Phosphor Icons로 바꾸고 색상 팔레트를 일관되게 적용해줘"
→ graphic-designer (아이콘 매핑) → ui-designer (색상 시스템) → makeshop-specialist (호환성 확인) → frontend-engineer (통합)
```

---

## 🆕 v2.0 변경 사항

### 추가된 기능
1. **디자인팀 신설**: ui-designer와 graphic-designer를 별도 부서로 분리
2. **graphic-designer 추가**: 아이콘, 색상, 브랜딩 전문
3. **디자인 시스템 가이드**: 색상 팔레트, 아이콘 매핑, 타이포그래피
4. **이모지 대체 솔루션**: Phosphor Icons 표준화
5. **디자인 협업 프로토콜**: graphic-designer와 다른 에이전트 간 협업 규칙

### 개선된 워크플로우
- "디자인 시스템 구축" 오케스트레이션 추가
- "아이콘 통합" 오케스트레이션 추가
- "이모지 대체 작업" 체이닝 추가
- 배포 전 체크리스트에 디자인 항목 추가

### 메모리 확장
- graphic-designer 전용 메모리 파일 추가
- 디자인 시스템 문서 참조 추가
