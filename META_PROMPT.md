# 파트너맵 v3 개발 메타프롬프트

## 🎯 프로젝트 개요

메이크샵(D4/카멜레온) 플랫폼에 최적화된 제휴 업체 지도 서비스를 구축합니다.
네이버 지도 API를 활용하여 전국 제휴 업체를 시각화하고, 사용자가 쉽게 찾아볼 수 있도록 합니다.

### 핵심 목표
1. **메이크샵 완벽 호환**: 메이크샵 에디터 저장 오류 방지, 가상 태그 보존
2. **데이터 영속성**: 메이크샵 오픈 API를 활용한 안정적인 데이터 저장
3. **사용자 경험 개선**: 기존 v2 대비 향상된 UX/UI
4. **성능 최적화**: API 호출 제한 준수, 효율적인 클러스터링

### 기술 스택
- **Frontend**: Vanilla HTML/CSS/JS (빌드 도구 없음)
- **Map**: 네이버 지도 API (Client ID: bfp8odep5r)
- **Data Storage**: 메이크샵 오픈 API (상품 추가정보) + Google Sheets (백업/관리)
- **Libraries**: Fuse.js (검색), PapaParse (CSV 파싱)

### 참조 파일
- 기존 v2: `/Users/jangjiho/workspace/brand-intro-page/partnermap-v2/`
- 메이크샵 제약사항: `~/.claude/CLAUDE.md`, `./CLAUDE.md`

---

## 📋 Phase 1: 요구사항 분석 및 아키텍처 설계

### 1.1 기존 시스템 분석

**에이전트**: `Explore` (medium thoroughness)

#### 작업 내용
```
기존 파트너맵 v2의 코드베이스를 분석하여 다음을 파악하세요:

1. 주요 기능 목록 및 구현 방식
   - 지도 렌더링 로직
   - 필터링 시스템 (카테고리, 지역, 협회, 파트너유형)
   - 검색 및 자동완성
   - 즐겨찾기, 공유, GPS 주변 검색
   - 클러스터링 알고리즘

2. 데이터 구조 및 흐름
   - Google Sheets API 연동 방식
   - 캐싱 전략 (localStorage)
   - 파트너 객체 스키마

3. 개선 필요 사항
   - 메이크샵 호환성 이슈 (템플릿 리터럴, 가상 태그 등)
   - 성능 병목 지점
   - UX 개선 포인트

탐색 경로:
- /Users/jangjiho/workspace/brand-intro-page/partnermap-v2/**/*
```

### 1.2 메이크샵 오픈 API 데이터 저장 설계

**에이전트**: `backend-engineer`, `db-architect` (CLAUDE.md의 AI 조직 활용)

#### 작업 내용
메이크샵 오픈 API를 활용한 파트너 데이터 저장 방안을 설계합니다.

**요구사항**:
1. 메이크샵 API 제약사항
   - 시간당 조회 500회, 처리 500회 제한
   - 상품 추가정보 필드 활용 (최대 20개 필드)
   - 또는 게시판 API 활용

2. 데이터 스키마 설계
   ```javascript
   Partner {
     id: string,
     name: string,           // 업체명
     category: string[],     // 카테고리 (압화, 플라워디자인 등)
     address: string,        // 주소
     lat: number,           // 위도
     lng: number,           // 경도
     phone: string,         // 전화번호
     email: string,         // 이메일
     description: string,   // 소개
     imageUrl: string,      // 이미지 URL
     logoUrl: string,       // 로고 URL
     association: string,   // 협회
     partnerType: string[], // 유형 (협회, 인플루언서 등)
     status: 'active' | 'inactive' // 상태
   }
   ```

3. API 전략
   - CRUD 엔드포인트 설계
   - 캐싱 전략 (24시간 localStorage + 주기적 갱신)
   - 에러 핸들링 및 fallback (Google Sheets)

4. 관리자 인터페이스
   - CSV 대량 업로드 (/admin/upload.html 개선)
   - 개별 등록/수정/삭제
   - 좌표 자동 변환 (주소 → 위경도)

**출력**: `docs/architecture.md` 파일로 저장

### 1.3 구현 계획 수립

**에이전트**: `Plan`

#### 작업 내용
```
1.1과 1.2의 결과를 바탕으로 단계별 구현 계획을 수립하세요.

**출력 항목**:
1. 파일 구조
   ```
   partner-map/
   ├── index.html              # 메인 페이지
   ├── admin/
   │   ├── index.html          # 관리자 대시보드
   │   └── upload.html         # CSV 대량 업로드
   ├── css/
   │   ├── variables.css       # CSS 변수
   │   ├── partnermap.css      # 파트너맵 전용 스타일
   │   └── admin.css           # 관리자 스타일
   ├── js/
   │   ├── config.js           # 설정 (API 키, 엔드포인트)
   │   ├── api.js              # 메이크샵 API 래퍼
   │   ├── map.js              # 지도 관련 로직
   │   ├── filters.js          # 필터링 시스템
   │   ├── search.js           # 검색/자동완성
   │   ├── ui.js               # UI 유틸리티
   │   └── main.js             # 초기화 및 통합
   ├── docs/
   │   ├── architecture.md     # 아키텍처 문서
   │   └── api-spec.md         # API 명세
   └── README.md
   ```

2. 구현 우선순위
   - P0 (필수): 지도 렌더링, 데이터 로딩, 기본 필터링
   - P1 (중요): 검색, 상세보기, 즐겨찾기
   - P2 (개선): GPS 검색, 공유, 클러스터링

3. 메이크샵 호환성 체크리스트
   - [ ] JS 템플릿 리터럴 이스케이프 (\${variable})
   - [ ] 가상 태그 보존 (<!-- -->, {\$code})
   - [ ] CSS 스코핑 (#partnermap-container 하위)
   - [ ] CDN 스크립트 로드 (Fuse.js, PapaParse)
   - [ ] iframe 높이 자동 조정

**출력**: `docs/implementation-plan.md` 파일로 저장
```

---

## 📋 Phase 2: 핵심 기능 구현

### 2.1 메이크샵 API 래퍼 구축

**에이전트**: `backend-engineer`

#### 작업 내용
```
메이크샵 오픈 API와 통신하는 JavaScript 래퍼를 구현하세요.

**파일**: `js/api.js`

**기능**:
1. API 클라이언트 클래스
   ```javascript
   class MakeshopAPI {
     constructor(config) {
       this.baseUrl = config.baseUrl;
       this.apiKey = config.apiKey;
       this.cacheKey = 'partnermap_data';
       this.cacheDuration = 24 * 60 * 60 * 1000; // 24시간
     }

     async getPartners() { /* 파트너 목록 조회 */ }
     async getPartner(id) { /* 단일 파트너 조회 */ }
     async createPartner(data) { /* 파트너 생성 */ }
     async updatePartner(id, data) { /* 파트너 수정 */ }
     async deletePartner(id) { /* 파트너 삭제 */ }

     // 캐싱 메서드
     getCache() { /* localStorage 읽기 */ }
     setCache(data) { /* localStorage 쓰기 */ }
     clearCache() { /* 캐시 무효화 */ }

     // Fallback (Google Sheets)
     async getFallbackData() { /* Google Sheets에서 데이터 가져오기 */ }
   }
   ```

2. 에러 핸들링
   - API 제한 초과 시 fallback
   - 네트워크 오류 시 캐시 사용
   - 사용자 친화적인 에러 메시지

3. 메이크샵 제약사항 준수
   - 템플릿 리터럴 이스케이프
   - 요청 큐잉 (rate limiting 대응)

**테스트 항목**:
- [ ] 파트너 목록 조회 성공
- [ ] 캐시 동작 확인
- [ ] API 제한 초과 시 fallback
- [ ] CORS 에러 대응
```

### 2.2 지도 및 마커 시스템

**에이전트**: `frontend-engineer`

#### 작업 내용
```
네이버 지도 API를 활용한 지도 렌더링 및 마커 관리 시스템을 구현하세요.

**파일**: `js/map.js`

**기능**:
1. 지도 초기화
   - 네이버 지도 SDK 동적 로드
   - 기본 중심점 (서울시청 또는 사용자 위치)
   - 줌 컨트롤, 지도 타입 컨트롤

2. 마커 생성 및 관리
   - HTML 커스텀 마커 (기존 v2 디자인 개선)
   - 파트너 유형별 색상 구분
     - 협회: #5A7FA8 (파란색)
     - 인플루언서: #C9A961 (금색)
     - 일반: #7D9675 (브랜드 컬러)
   - 호버 효과 (scale up, shadow)

3. 클러스터링 (줌 레벨 ≤ 10)
   - 거리 기반 그룹핑
   - 클러스터 마커 디자인
   - 클릭 시 해당 영역 줌인

4. 이벤트 처리
   - 마커 클릭 → 상세 모달
   - 지도 클릭 → 기준점 설정 (거리순 정렬)
   - 지도 idle → 뷰포트 내 마커만 렌더링

**메이크샵 호환성**:
- 모든 문자열은 escapeHtml() 처리
- 템플릿 리터럴 대신 문자열 연결 사용 (또는 \${ 이스케이프)

**테스트 항목**:
- [ ] 지도 정상 로드
- [ ] 마커 클릭 시 모달 열림
- [ ] 클러스터링 동작
- [ ] 메이크샵 에디터 저장 성공
```

### 2.3 필터링 및 검색 시스템

**에이전트**: `frontend-engineer`

#### 작업 내용
```
다중 필터 및 퍼지 검색 기능을 구현하세요.

**파일**: `js/filters.js`, `js/search.js`

**기능**:
1. 다중 필터
   - 카테고리 (압화, 플라워디자인, 투명식물표본 등)
   - 지역 (서울, 경기, 부산 등 - 주소 파싱)
   - 협회 (한국압화협회 등)
   - 파트너 유형 (협회, 인플루언서)
   - 즐겨찾기만 보기

2. 검색
   - Fuse.js 퍼지 검색
   - 검색 대상: 업체명, 주소, 카테고리, 소개
   - 실시간 자동완성 (debounce 300ms)

3. 활성 필터 배지
   - 선택된 필터를 칩 형태로 표시
   - 개별 제거 버튼 (×)
   - 전체 초기화 버튼

4. URL 파라미터 동기화
   - ?category=압화&region=서울
   - 북마크/공유 시 필터 상태 유지

**UX 개선**:
- 필터 변경 시 부드러운 애니메이션
- 검색 결과 하이라이트
- 결과 없을 시 안내 메시지

**테스트 항목**:
- [ ] 다중 필터 조합 동작
- [ ] 검색어 입력 시 자동완성
- [ ] URL 파라미터 로드/저장
- [ ] 필터 초기화 동작
```

### 2.4 UI/UX 컴포넌트

**에이전트**: `ui-designer`, `frontend-engineer`

#### 작업 내용
```
사용자 인터페이스 컴포넌트를 구현하세요.

**파일**: `js/ui.js`, `css/partnermap.css`

**컴포넌트**:
1. 파트너 카드
   - 로고 이미지 (fallback: 기본 이미지)
   - 업체명, 주소, 전화번호
   - 카테고리 태그
   - 즐겨찾기 버튼
   - 거리 표시 (GPS 검색 시)

2. 상세 모달
   - 파트너 정보 (이미지, 소개, 연락처)
   - 네이버 지도/카카오맵 길찾기 버튼
   - 즐겨찾기, 공유 버튼
   - ESC 키로 닫기

3. 토스트 알림
   - 성공/에러/경고 타입별 아이콘
   - 3초 후 자동 사라짐
   - 최대 3개 동시 표시

4. 로딩 스피너
   - 지도 로딩 중
   - API 호출 중

5. 공유 모달
   - 링크 복사
   - 카카오톡 공유 (Kakao SDK)
   - 네이티브 공유 (Web Share API)

**디자인 시스템**:
- CSS 변수 활용 (variables.css)
- 브레이크포인트: 768px, 992px, 1200px
- 브랜드 컬러: #7D9675 (프레스코21)
- Pretendard 폰트 (CDN)

**접근성**:
- 키보드 네비게이션
- ARIA 레이블
- 고대비 모드 대응

**테스트 항목**:
- [ ] 모든 컴포넌트 정상 렌더링
- [ ] 반응형 레이아웃 동작
- [ ] 키보드 네비게이션
- [ ] 모바일 터치 이벤트
```

---

## 📋 Phase 3: 관리자 기능 및 데이터 관리

### 3.1 관리자 대시보드

**에이전트**: `backend-engineer`, `frontend-engineer`

#### 작업 내용
```
파트너 데이터를 관리하는 관리자 페이지를 구현하세요.

**파일**: `admin/index.html`, `js/admin.js`

**기능**:
1. 인증
   - API 키 입력 (localStorage 저장)
   - 관리자 권한 확인

2. 파트너 목록
   - 전체/활성/비활성 필터
   - 검색 (업체명, 주소)
   - 정렬 (최신순, 이름순)
   - 페이지네이션 (20개씩)

3. CRUD
   - 생성: 모달 폼 (주소 입력 시 자동 좌표 변환)
   - 수정: 인라인 편집 또는 모달
   - 삭제: 확인 다이얼로그
   - 상태 변경 (active ↔ inactive)

4. 배치 작업
   - 선택 항목 일괄 삭제
   - 선택 항목 상태 변경
   - CSV 내보내기

**주소 → 좌표 변환**:
- 네이버 Geocoding API
- 또는 Kakao Local API (더 정확)

**테스트 항목**:
- [ ] 관리자 인증
- [ ] CRUD 동작
- [ ] 주소 자동 변환
- [ ] 배치 작업
```

### 3.2 CSV 대량 업로드 개선

**에이전트**: `backend-engineer`

#### 작업 내용
```
기존 upload.html을 개선하여 대량 업로드 기능을 고도화하세요.

**파일**: `admin/upload.html`

**개선 사항**:
1. 파일 검증
   - CSV 형식 체크
   - 필수 필드 검증 (업체명, 주소, 연락처)
   - 중복 체크 (기존 데이터와 비교)

2. 주소 일괄 변환
   - 주소 → 좌표 자동 변환 (Geocoding API)
   - 실패 시 경고 표시

3. 미리보기
   - 업로드 전 데이터 확인
   - 유효/오류/중복 상태 표시
   - 오류 행 하이라이트

4. 진행 상황
   - 프로그레스 바
   - 성공/실패 카운트
   - 상세 로그

5. 에러 복구
   - 실패 행만 재시도
   - 에러 리포트 CSV 다운로드

**최적화**:
- API 제한 대응 (배치 처리, 큐잉)
- 대용량 파일 처리 (Worker 활용 고려)

**테스트 항목**:
- [ ] CSV 템플릿 다운로드
- [ ] 파일 업로드 및 검증
- [ ] 주소 자동 변환
- [ ] 대량 데이터 처리 (100개 이상)
```

---

## 📋 Phase 4: 메이크샵 통합 및 배포

### 4.1 메이크샵 호환성 최종 검증

**에이전트**: `qa-engineer`, `security-auditor`

#### 작업 내용
```
메이크샵 플랫폼에서 정상 동작하는지 최종 검증하세요.

**체크리스트**:
1. 메이크샵 에디터 저장
   - [ ] HTML 저장 시 에러 없음
   - [ ] JS 코드 저장 시 에러 없음 (템플릿 리터럴 이스케이프 확인)
   - [ ] CSS 저장 시 에러 없음

2. 가상 태그 보존
   - [ ] <!-- --> 주석 유지
   - [ ] {\$치환코드} 유지
   - [ ] 메이크샵 치환코드와 충돌 없음

3. CSS 스코핑
   - [ ] #partnermap-container 하위로 모든 스타일 제한
   - [ ] 기존 쇼핑몰 스타일과 충돌 없음
   - [ ] 반응형 동작 (모바일, 태블릿, 데스크톱)

4. 외부 리소스 로드
   - [ ] CDN 스크립트 정상 로드 (Fuse.js, PapaParse)
   - [ ] 네이버 지도 SDK 로드
   - [ ] 폰트 로드 (Pretendard)

5. API 통신
   - [ ] 메이크샵 오픈 API 호출 성공
   - [ ] CORS 에러 없음
   - [ ] API 제한 초과 시 fallback 동작

6. 브라우저 호환성
   - [ ] Chrome (최신)
   - [ ] Safari (iOS, macOS)
   - [ ] Edge
   - [ ] 모바일 브라우저 (iOS Safari, Android Chrome)

7. 성능
   - [ ] 초기 로드 3초 이내
   - [ ] 지도 인터랙션 부드러움 (60fps)
   - [ ] 메모리 누수 없음

8. 보안
   - [ ] XSS 방지 (escapeHtml 적용)
   - [ ] API 키 노출 방지
   - [ ] 입력 값 검증

**테스트 환경**:
- 메이크샵 D4(카멜레온) 실제 쇼핑몰
- 다양한 디바이스 및 브라우저
```

### 4.2 배포 및 문서화

**에이전트**: `technical-writer`, `devops-engineer`

#### 작업 내용
```
배포 가이드 및 사용자 매뉴얼을 작성하세요.

**문서 작성**:
1. README.md
   - 프로젝트 개요
   - 기능 목록
   - 기술 스택
   - 설치 방법

2. docs/deployment-guide.md
   - 메이크샵에 코드 삽입 방법
   - 환경 변수 설정 (API 키 등)
   - 트러블슈팅

3. docs/user-manual.md
   - 일반 사용자 가이드
   - 관리자 가이드
   - FAQ

4. docs/api-spec.md
   - 메이크샵 API 엔드포인트 명세
   - 요청/응답 예시
   - 에러 코드

**배포 프로세스**:
1. 메이크샵 관리자 페이지 접속
2. [디자인 설정] → [HTML 편집]
3. 파트너맵 전용 페이지 생성
4. HTML/CSS/JS 코드 삽입
5. 저장 및 미리보기
6. 실서버 반영

**모니터링**:
- Google Analytics 연동 (선택)
- 에러 로깅 (Sentry 등)
- API 사용량 모니터링
```

---

## 🔧 개발 프로세스

### 워크플로우 활용

CLAUDE.md에 정의된 AI 조직 및 워크플로우를 활용합니다.

#### CW-01: 신규 기능 개발 (엔드-투-엔드)
```
사용자 요구사항 → 기획(PM) → 설계(Architect) → [게이트] →
구현(Engineer) → 코드리뷰(Reviewer) → QA(QA Engineer) →
문서화(Technical Writer) → 배포(DevOps)
```

#### AW-03: 프론트엔드 구현 (UI → 로직 → 테스트)
```
UI Designer → Frontend Engineer → QA Engineer
```

#### AW-04: 백엔드 API 구현
```
Backend Engineer → Code Reviewer → QA Engineer
```

### 에이전트 병렬 실행

독립적인 작업은 병렬로 실행하여 효율성을 높입니다.

**예시**:
```
Phase 2.1 (API 래퍼) + Phase 2.2 (지도 시스템) + Phase 2.3 (필터링)
→ 동시 진행 가능

Phase 2.4 (UI 컴포넌트)
→ 2.1~2.3 완료 후 통합
```

### 게이트 체크포인트

주요 단계마다 사용자 확인을 받습니다.

1. **Gate 1**: Phase 1 완료 후 (아키텍처 설계 승인)
2. **Gate 2**: Phase 2 완료 후 (핵심 기능 구현 확인)
3. **Gate 3**: Phase 4.1 완료 후 (최종 배포 승인)

---

## 🎨 MCP 도구 활용

### nano-banana (이미지 생성)

파트너 로고 또는 기본 이미지 생성 시 활용합니다.

**사용 예시**:
```
- 기본 로고 이미지 생성 (꽃 모티브, 브랜드 컬러)
- 카테고리별 아이콘 생성 (압화, 플라워디자인 등)
- 관리자 대시보드 일러스트
```

### IDE (Jupyter Notebook)

데이터 분석 또는 좌표 변환 스크립트 작성 시 활용합니다.

**사용 예시**:
```python
# 주소 일괄 좌표 변환 스크립트
import pandas as pd
import requests

def geocode_address(address):
    # 네이버 Geocoding API 호출
    # ...
    return (lat, lng)

df = pd.read_csv('partners.csv')
df[['lat', 'lng']] = df['address'].apply(geocode_address)
df.to_csv('partners_with_coords.csv', index=False)
```

---

## 📝 주요 제약사항 및 해결책

### 1. 메이크샵 템플릿 리터럴 이슈

**문제**: \${variable} 형태가 메이크샵 치환코드로 오인됨

**해결책**:
```javascript
// ❌ 안 됨
const html = `<div>\${partner.name}</div>`;

// ✅ 해결 1: 백슬래시 이스케이프
const html = `<div>\\${partner.name}</div>`;

// ✅ 해결 2: 문자열 연결
const html = '<div>' + partner.name + '</div>';
```

### 2. API 호출 제한

**문제**: 시간당 500회 제한

**해결책**:
- 캐싱 (24시간 localStorage)
- 배치 처리 (대량 업로드 시)
- Fallback (Google Sheets)

### 3. CORS 에러

**문제**: 외부 API 호출 시 브라우저 차단

**해결책**:
- 메이크샵 서버 사이드 프록시 활용
- Google Apps Script를 프록시로 사용
- JSONP (지원 시)

### 4. CSS 충돌

**문제**: 기존 쇼핑몰 스타일과 충돌

**해결책**:
```css
/* 모든 스타일을 컨테이너 하위로 제한 */
#partnermap-container {
  /* 변수 재정의 */
  --primary: #7D9675;
}

#partnermap-container .partner-card {
  /* 스타일 */
}
```

---

## ✅ 완료 기준

### Phase 1
- [ ] 아키텍처 문서 작성 완료
- [ ] 구현 계획 수립 완료
- [ ] 사용자 승인 (Gate 1)

### Phase 2
- [ ] 메이크샵 API 래퍼 구현 및 테스트
- [ ] 지도 렌더링 정상 동작
- [ ] 필터링 및 검색 정상 동작
- [ ] UI 컴포넌트 정상 렌더링
- [ ] 사용자 확인 (Gate 2)

### Phase 3
- [ ] 관리자 대시보드 정상 동작
- [ ] CSV 대량 업로드 정상 동작
- [ ] CRUD 기능 정상 동작

### Phase 4
- [ ] 메이크샵 호환성 검증 완료
- [ ] 성능 테스트 통과
- [ ] 보안 감사 통과
- [ ] 문서화 완료
- [ ] 사용자 최종 승인 (Gate 3)
- [ ] 실서버 배포

---

## 🚀 시작 명령어

이 메타프롬프트를 Claude Code에 전달하여 개발을 시작합니다.

```
"META_PROMPT.md 파일을 읽고 Phase 1부터 단계별로 진행해줘.
각 단계마다 완료 후 다음 단계로 넘어가기 전에 확인을 받을게."
```

---

## 📚 참고 자료

- 메이크샵 오픈 API 문서: https://www.makeshop.co.kr/manual/
- 네이버 지도 API: https://www.ncloud.com/product/applicationService/maps
- Fuse.js: https://fusejs.io/
- CLAUDE.md (메이크샵 제약사항): ~/.claude/CLAUDE.md

---

**작성일**: 2026-02-11
**버전**: 1.0.0
**작성자**: Claude (Sonnet 4.5)
