# Part 2B1 메이크샵 저장 실패 - 디버그 패키지 요약

## 📦 생성된 파일 개요

### 문서 (2개)
1. **TEST-GUIDE-PART2B1.md** (6.3KB)
   - 상세 테스트 가이드
   - 문제 패턴 분석
   - 의심 구간 설명

2. **QUICK-TEST-CHECKLIST.md** (2.8KB)
   - 빠른 테스트 체크리스트
   - 우선순위 기반 테스트 순서
   - 즉시 적용 가능한 해결 방안

### 테스트 파일 (10개)

#### 1단계: 최소 URL 테스트 (3개) - 가장 빠른 진단
- `test-minimal-url.js` (807B)
  - https:// 포함 URL
  - 실패 예상

- `test-minimal-url-no-https.js` (889B)
  - 프로토콜 상대 URL (//)
  - 성공 예상

- `test-minimal-url-split.js` (1.0KB)
  - https: + // 문자열 분할
  - 성공 예상

#### 2단계: 모달 테스트 (2개) - 핵심 의심 구간
- `test-part2b1c-modal.js` (4.6KB)
  - 원본 모달 코드 (URL 포함)
  - 실패 예상

- `test-part2b1c-modal-no-url.js` (4.8KB)
  - URL 구간 주석 처리
  - 성공 예상

#### 3단계: 4분할 테스트 (3개) - 세밀 진단
- `test-part2b1a-init-loading.js` (6.3KB)
  - 초기화, 이벤트 리스너, 로딩, 토스트
  - 의심도: 중간

- `test-part2b1b-partner-list.js` (2.9KB)
  - 파트너 리스트 렌더링
  - 의심도: 낮음

- `test-part2b1d-favorite-share.js` (5.1KB)
  - 즐겨찾기, 공유 기능
  - 의심도: 낮음

#### 디버그용 (2개) - 참고
- `debug-part2b1-upper.js` (11KB)
  - 1-316줄 (상반부)

- `debug-part2b1-lower.js` (11KB)
  - 317-632줄 (하반부)

---

## 🎯 핵심 발견사항

### 의심 패턴
1. **외부 URL (3개)**
   - `https://map.naver.com/v5/search/`
   - `https://map.kakao.com/?q=`
   - `https://instagram.com/`

2. **encodeURIComponent 사용 (2개)**
   - 네이버 지도 주소 인코딩
   - 카카오맵 주소 인코딩

3. **조건부 URL 생성 (1개)**
   - Instagram URL 생성: `partner.instagram.startsWith('http')`

### 문제 위치 추정
**test-part2b1c-modal.js 라인 61-82**

```javascript
// 라인 61-63: 지도 URL
'<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
'<a href="https://map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +

// 라인 82: 인스타그램 URL
var instagramUrl = partner.instagram.startsWith('http') ? 
    partner.instagram : 
    'https://instagram.com/' + partner.instagram;
```

---

## 🚀 권장 테스트 순서

### Step 1: 최소 테스트 (5분)
```bash
# 메이크샵 JS 탭에 순서대로 저장 시도
1. test-minimal-url.js
2. test-minimal-url-no-https.js
```

**판정 기준**:
- 1번 실패 + 2번 성공 → **URL이 원인 확정** ✅
- 둘 다 성공 → 다른 원인 (Step 2로)
- 둘 다 실패 → encodeURIComponent 문제 (Step 2로)

### Step 2: 모달 테스트 (10분)
```bash
# Step 1에서 원인 불명확하면
1. test-part2b1c-modal.js
2. test-part2b1c-modal-no-url.js
```

**판정 기준**:
- 1번 실패 + 2번 성공 → **모달의 URL이 원인 확정** ✅
- 둘 다 실패 → 모달의 다른 코드 문제 (Step 3로)

### Step 3: 전체 분할 테스트 (20분)
```bash
# Step 2에서도 원인 불명확하면
1. test-part2b1a-init-loading.js
2. test-part2b1b-partner-list.js
3. test-part2b1d-favorite-share.js
```

---

## 💡 예상 해결 방안

### 시나리오 A: https:// 프로토콜이 문제 (가능성 90%)

**수정 옵션 1: 프로토콜 상대 URL**
```javascript
// ❌ 기존
'<a href="https://map.naver.com/v5/search/'

// ✅ 수정
'<a href="//map.naver.com/v5/search/'
```

**수정 옵션 2: 문자열 분할**
```javascript
// Part 1 (CONFIG)에 추가
protocol: 'https:',
separator: '//',

// Part 2B1에서 사용
'<a href="' + self.config.protocol + self.config.separator + 'map.naver.com/v5/search/'
```

**수정 옵션 3: URL을 CONFIG로 이동**
```javascript
// Part 1 (CONFIG)에 추가
naverMapUrl: 'https://map.naver.com/v5/search/',
kakaoMapUrl: 'https://map.kakao.com/?q=',
instagramBaseUrl: 'https://instagram.com/',

// Part 2B1에서 사용
'<a href="' + self.config.naverMapUrl + encodeURIComponent(partner.address) + '"'
```

### 시나리오 B: encodeURIComponent가 문제 (가능성 5%)

**수정: 커스텀 인코딩 함수**
```javascript
// Part 1에 추가
function simpleUrlEncode(str) {
    return str.replace(/ /g, '+')
              .replace(/\//g, '%2F');
}

// Part 2B1에서 사용
self.config.simpleUrlEncode(partner.address)
```

### 시나리오 C: .startsWith() 메서드 문제 (가능성 5%)

**수정: indexOf로 교체**
```javascript
// ❌ 기존
partner.instagram.startsWith('http')

// ✅ 수정
partner.instagram.indexOf('http') === 0
```

---

## 📊 테스트 결과 기록 템플릿

```
[테스트 일시] YYYY-MM-DD HH:MM

[Step 1: 최소 URL 테스트]
□ test-minimal-url.js
  - 결과: [성공/실패]
  - 에러: _______________________________

□ test-minimal-url-no-https.js
  - 결과: [성공/실패]
  - 에러: _______________________________

[Step 2: 모달 테스트]
□ test-part2b1c-modal.js
  - 결과: [성공/실패]
  - 에러: _______________________________

□ test-part2b1c-modal-no-url.js
  - 결과: [성공/실패]
  - 에러: _______________________________

[Step 3: 4분할 테스트]
□ test-part2b1a-init-loading.js
  - 결과: [성공/실패]

□ test-part2b1b-partner-list.js
  - 결과: [성공/실패]

□ test-part2b1d-favorite-share.js
  - 결과: [성공/실패]

[결론]
원인: _________________________________
해결 방안: _____________________________
```

---

## 📁 파일 구조

```
/Users/jangjiho/workspace/partner-map/
├── makeshop-js-part2b1-no-inline.js  (원본 파일)
│
├── 📄 문서
│   ├── TEST-GUIDE-PART2B1.md
│   ├── QUICK-TEST-CHECKLIST.md
│   └── PART2B1-DEBUG-SUMMARY.md (본 파일)
│
├── 🧪 1단계: 최소 URL 테스트
│   ├── test-minimal-url.js
│   ├── test-minimal-url-no-https.js
│   └── test-minimal-url-split.js
│
├── 🧪 2단계: 모달 테스트
│   ├── test-part2b1c-modal.js
│   └── test-part2b1c-modal-no-url.js
│
├── 🧪 3단계: 4분할 테스트
│   ├── test-part2b1a-init-loading.js
│   ├── test-part2b1b-partner-list.js
│   └── test-part2b1d-favorite-share.js
│
└── 🔍 디버그 참고
    ├── debug-part2b1-upper.js
    └── debug-part2b1-lower.js
```

---

## 🎬 다음 액션

### 즉시 실행
1. **QUICK-TEST-CHECKLIST.md** 열기
2. Step 1부터 순서대로 테스트
3. 원인 특정되면 해결 방안 적용
4. 원본 파일 수정 후 재업로드

### 원인 특정 후
1. 이 문서의 해결 방안 참고
2. `makeshop-js-part2b1-no-inline.js` 수정
3. 메이크샵에 업로드
4. 브라우저에서 동작 확인
5. 다른 Part 파일들도 동일 패턴 수정

---

## 📞 참고 정보

- 원본 파일 라인 수: 634줄
- 주요 기능: UI 컴포넌트 (토스트, 모달, 즐겨찾기, 공유)
- 의심 구간: 라인 393-416 (모달의 URL 생성 부분)
- 예상 소요 시간: 15-30분 (테스트 + 수정)

---

**생성 일시**: $(date +"%Y-%m-%d %H:%M:%S")
**목적**: makeshop-js-part2b1-no-inline.js 메이크샵 저장 실패 원인 특정
**방법론**: 이진 탐색 (Binary Search) + 최소 재현 테스트
