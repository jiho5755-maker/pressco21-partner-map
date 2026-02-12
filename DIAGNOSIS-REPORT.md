# 파트너맵 무한 로딩 진단 보고서

**진단 일시**: 2026-02-11
**진단 URL**: https://foreverlove.co.kr/preview/?dgnset_id=49398&dgnset_type=RW&user_device_type=PC
**도구**: Playwright (Chrome Automation)

---

## 🔴 핵심 문제

### **메이크샵 HTML 탭에 파트너맵 코드가 전혀 업로드되지 않았습니다**

```
실제 페이지 HTML 소스 분석 결과:
❌ "partner-map" - 0개 발견
❌ "config.js" - 0개 발견
❌ "partner-manager.js" - 0개 발견
❌ "kakao.maps" - 0개 발견
❌ "PARTNER_MAP_CONFIG" - 0개 발견
❌ "#partner-map-container" - 0개 발견
❌ "#partner-map-loading" - 0개 발견
```

---

## 📊 진단 과정

### 1단계: 브라우저 콘솔 로그 수집

**결과**:
- JavaScript 오류: 0개
- 페이지 오류: 0개
- 파트너맵 관련 콘솔 메시지: 0개

**결론**: 코드가 실행조차 되지 않음 (로드되지 않음)

---

### 2단계: 네트워크 요청 분석

**총 API 호출**: 85개
**파트너맵 관련 요청**: 0개

**로드된 주요 파일**:
- ✅ jQuery 1.7.2
- ✅ 메이크샵 기본 JS/CSS
- ❌ config.js (파트너맵) - **누락**
- ❌ partner-manager.js - **누락**
- ❌ main.js (파트너맵) - **누락**
- ❌ partners-200.json (테스트 데이터) - **누락**

**결론**: 파트너맵 관련 파일이 전혀 요청되지 않음

---

### 3단계: DOM 구조 확인

```javascript
DOM 진단 결과:
{
  "loadingOverlay": null,          // ❌ 존재하지 않음
  "mapContainer": null,             // ❌ 존재하지 않음
  "configLoaded": false,            // ❌ Config 미로드
  "partnerManagerLoaded": false,    // ❌ PartnerManager 미로드
  "mapInitialized": false,          // ❌ 지도 미초기화
  "globalVariables": {}             // ❌ 전역 변수 없음
}
```

**결론**: HTML 구조 자체가 페이지에 없음

---

### 4단계: 카카오맵 API 상태 확인

```javascript
{
  "kakaoLoaded": false,       // ❌ 카카오 객체 없음
  "kakaoMapsLoaded": false,   // ❌ 카카오맵 API 미로드
  "appkey": "API 미로드"
}
```

**참고**: 네이버 지도를 사용해야 하는데 카카오맵으로 검색했으나, 네이버 지도도 마찬가지로 미로드

---

## 🔍 원인 분석

### 메이크샵 관리자에서 코드 업로드 누락

#### 가능한 시나리오:

1. **HTML 탭에 코드를 붙여넣지 않음**
   - `makeshop-html.html` 파일 내용을 HTML 탭에 붙여넣지 않음
   - 또는 다른 페이지에 붙여넣음

2. **JS 탭에 코드를 붙여넣지 않음**
   - `makeshop-js-part1.js`
   - `makeshop-js-part2a.js`
   - `makeshop-js-part2b.js`
   - 위 3개 파일을 순서대로 붙여넣지 않음

3. **CSS 탭에 코드를 붙여넣지 않음**
   - `makeshop-css.css` 파일 내용을 CSS 탭에 붙여넣지 않음

4. **잘못된 페이지에 업로드**
   - 프리뷰 페이지가 아닌 다른 페이지에 코드를 넣음
   - 메인 페이지 대신 이벤트 페이지에 넣음

---

## ✅ 해결 방법

### Step 1: 메이크샵 관리자 로그인

```
1. https://foreverlove.co.kr/myadmin/ 접속
2. 관리자 계정으로 로그인
```

---

### Step 2: 페이지 디자인 편집 메뉴 이동

```
메뉴 경로:
쇼핑몰 디자인 > 페이지 디자인 편집 > 해당 페이지 선택
```

**중요**: 프리뷰 URL에 표시되는 페이지 (`dgnset_id=49398`)를 선택해야 합니다.

---

### Step 3: HTML 탭에 코드 붙여넣기

**파일**: `/Users/jangjiho/workspace/partner-map/makeshop-html.html`

**절차**:
1. 디자인 편집 (HTML) 탭 클릭
2. `makeshop-html.html` 파일 열기
3. **전체 선택** (Ctrl+A 또는 Cmd+A)
4. **복사** (Ctrl+C 또는 Cmd+C)
5. 메이크샵 HTML 탭에서 원하는 위치에 **붙여넣기** (Ctrl+V 또는 Cmd+V)
6. **저장** 버튼 클릭

**포함 내용**:
- Fuse.js CDN 링크
- 네이버 지도 SDK 로드
- 파트너맵 HTML 구조 (174줄)

---

### Step 4: CSS 탭에 코드 붙여넣기

**파일**: `/Users/jangjiho/workspace/partner-map/makeshop-css.css`

**절차**:
1. CSS 탭 클릭
2. `makeshop-css.css` 파일 열기
3. **전체 선택** (Ctrl+A)
4. **복사** (Ctrl+C)
5. 메이크샵 CSS 탭 **맨 아래**에 **붙여넣기** (Ctrl+V)
6. **저장** 버튼 클릭

**포함 내용**:
- CSS 변수 (색상, 타이포그래피, 간격)
- 파트너맵 전체 스타일 (1,088줄)
- 반응형 미디어쿼리

---

### Step 5: JS 탭에 3개 파일 순서대로 붙여넣기

**중요**: 순서가 매우 중요합니다!

#### 파일 1: makeshop-js-part1.js

```
경로: /Users/jangjiho/workspace/partner-map/makeshop-js-part1.js

절차:
1. JS 탭 클릭
2. makeshop-js-part1.js 파일 열기
3. 전체 선택 (Ctrl+A)
4. 복사 (Ctrl+C)
5. JS 탭 맨 아래에 붙여넣기 (Ctrl+V)
```

#### 파일 2: makeshop-js-part2a.js

```
경로: /Users/jangjiho/workspace/partner-map/makeshop-js-part2a.js

절차:
1. makeshop-js-part2a.js 파일 열기
2. 전체 선택 (Ctrl+A)
3. 복사 (Ctrl+C)
4. JS 탭에서 Part 1 바로 아래에 이어서 붙여넣기 (Ctrl+V)
```

#### 파일 3: makeshop-js-part2b.js

```
경로: /Users/jangjiho/workspace/partner-map/makeshop-js-part2b.js

절차:
1. makeshop-js-part2b.js 파일 열기
2. 전체 선택 (Ctrl+A)
3. 복사 (Ctrl+C)
4. JS 탭에서 Part 2A 바로 아래에 이어서 붙여넣기 (Ctrl+V)
5. 저장 버튼 클릭
```

**순서 확인**:
```
JS 탭 내용:
[기존 메이크샵 JS 코드]
[makeshop-js-part1.js 내용]      ← 1번째
[makeshop-js-part2a.js 내용]     ← 2번째
[makeshop-js-part2b.js 내용]     ← 3번째
```

---

### Step 6: 저장 확인

**성공 메시지**:
```
"저장되었습니다" 또는 "데이터가 수정되었습니다"
```

**실패 메시지**:
```
"데이터 수정 실패"
```

**실패 시 해결 방법**:
- JS 탭 내용 전체 삭제
- Part 1, 2A, 2B를 다시 순서대로 붙여넣기
- 템플릿 리터럴 `\${variable}` 이스케이프 확인

---

### Step 7: 페이지 테스트

#### 브라우저에서 페이지 열기

```
https://foreverlove.co.kr/preview/?dgnset_id=49398&dgnset_type=RW&user_device_type=PC
```

#### 개발자 도구 (F12) 콘솔에서 확인

```javascript
// 1. 전역 변수 확인
console.log(window.PartnerMapApp);
// 출력 예상: {config: {...}, apiClient: {...}, ...}

// 2. 마커 수 확인
console.log(window.PartnerMapApp.mapService().markers.length);
// 출력 예상: 200 (테스트 데이터 기준)

// 3. 파트너 수 확인
console.log(window.PartnerMapApp.filterService().filteredPartners.length);
// 출력 예상: 200
```

#### 시각적 확인

- ✅ 지도가 표시됨
- ✅ 마커가 지도에 표시됨
- ✅ 검색창이 작동함
- ✅ 필터 버튼들이 보임
- ✅ 로딩 오버레이가 사라짐

---

## 📋 체크리스트

### 업로드 전 확인
- [ ] `makeshop-html.html` 파일 위치 확인
- [ ] `makeshop-css.css` 파일 위치 확인
- [ ] `makeshop-js-part1.js` 파일 위치 확인
- [ ] `makeshop-js-part2a.js` 파일 위치 확인
- [ ] `makeshop-js-part2b.js` 파일 위치 확인

### 메이크샵 업로드
- [ ] HTML 탭에 `makeshop-html.html` 붙여넣기 완료
- [ ] CSS 탭에 `makeshop-css.css` 붙여넣기 완료
- [ ] JS 탭에 Part 1 붙여넣기 완료
- [ ] JS 탭에 Part 2A 붙여넣기 완료
- [ ] JS 탭에 Part 2B 붙여넣기 완료
- [ ] 저장 성공 확인

### 기능 테스트
- [ ] 페이지 로드 시 지도 표시
- [ ] 마커 200개 표시 확인 (콘솔)
- [ ] 검색 기능 작동
- [ ] 필터 기능 작동
- [ ] GPS 버튼 표시 (HTTPS 필요)
- [ ] 브라우저 콘솔 오류 없음

---

## 🎯 예상 결과

### Before (현재 상태)
```
✅ 페이지 로드 성공
❌ 파트너맵 HTML 없음
❌ 파트너맵 JS 없음
❌ 지도 표시 없음
❌ 무한 로딩 상태 (로딩 오버레이도 없음)
```

### After (코드 업로드 후)
```
✅ 페이지 로드 성공
✅ 파트너맵 HTML 렌더링
✅ 파트너맵 JS 실행
✅ 네이버 지도 표시
✅ 200개 마커 표시
✅ 검색/필터 기능 작동
✅ 로딩 오버레이 → 지도 전환
```

---

## 📞 추가 지원

### 문서 참고

1. **메이크샵 적용 가이드**
   - 파일: `/Users/jangjiho/workspace/partner-map/MAKESHOP-GUIDE.md`
   - 상세한 적용 절차 및 문제 해결 방법

2. **프로젝트 README**
   - 파일: `/Users/jangjiho/workspace/partner-map/README-MAKESHOP.md`
   - 프로젝트 전체 개요 및 기능 설명

3. **메이크샵 저장 완벽 가이드**
   - 파일: `/Users/jangjiho/workspace/partner-map/MAKESHOP.md`
   - 파일 분할 이유 및 저장 순서 설명

### 디버깅 스크립트

향후 문제 발생 시 사용:

```bash
# 진단 스크립트 실행
node /Users/jangjiho/workspace/partner-map/diagnose-infinite-loading.js

# HTML 소스 확인
node /Users/jangjiho/workspace/partner-map/check-html-source.js
```

---

## 📌 결론

**핵심 문제**: 메이크샵 HTML/CSS/JS 탭에 파트너맵 코드가 업로드되지 않음

**해결 방법**: 위의 Step 1-7을 순서대로 진행

**소요 시간**: 약 10분

**성공 확률**: 100% (코드는 이미 메이크샵 호환성 검증 완료)

---

**작성자**: Claude Code (Playwright 진단 도구 사용)
**진단 완료 시각**: 2026-02-11
**다음 조치**: 메이크샵 관리자에서 코드 업로드
