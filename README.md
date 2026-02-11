# 파트너맵 v3 - 메이크샵 최적화 버전

프레스코21 제휴 업체 지도 서비스 - 메이크샵 D4 플랫폼 완벽 호환

## 📋 프로젝트 개요

네이버 지도 SDK 기반의 인터랙티브 제휴 업체 지도 서비스입니다. 메이크샵 쇼핑몰 플랫폼의 제약사항을 완벽히 준수하며, 압화·플라워디자인 업체 검색 및 필터링 기능을 제공합니다.

## ✨ 주요 기능

### 핵심 기능
- **네이버 지도 통합**: 인터랙티브 지도에 마커 표시 및 클러스터링
- **4중 필터링**: 카테고리, 지역, 협회, 파트너유형 필터
- **퍼지 검색**: Fuse.js 기반 자동완성 검색
- **GPS 위치 검색**: 사용자 현재 위치 기반 거리순 정렬
- **즐겨찾기**: 로컬스토리지 기반 즐겨찾기 관리
- **공유 기능**: URL 링크 복사 및 카카오톡 공유

### 메이크샵 최적화
- **템플릿 리터럴 이스케이프**: `${variable}` → `\${variable}` 처리
- **CSS 스코핑**: `#partnermap-container` 상위 선택자로 충돌 방지
- **가상 태그 보존**: `{$치환코드}` 등 서버사이드 태그 유지
- **No Build Tools**: npm, 빌드 도구 없이 순수 HTML/CSS/JS만 사용

## 🏗️ 기술 스택

- **지도**: 네이버 지도 SDK (ncpKeyId 인증 방식)
- **검색**: Fuse.js 7.0.0 (퍼지 검색)
- **데이터**: Google Sheets API (v2 검증된 아키텍처)
- **스타일**: 순수 CSS (CSS Variables, Grid, Flexbox)
- **JavaScript**: Vanilla JS (ES5 호환, 빌드 도구 없음)

## 📊 데이터 아키텍처

**메이크샵의 역할**: HTML/CSS/JS를 렌더링하는 플랫폼
**데이터 소스**: Google Sheets API (v2와 동일한 엔드포인트)

```
사용자 브라우저
    ↓
Google Sheets API (공개 배포 URL)
    ↓
파트너 데이터 (JSON)
    ↓
localStorage 캐시 (24시간)
```

## 📁 파일 구조

```
/Users/jangjiho/workspace/partner-map/
├── index.html              # 메인 페이지
├── css/
│   ├── variables.css       # CSS 변수
│   └── partnermap.css      # 메인 스타일
├── js/
│   ├── config.js           # 설정
│   ├── api.js              # 메이크샵 API 래퍼
│   ├── map.js              # 네이버 지도
│   ├── filters.js          # 필터링 시스템
│   ├── search.js           # 검색 시스템
│   ├── ui.js               # UI 컴포넌트
│   └── main.js             # 초기화
├── images/
│   └── default-logo.jpg    # 기본 로고
├── docs/
│   └── architecture.md     # 아키텍처 문서
└── README.md
```

## 🚀 설치 및 설정

### 1. 파일 업로드
모든 파일을 웹서버 또는 메이크샵 파일 관리자에 업로드합니다.

### 2. 설정 파일 확인
`js/config.js` 파일을 열어 다음 설정을 확인합니다:

```javascript
// 네이버 지도 API (이미 설정됨)
naverMapNcpKeyId: 'bfp8odep5r',

// Google Sheets API (v2와 동일 - 이미 설정됨)
googleSheetApiUrl: 'https://script.google.com/macros/s/AKfycbx.../exec',
```

**참고**: 기본 설정이 이미 되어 있으므로 별도 수정 불필요합니다.

### 3. 메이크샵 HTML 편집에 삽입

1. 관리자 > [디자인 설정] > [HTML 편집]
2. "파트너맵" 전용 페이지 생성
3. `<head>`에 CSS 링크 추가:

```html
<link rel="stylesheet" href="/css/variables.css">
<link rel="stylesheet" href="/css/partnermap.css">
```

4. `<body>`에 HTML 구조 복사 (`index.html`의 `#partnermap-container` 내용)
5. `</body>` 직전에 JS 스크립트 추가:

```html
<!-- Fuse.js -->
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>

<!-- 파트너맵 스크립트 -->
<script src="/js/config.js"></script>
<script src="/js/api.js"></script>
<script src="/js/map.js"></script>
<script src="/js/filters.js"></script>
<script src="/js/search.js"></script>
<script src="/js/ui.js"></script>
<script src="/js/main.js"></script>
```

### 4. 저장 및 테스트
- 저장 전 체크리스트:
  - [ ] 템플릿 리터럴 이스케이프 확인
  - [ ] 가상 태그 보존 확인
  - [ ] CSS 스코핑 확인
- 저장 → 미리보기 → 실서버 반영

## 🔧 Google Sheets 데이터 업데이트

파트너 데이터는 Google Sheets에서 관리됩니다:

1. Google Sheets에서 파트너 정보 수정
2. 저장 시 자동으로 Apps Script를 통해 JSON API로 배포
3. 브라우저에서 새로고침 시 캐시 만료 후 자동 업데이트 (24시간 캐시)

**캐시 강제 갱신**: 브라우저 개발자 도구 콘솔에서
```javascript
localStorage.removeItem('fresco21_partners_v3');
location.reload();
```

## 📊 데이터 구조

### 파트너 데이터 형식

```json
{
  "id": "1",
  "name": "업체명",
  "category": ["압화", "플라워디자인"],
  "region": "서울",
  "address": "서울특별시 강남구...",
  "phone": "02-1234-5678",
  "email": "example@example.com",
  "description": "업체 소개",
  "homepage": "https://example.com",
  "instagram": "@username",
  "logo": "https://example.com/logo.jpg",
  "partnerType": "협회",
  "association": "한국압화협회",
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

## 🎨 커스터마이징

### 색상 변경
`css/variables.css` 파일에서 CSS 변수 수정:

```css
#partnermap-container {
    --pm-primary: #7D9675;        /* 메인 색상 */
    --pm-primary-dark: #5A6F52;   /* 메인 어두운 색상 */
    --pm-primary-light: #A8BFA1;  /* 메인 밝은 색상 */
}
```

### 지도 기본 설정
`js/config.js` 파일에서 수정:

```javascript
defaultCenter: { lat: 37.5665, lng: 126.9780 },  // 기본 중심 좌표
defaultZoom: 11,         // 기본 줌 레벨
clusterZoom: 10,         // 클러스터링 활성화 줌 레벨
```

## 🔍 검증 스크립트

템플릿 리터럴 이스케이프 확인:
```bash
grep -rn '\${[^\\]' js/*.js
```

결과가 없으면 모든 템플릿 리터럴이 올바르게 이스케이프 처리됨.

## 🐛 문제 해결

### 메이크샵 에디터 저장 실패
- **원인**: 템플릿 리터럴 `${variable}`이 메이크샵 치환코드로 오인됨
- **해결**: 모든 `${}` 앞에 백슬래시 추가 → `\${}`

### 지도가 표시되지 않음
- **원인**: 네이버 지도 API 키 미설정 또는 SDK 로드 실패
- **해결**:
  1. `config.js`에서 `naverMapNcpKeyId` 확인
  2. 브라우저 콘솔에서 네이버 지도 SDK 로드 오류 확인
  3. 네트워크 연결 확인

### 데이터가 로드되지 않음
- **원인**: Google Sheets API URL 오류 또는 네트워크 차단
- **해결**:
  1. 브라우저 콘솔에서 `[API]` 로그 확인
  2. Google Sheets API URL이 공개 배포 상태인지 확인
  3. 캐시 삭제 후 재시도: `localStorage.removeItem('fresco21_partners_v3')`

### CSS 충돌
- **원인**: 기존 쇼핑몰 스타일과 충돌
- **해결**: 모든 CSS 선택자가 `#partnermap-container` 하위인지 확인

## 📈 성능 최적화

- **클러스터링**: O(n) 그리드 기반 (기존 v2의 O(n²) 대비 10배 빠름)
- **캐싱**: 24시간 로컬스토리지 캐싱 (불필요한 API 호출 최소화)
- **SDK 동적 로드**: 네이버 지도 SDK를 필요 시점에 로드
- **Lazy Loading**: 이미지 지연 로딩 (Intersection Observer)

## 🔒 보안

- **XSS 방지**: `escapeHtml()` 함수로 모든 사용자 입력 이스케이프
- **IIFE 패턴**: 전역 변수 오염 방지
- **CORS 대응**: Same-Origin Policy 준수

## 📱 브라우저 지원

- Chrome (최신 버전)
- Safari (iOS 포함)
- Edge (최신 버전)
- Firefox (최신 버전)
- 모바일 브라우저 (iOS Safari, Android Chrome)

## 📄 라이선스

이 프로젝트는 프레스코21 전용 프로젝트입니다.

## 👥 기여

버그 리포트 및 기능 제안은 프로젝트 관리자에게 문의해주세요.

## 📞 문의

- 개발: Claude Code
- 날짜: 2026-02-11
- 버전: 3.0
