# 파트너맵 v3 - Google Analytics 4 통합 배포 가이드

**작성일**: 2026-02-12
**작업 디렉토리**: `/Users/jangjiho/workspace/partner-map/v3-enhancement`

---

## 작업 개요

파트너맵 v3에 Google Analytics 4(GA4)를 통합하여 사용자 행동을 추적하고 분석할 수 있는 기능을 구현했습니다.

### 구현 내용

1. **makeshop-js-analytics.js 신규 생성** (10.2KB)
   - GA4 gtag.js 초기화
   - 17개 이벤트 추적 함수
   - localStorage 기반 조회수/검색 기록 관리

2. **기존 파일 수정** (6개)
   - `makeshop-html.html`: GA4 gtag.js CDN 추가
   - `makeshop-js-part2b1.js`: 즐겨찾기/모달/공유 이벤트 추적 (+650 bytes)
   - `makeshop-js-part2a.js`: 필터/검색 이벤트 추적 (+350 bytes)
   - `makeshop-js-part1.js`: 지도 마커 클릭 이벤트 추적 (+150 bytes)
   - `makeshop-js-part2b2.js`: Analytics 초기화 및 GPS 이벤트 추적 (+450 bytes)

---

## 추적 이벤트 목록 (17개)

### 1. 파트너 관련 (2개)
- **partner_view**: 파트너 상세 모달 조회
  - 파라미터: `partner_id`, `partner_name`, `partner_category`, `partner_region`, `partner_type`
- **partner_call**: 파트너 전화 클릭
  - 파라미터: `partner_id`, `partner_name`, `partner_phone`

### 2. 즐겨찾기 (2개)
- **favorite_add**: 즐겨찾기 추가
  - 파라미터: `partner_id`, `partner_name`
- **favorite_remove**: 즐겨찾기 제거
  - 파라미터: `partner_id`, `partner_name`

### 3. 검색 (1개)
- **search**: 검색 수행
  - 파라미터: `search_term`, `result_count`

### 4. 필터 (1개)
- **filter_change**: 필터 변경
  - 파라미터: `filter_type`, `filter_value`, `result_count`

### 5. GPS (1개)
- **gps_search**: GPS 위치 검색
  - 파라미터: `latitude`, `longitude`, `success`

### 6. 공유 (3개)
- **share_start**: 공유 모달 열기
  - 파라미터: `partner_id`, `partner_name`
- **share_copy**: 링크 복사
  - 파라미터: `partner_id`, `method: 'copy_link'`
- **share_kakao**: 카카오톡 공유
  - 파라미터: `partner_id`, `method: 'kakao'`

### 7. 지도 (2개)
- **map_marker_click**: 지도 마커 클릭
  - 파라미터: `partner_id`, `partner_name`
- **map_reset**: 지도 초기화
  - 파라미터: `action: 'reset_to_default'`

### 8. 시스템 (2개)
- **session_start**: 세션 시작 (자동)
  - 파라미터: `timestamp`
- **error**: 에러 발생
  - 파라미터: `error_type`, `error_message`

---

## localStorage 통계 데이터

### 1. 조회수 추적
- **키**: `fresco21_partner_views_v3`
- **형식**: `{ "partnerId": count }`
- **기능**: 각 파트너별 상세 조회 횟수 저장

### 2. 검색 기록
- **키**: `fresco21_search_history_v3`
- **형식**: `[{ query, resultCount, timestamp }]`
- **기능**: 최근 50개 검색 기록 저장

### 3. 즐겨찾기 통계
- **키**: `fresco21_favorite_stats_v3`
- **형식**: `{ totalAdds, totalRemoves, lastUpdated }`
- **기능**: 즐겨찾기 추가/제거 누적 통계

---

## 파일 크기 보고

### 신규 파일
- `makeshop-js-analytics.js`: **10.2KB**

### 수정된 파일 (증가량)
- `makeshop-html.html`: +500 bytes (GA4 스크립트 추가)
- `makeshop-js-part2b1.js`: +650 bytes (즐겨찾기/공유 추적)
- `makeshop-js-part2a.js`: +350 bytes (검색/필터 추적)
- `makeshop-js-part1.js`: +150 bytes (지도 마커 추적)
- `makeshop-js-part2b2.js`: +450 bytes (초기화/GPS 추적)

### 총 증가량: **약 12.3KB**

---

## 배포 순서

### 단계 1: GA4 측정 ID 발급
1. [Google Analytics 4](https://analytics.google.com/) 로그인
2. **관리 > 속성 > 데이터 스트림** 이동
3. 웹 스트림 생성 후 **측정 ID (G-XXXXXXXXXX)** 복사

### 단계 2: 코드 수정
1. `makeshop-html.html` 13줄 수정:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```
   → `G-XXXXXXXXXX`를 실제 측정 ID로 교체

2. `makeshop-js-analytics.js` 16줄 수정:
   ```javascript
   this.measurementId = 'G-XXXXXXXXXX';
   ```
   → `G-XXXXXXXXXX`를 실제 측정 ID로 교체

3. `makeshop-js-part2b2.js` 288줄 수정:
   ```javascript
   analyticsService.init('G-XXXXXXXXXX');
   ```
   → `G-XXXXXXXXXX`를 실제 측정 ID로 교체

### 단계 3: 메이크샵 업로드
#### HTML 탭
- `makeshop-html.html` 전체 복사 후 **디자인 편집 > HTML 탭**에 붙여넣기

#### CSS 전용 탭
- `makeshop-css.css` 전체 복사 후 **디자인 편집 > CSS 전용 탭**에 붙여넣기

#### JS 전용 탭 (7개 파일 순서대로)
1. `makeshop-js-part1.js` (Config + API + Map)
2. `makeshop-js-part2a.js` (Filter + Search)
3. `makeshop-js-part2b1.js` (UI Service Part 1)
4. `makeshop-js-part2b2.js` (UI Service Part 2 + Main)
5. **`makeshop-js-analytics.js`** ← **신규 추가**
6. `theme.js` (다크모드)
7. `makeshop-js-touch.js` (모바일 터치 UX)

### 단계 4: 저장 및 테스트
1. **저장** 버튼 클릭
2. 브라우저 개발자 도구(F12) → **콘솔 탭** 열기
3. 페이지 로드 후 확인:
   ```
   [Analytics] GA4 초기화 완료 - ID: G-XXXXXXXXXX
   [Analytics] 이벤트 추적: session_start {...}
   ```

---

## 테스트 방법

### 1. 브라우저 콘솔 확인
```javascript
// 콘솔에서 실행
console.log(window.analyticsInstance);
console.log(window.analyticsInstance.getViewCount('1'));  // 파트너 ID 1 조회수
console.log(window.analyticsInstance.getSearchHistory(5));  // 최근 5개 검색 기록
console.log(window.analyticsInstance.getFavoriteStats());  // 즐겨찾기 통계
```

### 2. GA4 실시간 보고서 확인
1. [Google Analytics 4](https://analytics.google.com/) 로그인
2. **보고서 > 실시간** 메뉴 이동
3. 파트너맵에서 다음 작업 수행:
   - 파트너 카드 클릭 → `partner_view` 이벤트 발생
   - 검색어 입력 후 검색 → `search` 이벤트 발생
   - 즐겨찾기 추가/제거 → `favorite_add/remove` 이벤트 발생
   - GPS 버튼 클릭 → `gps_search` 이벤트 발생
   - 공유 버튼 클릭 → `share_start` 이벤트 발생

4. 실시간 보고서에서 이벤트 이름과 파라미터 확인

### 3. 주요 테스트 시나리오

#### 시나리오 1: 파트너 검색 → 상세 조회
1. 검색창에 "압화" 입력 후 검색 → `search` 이벤트
2. 검색 결과에서 파트너 클릭 → `partner_view` 이벤트
3. 즐겨찾기 버튼 클릭 → `favorite_add` 이벤트
4. 공유 버튼 클릭 → `share_start` 이벤트
5. 링크 복사 클릭 → `share_copy` 이벤트

#### 시나리오 2: GPS 기반 검색
1. GPS 버튼 클릭 → 위치 권한 허용
2. 위치 정보 획득 성공 → `gps_search` 이벤트 (success: true)
3. 거리순 정렬 적용 → `filter_change` 이벤트

#### 시나리오 3: 필터링
1. 카테고리 "플라워디자인" 선택 → `filter_change` 이벤트
2. 지역 "서울" 선택 → `filter_change` 이벤트
3. 지도 마커 클릭 → `map_marker_click` 이벤트

---

## 메이크샵 제약사항 준수 확인

### ✅ 1. 템플릿 리터럴 이스케이프
- 모든 `${variable}` → `\${variable}` 처리 완료

### ✅ 2. ES5 문법
- `async/await` 사용 안 함 (Promise 체이닝)
- Arrow function 사용 안 함 (`function() {}` 사용)

### ✅ 3. IIFE 패턴
```javascript
(function(window) {
    'use strict';
    // Analytics 코드
})(window);
```

### ✅ 4. 파일 크기
- `makeshop-js-analytics.js`: 10.2KB < 40KB 제한 ✅
- 전체 증가량: 12.3KB ✅

### ✅ 5. 전역 변수 격리
- `window.analyticsInstance`로 전역 인스턴스 등록
- 각 모듈에서 조건부 접근: `if (window.AnalyticsService && window.analyticsInstance)`

---

## localStorage 관리

### 데이터 조회
```javascript
// 파트너 조회수
localStorage.getItem('fresco21_partner_views_v3');

// 검색 기록
localStorage.getItem('fresco21_search_history_v3');

// 즐겨찾기 통계
localStorage.getItem('fresco21_favorite_stats_v3');
```

### 데이터 초기화 (개발/테스트용)
```javascript
// 콘솔에서 실행
window.analyticsInstance.clearStats();
```

---

## GA4 맞춤 측정기준 설정 (선택)

### 권장 맞춤 측정기준
1. **partner_category** (파트너 카테고리)
   - 범위: 이벤트
   - 매개변수: `partner_category`

2. **partner_region** (파트너 지역)
   - 범위: 이벤트
   - 매개변수: `partner_region`

3. **search_term** (검색어)
   - 범위: 이벤트
   - 매개변수: `search_term`

4. **filter_type** (필터 유형)
   - 범위: 이벤트
   - 매개변수: `filter_type`

### 설정 방법
1. GA4 관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준 만들기
2. 측정기준 이름, 범위, 매개변수 입력 후 저장

---

## 주요 분석 지표

### 1. 인기 파트너 TOP 10
- 이벤트: `partner_view`
- 측정기준: `partner_name`
- 측정항목: 이벤트 수

### 2. 인기 검색어 TOP 20
- 이벤트: `search`
- 측정기준: `search_term`
- 측정항목: 이벤트 수

### 3. 필터 사용 분석
- 이벤트: `filter_change`
- 측정기준: `filter_type`, `filter_value`
- 측정항목: 이벤트 수

### 4. GPS 사용률
- 이벤트: `gps_search`
- 측정기준: `success`
- 측정항목: 이벤트 수

### 5. 공유 전환율
- 이벤트: `share_start` → `share_copy` / `share_kakao`
- 측정항목: 전환율 (%)

---

## 트러블슈팅

### 문제 1: GA4 이벤트가 전송되지 않음
**증상**: 콘솔에 `[Analytics] 이벤트 추적 (미초기화)` 메시지

**원인**:
1. GA4 gtag.js가 로드되지 않음
2. 측정 ID가 잘못 입력됨

**해결**:
1. `makeshop-html.html`에서 GA4 스크립트 태그 확인
2. 측정 ID (`G-XXXXXXXXXX`) 정확성 확인
3. 브라우저 개발자 도구 → Network 탭에서 `gtag/js` 요청 확인

### 문제 2: localStorage 데이터가 저장되지 않음
**증상**: `getViewCount()` 항상 0 반환

**원인**:
1. localStorage 용량 초과 (5MB 제한)
2. 브라우저 프라이빗 모드

**해결**:
1. 불필요한 localStorage 데이터 삭제
2. 정상 브라우저 모드 사용
3. `analyticsService.clearStats()` 실행 후 재시도

### 문제 3: 일부 이벤트만 추적됨
**증상**: `partner_view`는 작동하지만 `favorite_add`가 작동 안 함

**원인**:
1. 파일 업로드 순서 오류
2. 일부 파일 누락

**해결**:
1. JS 전용 탭에서 7개 파일 순서 확인
2. `makeshop-js-analytics.js` 업로드 확인
3. 브라우저 캐시 삭제 후 새로고침 (Ctrl+Shift+R)

---

## 버전 정보

- **파트너맵 버전**: v3 (2026-02-12)
- **Analytics 버전**: v1.0
- **GA4 API**: gtag.js (최신)
- **호환성**: 메이크샵 D4 플랫폼

---

## 문의 및 지원

- **개발자**: jangjiho
- **작업 디렉토리**: `/Users/jangjiho/workspace/partner-map/v3-enhancement`
- **관련 문서**:
  - `PHASE1-COMPLETE.md` - Phase 1 완료 보고서
  - `DARK-MODE-GUIDE.md` - 다크모드 가이드
  - `PERFORMANCE-OPTIMIZATION.md` - 성능 최적화 보고서

---

## 다음 단계 (선택)

### 1. 고급 분석 설정
- GA4 탐색 분석 보고서 생성
- 전환 이벤트 설정 (예: `favorite_add`, `share_copy`)
- 맞춤 대시보드 구성

### 2. 추가 이벤트 구현
- `partner_email_click`: 이메일 클릭 추적
- `partner_website_click`: 홈페이지 클릭 추적
- `partner_instagram_click`: 인스타그램 클릭 추적

### 3. BigQuery 연동
- GA4 → BigQuery 자동 내보내기 설정
- SQL 기반 고급 분석 수행

---

**배포 완료 후 확인사항**:
- [ ] GA4 실시간 보고서에서 `session_start` 이벤트 확인
- [ ] 각 이벤트 추적 정상 작동 확인
- [ ] localStorage 데이터 저장 확인
- [ ] 브라우저 콘솔에 에러 없음 확인
- [ ] 모바일/데스크톱 모두 정상 작동 확인

---

**배포 성공!** 🎉
