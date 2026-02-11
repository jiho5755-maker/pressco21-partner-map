# 파트너맵 v3 - 메이크샵 D4 플랫폼

프레스코21 전국 제휴 업체 지도 - 3-Part 분할 빌드 방식

## 🎯 메이크샵 저장 방법 (중요!)

### 파일 분할 방식

메이크샵 D4는 **단일 파일 크기 제한**(약 30-40KB)이 있습니다.
따라서 3개 파일로 분할하여 저장해야 합니다.

### 1단계: HTML 탭

```
메이크샵 관리자 > 쇼핑몰 디자인 > 페이지 디자인 편집 > HTML 탭
```

**파일**: `makeshop-html.html`
**방법**: 전체 내용 복사 → 붙여넣기 → 저장

### 2단계: JS 탭

```
메이크샵 관리자 > 쇼핑몰 디자인 > 페이지 디자인 편집 > JS 탭
```

**중요**: 3개 파일을 **순서대로** 붙여넣기!

```
1. makeshop-js-part1.js 전체 복사-붙여넣기
   ↓ Part 1 바로 아래에 이어서
2. makeshop-js-part2a.js 전체 복사-붙여넣기
   ↓ Part 2A 바로 아래에 이어서
3. makeshop-js-part2b.js 전체 복사-붙여넣기
   → 저장 버튼 클릭
```

### 파일 구조

```
Part 1  (Config + API + Map)     - 기본 설정 및 지도
Part 2A (Filters + Search)       - 필터 및 검색
Part 2B (UI + Main)              - UI 및 초기화
```

상세한 저장 가이드는 [MAKESHOP.md](./MAKESHOP.md)를 참조하세요.

---

## 🔨 개발 및 빌드

### 빌드 명령어

```bash
# 기본 빌드 (원본 버전)
npm run build

# 압축 빌드 (주석 제거)
npm run build:minify

# 빌드 파일 삭제
npm run clean

# 실패한 파일 아카이브로 이동
npm run archive
```

### 파일 수정 후 재빌드

```bash
# 1. js/ 폴더의 원본 파일 수정
vim js/ui.js

# 2. 빌드
npm run build

# 3. 메이크샵에 다시 저장
# - JS 탭 내용 전체 삭제
# - Part 1, 2A, 2B 순서대로 붙여넣기
```

---

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
partner-map/
├── js/                      # 원본 소스 (편집용)
│   ├── config.js           # 설정
│   ├── api.js              # API 클라이언트
│   ├── map.js              # 지도 서비스
│   ├── filters.js          # 필터 서비스
│   ├── search.js           # 검색 서비스
│   ├── ui.js               # UI 서비스
│   └── main.js             # 초기화
│
├── makeshop-html.html       # 메이크샵 HTML 탭용
├── makeshop-js-part1.js     # Part 1 (메이크샵 JS 탭용)
├── makeshop-js-part2a.js    # Part 2A
├── makeshop-js-part2b.js    # Part 2B
│
├── build.sh                 # 빌드 스크립트
├── package.json             # npm 설정
├── README.md                # 이 문서
├── MAKESHOP.md              # 메이크샵 저장 가이드
│
├── archive/                 # 실패한 버전 보관
│   └── failed-attempts/
│
├── css/
│   ├── variables.css
│   └── partnermap.css
├── images/
│   └── default-logo.jpg
└── docs/
    └── architecture.md
```

## 🚨 주의사항

### 메이크샵 D4 제약사항

1. **파일 크기**: 단일 파일 30-40KB 제한
2. **템플릿 리터럴**: `\${변수}` 사용 시 `\\\${변수}`로 이스케이프 필수
3. **가상 태그**: `{$치환코드}` 절대 삭제 금지
4. **빌드 도구**: npm/webpack 사용 불가, Vanilla JS만 사용

### 코드 수정 시 주의

- `js/` 폴더의 원본 파일만 수정
- `makeshop-js-part*.js`는 빌드로 자동 생성됨
- 수정 후 반드시 `npm run build` 실행
- 의존성 순서 유지: config → api → map → filters → search → ui → main

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

## 🧪 테스트

### 브라우저 콘솔 테스트

```javascript
// 1. 앱 초기화 확인
console.log(window.PartnerMapApp);

// 2. 네이버 지도 SDK 확인
console.log(window.naver && window.naver.maps);

// 3. 마커 수 확인
console.log(window.PartnerMapApp.mapService().markers.length);
```

### 기능 체크리스트

- [ ] 지도 표시
- [ ] 마커 표시
- [ ] 검색 기능
- [ ] 필터 기능 (카테고리, 지역, 협회, 파트너 유형)
- [ ] GPS 위치 기능
- [ ] 파트너 상세 모달
- [ ] 즐겨찾기
- [ ] 공유 기능

---

## 📚 문제 해결

### Q: "데이터 수정 실패" 오류

**원인**: 파일 크기 초과 또는 잘못된 순서
**해결**:
1. Part 1, 2A, 2B를 정확한 순서로 붙여넣었는지 확인
2. 각 파일 전체 내용이 복사되었는지 확인
3. 빌드를 다시 실행해서 최신 파일인지 확인

### Q: 지도가 표시되지 않음

**원인**: HTML 탭에 네이버 SDK 누락
**해결**: HTML 탭에 다음 코드 포함 확인
```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=bfp8odep5r"></script>
```

### Q: 빌드 후 파일이 생성되지 않음

**원인**: js/ 폴더의 원본 파일 누락
**해결**:
```bash
ls js/
# config.js, api.js, map.js, filters.js, search.js, ui.js, main.js 확인
```

### Q: 데이터가 로드되지 않음

**원인**: Google Sheets API URL 오류 또는 네트워크 차단
**해결**:
1. 브라우저 콘솔에서 `[API]` 로그 확인
2. Google Sheets API URL이 공개 배포 상태인지 확인
3. 캐시 삭제 후 재시도: `localStorage.removeItem('fresco21_partners_v3')`

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

## 📝 변경 이력

### v3.0.0 (2026-02-11)
- ✅ 메이크샵 D4 3-Part 분할 방식 적용
- ✅ createElement 제거 (insertAdjacentHTML 사용)
- ✅ 네이버 지도 SDK HTML 직접 로드
- ✅ 빌드 스크립트 작성
- ✅ 파일 크기 제한 문제 해결 (30-40KB 단위 분할)

### 핵심 발견

- ❌ 문제: 57KB 단일 파일 저장 실패
- ✅ 해결: 3개 분할 파일 (Part1 + Part2A + Part2B) 저장 성공
- 🔍 원인: 메이크샵의 **단일 파일 크기 제한** (약 30-40KB 추정)
- 💡 놀라운 점: 압축 안 한 원본 버전(90KB 합계)도 분할하면 저장됨!

### v2.0.0
- Google Sheets 기반 아키텍처

---

## 📞 문의

문제가 발생하면 이슈를 등록해주세요.
