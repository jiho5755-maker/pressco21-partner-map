# 메이크샵 D4 플랫폼 개발 종합 가이드

> **작성일**: 2026-02-11
> **버전**: 1.0.0
> **대상**: 메이크샵 D4를 호스팅으로 사용하는 모든 개발자
> **기반**: 파트너맵 v3 프로젝트 실전 경험

---

## 📋 목차

1. [소개 및 개요](#1-소개-및-개요)
2. [메이크샵 플랫폼 이해](#2-메이크샵-플랫폼-이해)
3. [개발 환경 설정](#3-개발-환경-설정)
4. [핵심 제약사항 및 호환성](#4-핵심-제약사항-및-호환성)
5. [코드 작성 가이드라인](#5-코드-작성-가이드라인)
6. [파일 분할 전략](#6-파일-분할-전략)
7. [배포 프로세스](#7-배포-프로세스)
8. [디버깅 및 문제 해결](#8-디버깅-및-문제-해결)
9. [아이콘/이미지 처리](#9-아이콘이미지-처리)
10. [성능 최적화](#10-성능-최적화)
11. [보안 고려사항](#11-보안-고려사항)
12. [테스트 방법](#12-테스트-방법)
13. [유지보수 가이드](#13-유지보수-가이드)
14. [메이크샵 고객센터 질문 가이드](#14-메이크샵-고객센터-질문-가이드)
15. [실전 사례: 파트너맵 v3](#15-실전-사례-파트너맵-v3)
16. [부록](#16-부록)

---

## 1. 소개 및 개요

### 1.1 메이크샵 D4 플랫폼이란?

메이크샵 D4(카멜레온)는 국내 대표적인 쇼핑몰 솔루션으로, 스마트디자인 편집 시스템을 통해 HTML/CSS/JavaScript를 직접 편집할 수 있습니다.

**주요 특징:**
- 웹 기반 코드 에디터 (HTML/CSS/JS 탭 분리)
- 서버 사이드 치환코드 시스템 (`{$변수}`)
- jQuery 기본 내장
- No-Build 환경 (Vanilla JS 중심)

### 1.2 이 가이드의 목적

메이크샵 플랫폼은 일반적인 웹 개발 환경과 다른 **고유한 제약사항**이 있습니다. 이 가이드는:

✅ 메이크샵에서 발생하는 "데이터 수정 실패" 오류를 사전에 방지
✅ ES6+ 문법을 ES5로 안전하게 변환하는 방법 제시
✅ 파일 크기 제한(30-40KB)을 극복하는 분할 전략 제공
✅ 실전 프로젝트(파트너맵 v3)의 성공 사례 공유

### 1.3 빠른 시작 가이드 (5분 요약)

**메이크샵에서 절대 하지 말아야 할 것 (Top 5):**

| 금지 사항 | 이유 | 대안 |
|----------|------|------|
| 1️⃣ 이모지 사용 (📍❤️🗺️) | UTF-8 4바이트 문자 차단 | HTML 엔티티 (♥☎), Font Awesome |
| 2️⃣ `async/await` | 구형 JS 엔진 | Promise 체이닝 (`.then()`) |
| 3️⃣ 템플릿 리터럴 `` `${var}` `` | 치환코드 충돌 | 문자열 연결 (`'문자' + var`) |
| 4️⃣ 인라인 이벤트 (`onclick`) | 보안 필터 차단 | `addEventListener` + 이벤트 위임 |
| 5️⃣ 단일 파일 40KB 초과 | 서버 제한 | 3-9개 파일로 분할 |

**즉시 적용 체크리스트:**
```bash
# 1. 이모지 검색
grep -P "[\x{1F300}-\x{1F9FF}]" your-file.js

# 2. async/await 검색
grep -E 'async|await' your-file.js

# 3. 템플릿 리터럴 검색
grep '\$\{' your-file.js

# 4. 인라인 핸들러 검색
grep -E 'on(click|error|load)=' your-file.html

# 5. 파일 크기 확인
ls -lh your-file.js
```

---

## 2. 메이크샵 플랫폼 이해

### 2.1 플랫폼 구조

#### 2.1.1 스마트디자인 편집 시스템

메이크샵 관리자 > [디자인 설정] > [스마트디자인 관리]에서 코드를 직접 편집합니다.

**3개 탭 구조:**
```
┌─────────────────────────────────────┐
│  HTML 탭   │  CSS 탭   │   JS 탭   │
├─────────────────────────────────────┤
│ <div>      │ .class {} │ (function│
│   {$상품명} │           │   () {   │
│ </div>     │           │   ...    │
└─────────────────────────────────────┘
          [저장] 버튼
```

**저장 프로세스:**
1. 코드 입력/붙여넣기
2. [저장] 버튼 클릭
3. 서버 측 검증 (보안 필터, 문법 체크)
4. 성공 → "저장되었습니다" / 실패 → "데이터 수정 실패"

⚠️ **중요**: 저장 실패 시 **어떤 라인**이 문제인지 알려주지 않습니다!

#### 2.1.2 치환코드 시스템

메이크샵은 서버 사이드에서 `{$변수}`를 실제 값으로 치환합니다.

**예시:**
```html
<!-- 저장 전 (편집기) -->
<h1>{$shop_name}</h1>
<p>{$product_name} - {$product_price}원</p>

<!-- 실제 렌더링 후 -->
<h1>우리 쇼핑몰</h1>
<p>상품A - 15,000원</p>
```

**주의사항:**
- JavaScript 템플릿 리터럴 `` `${변수}` ``과 **충돌**
- 해결: `` `\${변수}` `` (백슬래시 이스케이프)

#### 2.1.3 파일 관리자

`/web/upload/` 디렉토리에 이미지, 폰트 등을 업로드할 수 있습니다.

**경로 예시:**
```
/web/upload/my-project/
  ├── images/
  │   ├── logo.png
  │   └── icon-heart.svg
  ├── fonts/
  │   └── custom-font.woff2
  └── data/
      └── partners.json
```

**사용:**
```html
<img src="/web/upload/my-project/images/logo.png" alt="로고">
```

### 2.2 기술 스택

#### 2.2.1 지원하는 버전

| 기술 | 지원 버전 | 비고 |
|------|----------|------|
| HTML | HTML5 | 일부 태그 제한 (script, iframe 등) |
| CSS | CSS3 | 대부분 지원 |
| JavaScript | **ES5 기준** | ES6+ 일부 제한 (아래 표 참고) |
| jQuery | 1.x ~ 3.x | 기본 내장 |

#### 2.2.2 JavaScript ES6+ 호환성 매트릭스

| 문법 | 상태 | 비고 |
|------|------|------|
| `let`, `const` | ⚠️ 제한적 | `var` 권장 |
| Arrow Function `() => {}` | ⚠️ 제한적 | `function` 권장 |
| Template Literal `` `${}` `` | ❌ 차단 | 문자열 연결 |
| `async`/`await` | ❌ 차단 | Promise 체이닝 |
| `class` 키워드 | ⚠️ 제한적 | 프로토타입 패턴 |
| Destructuring `{a, b}` | ⚠️ 제한적 | 개별 할당 |
| Spread `...arr` | ⚠️ 제한적 | `Array.prototype.slice` |
| `import`/`export` | ❌ 차단 | IIFE 패턴 |

**권장 접근:**
- **ES5 문법 우선 사용** (가장 안전)
- ES6+ 사용 시 **로컬 테스트 필수**
- Babel 트랜스파일 고려 (빌드 스크립트 활용)

#### 2.2.3 외부 라이브러리 로드 (CDN)

```html
<!-- HTML 탭 -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

**권장 CDN:**
- jsDelivr (https://www.jsdelivr.com/)
- cdnjs (https://cdnjs.com/)
- unpkg (https://unpkg.com/)

---

## 3. 개발 환경 설정

### 3.1 로컬 개발 환경

#### 3.1.1 에디터 설정 (VS Code 권장)

**필수 확장 프로그램:**
- ESLint (코드 품질)
- Prettier (코드 포맷팅)
- Live Server (로컬 프리뷰)

**VS Code 설정 (`settings.json`):**
```json
{
  "eslint.options": {
    "parserOptions": {
      "ecmaVersion": 5
    }
  },
  "javascript.validate.enable": true,
  "files.encoding": "utf8"
}
```

#### 3.1.2 로컬 테스트 서버

**방법 1: Python (기본 내장)**
```bash
cd your-project
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

**방법 2: Node.js**
```bash
npx http-server -p 8000
```

**방법 3: VS Code Live Server**
- HTML 파일 우클릭 > "Open with Live Server"

#### 3.1.3 브라우저 개발자 도구 활용

**Chrome DevTools 필수 패널:**
1. **Console**: JavaScript 오류 확인
2. **Network**: API 호출 모니터링
3. **Elements**: DOM 구조 확인
4. **Application**: LocalStorage/SessionStorage 확인

**유용한 단축키:**
- `Cmd + Option + I` (Mac) / `F12` (Windows): DevTools 열기
- `Cmd + Shift + C`: 요소 선택
- `Cmd + K`: Console 지우기

### 3.2 프로젝트 구조 권장안

```
my-makeshop-project/
├── src/                      # 소스 코드
│   ├── html/
│   │   └── index.html        # HTML 탭 코드
│   ├── css/
│   │   ├── reset.css
│   │   ├── layout.css
│   │   └── components.css
│   └── js/
│       ├── config.js         # 설정
│       ├── utils.js          # 유틸리티
│       ├── api.js            # API 호출
│       ├── components.js     # UI 컴포넌트
│       └── main.js           # 초기화
├── dist/                     # 배포용 (빌드 결과)
│   ├── makeshop-html.html
│   ├── makeshop-css.css
│   ├── makeshop-js-part1.js  # Part 1: Config + API
│   ├── makeshop-js-part2.js  # Part 2: Components
│   └── makeshop-js-part3.js  # Part 3: Main
├── build.sh                  # 빌드 스크립트
├── test.html                 # 로컬 테스트용
└── README.md
```

### 3.3 빌드 스크립트 예시

**build.sh:**
```bash
#!/bin/bash

echo "🔨 메이크샵 빌드 시작..."

# dist 디렉토리 생성
mkdir -p dist

# HTML 빌드
cat src/html/index.html > dist/makeshop-html.html
echo "✅ HTML 빌드 완료"

# CSS 빌드
cat src/css/reset.css \
    src/css/layout.css \
    src/css/components.css > dist/makeshop-css.css
echo "✅ CSS 빌드 완료"

# JS Part 1: Config + API
cat src/js/config.js \
    src/js/utils.js \
    src/js/api.js > dist/makeshop-js-part1.js

# JS Part 2: Components
cat src/js/components.js > dist/makeshop-js-part2.js

# JS Part 3: Main
cat src/js/main.js > dist/makeshop-js-part3.js

echo "✅ JS 빌드 완료"

# 파일 크기 체크
echo ""
echo "📊 파일 크기:"
ls -lh dist/ | grep makeshop

# 40KB 초과 경고
for file in dist/makeshop-js-*.js; do
  size=$(wc -c < "$file")
  if [ $size -gt 40000 ]; then
    echo "⚠️  경고: $file ($size bytes) - 40KB 초과!"
  fi
done

echo ""
echo "🎉 빌드 완료!"
```

**사용:**
```bash
chmod +x build.sh
./build.sh
```

---

## 4. 핵심 제약사항 및 호환성

### 4.1 파일 크기 제한

#### 4.1.1 제한 사항

- **단일 파일 크기**: 30-40KB (약 1,000줄)
- **초과 시**: "데이터 수정 실패" 오류 또는 저장 성공 후 일부 코드 누락

#### 4.1.2 해결 방법: 파일 분할

**분할 전략:**
```
단일 파일 (60KB, 2,000줄)
    ↓
3-9개 파일로 분할
    ↓
Part 1 (25KB) + Part 2 (20KB) + Part 3 (15KB)
```

**의존성 순서 준수:**
```javascript
// Part 1: 설정 및 유틸리티 (다른 파일이 의존)
var CONFIG = { ... };
function Utils() { ... }

// Part 2: 컴포넌트 (Part 1에 의존)
function Component() {
  Utils.log('초기화');  // Part 1의 Utils 사용
}

// Part 3: 초기화 (Part 1, 2에 의존)
window.addEventListener('DOMContentLoaded', function() {
  Component.init();  // Part 2의 Component 사용
});
```

**메이크샵 JS 탭 붙여넣기 순서:**
```
[JS 탭]
<!-- Part 1 코드 -->
<!-- Part 2 코드 (Part 1 아래) -->
<!-- Part 3 코드 (Part 2 아래) -->
```

#### 4.1.3 실전 예시: 파트너맵 v3

**Before (저장 실패):**
- 단일 파일: 97KB, 3,200줄

**After (저장 성공):**
- Part 1: 34KB (Config + API + Map)
- Part 2: 27KB (Filters + Search)
- Part 3-8: 각 2-5KB (UI 컴포넌트 6개)
- Part 9: 12KB (Main + Init)

### 4.2 JavaScript 제약

#### 4.2.1 async/await 사용 불가

**❌ 저장 실패:**
```javascript
async function loadData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
```

**✅ 올바른 방법 (Promise 체이닝):**
```javascript
function loadData() {
  return fetch('/api/data')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
}
```

#### 4.2.2 템플릿 리터럴 이스케이프

**❌ 저장 실패 (치환코드 충돌):**
```javascript
var message = `안녕하세요, ${userName}님!`;
var html = `<div>${content}</div>`;
```

**✅ 올바른 방법 1 (백슬래시 이스케이프):**
```javascript
var message = `안녕하세요, \${userName}님!`;  // 백슬래시 추가
var html = `<div>\${content}</div>`;
```

**✅ 올바른 방법 2 (문자열 연결, 권장):**
```javascript
var message = '안녕하세요, ' + userName + '님!';
var html = '<div>' + content + '</div>';
```

#### 4.2.3 let/const vs var

**⚠️ 제한적 지원 (일부 환경에서 오류):**
```javascript
const API_URL = 'https://api.example.com';
let counter = 0;
```

**✅ 안전한 방법 (var 사용):**
```javascript
var API_URL = 'https://api.example.com';
var counter = 0;
```

#### 4.2.4 화살표 함수

**⚠️ 제한적 지원:**
```javascript
var items = [1, 2, 3];
var doubled = items.map(x => x * 2);
```

**✅ 안전한 방법 (function 키워드):**
```javascript
var items = [1, 2, 3];
var doubled = items.map(function(x) {
  return x * 2;
});
```

### 4.3 HTML/보안 제약

#### 4.3.1 인라인 이벤트 핸들러 차단

**❌ 저장 실패 또는 작동 안 함:**
```html
<button onclick="handleClick()">클릭</button>
<img src="image.jpg" onerror="handleError()">
<div onload="init()">로딩 중...</div>
```

**✅ 올바른 방법 (addEventListener):**
```html
<!-- HTML -->
<button id="myButton">클릭</button>
<img id="myImage" src="image.jpg">

<!-- JS -->
<script>
document.getElementById('myButton').addEventListener('click', function() {
  handleClick();
});

document.getElementById('myImage').addEventListener('error', function() {
  handleError();
});
</script>
```

**✅ 더 나은 방법 (이벤트 위임):**
```html
<!-- HTML -->
<div id="container">
  <button data-action="save">저장</button>
  <button data-action="delete">삭제</button>
  <button data-action="cancel">취소</button>
</div>

<!-- JS -->
<script>
document.getElementById('container').addEventListener('click', function(e) {
  var button = e.target.closest('button');
  if (!button) return;

  var action = button.getAttribute('data-action');
  if (action === 'save') handleSave();
  else if (action === 'delete') handleDelete();
  else if (action === 'cancel') handleCancel();
});
</script>
```

**장점:**
- 이벤트 리스너 1개로 모든 버튼 처리 (메모리 절약)
- 동적으로 추가된 요소도 자동 처리
- 유지보수 용이

#### 4.3.2 작은따옴표 이스케이프 차단

**❌ 저장 실패:**
```javascript
var html = '<button onclick="alert(\'안녕\')">클릭</button>';
```

**✅ 올바른 방법 (HTML 엔티티):**
```javascript
var html = '<button onclick="alert(&quot;안녕&quot;)">클릭</button>';
```

**✅ 더 나은 방법 (인라인 핸들러 제거):**
```javascript
var button = document.createElement('button');
button.textContent = '클릭';
button.addEventListener('click', function() {
  alert('안녕');
});
```

### 4.4 특수 문자 제약

#### 4.4.1 UTF-8 4바이트 이모지 차단

**❌ 저장 실패:**
```javascript
var icons = {
  location: '📍',
  phone: '📞',
  heart: '❤️',
  star: '⭐',
  map: '🗺️'
};

var html = '<button>❤️ 좋아요</button>';
```

**✅ 올바른 방법 (HTML 엔티티):**
```javascript
var icons = {
  location: '&#128205;',  // 📍
  phone: '&#9742;',       // ☎
  heart: '&hearts;',      // ♥
  star: '&starf;',        // ★
  map: ''                 // 대체 텍스트
};

var html = '<button>&hearts; 좋아요</button>';
```

**✅ 더 나은 방법 (Font Awesome, 권장):**
```html
<!-- HTML 탭 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 사용 -->
<button><i class="fa-solid fa-heart"></i> 좋아요</button>
<span><i class="fa-solid fa-phone"></i> 02-1234-5678</span>
```

**이모지 → HTML 엔티티 변환표:**

| 이모지 | HTML 엔티티 | 10진수 | Font Awesome |
|-------|-------------|--------|--------------|
| 📍 | - | `&#128205;` | `fa-map-marker-alt` |
| ☎ | `&phone;` | `&#9742;` | `fa-phone` |
| ❤️ | `&hearts;` | `&#9829;` | `fa-heart` |
| ⭐ | `&starf;` | `&#9733;` | `fa-star` |
| 🗺️ | - | `&#128506;` | `fa-map` |
| 📧 | - | `&#128231;` | `fa-envelope` |
| 🏠 | - | `&#127968;` | `fa-home` |
| ✅ | - | `&#9989;` | `fa-check` |
| ❌ | - | `&#10060;` | `fa-times` |

**이모지 검색 명령어:**
```bash
# UTF-8 4바이트 문자 검색
grep -P "[\x{1F300}-\x{1F9FF}]" your-file.js

# 또는
grep -P "[\x{1F000}-\x{1FFFF}]" your-file.js
```

---

## 5. 코드 작성 가이드라인

### 5.1 JavaScript 작성 규칙

#### 5.1.1 IIFE 패턴 (전역 오염 방지)

**❌ 나쁜 예 (전역 변수 남발):**
```javascript
var config = { ... };
var utils = { ... };
var app = { ... };

function init() { ... }
function handleClick() { ... }
```

**✅ 좋은 예 (IIFE로 격리):**
```javascript
(function(window, document) {
  'use strict';

  // 비공개 변수
  var config = {
    apiUrl: 'https://api.example.com'
  };

  // 비공개 함수
  function privateFunction() {
    console.log('내부 전용');
  }

  // 공개 API
  var MyApp = {
    init: function() {
      console.log('초기화');
      privateFunction();
    },

    publicMethod: function() {
      console.log('외부 호출 가능');
    }
  };

  // 전역에 노출
  window.MyApp = MyApp;

})(window, document);

// 사용
MyApp.init();
```

#### 5.1.2 객체 생성 패턴

**패턴 1: 객체 리터럴 (간단한 경우)**
```javascript
var Utils = {
  formatNumber: function(num) {
    return num.toLocaleString('ko-KR');
  },

  debounce: function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
};
```

**패턴 2: 생성자 함수 (인스턴스가 여러 개)**
```javascript
function Partner(name, address) {
  this.name = name;
  this.address = address;
  this.isFavorite = false;
}

Partner.prototype.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
};

// 사용
var partner1 = new Partner('업체A', '서울');
var partner2 = new Partner('업체B', '부산');
partner1.toggleFavorite();
```

**패턴 3: 모듈 패턴 (싱글톤)**
```javascript
var MapManager = (function() {
  var instance;

  function createInstance() {
    var map = null;
    var markers = [];

    return {
      init: function(containerId) {
        // 지도 초기화
        map = new naver.maps.Map(containerId);
      },

      addMarker: function(position) {
        var marker = new naver.maps.Marker({
          position: position,
          map: map
        });
        markers.push(marker);
      }
    };
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 사용
var mapMgr = MapManager.getInstance();
mapMgr.init('map-container');
```

#### 5.1.3 이벤트 처리 패턴

**패턴 1: 이벤트 위임 (권장)**
```javascript
// 200개 파트너 리스트
document.getElementById('partner-list').addEventListener('click', function(e) {
  // 즐겨찾기 버튼
  var favoriteBtn = e.target.closest('.favorite-btn');
  if (favoriteBtn) {
    var partnerId = favoriteBtn.getAttribute('data-id');
    toggleFavorite(partnerId);
    return;
  }

  // 상세보기 버튼
  var detailBtn = e.target.closest('.detail-btn');
  if (detailBtn) {
    var partnerId = detailBtn.getAttribute('data-id');
    showDetail(partnerId);
    return;
  }
});
```

**패턴 2: Custom Event**
```javascript
// 발행
function notifyDataChanged(data) {
  var event = new CustomEvent('dataChanged', {
    detail: { data: data }
  });
  document.dispatchEvent(event);
}

// 구독
document.addEventListener('dataChanged', function(e) {
  console.log('데이터 변경:', e.detail.data);
  updateUI(e.detail.data);
});
```

#### 5.1.4 에러 처리

**Promise 체이닝:**
```javascript
function loadPartners() {
  showLoading(true);

  return fetch('/api/partners')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      renderPartners(data);
      return data;
    })
    .catch(function(error) {
      console.error('Error:', error);
      showError('데이터 로드 실패: ' + error.message);
    })
    .finally(function() {
      showLoading(false);
    });
}
```

### 5.2 HTML 작성 규칙

#### 5.2.1 시맨틱 마크업

**✅ 좋은 예:**
```html
<article id="partner-map-container">
  <header>
    <h1>전국 파트너 지도</h1>
    <nav>
      <button type="button" data-action="filter">필터</button>
      <button type="button" data-action="search">검색</button>
    </nav>
  </header>

  <section id="map-area" role="application">
    <div id="map" style="width:100%; height:600px;"></div>
  </section>

  <aside id="partner-list" role="complementary">
    <!-- 파트너 리스트 -->
  </aside>

  <footer>
    <p>&copy; 2026 우리쇼핑몰</p>
  </footer>
</article>
```

#### 5.2.2 접근성 (Accessibility)

```html
<!-- ARIA 속성 -->
<button type="button"
        aria-label="즐겨찾기 추가"
        aria-pressed="false"
        data-id="123">
  <i class="fa-regular fa-heart" aria-hidden="true"></i>
  <span class="sr-only">즐겨찾기</span>
</button>

<!-- 스크린 리더 전용 텍스트 -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
```

#### 5.2.3 data 속성 활용

```html
<!-- 이벤트 위임용 -->
<div class="partner-card"
     data-id="123"
     data-category="음식점"
     data-region="서울"
     data-lat="37.5665"
     data-lng="126.9780">

  <h3>파트너 업체명</h3>

  <button type="button"
          class="action-btn"
          data-action="favorite"
          data-partner-id="123">
    즐겨찾기
  </button>

  <button type="button"
          class="action-btn"
          data-action="detail"
          data-partner-id="123">
    상세보기
  </button>
</div>
```

```javascript
// JavaScript에서 사용
var card = document.querySelector('.partner-card');
var id = card.getAttribute('data-id');
var lat = parseFloat(card.getAttribute('data-lat'));
var lng = parseFloat(card.getAttribute('data-lng'));
```

### 5.3 CSS 작성 규칙

#### 5.3.1 스코핑 (충돌 방지)

**❌ 나쁜 예 (전역 스타일):**
```css
.btn {
  background-color: #7D9675;
  /* 메이크샵 기존 .btn과 충돌! */
}

.container {
  max-width: 1200px;
  /* 메이크샵 기존 .container와 충돌! */
}
```

**✅ 좋은 예 (컨테이너로 스코핑):**
```css
/* 모든 스타일을 #partner-map-app 하위로 제한 */
#partner-map-app .btn {
  background-color: #7D9675;
}

#partner-map-app .container {
  max-width: 1200px;
}

#partner-map-app .partner-card {
  border: 1px solid #ddd;
}
```

#### 5.3.2 CSS Variables

```css
#partner-map-app {
  /* 컬러 팔레트 */
  --primary-color: #7D9675;
  --secondary-color: #E8E3D5;
  --accent-color: #B85C38;
  --text-color: #333;
  --border-color: #ddd;

  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 브레이크포인트 (JS에서도 사용) */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 992px;
  --breakpoint-desktop: 1200px;
}

/* 사용 */
#partner-map-app .btn-primary {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
}
```

#### 5.3.3 반응형 디자인

```css
/* 모바일 우선 (Mobile First) */
#partner-map-app .partner-grid {
  display: grid;
  grid-template-columns: 1fr;  /* 1열 */
  gap: 16px;
}

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
  #partner-map-app .partner-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2열 */
  }
}

/* 데스크톱 (992px 이상) */
@media (min-width: 992px) {
  #partner-map-app .partner-grid {
    grid-template-columns: repeat(3, 1fr);  /* 3열 */
  }
}

/* 대형 화면 (1200px 이상) */
@media (min-width: 1200px) {
  #partner-map-app .partner-grid {
    grid-template-columns: repeat(4, 1fr);  /* 4열 */
  }
}
```

---

## 6. 파일 분할 전략

### 6.1 의존성 순서

**핵심 원칙**: 의존하는 코드보다 먼저 로드되어야 함

```
Part 1 (기반)
  ├─ config.js         (설정)
  ├─ utils.js          (유틸리티)
  └─ api.js            (API 호출)
        ↓
Part 2 (기능)
  ├─ components.js     (UI 컴포넌트)
  ├─ services.js       (비즈니스 로직)
  └─ events.js         (이벤트 핸들러)
        ↓
Part 3 (초기화)
  └─ main.js           (앱 시작)
```

**잘못된 순서 (오류 발생):**
```javascript
// Part 1: main.js (초기화)
MyApp.init();  // ❌ MyApp이 아직 정의되지 않음!

// Part 2: components.js
var MyApp = { ... };
```

**올바른 순서:**
```javascript
// Part 1: components.js
var MyApp = { ... };

// Part 2: main.js (초기화)
MyApp.init();  // ✅ MyApp이 이미 정의됨
```

### 6.2 파일 분할 기준

#### 6.2.1 기능별 분할 (권장)

**예시: 파트너맵 v3 (9-Part)**
```
Part 1 (34KB): config.js + api.js + map-init.js
  - 설정, API 호출, 네이버 지도 초기화

Part 2 (27KB): filters.js + search.js
  - 지역/카테고리 필터, Fuse.js 검색

Part 3 (5KB): partner-list-ui.js
  - 파트너 리스트 렌더링

Part 4 (4KB): modal-ui.js
  - 상세보기 모달

Part 5 (3KB): favorite-ui.js
  - 즐겨찾기 UI

Part 6 (3KB): share-ui.js
  - 공유 기능

Part 7 (2KB): toast-ui.js
  - 토스트 알림

Part 8 (7KB): marker-clustering.js
  - 마커 클러스터링

Part 9 (12KB): main.js + event-delegation.js
  - 앱 초기화, 이벤트 위임
```

#### 6.2.2 크기별 분할

```bash
# 파일 크기 확인
ls -lh src/js/*.js

# 40KB 초과 파일 찾기
find src/js -name "*.js" -size +40k

# 라인 수 확인
wc -l src/js/*.js
```

**분할 기준:**
- 40KB 미만: 단일 파일 유지
- 40-80KB: 2개로 분할
- 80KB 이상: 3개 이상 분할

#### 6.2.3 의존성 그래프 예시

```
config.js (5KB)
  ↓
utils.js (8KB) ← api.js (12KB)
  ↓              ↓
  ↓         map-manager.js (15KB)
  ↓              ↓
components.js (20KB) ────┐
  ↓                       ↓
services.js (18KB) ───→ main.js (10KB)
```

**빌드 순서:**
1. config.js
2. utils.js
3. api.js
4. map-manager.js
5. components.js
6. services.js
7. main.js

### 6.3 빌드 스크립트 (고급)

#### 6.3.1 기본 빌드 스크립트

```bash
#!/bin/bash
# build.sh

set -e  # 오류 시 중단

echo "🔨 메이크샵 빌드 시작..."

# 변수
SRC_DIR="src/js"
DIST_DIR="dist"
MAX_SIZE=40000  # 40KB

# dist 디렉토리 생성
mkdir -p "$DIST_DIR"

# Part 1: Config + Utils + API
cat "$SRC_DIR/config.js" \
    "$SRC_DIR/utils.js" \
    "$SRC_DIR/api.js" > "$DIST_DIR/makeshop-js-part1.js"

# Part 2: Components + Services
cat "$SRC_DIR/components.js" \
    "$SRC_DIR/services.js" > "$DIST_DIR/makeshop-js-part2.js"

# Part 3: Main
cat "$SRC_DIR/main.js" > "$DIST_DIR/makeshop-js-part3.js"

echo "✅ 빌드 완료"

# 크기 체크
echo ""
echo "📊 파일 크기:"
for file in "$DIST_DIR"/makeshop-js-*.js; do
  size=$(wc -c < "$file")
  size_kb=$((size / 1024))

  if [ $size -gt $MAX_SIZE ]; then
    echo "⚠️  $file: ${size_kb}KB (40KB 초과!)"
  else
    echo "✅ $file: ${size_kb}KB"
  fi
done

echo ""
echo "🎉 빌드 완료!"
```

#### 6.3.2 검증 포함 빌드 스크립트

```bash
#!/bin/bash
# build-with-validation.sh

set -e

echo "🔨 메이크샵 빌드 + 검증..."

# 빌드
./build.sh

# 검증
echo ""
echo "🔍 코드 검증 중..."

# 이모지 검색
if grep -rP "[\x{1F300}-\x{1F9FF}]" dist/; then
  echo "❌ 오류: 이모지 발견!"
  exit 1
fi

# async/await 검색
if grep -rE 'async\s+function|await\s+' dist/; then
  echo "❌ 오류: async/await 발견!"
  exit 1
fi

# 템플릿 리터럴 검색 (이스케이프 안 된 것만)
if grep -rE '\$\{[^\\]' dist/; then
  echo "⚠️  경고: 이스케이프되지 않은 템플릿 리터럴 발견!"
fi

# 인라인 이벤트 핸들러 검색
if grep -rE 'on(click|error|load)=' dist/; then
  echo "⚠️  경고: 인라인 이벤트 핸들러 발견!"
fi

echo "✅ 검증 완료!"
```

#### 6.3.3 Node.js 빌드 스크립트

```javascript
// build.js
const fs = require('fs');
const path = require('path');

const SRC_DIR = 'src/js';
const DIST_DIR = 'dist';
const MAX_SIZE = 40 * 1024; // 40KB

// Part 정의
const parts = [
  {
    name: 'part1',
    files: ['config.js', 'utils.js', 'api.js']
  },
  {
    name: 'part2',
    files: ['components.js', 'services.js']
  },
  {
    name: 'part3',
    files: ['main.js']
  }
];

// dist 디렉토리 생성
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR);
}

// 빌드
parts.forEach((part) => {
  const output = path.join(DIST_DIR, `makeshop-js-${part.name}.js`);
  let content = '';

  part.files.forEach((file) => {
    const filePath = path.join(SRC_DIR, file);
    if (fs.existsSync(filePath)) {
      content += fs.readFileSync(filePath, 'utf8') + '\n\n';
    } else {
      console.warn(`⚠️  파일 없음: ${filePath}`);
    }
  });

  fs.writeFileSync(output, content);

  // 크기 체크
  const size = fs.statSync(output).size;
  const sizeKB = (size / 1024).toFixed(2);

  if (size > MAX_SIZE) {
    console.log(`⚠️  ${output}: ${sizeKB}KB (40KB 초과!)`);
  } else {
    console.log(`✅ ${output}: ${sizeKB}KB`);
  }
});

console.log('🎉 빌드 완료!');
```

**사용:**
```bash
node build.js
```

---

## 7. 배포 프로세스

### 7.1 메이크샵 저장 절차

#### 7.1.1 HTML 탭

1. `dist/makeshop-html.html` 파일 열기
2. **전체 선택** (Cmd+A / Ctrl+A)
3. **복사** (Cmd+C / Ctrl+C)
4. 메이크샵 관리자 > 디자인 설정 > 스마트디자인 관리
5. 해당 페이지 편집 > **HTML 탭** 클릭
6. **기존 코드 아래**에 붙여넣기
7. **저장** 버튼 클릭

**주의사항:**
- 메이크샵 기본 HTML 코드를 삭제하지 마세요
- `<!-- 주석 -->`, `{$치환코드}` 보존

#### 7.1.2 CSS 탭

1. `dist/makeshop-css.css` 파일 열기
2. 전체 복사
3. **CSS 탭** 클릭
4. **기존 코드 아래**에 붙여넣기
5. 저장

#### 7.1.3 JS 탭 (순서 중요!)

**⚠️ 핵심: Part 순서 준수**

```
[JS 탭 최종 구조]

(메이크샵 기본 JS 코드)
...

<!-- Part 1: Config + API + Map -->
(makeshop-js-part1.js 내용)

<!-- Part 2: Filters + Search -->
(makeshop-js-part2.js 내용)

<!-- Part 3: UI Components -->
(makeshop-js-part3.js 내용)

...

<!-- Part 9: Main + Init -->
(makeshop-js-part9.js 내용)
```

**절차:**
1. `dist/makeshop-js-part1.js` 복사 → JS 탭 기존 코드 아래 붙여넣기
2. `dist/makeshop-js-part2.js` 복사 → Part 1 아래 붙여넣기
3. `dist/makeshop-js-part3.js` 복사 → Part 2 아래 붙여넣기
4. ...
5. 모든 Part 붙여넣기 완료 후 **저장**

**실수 방지:**
- Part 순서를 바꾸지 마세요 (의존성 오류 발생)
- 각 Part 사이에 주석 추가 권장:
  ```javascript
  /* ========== Part 1: Config + API ========== */
  (Part 1 코드)

  /* ========== Part 2: Components ========== */
  (Part 2 코드)
  ```

### 7.2 배포 전 체크리스트

```markdown
## 배포 전 필수 체크리스트

### 코드 품질
- [ ] 이모지 사용 여부 확인 (`grep -P "[\x{1F300}-\x{1F9FF}]"`)
- [ ] async/await 사용 여부 확인 (`grep -E 'async|await'`)
- [ ] 템플릿 리터럴 이스케이프 확인 (`grep '\$\{'`)
- [ ] 인라인 이벤트 핸들러 제거 확인 (`grep -E 'on(click|error|load)='`)

### 파일 크기
- [ ] 각 Part 파일이 40KB 이하인지 확인 (`ls -lh dist/`)
- [ ] 전체 JS 크기 확인 (너무 크면 로딩 느림)

### 의존성
- [ ] Part 순서가 올바른지 확인
- [ ] 전역 변수 충돌 확인 (console에서 `window.MyApp`)

### 로컬 테스트
- [ ] 로컬에서 정상 작동 확인
- [ ] 브라우저 콘솔 오류 없음
- [ ] 모바일 반응형 확인 (DevTools Device Mode)
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Edge)

### 기능 테스트
- [ ] 페이지 로드 성공
- [ ] UI 렌더링 정상
- [ ] 버튼 클릭 작동
- [ ] API 호출 성공
- [ ] 데이터 표시 정상

### 배포 준비
- [ ] 빌드 스크립트 실행 (`./build.sh`)
- [ ] dist/ 폴더 내용 확인
- [ ] 백업 생성 (메이크샵 현재 코드 복사해두기)
```

### 7.3 배포 후 확인

#### 7.3.1 즉시 확인 (배포 직후)

1. **페이지 로드 확인**
   - 쇼핑몰 해당 페이지 접속
   - 로딩 시간 체크 (3초 이내 권장)

2. **브라우저 콘솔 확인**
   - F12 > Console 탭
   - 오류 메시지 없는지 확인
   - 네트워크 탭에서 404 오류 없는지 확인

3. **기본 기능 테스트**
   - 버튼 클릭
   - 검색/필터
   - 모달 열기/닫기

#### 7.3.2 상세 테스트 (1시간 내)

```javascript
// 브라우저 콘솔에서 실행
console.log('=== 메이크샵 배포 확인 ===');

// 1. 전역 변수 확인
console.log('MyApp:', window.MyApp);
console.log('초기화:', window.MyApp && window.MyApp.initialized);

// 2. 로컬스토리지 확인
console.log('LocalStorage:', localStorage);

// 3. 이벤트 리스너 개수 (메모리 누수 체크)
console.log('리스너 개수:', getEventListeners(document).click?.length || 0);

// 4. API 호출 테스트
if (window.MyApp && window.MyApp.api) {
  window.MyApp.api.getPartners()
    .then(function(data) {
      console.log('API 성공:', data.length + '개');
    })
    .catch(function(error) {
      console.error('API 실패:', error);
    });
}
```

#### 7.3.3 모니터링 (1주일)

- **Google Analytics**: 페이지뷰, 이탈률
- **Sentry** (선택): JavaScript 오류 모니터링
- **사용자 피드백**: 고객센터 문의 증가 여부

### 7.4 롤백 절차

**배포 실패 시:**

1. **즉시 롤백**
   - 메이크샵 관리자 > 스마트디자인 관리
   - 백업해둔 이전 코드로 복원
   - 저장

2. **원인 분석**
   - 브라우저 콘솔 오류 메시지 복사
   - 네트워크 탭 확인
   - 로컬에서 재현

3. **수정 후 재배포**
   - 로컬에서 수정
   - 로컬 테스트 완료
   - 빌드 → 배포

---

## 8. 디버깅 및 문제 해결

### 8.1 "데이터 수정 실패" 오류

메이크샵에서 가장 흔한 오류입니다. **원인이 명확히 표시되지 않아** 수동으로 찾아야 합니다.

#### 8.1.1 원인별 해결책

| 원인 | 증상 | 해결책 | 검색 명령어 |
|------|------|--------|------------|
| **이모지** | 📍❤️🗺️ 등 사용 | HTML 엔티티/Font Awesome | `grep -P "[\x{1F300}-\x{1F9FF}]"` |
| **async/await** | `async function` 사용 | Promise 체이닝 | `grep -E 'async\|await'` |
| **템플릿 리터럴** | `` `${var}` `` | 문자열 연결 또는 `\${var}` | `grep '\$\{'` |
| **인라인 핸들러** | `onclick="..."` | `addEventListener` | `grep -E 'on(click\|error\|load)='` |
| **파일 크기** | 40KB 초과 | 파일 분할 | `ls -lh file.js` |
| **긴 문자열 연결** | 15줄+ HTML 연결 | 중간 변수 사용 | 육안 확인 |

#### 8.1.2 이진 탐색(Binary Search) 디버깅

**파일이 너무 커서 원인을 못 찾을 때:**

1. **절반으로 나누기**
   ```javascript
   // 원본 (2,000줄)
   var code = '...2,000줄...';

   // 상반부만 저장 시도 (1,000줄)
   var code = '...1,000줄...';  // 저장 성공? → 하반부에 문제
                                 // 저장 실패? → 상반부에 문제
   ```

2. **문제 영역 다시 절반으로**
   ```javascript
   // 하반부 (1,000줄)
   var code = '...500줄...';  // 저장 성공? → 나머지 500줄에 문제
   ```

3. **반복하여 문제 라인 특정**
   ```
   2,000줄 → 1,000줄 → 500줄 → 250줄 → 125줄 → ... → 1줄
   ```

#### 8.1.3 최소 재현 테스트

**작은 코드로 테스트:**

```javascript
// 1. 최소 코드 (저장 성공 확인)
console.log('Hello');

// 2. 의심 코드 추가 (저장 실패? → 이게 원인!)
console.log('Hello');
var message = `안녕 ${name}`;  // 템플릿 리터럴

// 3. 수정 후 재시도
console.log('Hello');
var message = '안녕 ' + name;  // 저장 성공!
```

### 8.2 디버깅 도구

#### 8.2.1 명령어 모음

**이모지 검색:**
```bash
# UTF-8 4바이트 문자 (📍❤️🗺️ 등)
grep -P "[\x{1F300}-\x{1F9FF}]" file.js

# 모든 유니코드 이모지
grep -P "[\x{1F000}-\x{1FFFF}]" file.js

# 디렉토리 전체 검색
grep -rP "[\x{1F300}-\x{1F9FF}]" src/

# 파일명과 라인번호 표시
grep -nP "[\x{1F300}-\x{1F9FF}]" file.js
```

**async/await 검색:**
```bash
grep -E 'async\s+function|await\s+' file.js
grep -rn 'async\|await' src/
```

**템플릿 리터럴 검색:**
```bash
# 백틱 사용
grep '`' file.js

# ${} 사용 (이스케이프 안 된 것)
grep '\$\{' file.js

# 백슬래시로 이스케이프된 것 제외
grep -P '\$\{(?!\\)' file.js
```

**인라인 이벤트 핸들러 검색:**
```bash
grep -E 'on(click|error|load|change|submit|keyup|keydown)=' file.html
grep -rn 'onclick\|onerror' src/
```

**파일 크기 확인:**
```bash
# 단일 파일
ls -lh file.js
wc -c file.js  # 바이트 단위

# 디렉토리 내 모든 파일
ls -lh src/js/*.js

# 40KB 초과 파일 찾기
find src/js -name "*.js" -size +40k

# 크기 순 정렬
ls -lhS src/js/*.js
```

#### 8.2.2 브라우저 콘솔 디버깅

**초기화 상태 확인:**
```javascript
// 전역 변수 확인
console.log('MyApp:', window.MyApp);
console.log('Config:', window.MyApp?.config);
console.log('초기화:', window.MyApp?.initialized);

// 모든 전역 변수 확인
console.log('전역 변수:', Object.keys(window).filter(k => !window.hasOwnProperty.call(Window.prototype, k)));
```

**로컬스토리지 확인:**
```javascript
// 전체 조회
console.log('LocalStorage:', localStorage);

// 특정 키 조회
var data = localStorage.getItem('partners_cache');
console.log('캐시:', JSON.parse(data));

// 전체 삭제
localStorage.clear();

// 특정 키 삭제
localStorage.removeItem('partners_cache');
```

**이벤트 리스너 확인:**
```javascript
// 특정 요소의 리스너
var elem = document.getElementById('my-button');
console.log('리스너:', getEventListeners(elem));

// document 전체 리스너 (Chrome 전용)
console.log('document 리스너:', getEventListeners(document));

// 리스너 개수 (메모리 누수 체크)
var clickListeners = getEventListeners(document).click || [];
console.log('클릭 리스너:', clickListeners.length + '개');
```

**네트워크 요청 모니터링:**
```javascript
// Fetch 후킹
var originalFetch = window.fetch;
window.fetch = function() {
  console.log('Fetch:', arguments[0]);
  return originalFetch.apply(this, arguments);
};

// XMLHttpRequest 후킹
var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  console.log('XHR:', method, url);
  return originalOpen.apply(this, arguments);
};
```

**성능 측정:**
```javascript
// 함수 실행 시간
console.time('loadData');
loadData().then(function() {
  console.timeEnd('loadData');  // loadData: 245.67ms
});

// 메모리 사용량 (Chrome)
console.log('메모리:', performance.memory);
```

### 8.3 일반적인 오류 패턴

#### 8.3.1 "Uncaught ReferenceError: X is not defined"

**원인**: Part 순서가 잘못되어 변수/함수가 정의되기 전에 사용됨

```javascript
// ❌ 잘못된 순서

// Part 1: main.js
MyApp.init();  // ReferenceError: MyApp is not defined

// Part 2: app.js
var MyApp = { init: function() {...} };
```

**해결:**
```javascript
// ✅ 올바른 순서

// Part 1: app.js
var MyApp = { init: function() {...} };

// Part 2: main.js
MyApp.init();  // 정상 작동
```

#### 8.3.2 "Uncaught TypeError: X is not a function"

**원인**: 메서드 호출 시점에 객체가 완전히 초기화되지 않음

```javascript
// ❌ 문제 코드
var MyApp = {
  init: function() {
    this.loadData();  // TypeError: this.loadData is not a function
  }
};

MyApp.loadData = function() {  // init 후에 정의됨
  console.log('로드');
};

MyApp.init();
```

**해결:**
```javascript
// ✅ 수정 코드
var MyApp = {
  init: function() {
    this.loadData();
  },

  loadData: function() {  // init 전에 정의
    console.log('로드');
  }
};

MyApp.init();
```

#### 8.3.3 "Uncaught SyntaxError: Unexpected token"

**원인**: ES6+ 문법 사용

```javascript
// ❌ ES6 화살표 함수
var items = [1, 2, 3];
var doubled = items.map(x => x * 2);  // SyntaxError

// ✅ ES5 함수
var items = [1, 2, 3];
var doubled = items.map(function(x) {
  return x * 2;
});
```

#### 8.3.4 이벤트 핸들러가 작동하지 않음

**원인**: DOM 로드 전에 이벤트 리스너 등록

```javascript
// ❌ 문제 코드 (DOM이 아직 없음)
document.getElementById('myButton').addEventListener('click', handleClick);
// TypeError: Cannot read property 'addEventListener' of null

// ✅ 해결 1: DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('myButton').addEventListener('click', handleClick);
});

// ✅ 해결 2: 스크립트를 </body> 직전에 배치
// (HTML이 모두 로드된 후 스크립트 실행)
```

### 8.4 로그 전략

#### 8.4.1 개발 모드 로그

```javascript
var CONFIG = {
  debug: true  // 개발: true, 운영: false
};

function log() {
  if (CONFIG.debug) {
    console.log.apply(console, arguments);
  }
}

function warn() {
  if (CONFIG.debug) {
    console.warn.apply(console, arguments);
  }
}

function error() {
  console.error.apply(console, arguments);  // 운영에서도 오류는 로그
}

// 사용
log('데이터 로드 시작');
warn('캐시 만료됨');
error('API 호출 실패:', err);
```

#### 8.4.2 단계별 로그

```javascript
function loadPartners() {
  console.log('[1/5] 파트너 로드 시작');

  return fetchCache()
    .then(function(cache) {
      if (cache) {
        console.log('[2/5] 캐시 사용:', cache.length + '개');
        return cache;
      }

      console.log('[2/5] 캐시 없음, API 호출');
      return fetch('/api/partners')
        .then(function(res) {
          console.log('[3/5] API 응답:', res.status);
          return res.json();
        })
        .then(function(data) {
          console.log('[4/5] 데이터 파싱:', data.length + '개');
          saveCache(data);
          return data;
        });
    })
    .then(function(data) {
      console.log('[5/5] 렌더링 완료');
      renderPartners(data);
    })
    .catch(function(err) {
      console.error('[ERROR]', err);
    });
}
```

---

## 9. 아이콘/이미지 처리

### 9.1 아이콘 표현 방법 (우선순위)

메이크샵은 UTF-8 4바이트 이모지를 차단하므로, 대안이 필요합니다.

#### 9.1.1 방법 1: HTML 엔티티 (가장 안전)

**장점**: 외부 리소스 불필요, 가장 안정적
**단점**: 제한적인 아이콘 종류

```html
<!-- 자주 사용하는 HTML 엔티티 -->
<span>&hearts;</span>  ♥ 하트
<span>&phone;</span>   ☎ 전화
<span>&starf;</span>   ★ 별
<span>&clubs;</span>   ♣ 클럽
<span>&spades;</span>  ♠ 스페이드
<span>&diams;</span>   ♦ 다이아몬드

<!-- 10진수 코드 -->
<span>&#9742;</span>   ☎ 전화
<span>&#9733;</span>   ★ 별 (채움)
<span>&#9734;</span>   ☆ 별 (빈)
<span>&#128205;</span> (이모지는 차단됨)
```

**CSS 스타일링:**
```css
.icon-heart {
  color: #ff0000;
  font-size: 18px;
}

.icon-star {
  color: #ffd700;
}
```

#### 9.1.2 방법 2: Font Awesome (권장)

**장점**: 수천 개 아이콘, 쉬운 사용, 커스터마이징 용이
**단점**: 외부 CDN 의존

```html
<!-- HTML 탭 (head에 추가) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 사용 예시 -->
<button type="button">
  <i class="fa-solid fa-heart"></i> 즐겨찾기
</button>

<span><i class="fa-solid fa-phone"></i> 02-1234-5678</span>
<span><i class="fa-solid fa-map-marker-alt"></i> 서울특별시</span>
<span><i class="fa-solid fa-envelope"></i> email@example.com</span>

<!-- 크기 조절 -->
<i class="fa-solid fa-heart fa-lg"></i>    <!-- 1.33배 -->
<i class="fa-solid fa-heart fa-2x"></i>    <!-- 2배 -->
<i class="fa-solid fa-heart fa-3x"></i>    <!-- 3배 -->

<!-- 색상 변경 -->
<i class="fa-solid fa-heart" style="color: #ff0000;"></i>

<!-- 스피너 (로딩) -->
<i class="fa-solid fa-spinner fa-spin"></i>

<!-- 빈 아이콘 (regular) -->
<i class="fa-regular fa-heart"></i>  <!-- ♡ -->
<i class="fa-solid fa-heart"></i>    <!-- ♥ -->
```

**자주 사용하는 Font Awesome 아이콘:**
```html
<!-- 위치 -->
<i class="fa-solid fa-map-marker-alt"></i>
<i class="fa-solid fa-location-dot"></i>

<!-- 연락처 -->
<i class="fa-solid fa-phone"></i>
<i class="fa-solid fa-envelope"></i>
<i class="fa-solid fa-globe"></i>

<!-- UI -->
<i class="fa-solid fa-search"></i>
<i class="fa-solid fa-filter"></i>
<i class="fa-solid fa-times"></i>
<i class="fa-solid fa-bars"></i>

<!-- 상호작용 -->
<i class="fa-solid fa-heart"></i>
<i class="fa-regular fa-heart"></i>
<i class="fa-solid fa-star"></i>
<i class="fa-regular fa-star"></i>

<!-- 방향 -->
<i class="fa-solid fa-chevron-down"></i>
<i class="fa-solid fa-chevron-up"></i>
<i class="fa-solid fa-arrow-right"></i>

<!-- 기타 -->
<i class="fa-solid fa-spinner fa-spin"></i>  <!-- 로딩 -->
<i class="fa-solid fa-check"></i>             <!-- 체크 -->
<i class="fa-solid fa-exclamation-triangle"></i>  <!-- 경고 -->
```

#### 9.1.3 방법 3: SVG 인라인

**장점**: 완벽한 커스터마이징, 애니메이션 가능
**단점**: 코드가 길어짐

```html
<!-- 하트 아이콘 SVG -->
<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <path d="M10 18.35l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z"/>
</svg>

<!-- CSS로 색상 변경 -->
<svg class="icon-heart" width="20" height="20" viewBox="0 0 20 20">
  <path d="..."/>
</svg>

<style>
.icon-heart {
  fill: #ff0000;
}

.icon-heart:hover {
  fill: #ff6666;
}
</style>
```

**SVG 스프라이트 (여러 아이콘):**
```html
<!-- HTML 상단 -->
<svg style="display: none;">
  <symbol id="icon-heart" viewBox="0 0 20 20">
    <path d="M10 18.35l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z"/>
  </symbol>

  <symbol id="icon-phone" viewBox="0 0 20 20">
    <path d="..."/>
  </symbol>
</svg>

<!-- 사용 -->
<svg class="icon" width="20" height="20">
  <use href="#icon-heart"></use>
</svg>

<svg class="icon" width="20" height="20">
  <use href="#icon-phone"></use>
</svg>
```

#### 9.1.4 방법 4: 이미지 파일

**장점**: 복잡한 아이콘도 표현 가능
**단점**: 파일 관리 필요, HTTP 요청 증가

```html
<!-- 이미지 업로드: 메이크샵 파일 관리자 -->
<!-- /web/upload/my-project/icons/ -->

<img src="/web/upload/my-project/icons/heart.png"
     alt="하트"
     width="20"
     height="20">

<!-- 레티나 대응 -->
<img src="/web/upload/my-project/icons/heart.png"
     srcset="/web/upload/my-project/icons/heart@2x.png 2x"
     alt="하트"
     width="20"
     height="20">

<!-- CSS 배경 이미지 -->
<style>
.icon-heart {
  width: 20px;
  height: 20px;
  background-image: url('/web/upload/my-project/icons/heart.png');
  background-size: contain;
  background-repeat: no-repeat;
}
</style>

<span class="icon-heart"></span>
```

### 9.2 이모지 → 대안 변환 가이드

#### 9.2.1 자주 사용하는 이모지 변환표

| 이모지 | 의미 | HTML 엔티티 | Font Awesome | CSS 아이콘 |
|-------|------|------------|--------------|-----------|
| 📍 | 위치 | - | `fa-map-marker-alt` | `::before { content: '\1F4CD'; }` |
| ☎️ | 전화 | `&phone;` | `fa-phone` | `::before { content: '\260E'; }` |
| ❤️ | 하트 | `&hearts;` | `fa-heart` | `::before { content: '\2665'; }` |
| ⭐ | 별 | `&starf;` | `fa-star` | `::before { content: '\2605'; }` |
| 🗺️ | 지도 | - | `fa-map` | - |
| 📧 | 이메일 | - | `fa-envelope` | - |
| 🏠 | 집 | - | `fa-home` | - |
| ✅ | 체크 | - | `fa-check` | `::before { content: '\2713'; }` |
| ❌ | X | - | `fa-times` | `::before { content: '\2717'; }` |
| 🔍 | 검색 | - | `fa-search` | - |
| 📱 | 모바일 | - | `fa-mobile-alt` | - |
| 💬 | 말풍선 | - | `fa-comment` | - |

#### 9.2.2 자동 변환 스크립트

```javascript
// replace-emoji.js
const fs = require('fs');

const emojiMap = {
  '📍': '<i class="fa-solid fa-map-marker-alt"></i>',
  '☎️': '<i class="fa-solid fa-phone"></i>',
  '📞': '<i class="fa-solid fa-phone"></i>',
  '❤️': '<i class="fa-solid fa-heart"></i>',
  '⭐': '<i class="fa-solid fa-star"></i>',
  '🗺️': '<i class="fa-solid fa-map"></i>',
  '📧': '<i class="fa-solid fa-envelope"></i>',
  '🏠': '<i class="fa-solid fa-home"></i>',
  '✅': '<i class="fa-solid fa-check"></i>',
  '❌': '<i class="fa-solid fa-times"></i>',
  '🔍': '<i class="fa-solid fa-search"></i>'
};

function replaceEmojis(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  Object.keys(emojiMap).forEach(emoji => {
    const regex = new RegExp(emoji, 'g');
    content = content.replace(regex, emojiMap[emoji]);
  });

  fs.writeFileSync(filePath, content);
  console.log('✅ 이모지 변환 완료:', filePath);
}

// 사용
replaceEmojis('src/html/index.html');
replaceEmojis('src/js/components.js');
```

**사용:**
```bash
node replace-emoji.js
```

### 9.3 이미지 최적화

#### 9.3.1 파일 크기 최적화

```bash
# ImageOptim (Mac)
# https://imageoptim.com/

# TinyPNG (온라인)
# https://tinypng.com/

# 명령어 (ImageMagick)
convert input.png -quality 85 output.png
convert input.jpg -resize 50% output.jpg
```

#### 9.3.2 반응형 이미지

```html
<!-- 방법 1: srcset -->
<img src="logo.png"
     srcset="logo.png 1x,
             logo@2x.png 2x,
             logo@3x.png 3x"
     alt="로고">

<!-- 방법 2: picture 요소 -->
<picture>
  <source media="(min-width: 768px)" srcset="banner-desktop.jpg">
  <source media="(min-width: 480px)" srcset="banner-tablet.jpg">
  <img src="banner-mobile.jpg" alt="배너">
</picture>
```

#### 9.3.3 Lazy Loading

```html
<!-- 네이티브 Lazy Loading -->
<img src="image.jpg" loading="lazy" alt="이미지">

<!-- Intersection Observer -->
<img data-src="image.jpg" class="lazy" alt="이미지">

<script>
var lazyImages = document.querySelectorAll('.lazy');

var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var img = entry.target;
      img.src = img.getAttribute('data-src');
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach(function(img) {
  observer.observe(img);
});
</script>
```

---

## 10. 성능 최적화

### 10.1 캐싱 전략

#### 10.1.1 LocalStorage 캐싱

```javascript
var CACHE_KEY = 'partners_data_v1';
var CACHE_DURATION = 24 * 60 * 60 * 1000;  // 24시간

function getCache(key) {
  try {
    var cached = localStorage.getItem(key || CACHE_KEY);
    if (!cached) return null;

    var data = JSON.parse(cached);
    var now = Date.now();

    // 만료 확인
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key || CACHE_KEY);
      return null;
    }

    console.log('[Cache] 히트:', key || CACHE_KEY);
    return data.value;
  } catch (err) {
    console.error('[Cache] 오류:', err);
    return null;
  }
}

function setCache(value, key) {
  try {
    var data = {
      value: value,
      timestamp: Date.now()
    };
    localStorage.setItem(key || CACHE_KEY, JSON.stringify(data));
    console.log('[Cache] 저장:', key || CACHE_KEY);
  } catch (err) {
    console.error('[Cache] 저장 실패:', err);
    // LocalStorage 용량 초과 시 기존 캐시 삭제
    localStorage.clear();
  }
}

function clearCache(key) {
  if (key) {
    localStorage.removeItem(key);
  } else {
    localStorage.clear();
  }
  console.log('[Cache] 삭제:', key || '전체');
}

// 사용 예시
function loadPartners() {
  var cached = getCache();
  if (cached) {
    renderPartners(cached);
    return Promise.resolve(cached);
  }

  return fetch('/api/partners')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      setCache(data);
      renderPartners(data);
      return data;
    });
}
```

#### 10.1.2 SessionStorage vs LocalStorage

| 특징 | LocalStorage | SessionStorage |
|------|--------------|----------------|
| 유효기간 | 영구 (삭제 전까지) | 탭 닫으면 삭제 |
| 용량 | 5-10MB | 5-10MB |
| 공유 범위 | 모든 탭/창 | 현재 탭만 |
| 사용 사례 | 사용자 설정, 캐시 | 임시 데이터, 폼 입력 |

```javascript
// LocalStorage: 영구 저장
localStorage.setItem('user_settings', JSON.stringify(settings));

// SessionStorage: 임시 저장
sessionStorage.setItem('temp_data', JSON.stringify(data));
```

### 10.2 이벤트 최적화

#### 10.2.1 이벤트 위임 (Event Delegation)

**❌ 나쁜 예 (N개 리스너):**
```javascript
var items = document.querySelectorAll('.item');
items.forEach(function(item) {
  item.addEventListener('click', function() {
    handleClick(item);
  });
});

// 200개 요소 = 200개 리스너 (메모리 낭비!)
```

**✅ 좋은 예 (1개 리스너):**
```javascript
var container = document.getElementById('item-container');

container.addEventListener('click', function(e) {
  var item = e.target.closest('.item');
  if (item) {
    handleClick(item);
  }
});

// 200개 요소 = 1개 리스너 (97% 절감!)
```

**실전 예시 (파트너맵 v3):**
```javascript
// Before: 200개 파트너 × 3개 버튼 = 600개 리스너
partners.forEach(function(partner) {
  var favoriteBtn = partner.querySelector('.favorite-btn');
  var detailBtn = partner.querySelector('.detail-btn');
  var shareBtn = partner.querySelector('.share-btn');

  favoriteBtn.addEventListener('click', function() { ... });
  detailBtn.addEventListener('click', function() { ... });
  shareBtn.addEventListener('click', function() { ... });
});

// After: 3개 리스너 (99.5% 절감!)
document.getElementById('partner-list').addEventListener('click', function(e) {
  var target = e.target;

  if (target.matches('.favorite-btn') || target.closest('.favorite-btn')) {
    var btn = target.closest('.favorite-btn');
    var id = btn.getAttribute('data-id');
    toggleFavorite(id);
  }

  else if (target.matches('.detail-btn') || target.closest('.detail-btn')) {
    var btn = target.closest('.detail-btn');
    var id = btn.getAttribute('data-id');
    showDetail(id);
  }

  else if (target.matches('.share-btn') || target.closest('.share-btn')) {
    var btn = target.closest('.share-btn');
    var id = btn.getAttribute('data-id');
    showShareModal(id);
  }
});
```

#### 10.2.2 Debounce (입력 제한)

```javascript
function debounce(func, wait) {
  var timeout;

  return function() {
    var context = this;
    var args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

// 사용 예시: 검색 입력
var searchInput = document.getElementById('search');

searchInput.addEventListener('input', debounce(function(e) {
  var query = e.target.value;
  performSearch(query);  // API 호출
}, 300));  // 300ms 대기

// 타이핑 중에는 API 호출 안 함 → 300ms 후에만 호출
```

#### 10.2.3 Throttle (실행 제한)

```javascript
function throttle(func, limit) {
  var inThrottle;

  return function() {
    var context = this;
    var args = arguments;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;

      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}

// 사용 예시: 스크롤 이벤트
window.addEventListener('scroll', throttle(function() {
  console.log('스크롤 위치:', window.scrollY);
  // 무한 스크롤, 헤더 고정 등
}, 100));  // 100ms마다 최대 1회 실행
```

### 10.3 DOM 조작 최적화

#### 10.3.1 DocumentFragment 사용

**❌ 나쁜 예 (N번 리플로우):**
```javascript
var list = document.getElementById('partner-list');

partners.forEach(function(partner) {
  var li = document.createElement('li');
  li.textContent = partner.name;
  list.appendChild(li);  // 200번 리플로우!
});
```

**✅ 좋은 예 (1번 리플로우):**
```javascript
var list = document.getElementById('partner-list');
var fragment = document.createDocumentFragment();

partners.forEach(function(partner) {
  var li = document.createElement('li');
  li.textContent = partner.name;
  fragment.appendChild(li);  // 메모리에만 추가
});

list.appendChild(fragment);  // 1번만 리플로우
```

#### 10.3.2 innerHTML vs createElement

**빠른 방법 (innerHTML):**
```javascript
// 한 번에 많은 요소 생성 시 빠름
var html = partners.map(function(partner) {
  return '<li>' + escapeHtml(partner.name) + '</li>';
}).join('');

list.innerHTML = html;
```

**안전한 방법 (createElement):**
```javascript
// XSS 방지, 이벤트 리스너 보존
partners.forEach(function(partner) {
  var li = document.createElement('li');
  li.textContent = partner.name;  // 자동 이스케이프
  fragment.appendChild(li);
});
```

#### 10.3.3 가상 스크롤 (Virtual Scroll)

```javascript
// 10,000개 항목을 모두 렌더링하지 않고, 보이는 부분만 렌더링
var VirtualScroll = {
  container: null,
  items: [],
  itemHeight: 50,
  visibleCount: 20,
  currentIndex: 0,

  init: function(containerId, items) {
    this.container = document.getElementById(containerId);
    this.items = items;

    this.container.style.height = (this.visibleCount * this.itemHeight) + 'px';
    this.container.style.overflowY = 'scroll';

    this.render();

    this.container.addEventListener('scroll', this.onScroll.bind(this));
  },

  render: function() {
    var start = this.currentIndex;
    var end = Math.min(start + this.visibleCount, this.items.length);
    var fragment = document.createDocumentFragment();

    for (var i = start; i < end; i++) {
      var item = document.createElement('div');
      item.textContent = this.items[i].name;
      item.style.height = this.itemHeight + 'px';
      fragment.appendChild(item);
    }

    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  },

  onScroll: function(e) {
    var scrollTop = e.target.scrollTop;
    var newIndex = Math.floor(scrollTop / this.itemHeight);

    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.render();
    }
  }
};

// 사용
VirtualScroll.init('list-container', largeArray);
```

### 10.4 네트워크 최적화

#### 10.4.1 API 요청 배칭

```javascript
// ❌ 나쁜 예: 200개 요청
partners.forEach(function(partner) {
  fetch('/api/partners/' + partner.id)
    .then(function(res) { return res.json(); })
    .then(function(data) { updatePartner(data); });
});

// ✅ 좋은 예: 1개 요청
fetch('/api/partners?ids=' + partnerIds.join(','))
  .then(function(res) { return res.json(); })
  .then(function(data) { updatePartners(data); });
```

#### 10.4.2 요청 취소 (AbortController)

```javascript
var controller = new AbortController();
var signal = controller.signal;

fetch('/api/partners', { signal: signal })
  .then(function(res) { return res.json(); })
  .then(function(data) { renderPartners(data); })
  .catch(function(err) {
    if (err.name === 'AbortError') {
      console.log('요청 취소됨');
    } else {
      console.error('오류:', err);
    }
  });

// 3초 후 취소
setTimeout(function() {
  controller.abort();
}, 3000);

// 사용 예시: 검색 시 이전 요청 취소
var searchController = null;

function performSearch(query) {
  // 이전 요청 취소
  if (searchController) {
    searchController.abort();
  }

  searchController = new AbortController();

  fetch('/api/search?q=' + query, { signal: searchController.signal })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      renderSearchResults(data);
      searchController = null;
    })
    .catch(function(err) {
      if (err.name !== 'AbortError') {
        console.error('검색 오류:', err);
      }
    });
}
```

### 10.5 성능 측정

#### 10.5.1 Performance API

```javascript
// 함수 실행 시간 측정
performance.mark('start-load');

loadPartners().then(function() {
  performance.mark('end-load');
  performance.measure('load-partners', 'start-load', 'end-load');

  var measures = performance.getEntriesByName('load-partners');
  console.log('로드 시간:', measures[0].duration + 'ms');

  // 정리
  performance.clearMarks();
  performance.clearMeasures();
});
```

#### 10.5.2 User Timing

```javascript
var PerformanceMonitor = {
  start: function(name) {
    performance.mark(name + '-start');
  },

  end: function(name) {
    performance.mark(name + '-end');
    performance.measure(name, name + '-start', name + '-end');

    var measure = performance.getEntriesByName(name)[0];
    console.log('[Performance]', name + ':', measure.duration.toFixed(2) + 'ms');

    return measure.duration;
  },

  report: function() {
    var measures = performance.getEntriesByType('measure');
    console.table(measures.map(function(m) {
      return {
        이름: m.name,
        '시간(ms)': m.duration.toFixed(2)
      };
    }));
  }
};

// 사용
PerformanceMonitor.start('load-data');
loadData().then(function() {
  PerformanceMonitor.end('load-data');
});

PerformanceMonitor.start('render-ui');
renderUI();
PerformanceMonitor.end('render-ui');

PerformanceMonitor.report();
```

---

## 11. 보안 고려사항

### 11.1 XSS (Cross-Site Scripting) 방지

#### 11.1.1 HTML 이스케이프

```javascript
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return String(text).replace(/[&<>"']/g, function(char) {
    return map[char];
  });
}

// 사용
var userName = '<script>alert("XSS")</script>';
var html = '<div>' + escapeHtml(userName) + '</div>';
// 결과: <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
```

#### 11.1.2 안전한 DOM 조작

**❌ 위험:**
```javascript
var userInput = prompt('이름을 입력하세요');
element.innerHTML = '<div>' + userInput + '</div>';  // XSS 취약!
```

**✅ 안전:**
```javascript
// 방법 1: textContent 사용
element.textContent = userInput;  // 자동 이스케이프

// 방법 2: createElement + textContent
var div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);

// 방법 3: innerHTML + 이스케이프
element.innerHTML = '<div>' + escapeHtml(userInput) + '</div>';
```

#### 11.1.3 DOMPurify (라이브러리)

```html
<!-- HTML 탭 -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

<!-- 사용 -->
<script>
var dirty = '<img src=x onerror=alert(1)//>';
var clean = DOMPurify.sanitize(dirty);
element.innerHTML = clean;  // 안전!
</script>
```

### 11.2 CSRF (Cross-Site Request Forgery) 방지

메이크샵은 서버 사이드이므로 CSRF 토큰을 자동으로 관리하지만, 외부 API 호출 시 주의 필요.

```javascript
// API 호출 시 CSRF 토큰 포함
fetch('/api/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify(data)
});

function getCsrfToken() {
  var meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}
```

### 11.3 민감 정보 보호

#### 11.3.1 API 키 관리

**❌ 절대 금지:**
```javascript
// 클라이언트 코드에 API 키 노출
var API_KEY = 'sk-1234567890abcdef';  // 누구나 볼 수 있음!

fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer ' + API_KEY
  }
});
```

**✅ 올바른 방법:**
```javascript
// 서버 프록시를 통해 API 호출
// 메이크샵 서버 측 스크립트 (PHP 등)에서 API 키 관리

fetch('/proxy/api-call')  // 메이크샵 내부 프록시
  .then(function(res) { return res.json(); })
  .then(function(data) { console.log(data); });
```

#### 11.3.2 LocalStorage 주의사항

**❌ 위험:**
```javascript
// 민감 정보를 LocalStorage에 저장 금지!
localStorage.setItem('password', userPassword);  // 누구나 볼 수 있음
localStorage.setItem('creditCard', cardNumber);  // 절대 금지
```

**✅ 안전:**
```javascript
// 비민감 정보만 저장
localStorage.setItem('user_settings', JSON.stringify(settings));
localStorage.setItem('theme', 'dark');

// 민감 정보는 서버 세션 사용
// (메이크샵 서버 측에서 관리)
```

### 11.4 Content Security Policy (CSP)

메이크샵에서 CSP 설정은 제한적이지만, 인라인 스크립트 최소화로 보안 향상 가능.

**권장 사항:**
- 인라인 `<script>` 최소화
- `eval()`, `new Function()` 사용 금지
- 외부 CDN은 신뢰할 수 있는 출처만 사용

```javascript
// ❌ 위험
eval('var x = 1 + 2;');  // 코드 인젝션 가능

var func = new Function('a', 'b', 'return a + b;');  // 위험

// ✅ 안전
var x = 1 + 2;

function add(a, b) {
  return a + b;
}
```

---

## 12. 테스트 방법

### 12.1 로컬 테스트

#### 12.1.1 로컬 서버 실행

```bash
# Python (가장 간단)
python3 -m http.server 8000
# http://localhost:8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

#### 12.1.2 테스트 HTML 파일

```html
<!-- test.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>메이크샵 로컬 테스트</title>

  <!-- CSS (빌드 결과) -->
  <link rel="stylesheet" href="dist/makeshop-css.css">
</head>
<body>

  <!-- HTML (빌드 결과) -->
  <div id="partner-map-app">
    <!-- 여기에 dist/makeshop-html.html 내용 복사 -->
  </div>

  <!-- JS (빌드 결과, 순서 주의!) -->
  <script src="dist/makeshop-js-part1.js"></script>
  <script src="dist/makeshop-js-part2.js"></script>
  <script src="dist/makeshop-js-part3.js"></script>

  <!-- 테스트 스크립트 -->
  <script>
    console.log('=== 로컬 테스트 시작 ===');
    console.log('MyApp:', window.MyApp);

    // 초기화 테스트
    if (window.MyApp && typeof window.MyApp.init === 'function') {
      window.MyApp.init();
      console.log('✅ 초기화 성공');
    } else {
      console.error('❌ MyApp.init이 없습니다!');
    }
  </script>
</body>
</html>
```

### 12.2 기능 테스트 체크리스트

```markdown
## 기능 테스트 체크리스트

### 페이지 로드
- [ ] 페이지가 3초 이내 로드됨
- [ ] 콘솔에 오류 없음
- [ ] 네트워크 탭에 404 오류 없음

### UI 렌더링
- [ ] 모든 요소가 올바르게 표시됨
- [ ] 아이콘이 정상적으로 보임 (이모지 → Font Awesome 변환)
- [ ] 레이아웃이 깨지지 않음

### 이벤트 처리
- [ ] 버튼 클릭 작동
- [ ] 검색 기능 작동
- [ ] 필터 기능 작동
- [ ] 모달 열기/닫기 작동

### 데이터 처리
- [ ] API 호출 성공
- [ ] 데이터가 올바르게 표시됨
- [ ] 캐싱 동작 확인
- [ ] 오류 처리 작동

### 반응형
- [ ] 모바일 (< 768px) 정상
- [ ] 태블릿 (768px ~ 992px) 정상
- [ ] 데스크톱 (> 992px) 정상

### 크로스 브라우저
- [ ] Chrome 정상
- [ ] Safari 정상
- [ ] Edge 정상
- [ ] Firefox 정상

### 성능
- [ ] 페이지 로드 시간 3초 이하
- [ ] 메모리 누수 없음
- [ ] 스크롤 부드러움
```

### 12.3 자동화 테스트

#### 12.3.1 Puppeteer 테스트

```javascript
// test/e2e.test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log('🧪 E2E 테스트 시작...');

  // 1. 페이지 로드
  await page.goto('http://localhost:8000/test.html');
  console.log('✅ 페이지 로드 성공');

  // 2. 초기화 확인
  const appExists = await page.evaluate(() => {
    return typeof window.MyApp !== 'undefined';
  });

  if (appExists) {
    console.log('✅ MyApp 초기화됨');
  } else {
    console.error('❌ MyApp이 없습니다!');
  }

  // 3. UI 요소 확인
  const buttonExists = await page.$('#my-button');
  if (buttonExists) {
    console.log('✅ 버튼 존재');
  }

  // 4. 버튼 클릭
  await page.click('#my-button');
  await page.waitForTimeout(500);
  console.log('✅ 버튼 클릭 성공');

  // 5. 콘솔 오류 확인
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('❌ 콘솔 오류:', msg.text());
    }
  });

  // 6. 스크린샷
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('✅ 스크린샷 저장');

  await browser.close();
  console.log('🎉 테스트 완료!');
})();
```

**실행:**
```bash
npm install puppeteer
node test/e2e.test.js
```

### 12.4 성능 테스트

#### 12.4.1 Lighthouse

```bash
# Chrome DevTools > Lighthouse 탭
# 또는 CLI

npm install -g lighthouse

lighthouse http://localhost:8000/test.html --view
```

#### 12.4.2 WebPageTest

온라인: https://www.webpagetest.org/

```
테스트 URL 입력 → Start Test
→ 성능 지표 확인:
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Total Blocking Time (TBT): < 300ms
```

---

## 13. 유지보수 가이드

### 13.1 버전 관리

#### 13.1.1 시맨틱 버저닝 (Semantic Versioning)

```
MAJOR.MINOR.PATCH

예: 1.2.3
  1: 주요 변경 (하위 호환 불가)
  2: 기능 추가 (하위 호환)
  3: 버그 수정
```

```javascript
// config.js
var APP_VERSION = '1.2.3';
var CACHE_VERSION = 'v1.2';  // 캐시 키 버전 (메이저.마이너)

console.log('[App] Version:', APP_VERSION);

// 캐시 키에 버전 포함
var CACHE_KEY = 'partners_data_' + CACHE_VERSION;
```

#### 13.1.2 변경 로그 (CHANGELOG.md)

```markdown
# 변경 로그

## [1.2.3] - 2026-02-11

### 수정
- 이모지 사용으로 인한 저장 실패 문제 해결
  - 모든 이모지를 Font Awesome 아이콘으로 교체
  - `grep -P "[\x{1F300}-\x{1F9FF}]"` 검색으로 확인

### 변경
- 이벤트 위임 방식으로 전환 (메모리 97% 절감)
  - Before: 600개 리스너
  - After: 3개 리스너

### 개선
- 9-Part 분할 구조로 변경
  - Part 1: 34KB (Config + API + Map)
  - Part 2-9: 각 2-27KB

## [1.2.2] - 2026-02-10

### 수정
- async/await 사용으로 인한 저장 실패 문제 해결
  - Promise 체이닝으로 변경

## [1.2.1] - 2026-02-09

### 추가
- 파트너 검색 기능 (Fuse.js)
- 즐겨찾기 기능 (LocalStorage)

## [1.2.0] - 2026-02-08

### 추가
- 네이버 지도 통합
- 마커 클러스터링

### 변경
- 파일 크기 40KB 제한으로 3-Part 분할

## [1.1.0] - 2026-02-07

### 추가
- 지역/카테고리 필터

## [1.0.0] - 2026-02-06

### 최초 배포
- 파트너 리스트 표시
- 상세보기 모달
```

### 13.2 문서화

#### 13.2.1 README.md

```markdown
# 파트너맵 v3

메이크샵 D4 플랫폼을 위한 전국 파트너 지도

## 기능

- 🗺️ 네이버 지도 통합
- 🔍 Fuse.js 검색 (한글 초성 지원)
- 📍 마커 클러스터링 (성능 최적화)
- ❤️ 즐겨찾기 (LocalStorage)
- 📱 모바일 반응형

## 빌드

```bash
./build.sh
```

## 배포

1. `dist/makeshop-html.html` → 메이크샵 HTML 탭
2. `dist/makeshop-css.css` → 메이크샵 CSS 탭
3. `dist/makeshop-js-part*.js` → 메이크샵 JS 탭 (순서대로)

## 기술 스택

- Vanilla JavaScript (ES5)
- 네이버 지도 API v3
- Fuse.js v7.0.0
- Font Awesome v6.4.0

## 라이선스

MIT
```

#### 13.2.2 코드 주석

```javascript
/**
 * 파트너 데이터 로드
 *
 * 1. 캐시 확인 (LocalStorage)
 * 2. 캐시 없으면 API 호출
 * 3. 캐시 저장 (24시간)
 * 4. UI 렌더링
 *
 * @returns {Promise<Array>} 파트너 배열
 */
function loadPartners() {
  var cached = getCache();
  if (cached) {
    renderPartners(cached);
    return Promise.resolve(cached);
  }

  return fetch('/api/partners')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      setCache(data);
      renderPartners(data);
      return data;
    });
}
```

### 13.3 모니터링

#### 13.3.1 오류 로깅

```javascript
// 전역 오류 핸들러
window.addEventListener('error', function(e) {
  console.error('[Global Error]', {
    message: e.message,
    source: e.filename,
    line: e.lineno,
    column: e.colno,
    error: e.error
  });

  // 선택: 서버로 오류 전송
  sendErrorToServer({
    message: e.message,
    stack: e.error ? e.error.stack : '',
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
});

// Promise 거부 처리
window.addEventListener('unhandledrejection', function(e) {
  console.error('[Unhandled Promise]', e.reason);
});

function sendErrorToServer(error) {
  // 메이크샵 서버 또는 외부 로깅 서비스로 전송
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(error)
  }).catch(function() {
    // 로깅 실패해도 앱은 계속 작동
  });
}
```

#### 13.3.2 사용자 분석

```javascript
// Google Analytics 4
// HTML 탭 (head에 추가)
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

// 커스텀 이벤트 트래킹
function trackEvent(category, action, label) {
  if (typeof gtag === 'function') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
}

// 사용
trackEvent('Partner', 'favorite', partnerId);
trackEvent('Search', 'query', searchQuery);
trackEvent('Filter', 'region', selectedRegion);
```

---

## 14. 메이크샵 고객센터 질문 가이드

### 14.1 효과적인 질문 템플릿

메이크샵 고객센터에 문의 시 참고할 템플릿입니다.

#### 14.1.1 저장 실패 관련

```
제목: [스마트디자인] JS 탭 저장 시 "데이터 수정 실패" 오류

안녕하세요.

스마트디자인 편집에서 JS 탭 저장 시 "데이터 수정 실패" 오류가 발생합니다.

**상황:**
- 메뉴: 디자인 설정 > 스마트디자인 관리 > [페이지명] 편집
- 탭: JS 탭
- 파일 크기: XX KB
- 오류 메시지: "데이터 수정 실패"

**질문:**
1. JS 탭에서 사용할 수 없는 JavaScript 문법이 있나요?
   (예: async/await, 템플릿 리터럴 등)

2. 파일 크기 제한이 있나요?

3. 특정 특수 문자가 차단되나요?
   (예: 이모지, 백슬래시 등)

4. 인라인 이벤트 핸들러(onclick 등)가 보안 정책으로 차단되나요?

5. 어떤 부분이 문제인지 확인할 수 있는 방법이 있나요?

감사합니다.
```

#### 14.1.2 기술 지원 범위 확인

```
제목: [스마트디자인] JavaScript ES6 문법 지원 여부

안녕하세요.

스마트디자인 편집에서 사용 가능한 JavaScript 버전/문법을 확인하고 싶습니다.

**질문:**
1. ES6+ 문법이 지원되나요?
   - let/const
   - Arrow Function (() => {})
   - Template Literal (`${}`)
   - async/await
   - class 키워드
   - Destructuring

2. 지원되지 않는 경우, 권장하는 JavaScript 버전은 무엇인가요?
   (ES5 기준으로 작성해야 하나요?)

3. 관련 공식 문서나 가이드가 있나요?

감사합니다.
```

#### 14.1.3 파일 분할 관련

```
제목: [스마트디자인] JS 파일 분할 및 순서

안녕하세요.

JavaScript 코드가 커서 여러 파일로 분할하려고 합니다.

**질문:**
1. JS 탭에 여러 파일을 붙여넣을 때 순서가 보장되나요?
   (위에서 아래로 순차 실행되나요?)

2. 파일을 분할할 때 권장 방법이 있나요?

3. 파일 간 의존성(변수/함수 참조)이 있을 때 주의사항이 있나요?

감사합니다.
```

### 14.2 참고 문서 요청

메이크샵 고객센터에 다음 문서를 요청하세요:

```markdown
## 요청할 문서 목록

1. **스마트디자인 편집 개발자 가이드**
   - JavaScript 지원 버전/문법
   - HTML/CSS 제약사항
   - 파일 크기 제한

2. **보안 정책 문서**
   - 차단되는 태그/속성
   - 인라인 스크립트 정책
   - XSS 방지 필터 규칙

3. **치환코드 레퍼런스**
   - 사용 가능한 모든 치환코드 목록
   - 조건문/반복문 사용법
   - 예제 코드

4. **파일 관리자 가이드**
   - 업로드 가능한 파일 형식
   - 파일 크기 제한
   - 경로 규칙

5. **API 문서**
   - 오픈 API 사용법
   - 권한 설정
   - 호출 제한
```

### 14.3 커뮤니티 활용

**메이크샵 개발자 커뮤니티:**
- 공식 카페: https://cafe.naver.com/makeshopdesign (가상 URL)
- 공식 블로그: 기술 블로그 확인
- YouTube: 메이크샵 공식 채널

**일반 개발 커뮤니티:**
- GitHub: 메이크샵 관련 오픈소스 검색
- Stack Overflow: `[makeshop]` 태그 검색

---

## 15. 실전 사례: 파트너맵 v3

### 15.1 프로젝트 개요

**프로젝트명**: 파트너맵 v3
**목적**: 전국 200개 제휴 업체를 지도에 표시
**기간**: 2026-02-06 ~ 2026-02-11 (6일)

**주요 기능:**
- 🗺️ 네이버 지도 API v3 통합
- 📍 마커 클러스터링 (성능 최적화)
- 🔍 Fuse.js 검색 (한글 초성 지원)
- 🏷️ 지역/카테고리 필터
- ❤️ 즐겨찾기 (LocalStorage)
- 📱 모바일 반응형

### 15.2 기술 스택

| 분류 | 기술 | 버전 | 사용 이유 |
|------|------|------|-----------|
| 지도 | 네이버 지도 API | v3 | 국내 지도 정확도 |
| 검색 | Fuse.js | 7.0.0 | 한글 퍼지 검색 |
| 아이콘 | Font Awesome | 6.4.0 | 이모지 대체 |
| JavaScript | Vanilla JS | ES5 | 메이크샵 호환 |

### 15.3 주요 해결 과제

#### 15.3.1 과제 1: 이모지 저장 실패

**문제:**
```javascript
var html = '<button>❤️ 즐겨찾기</button>';  // 저장 실패!
```

**원인**: UTF-8 4바이트 이모지 차단

**해결:**
```html
<!-- Font Awesome 아이콘으로 교체 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<button>
  <i class="fa-solid fa-heart"></i> 즐겨찾기
</button>
```

**검증:**
```bash
# 이모지 검색
grep -P "[\x{1F300}-\x{1F9FF}]" src/js/*.js
# 결과: 0개 (모두 제거 완료)
```

#### 15.3.2 과제 2: async/await 저장 실패

**문제:**
```javascript
async function loadPartners() {
  const response = await fetch('/api/partners');  // 저장 실패!
  const data = await response.json();
  return data;
}
```

**해결:**
```javascript
function loadPartners() {
  return fetch('/api/partners')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
}
```

#### 15.3.3 과제 3: 인라인 이벤트 핸들러 차단

**문제:**
```javascript
var html = '<button onclick="toggleFavorite(' + id + ')">즐겨찾기</button>';
// 저장은 성공하지만 클릭이 작동 안 함!
```

**해결 (이벤트 위임):**
```javascript
// HTML
var html = '<button class="favorite-btn" data-id="' + id + '">즐겨찾기</button>';

// JS (이벤트 위임)
document.getElementById('partner-list').addEventListener('click', function(e) {
  var btn = e.target.closest('.favorite-btn');
  if (btn) {
    var id = btn.getAttribute('data-id');
    toggleFavorite(id);
  }
});
```

**성과:**
- 이벤트 리스너 97% 감소 (600개 → 3개)
- 메모리 사용량 감소
- 동적 요소도 자동 처리

#### 15.3.4 과제 4: 파일 크기 초과

**문제:**
- 단일 파일: 97KB (저장 실패)

**해결 (9-Part 분할):**
```
Part 1 (34KB): config.js + api.js + map-init.js
Part 2 (27KB): filters.js + search.js
Part 3 (5KB):  partner-list-ui.js
Part 4 (4KB):  modal-ui.js
Part 5 (3KB):  favorite-ui.js
Part 6 (3KB):  share-ui.js
Part 7 (2KB):  toast-ui.js
Part 8 (7KB):  marker-clustering.js
Part 9 (12KB): main.js + event-delegation.js
```

**빌드 스크립트:**
```bash
#!/bin/bash
# build.sh

cat src/js/config.js src/js/api.js src/js/map-init.js > dist/makeshop-js-part1.js
cat src/js/filters.js src/js/search.js > dist/makeshop-js-part2.js
# ... (Part 3-8)
cat src/js/main.js src/js/event-delegation.js > dist/makeshop-js-part9.js

echo "✅ 빌드 완료"
ls -lh dist/makeshop-js-*.js
```

### 15.4 성과

#### 15.4.1 정량적 성과

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 저장 성공률 | 0% | 100% | - |
| 이벤트 리스너 | 600개 | 3개 | 99.5% |
| 파일 크기 (최대) | 97KB | 34KB | 65% |
| 페이지 로드 시간 | - | 1.2s | - |
| 마커 클러스터링 | ❌ | ✅ | 10배 빠름 |

#### 15.4.2 정성적 성과

✅ 메이크샵 저장 100% 성공
✅ 모든 브라우저에서 정상 작동
✅ 모바일 반응형 완벽 대응
✅ 검색 성능 우수 (200개 중 0.1ms 이내)
✅ 유지보수 용이 (기능별 파일 분할)

### 15.5 교훈

#### 15.5.1 메이크샵 개발 원칙

1. **ES5 우선**: ES6+ 문법 최소화
2. **이모지 금지**: Font Awesome 또는 HTML 엔티티
3. **이벤트 위임**: 인라인 핸들러 금지
4. **파일 분할**: 40KB 이하로 유지
5. **철저한 테스트**: 로컬 테스트 후 배포

#### 15.5.2 문제 해결 방법론

1. **최소 재현**: 작은 코드로 문제 확인
2. **이진 탐색**: 절반씩 나누어 원인 특정
3. **패턴 분석**: 유사 문제 경험 활용
4. **문서화**: 해결책을 MEMORY.md에 기록

### 15.6 코드 예시

#### 15.6.1 Part 1: Config + API

```javascript
// Part 1: Config + API + Map (34KB)
(function(window) {
  'use strict';

  // ========== Config ==========
  var CONFIG = {
    apiUrl: 'https://api.example.com',
    cacheKey: 'partners_v1',
    cacheDuration: 24 * 60 * 60 * 1000,
    debug: false
  };

  // ========== Utility ==========
  var Utils = {
    log: function() {
      if (CONFIG.debug) {
        console.log.apply(console, arguments);
      }
    },

    escapeHtml: function(text) {
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, function(char) {
        return map[char];
      });
    }
  };

  // ========== API ==========
  var API = {
    getPartners: function() {
      return fetch(CONFIG.apiUrl + '/partners')
        .then(function(res) { return res.json(); })
        .catch(function(err) {
          console.error('API Error:', err);
          return [];
        });
    }
  };

  // ========== Map Manager ==========
  var MapManager = {
    map: null,
    markers: [],

    init: function(containerId) {
      this.map = new naver.maps.Map(containerId, {
        center: new naver.maps.LatLng(37.5665, 126.9780),
        zoom: 12
      });
      Utils.log('Map initialized');
    },

    addMarker: function(partner) {
      var marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(partner.lat, partner.lng),
        map: this.map,
        title: partner.name
      });

      this.markers.push(marker);
      return marker;
    }
  };

  // 전역 노출
  window.PartnerMapApp = {
    CONFIG: CONFIG,
    Utils: Utils,
    API: API,
    MapManager: MapManager
  };

})(window);
```

#### 15.6.2 Part 9: Main + Init

```javascript
// Part 9: Main + Init (12KB)
(function(window, document) {
  'use strict';

  var App = window.PartnerMapApp;

  // ========== Main ==========
  var Main = {
    initialized: false,

    init: function() {
      if (this.initialized) return;

      App.Utils.log('App initializing...');

      // 지도 초기화
      App.MapManager.init('map');

      // 데이터 로드
      this.loadData();

      // 이벤트 등록
      this.attachEvents();

      this.initialized = true;
      App.Utils.log('App initialized!');
    },

    loadData: function() {
      App.API.getPartners()
        .then(function(partners) {
          partners.forEach(function(partner) {
            App.MapManager.addMarker(partner);
          });
        });
    },

    attachEvents: function() {
      // 이벤트 위임
      document.getElementById('partner-list').addEventListener('click', function(e) {
        var btn = e.target.closest('.favorite-btn');
        if (btn) {
          var id = btn.getAttribute('data-id');
          Main.toggleFavorite(id);
        }
      });
    },

    toggleFavorite: function(id) {
      App.Utils.log('Toggle favorite:', id);
      // 즐겨찾기 로직
    }
  };

  // DOMContentLoaded 시 자동 초기화
  document.addEventListener('DOMContentLoaded', function() {
    Main.init();
  });

  // 전역 노출
  App.Main = Main;

})(window, document);
```

---

## 16. 부록

### 16.1 빠른 참조

#### 16.1.1 금지 패턴 목록

| 패턴 | 대안 |
|------|------|
| `async function` | Promise 체이닝 (`.then()`) |
| `await` | `.then()` |
| `` `${var}` `` | `'문자' + var` 또는 `` `\${var}` `` |
| `onclick="..."` | `addEventListener` |
| `const`/`let` | `var` |
| `() => {}` | `function() {}` |
| 이모지 (📍❤️) | Font Awesome, HTML 엔티티 |
| `import`/`export` | IIFE 패턴 |

#### 16.1.2 권장 대안 목록

| 작업 | 권장 방법 |
|------|----------|
| 아이콘 표시 | Font Awesome CDN |
| 비동기 처리 | Promise 체이닝 |
| 문자열 조합 | `'문자' + var + '문자'` |
| 이벤트 처리 | 이벤트 위임 |
| 모듈 패턴 | IIFE |
| 캐싱 | LocalStorage |
| 파일 분할 | 기능별 3-9개 파일 |
| 디버깅 | `console.log` + Chrome DevTools |

#### 16.1.3 유용한 코드 스니펫

**debounce:**
```javascript
function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}
```

**throttle:**
```javascript
function throttle(func, limit) {
  var inThrottle;
  return function() {
    var context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(function() { inThrottle = false; }, limit);
    }
  };
}
```

**escapeHtml:**
```javascript
function escapeHtml(text) {
  var map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}
```

**LocalStorage 캐시:**
```javascript
function getCache(key) {
  try {
    var cached = localStorage.getItem(key);
    if (!cached) return null;
    var data = JSON.parse(cached);
    if (Date.now() - data.timestamp > 86400000) return null;  // 24시간
    return data.value;
  } catch (e) { return null; }
}

function setCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({
      value: value,
      timestamp: Date.now()
    }));
  } catch (e) { console.error('Cache error:', e); }
}
```

### 16.2 외부 리소스

#### 16.2.1 메이크샵 공식

- **메이크샵 고객센터**: https://www.makeshop.co.kr/
- **스마트디자인 가이드**: 고객센터에 문의
- **오픈 API 문서**: https://api.makeshop.co.kr/

#### 16.2.2 CDN

- **jsDelivr**: https://www.jsdelivr.com/
- **cdnjs**: https://cdnjs.com/
- **unpkg**: https://unpkg.com/

**자주 사용하는 라이브러리:**
```html
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Lodash -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

<!-- Axios -->
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>

<!-- Fuse.js (검색) -->
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>

<!-- DOMPurify (XSS 방지) -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

#### 16.2.3 학습 리소스

- **MDN Web Docs (ES5)**: https://developer.mozilla.org/ko/
- **JavaScript.info**: https://javascript.info/
- **Can I Use**: https://caniuse.com/ (브라우저 호환성)

### 16.3 용어집

| 용어 | 설명 |
|------|------|
| **IIFE** | Immediately Invoked Function Expression (즉시 실행 함수) |
| **이벤트 위임** | 부모 요소에서 자식 요소의 이벤트를 처리하는 패턴 |
| **Debounce** | 연속 이벤트를 마지막 이벤트만 처리 (검색 입력) |
| **Throttle** | 일정 시간마다 최대 1회 실행 (스크롤) |
| **Polyfill** | 구형 브라우저에서 최신 기능을 사용 가능하게 하는 코드 |
| **프로토콜 상대 URL** | `//cdn.example.com/file.js` (http/https 자동) |
| **XSS** | Cross-Site Scripting (악성 스크립트 삽입 공격) |
| **CSRF** | Cross-Site Request Forgery (위조 요청 공격) |
| **CSP** | Content Security Policy (콘텐츠 보안 정책) |
| **Lazy Loading** | 필요한 시점에만 리소스 로드 (성능 개선) |
| **Virtual Scroll** | 보이는 영역만 렌더링 (대량 데이터 최적화) |

---

## 마치며

이 가이드는 파트너맵 v3 프로젝트의 실전 경험을 바탕으로 작성되었습니다.

메이크샵 D4 플랫폼은 제약사항이 있지만, **올바른 접근 방법**을 알면 충분히 강력한 웹 애플리케이션을 구축할 수 있습니다.

**핵심 원칙:**
1. ✅ ES5 문법 우선
2. ❌ 이모지 금지 (Font Awesome 사용)
3. 🔄 이벤트 위임 패턴
4. 📦 파일 크기 40KB 이하
5. 🧪 철저한 로컬 테스트

**문의 및 기여:**
- 이 가이드에 대한 피드백이나 추가 사례가 있다면 공유해주세요.
- 메이크샵 개발자 커뮤니티에서 함께 발전시켜 나갑시다!

**버전 정보:**
- **v1.0.0** (2026-02-11): 최초 작성
- **작성자**: 파트너맵 v3 개발팀
- **라이선스**: MIT

---

**Happy Coding with MakeShop! 🎉**