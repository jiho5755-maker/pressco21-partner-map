# 파트너맵 v3 - 메이크샵 적용 가이드

## 📋 생성 완료된 파일

| 파일명 | 용도 | 라인 수 | 메이크샵 탭 |
|--------|------|---------|------------|
| `makeshop-html.html` | HTML 구조 | 174줄 | 디자인 편집 |
| `makeshop-css.css` | 스타일 | 1,088줄 | CSS |
| `makeshop-js.js` | JavaScript | 2,777줄 | JS |
| **총계** | | **4,039줄** | |

---

## 🚀 메이크샵 적용 절차

### 1단계: 메이크샵 관리자 접속

1. **메이크샵 관리자 로그인**
2. **쇼핑몰 디자인 > 페이지 디자인 편집** 메뉴 이동
3. 파트너맵을 넣을 페이지 선택 (예: 커스텀 페이지)

---

### 2단계: 디자인 편집 탭 (HTML)

**파일**: `makeshop-html.html`

1. **디자인 편집 (HTML) 탭** 클릭
2. `makeshop-html.html` 파일 내용 **전체 복사**
3. 원하는 위치에 **붙여넣기**

**⚠️ 주의사항**:
- 메이크샵 가상 태그(`{$치환코드}`)가 있다면 **절대 삭제하지 마세요**
- 다른 HTML 코드와 충돌하지 않도록 위치 선정

**포함 내용**:
- ✅ Fuse.js CDN 링크
- ✅ 전체 HTML 구조 (컨테이너, 검색, 필터, 지도, 리스트, 모달)
- ✅ 총 174줄

---

### 3단계: CSS 탭

**파일**: `makeshop-css.css`

1. **CSS 탭** 클릭
2. `makeshop-css.css` 파일 내용 **전체 복사**
3. **붙여넣기**

**⚠️ 주의사항**:
- `<style>` 태그는 **입력하지 마세요** (순수 CSS만)
- 기존 CSS가 있다면 **맨 아래에 추가**

**포함 내용**:
- ✅ CSS 변수 (224줄): 색상, 타이포그래피, 간격 등
- ✅ 메인 스타일 (864줄): 모든 컴포넌트 스타일
- ✅ 반응형 미디어쿼리
- ✅ 애니메이션 (스피너, 펄스)
- ✅ 모든 스타일이 `#partnermap-container` 범위로 스코핑 (충돌 없음)

---

### 4단계: JS 탭

**파일**: `makeshop-js.js`

1. **JS 탭** 클릭
2. `makeshop-js.js` 파일 내용 **전체 복사**
3. **붙여넣기**

**⚠️ 주의사항**:
- `<script>` 태그는 **입력하지 마세요** (순수 JS만)
- 기존 JavaScript가 있다면 **맨 아래에 추가**
- **병합 순서가 매우 중요합니다** (의존성 때문)

**포함 내용** (의존성 순서):
1. ✅ `config.js` (217줄) - 전역 설정
2. ✅ `api.js` (251줄) - 데이터 API
3. ✅ `map.js` (571줄) - 네이버 지도
4. ✅ `filters.js` (593줄) - 필터 시스템
5. ✅ `search.js` (294줄) - 검색 시스템
6. ✅ `ui.js` (544줄) - UI 컴포넌트
7. ✅ `main.js` (307줄) - 초기화

---

### 5단계: 설정 변경 (중요!)

**파일**: `makeshop-js.js` 내부의 CONFIG 객체

메이크샵 환경에 맞게 다음 값들을 수정하세요:

```javascript
// 1. 테스트 모드 (운영 시 false로 변경)
useTestData: false,  // 개발: true, 운영: false

// 2. 테스트 데이터 경로 (메이크샵 파일 서버 경로로 조정)
testDataPath: '/쇼핑몰파일경로/test-data/partners-200.json',

// 3. 기본 로고 이미지 경로
defaultLogoPath: '/쇼핑몰파일경로/images/default-logo.jpg',

// 4. Google Sheets API URL (운영 데이터 소스)
googleSheetApiUrl: 'https://script.google.com/macros/s/.../exec',

// 5. 네이버 지도 API 키 (메이크샵 도메인에서 유효한지 확인)
naverMapNcpKeyId: 'bfp8odep5r',
```

**설정 위치**: `makeshop-js.js` 파일 상단 약 7~22줄

---

### 6단계: 저장 및 테스트

1. **저장 버튼 클릭**
   - "데이터 수정 실패" 오류 발생 시 → 템플릿 리터럴 `${variable}` 확인
   - ✅ **현재 코드는 모두 `+` 연산자 사용으로 안전합니다**

2. **페이지 미리보기**
   - 지도 표시 확인
   - 검색 기능 확인
   - 필터 기능 확인
   - GPS 기능 확인 (HTTPS 필요)

3. **브라우저 콘솔 확인** (F12)
   ```javascript
   // 설정 확인
   window.PartnerMapApp.config

   // 마커 수 확인
   window.PartnerMapApp.mapService().markers.length

   // 파트너 수 확인
   window.PartnerMapApp.filterService().filteredPartners.length
   ```

---

## ✅ 검증 체크리스트

### 메이크샵 저장 성공
- [ ] HTML 탭 저장 성공
- [ ] CSS 탭 저장 성공
- [ ] JS 탭 저장 성공
- [ ] "데이터 수정 실패" 오류 없음

### 기능 동작 확인
- [ ] 페이지 로드 시 지도 표시
- [ ] 마커 표시 (콘솔: `window.PartnerMapApp.mapService().markers.length`)
- [ ] 검색 기능 작동 (자동완성)
- [ ] 필터 기능 작동 (카테고리, 지역, 협회, 파트너 유형, 즐겨찾기)
- [ ] 정렬 기능 작동 (이름순, 거리순, 최근 추가순)
- [ ] 지도 클릭 시 기준점 설정 (📍 마커 표시)
- [ ] GPS 버튼 작동 (HTTPS 환경)
- [ ] 파트너 카드 클릭 시 모달 표시
- [ ] 즐겨찾기 추가/제거 (localStorage)
- [ ] 토스트 알림 표시

### 성능 확인
- [ ] 초기 로드 < 3초
- [ ] 지도 클러스터링 정상 작동
- [ ] 필터링/정렬 < 100ms
- [ ] 메모리 누수 없음

### 스타일 확인
- [ ] 반응형 디자인 작동 (모바일/태블릿/데스크톱)
- [ ] 기존 메이크샵 스타일과 충돌 없음
- [ ] CSS 스코핑 정상 (`#partnermap-container`)

---

## ⚠️ 문제 해결

### 1. 지도가 표시되지 않을 때

**원인**:
- 네이버 지도 API 키가 유효하지 않음
- 메이크샵 도메인이 허용 목록에 없음

**해결**:
1. [네이버 클라우드 플랫폼](https://console.ncloud.com) 접속
2. AI·Application Service > Maps > Application 메뉴
3. 서비스 URL에 메이크샵 도메인 추가
4. API 키 확인 및 `naverMapNcpKeyId` 값 업데이트

---

### 2. 마커가 표시되지 않을 때

**원인**:
- 데이터 로드 실패
- 좌표 필드명 불일치

**해결**:
1. 브라우저 콘솔 (F12) 확인
   ```javascript
   window.PartnerMapApp.apiClient().loadPartnerData().then(data => console.log(data))
   ```
2. 데이터에 `latitude`, `longitude` 필드가 있는지 확인
3. `testDataPath` 또는 `googleSheetApiUrl` 설정 확인

---

### 3. GPS 기능이 작동하지 않을 때

**원인**:
- HTTPS가 아닌 HTTP 사용
- 위치 권한 거부

**해결**:
- 메이크샵 쇼핑몰이 HTTPS로 운영되는지 확인
- 브라우저 설정에서 위치 권한 허용

---

### 4. "데이터 수정 실패" 오류 발생

**원인**:
- 템플릿 리터럴 `${variable}` 사용 (메이크샵이 치환코드로 오인)

**해결**:
- ✅ **현재 코드는 모두 `+` 연산자 사용으로 안전합니다**
- 만약 발생한다면, `${` 패턴 검색하여 `\${` 또는 `+` 연산자로 변경

---

### 5. Google Sheets API CORS 오류

**원인**:
- Google Apps Script에서 응답 헤더 미설정

**해결**:
1. Google Apps Script 편집기 열기
2. `doGet()` 함수에 CORS 헤더 추가:
   ```javascript
   function doGet(e) {
     var data = getPartnerData();

     return ContentService
       .createTextOutput(JSON.stringify(data))
       .setMimeType(ContentService.MimeType.JSON)
       .setHeader('Access-Control-Allow-Origin', '*')
       .setHeader('Access-Control-Allow-Methods', 'GET');
   }
   ```
3. 배포 > 새 배포 > 버전 업데이트

---

## 🎯 개발 모드 vs 운영 모드

### 개발 모드 (테스트 데이터)

```javascript
// config.js 내부
useTestData: true,
testDataPath: '/test-data/partners-200.json',
```

**특징**:
- 로컬 JSON 파일 사용
- API 호출 없음
- 빠른 개발/테스트

---

### 운영 모드 (Google Sheets)

```javascript
// config.js 내부
useTestData: false,
googleSheetApiUrl: 'https://script.google.com/macros/s/.../exec',
```

**특징**:
- 실시간 데이터 업데이트
- 관리자가 Google Sheets에서 직접 편집
- 24시간 캐싱 적용

---

## 📚 추가 정보

### 전역 변수

메이크샵 JS 탭에서 사용 가능한 전역 변수:

```javascript
window.CONFIG                  // 설정 객체
window.PartnerAPI              // API 클라이언트 클래스
window.MapService              // 지도 서비스 인스턴스
window.FilterService           // 필터 서비스 인스턴스
window.SearchService           // 검색 서비스 인스턴스
window.UIService               // UI 서비스 인스턴스
window.PartnerMapApp           // 통합 앱 객체
```

**디버깅 예시**:
```javascript
// 전체 설정 보기
console.log(window.PartnerMapApp.config);

// 현재 마커 수 확인
console.log(window.PartnerMapApp.mapService().markers.length);

// 필터된 파트너 수 확인
console.log(window.PartnerMapApp.filterService().filteredPartners.length);

// 캐시 삭제
localStorage.removeItem('fresco21_partners_v3');

// 즐겨찾기 초기화
localStorage.removeItem('fresco21_favorites_v3');
```

---

### 로컬스토리지 사용

```javascript
// 캐시
localStorage['fresco21_partners_v3']

// 즐겨찾기
localStorage['fresco21_favorites_v3']
```

**캐시 만료**: 24시간 후 자동 삭제

---

### 외부 의존성

1. **Fuse.js** (CDN)
   - URL: `https://cdn.jsdelivr.net/npm/fuse.js@7.0.0`
   - 용도: 검색 기능
   - 필수 여부: 필수 (없으면 기본 검색으로 Fallback)

2. **네이버 지도 SDK** (동적 로드)
   - URL: `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId={키}`
   - 용도: 지도 표시
   - 필수 여부: 필수

3. **Google Sheets API** (선택)
   - 용도: 운영 데이터 소스
   - 필수 여부: 선택 (테스트 모드에서는 불필요)

---

## 🎉 완료!

메이크샵 통합이 완료되었습니다!

**다음 단계**:
- 실제 파트너 데이터 추가
- Google Sheets 연동 (선택)
- 도메인별 API 키 설정
- 운영 환경 테스트

**문의 사항이 있으시면 프로젝트 관리자에게 연락하세요.**

---

## 📝 파일 구조

```
/workspace/partner-map/
├── makeshop-html.html      (메이크샵 디자인 편집 탭용, 174줄)
├── makeshop-css.css        (메이크샵 CSS 탭용, 1,088줄)
├── makeshop-js.js          (메이크샵 JS 탭용, 2,777줄)
├── MAKESHOP-GUIDE.md       (이 가이드 문서)
│
├── index.html              (개발용 원본)
├── css/
│   ├── variables.css
│   └── partnermap.css
└── js/
    ├── config.js
    ├── api.js
    ├── map.js
    ├── filters.js
    ├── search.js
    ├── ui.js
    └── main.js
```

---

**생성일**: 2026-02-11
**버전**: v3.0
**파일 개수**: 3개 (HTML, CSS, JS)
**총 라인 수**: 4,039줄
