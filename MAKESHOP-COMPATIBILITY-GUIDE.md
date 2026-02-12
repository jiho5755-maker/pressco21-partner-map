# 메이크샵 D4 플랫폼 호환성 가이드

## 📊 현재 확인된 호환성 (실전 테스트 결과)

### ✅ 사용 가능 (저장 성공)

#### HTML
- **기본 태그**: `<div>`, `<span>`, `<p>`, `<h1-h6>`, `<ul>`, `<li>`, `<a>`, `<img>`
- **폼 요소**: `<button type="button">`, `<input>`, `<select>`, `<textarea>`
- **시맨틱 태그**: `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`
- **데이터 속성**: `data-*` (예: `data-partner-id="123"`)
- **ARIA 속성**: `aria-label`, `role` 등

#### CSS
- **클래스/ID**: 자유롭게 사용 가능
- **CSS Variables**: `--변수명` (메이크샵 변수와 충돌 없음)
- **모든 CSS3 속성**: Grid, Flexbox, Transform, Animation 등
- **미디어 쿼리**: `@media (max-width: 768px)` 등
- **의사 클래스**: `:hover`, `:focus`, `:nth-child()` 등
- **의사 요소**: `::before`, `::after` 등

#### JavaScript (ES5 기준)
- **기본 문법**: `var`, `function`, `if/else`, `for/while`
- **DOM API**: `getElementById`, `querySelector`, `addEventListener`
- **Promise**: `.then()`, `.catch()` (ES6 Promise 지원)
- **Array 메서드**: `map`, `filter`, `forEach`, `find`, `reduce` 등
- **JSON**: `JSON.parse()`, `JSON.stringify()`
- **localStorage**: `getItem`, `setItem`, `removeItem`
- **fetch API**: 외부 API 호출 가능
- **타이머**: `setTimeout`, `setInterval`
- **이벤트**: `click`, `submit`, `keydown`, `change` 등

#### 외부 라이브러리 (CDN)
- **jQuery**: 가능 (메이크샵 자체 포함)
- **Fuse.js**: ✅ 테스트 완료
- **네이버 지도 SDK**: ✅ 테스트 완료
- **Font Awesome**: 아이콘 폰트 사용 가능
- **Google Fonts**: 웹 폰트 로드 가능

#### 아이콘/이미지
- **HTML 엔티티**: `&hearts;` (♥), `&copy;` (©) 등
- **SVG 인라인**: `<svg>` 태그 직접 삽입 가능
- **외부 이미지**: CDN, 상대경로, 절대경로 모두 가능
- **Base64 인코딩**: Data URI 사용 가능

---

### ❌ 사용 불가 (저장 실패 확인)

#### 문자/기호
- **UTF-8 4바이트 이모지**: 📍, 📞, ❤️, 🗺️, 📷 등
  - **대안**: HTML 엔티티 (♥, ♡), 텍스트, CSS 아이콘
- **일부 특수 유니코드**: 4바이트 문자 전반

#### JavaScript
- **async/await**: ES2017+ 문법
  - **대안**: Promise 체이닝 (`.then()`)
- **템플릿 리터럴**: `` `${변수}` ``
  - **대안**: `'문자열 ' + 변수 + '문자열'` 또는 `\${변수}`
- **화살표 함수**: `() => {}` (일부 환경)
  - **대안**: `function() {}`
- **let/const**: (안전하게는 `var` 권장)
- **Destructuring**: `const {a, b} = obj`
- **Spread 연산자**: `...array`
- **import/export**: ES6 모듈

#### HTML 속성
- **인라인 이벤트 핸들러**: `onclick="함수()"`, `onerror="this.src='...'"`
  - **대안**: `addEventListener` 또는 이벤트 위임
- **복잡한 인라인 스타일**: 긴 `style=""` 속성
  - **대안**: CSS 클래스 사용

#### URL 패턴 (일부)
- **절대 URL**: `https://example.com` (컨텍스트에 따라 차단 가능)
  - **대안**: `//example.com` (프로토콜 상대 URL)

#### 코드 패턴
- **긴 문자열 연결**: 15줄 이상 `+` 연산자 연속 사용
  - **대안**: 중간 변수로 분리
- **큰 파일**: 40KB 초과 단일 파일
  - **대안**: 여러 파일로 분할

---

## 🎨 디자인 요소별 권장 방법

### 1. 아이콘 표시

#### 방법 A: HTML 엔티티 (가장 안전)
```html
<span class="icon">♥</span> 즐겨찾기
<span class="icon">☎</span> 전화
<span class="icon">✉</span> 이메일
<span class="icon">⌂</span> 홈
```

**장점**: 추가 로드 없음, 100% 호환
**단점**: 선택지 제한적

#### 방법 B: Font Awesome (CDN)
```html
<!-- HTML 탭 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 사용 -->
<i class="fa-solid fa-heart"></i>
<i class="fa-solid fa-phone"></i>
<i class="fa-solid fa-envelope"></i>
```

**장점**: 다양한 아이콘, 커스터마이징 용이
**단점**: 외부 리소스 로드 필요

#### 방법 C: SVG 인라인
```html
<svg width="20" height="20" viewBox="0 0 24 24">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
```

**장점**: 완전한 커스터마이징, 애니메이션 가능
**단점**: 코드 길이 증가

#### 방법 D: CSS 아이콘 (::before/::after)
```css
.icon-heart::before {
  content: "♥";
  color: red;
  font-size: 20px;
}
```

**장점**: HTML 간결, CSS로 제어
**단점**: 구조적 분리

---

### 2. 색상 시스템

#### CSS Variables (권장)
```css
:root {
  --primary-color: #7D9675;
  --secondary-color: #C9A961;
  --accent-color: #5A7FA8;
  --gray-100: #F5F5F5;
  --gray-900: #212121;
}

.button {
  background-color: var(--primary-color);
}
```

**장점**: 중앙 관리, 테마 변경 용이
**단점**: 없음 (완벽 호환)

---

### 3. 레이아웃

#### Flexbox (권장)
```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

#### Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

**호환성**: 완벽 지원

---

### 4. 애니메이션

#### CSS Transitions (권장)
```css
.button {
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

#### CSS Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  animation: fadeIn 0.3s ease;
}
```

**호환성**: 완벽 지원

---

### 5. 반응형 디자인

```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .container {
    padding: 3rem;
  }
}
```

**호환성**: 완벽 지원

---

### 6. 타이포그래피

#### Google Fonts
```html
<!-- HTML 탭 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
/* CSS 탭 */
body {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

**호환성**: 완벽 지원

---

## 📞 메이크샵 고객센터 질문 템플릿

### 질문 1: HTML/CSS/JS 공식 지원 범위

```
제목: 스마트디자인 편집 - HTML/CSS/JavaScript 공식 지원 범위 문의

안녕하세요.

스마트디자인 편집 기능을 사용하여 커스텀 페이지를 제작 중입니다.
안정적인 개발을 위해 공식 지원 범위를 확인하고자 문의드립니다.

1. HTML/CSS/JavaScript 버전
   - 지원하는 HTML 버전은 무엇인가요? (HTML5 완전 지원 여부)
   - CSS 버전은? (CSS3 지원 여부)
   - JavaScript ES 버전은? (ES5/ES6 지원 범위)

2. 파일 크기 제한
   - 단일 파일 최대 크기 제한이 있나요?
   - HTML/CSS/JS 각 탭별 제한이 있나요?

3. 외부 리소스 로드
   - CDN 사용 가능 여부 (jQuery, Font Awesome 등)
   - 외부 API 호출 제한 (CORS 정책)

4. 보안 필터
   - 저장 시 차단되는 특정 패턴이나 키워드가 있나요?
   - 인라인 JavaScript (onclick 등) 사용 제한 여부

5. 공식 개발 가이드
   - 스마트디자인 편집 개발자 가이드 문서가 있나요?
   - 권장/비권장 코딩 패턴이 정리된 자료가 있나요?

감사합니다.
```

---

### 질문 2: 특수 문자/이모지 지원 범위

```
제목: 스마트디자인 편집 - UTF-8 이모지 및 특수 문자 지원 여부

안녕하세요.

디자인 작업 중 이모지 및 특수 문자 사용 시 "데이터 수정 실패" 오류가 발생합니다.

1. 현상
   - UTF-8 4바이트 이모지 (📍, ❤️ 등) 사용 시 저장 실패
   - HTML 엔티티 (&hearts; 등)로 대체 시 저장 성공

2. 질문
   - UTF-8 이모지 공식 지원 여부
   - 지원하는 문자 인코딩 범위 (utf8 vs utf8mb4)
   - 권장하는 특수 문자 표현 방법 (엔티티, 이미지, CSS 등)

3. 요청
   - 지원 가능한 특수 문자 목록 또는 가이드

감사합니다.
```

---

### 질문 3: JavaScript 최신 문법 지원 범위

```
제목: 스마트디자인 편집 - JavaScript 최신 문법 지원 범위

안녕하세요.

JavaScript 개발 중 일부 문법에서 저장 오류가 발생하여 문의드립니다.

1. 저장 실패한 문법
   - async/await (ES2017)
   - 템플릿 리터럴 `${변수}` (백틱 사용 시)
   - 화살표 함수 () => {}

2. 저장 성공한 문법
   - Promise (.then/.catch)
   - 전통적 함수 function() {}
   - 문자열 연결 '문자열 ' + 변수

3. 질문
   - 공식 지원하는 JavaScript ES 버전은?
   - Babel 등 트랜스파일러 사용이 필요한가요?
   - 권장하는 JavaScript 작성 방법이 있나요?

감사합니다.
```

---

### 질문 4: 인라인 이벤트 핸들러 보안 정책

```
제목: 스마트디자인 편집 - 인라인 이벤트 핸들러 사용 제한 여부

안녕하세요.

HTML 인라인 이벤트 핸들러 사용 시 저장이 차단되어 문의드립니다.

1. 현상
   - onclick="함수()" 사용 시 저장 실패
   - addEventListener 사용 시 저장 성공

2. 질문
   - 인라인 이벤트 핸들러(onclick, onerror 등) 사용 제한 여부
   - 보안 정책상 제한되는 JavaScript 패턴이 있나요?
   - CSP(Content Security Policy) 정책이 적용되어 있나요?

3. 요청
   - 허용/차단되는 JavaScript 패턴 가이드

감사합니다.
```

---

### 질문 5: 파일 분할 및 로드 순서

```
제목: 스마트디자인 편집 - 여러 JavaScript 파일 로드 순서 보장 여부

안녕하세요.

대용량 스크립트를 여러 파일로 분할하여 로드하고자 합니다.

1. 질문
   - JS 탭에 여러 스크립트를 붙여넣을 때 실행 순서가 보장되나요?
   - <script> 태그로 외부 파일 로드 시 순서 보장 여부
   - 모듈 시스템(import/export) 지원 여부

2. 현재 방식
   - JS 탭에 여러 스크립트를 순서대로 붙여넣기
   - IIFE 패턴으로 글로벌 스코프 오염 방지

3. 요청
   - 권장하는 스크립트 분할 및 로드 방법

감사합니다.
```

---

## 💡 메이크샵 고객센터 문의 팁

### 효과적인 질문 방법

1. **구체적인 코드 예시 포함**
   ```
   ❌ "JavaScript가 안 돼요"
   ✅ "async/await 사용 시 '데이터 수정 실패' 오류 발생"
   ```

2. **재현 가능한 최소 코드 제공**
   - 문제가 되는 부분만 간결하게
   - 전체 코드보다는 핵심 패턴만

3. **기대 결과와 실제 결과 명시**
   ```
   - 기대: 저장 성공
   - 실제: "데이터 수정 실패" 오류
   ```

4. **브라우저 및 환경 정보**
   - 사용 브라우저 (Chrome, Safari 등)
   - 메이크샵 플랜 (베이직, 프리미엄 등)
   - 스마트디자인 버전

5. **공식 문서 요청**
   - "개발자 가이드가 있나요?"
   - "API 명세서를 제공해주시나요?"

---

## 📚 추가 확인이 필요한 항목

다음 항목들은 실제 테스트를 통해 확인이 필요합니다:

- [ ] WebGL 지원 여부
- [ ] Canvas API 사용 가능 범위
- [ ] Service Worker 지원
- [ ] Web Storage 용량 제한
- [ ] IndexedDB 지원
- [ ] WebSocket 사용 가능 여부
- [ ] Geolocation API 권한 처리
- [ ] File API 지원 범위
- [ ] Drag and Drop API
- [ ] History API (pushState/replaceState)

---

## 🎯 결론

### 안전한 개발을 위한 황금률

1. **ES5 문법 기준으로 작성** (var, function, .then())
2. **이모지 대신 HTML 엔티티 또는 아이콘 폰트 사용**
3. **인라인 이벤트 대신 addEventListener 사용**
4. **파일은 5KB 이하로 분할**
5. **긴 문자열 연결은 중간 변수로 분리**
6. **프로토콜 상대 URL 사용** (//example.com)
7. **IIFE로 전역 오염 방지**
8. **체계적인 테스트와 점진적 디버깅**

### 문제 발생 시 디버깅 순서

1. 최소 코드로 테스트
2. 이진 분할로 문제 구간 특정
3. 패턴 분석으로 원인 파악
4. 메이크샵 고객센터 문의 (구체적 예시 포함)
5. 대안 방법 적용

---

**작성일**: 2026-02-11
**프로젝트**: 파트너맵 v3
**테스트 환경**: 메이크샵 D4 스마트디자인 편집
