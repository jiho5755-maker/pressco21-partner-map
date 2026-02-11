# 메이크샵 저장 완벽 가이드

## 🎯 핵심 요약

메이크샵 D4는 **단일 파일 크기 제한**이 있습니다.
→ **3개 파일로 분할**하여 저장해야 합니다.

## 📝 저장 순서

### 1️⃣ HTML 탭

```
경로: 메이크샵 관리자 > 쇼핑몰 디자인 > 페이지 디자인 편집 > HTML 탭

파일: makeshop-html.html
방법:
1. 기존 내용 전체 삭제
2. makeshop-html.html 파일 열기
3. 전체 복사 (Ctrl+A → Ctrl+C)
4. 붙여넣기 (Ctrl+V)
5. 저장 버튼 클릭
```

### 2️⃣ JS 탭 (중요!)

```
경로: 메이크샵 관리자 > 쇼핑몰 디자인 > 페이지 디자인 편집 > JS 탭

⚠️ 중요: 3개 파일을 순서대로 붙여넣기!

단계:
1. 기존 내용 전체 삭제

2. makeshop-js-part1.js 파일 열기
   → 전체 복사 (Ctrl+A → Ctrl+C)
   → 붙여넣기 (Ctrl+V)

3. makeshop-js-part2a.js 파일 열기
   → 전체 복사 (Ctrl+A → Ctrl+C)
   → Part 1 바로 아래에 이어서 붙여넣기 (Ctrl+V)

4. makeshop-js-part2b.js 파일 열기
   → 전체 복사 (Ctrl+A → Ctrl+C)
   → Part 2A 바로 아래에 이어서 붙여넣기 (Ctrl+V)

5. 저장 버튼 클릭
```

### ✅ 저장 후 확인

```
1. "저장되었습니다" 메시지 확인
2. 쇼핑몰 페이지 열기
3. F12 (개발자 도구) 열기
4. 콘솔에서 확인:
   console.log(window.PartnerMapApp);
   → 객체가 나오면 성공!
```

---

## 🚨 자주 하는 실수

### ❌ 실수 1: 순서 바꿔서 붙여넣기

```
Part 2A → Part 1 → Part 2B  (X)
Part 1 → Part 2B → Part 2A  (X)
```

✅ **올바른 순서**: Part 1 → Part 2A → Part 2B

**왜 순서가 중요한가요?**
- Part 1: 기본 설정 (config) 정의
- Part 2A: Part 1의 설정을 사용하는 필터/검색 기능
- Part 2B: Part 1, 2A를 모두 사용하는 UI 및 초기화

순서가 바뀌면 undefined 오류가 발생합니다!

---

### ❌ 실수 2: 파일 일부만 복사

```
파일을 열었는데 일부만 선택해서 복사
```

✅ **올바른 방법**: Ctrl+A (전체 선택) 후 복사

**확인 방법**:
- Part 1: 약 34KB (1000줄)
- Part 2A: 약 27KB (800줄)
- Part 2B: 약 29KB (900줄)

붙여넣은 후 스크롤을 내려서 파일 끝까지 있는지 확인하세요.

---

### ❌ 실수 3: 압축 버전과 원본 혼용

```
Part 1 (원본) + Part 2A (압축) + Part 2B (원본)
```

✅ **올바른 방법**: 모두 원본 또는 모두 압축

**권장**: 원본 버전 사용 (압축 없이도 저장 가능)
- makeshop-js-part1.js
- makeshop-js-part2a.js
- makeshop-js-part2b.js

---

### ❌ 실수 4: 중간에 빈 줄 또는 추가 코드 삽입

```
Part 1
[여기에 빈 줄 여러 개 또는 다른 코드 추가]
Part 2A
```

✅ **올바른 방법**: 3개 파일을 연속으로 붙여넣기 (중간에 아무것도 추가하지 않음)

---

## 🔍 문제 해결

### "데이터 수정 실패" 오류

#### 원인 1: 파일 순서가 잘못됨

→ **해결**: JS 탭 내용 전체 삭제하고 다시 순서대로 붙여넣기

**단계**:
1. JS 탭에서 Ctrl+A (전체 선택)
2. Delete (삭제)
3. Part 1, 2A, 2B 순서대로 다시 붙여넣기

---

#### 원인 2: 파일이 최신이 아님

→ **해결**: `npm run build` 실행 후 다시 붙여넣기

**단계**:
```bash
cd /Users/jangjiho/workspace/partner-map
npm run build
```

빌드 후 생성된 파일 사용:
- makeshop-js-part1.js (최신)
- makeshop-js-part2a.js (최신)
- makeshop-js-part2b.js (최신)

---

#### 원인 3: 파일 전체가 복사되지 않음

→ **해결**: Ctrl+A로 전체 선택 후 다시 복사

**확인 방법**:
1. 파일을 메모장/에디터로 열기
2. Ctrl+A (전체 선택)
3. 하단 상태바에서 줄 수 확인:
   - Part 1: 약 1000줄
   - Part 2A: 약 800줄
   - Part 2B: 약 900줄

---

#### 원인 4: 메이크샵 서버 오류

→ **해결**: 잠시 후 다시 시도

**단계**:
1. 5분 정도 기다림
2. 브라우저 새로고침 (F5)
3. 다시 저장 시도

---

### 지도가 표시되지 않음

#### 원인: HTML 탭에 네이버 지도 SDK 누락

→ **해결**: HTML 탭 확인

**단계**:
1. HTML 탭 열기
2. 다음 코드가 있는지 확인:

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=bfp8odep5r"></script>
```

3. 없으면 `makeshop-html.html`의 전체 내용을 다시 붙여넣기

---

### 콘솔에 "undefined" 오류

#### 원인: 파일 순서 문제 또는 일부 파일 누락

→ **해결**: 3개 파일이 모두 올바른 순서로 있는지 확인

**확인 방법**:
1. F12 (개발자 도구) 열기
2. Console 탭에서 오류 메시지 확인
3. 어떤 변수가 undefined인지 확인

**예시**:
```
ReferenceError: CONFIG is not defined
→ Part 1이 누락되었거나 순서가 잘못됨
```

**해결**:
- JS 탭 전체 삭제
- Part 1, 2A, 2B 순서대로 다시 붙여넣기

---

## 💡 팁

### 빠르게 저장하기

#### 방법 1: 파일 3개를 미리 메모장에 준비

```
1. 메모장 3개 열기
2. Part 1, 2A, 2B 각각 복사해두기
3. 메이크샵 JS 탭에서 순서대로 붙여넣기
```

---

#### 방법 2: 하나의 임시 파일로 합치기

```bash
# 터미널에서 실행
cd /Users/jangjiho/workspace/partner-map
cat makeshop-js-part1.js makeshop-js-part2a.js makeshop-js-part2b.js > temp-combined.js
```

그 다음:
1. `temp-combined.js` 파일 열기
2. Ctrl+A (전체 선택)
3. Ctrl+C (복사)
4. 메이크샵 JS 탭에 Ctrl+V (붙여넣기)
5. 저장

**주의**: 이 방법도 동일하게 작동하지만, 개별 파일로 관리하는 것이 유지보수에 더 좋습니다.

---

### 저장 전 체크리스트

```
[ ] Part 1 파일 전체 복사 완료
[ ] Part 2A 파일 전체 복사 완료
[ ] Part 2B 파일 전체 복사 완료
[ ] 순서 확인: 1 → 2A → 2B
[ ] 중간에 추가 코드 없음
[ ] 모두 원본 버전 (또는 모두 압축 버전)
```

---

### 저장 후 테스트

```
1. 쇼핑몰 페이지 열기
2. F12 (개발자 도구) 열기
3. Console 탭에서:

   console.log(window.PartnerMapApp);
   → {config: {...}, apiClient: {...}, ...} 출력되면 성공!

4. 지도가 보이는지 확인
5. 검색 기능 테스트
6. 필터 기능 테스트
```

---

## 📊 파일 크기 참고

### 원본 버전 (권장)

```
Part 1:  34KB (약 1000줄)
Part 2A: 27KB (약 800줄)
Part 2B: 29KB (약 900줄)
합계:    90KB (약 2700줄)
```

### 압축 버전 (옵션)

```
Part 1:  23KB
Part 2A: 18KB
Part 2B: 19KB
합계:    60KB
```

**참고**: 메이크샵은 각 파일의 크기만 확인하므로, 합계가 90KB여도 각 파일이 40KB 이하면 저장 가능합니다.

---

## 🎓 메이크샵 D4의 제한 이해하기

### 왜 파일을 분할해야 하나요?

메이크샵 D4는 보안 및 성능상의 이유로 **단일 JS 파일의 크기를 제한**합니다.

- **제한 크기**: 약 30-40KB (정확한 수치는 비공개)
- **우리의 파일**: 원본 57KB, 압축 50KB → 모두 제한 초과
- **해결책**: 3개로 분할 (각 34KB, 27KB, 29KB)

---

### 분할해도 정상 작동하는 이유

JavaScript는 **순차적으로 실행**되므로, 3개 파일을 순서대로 붙여넣으면 하나의 파일처럼 작동합니다.

```javascript
// Part 1
const CONFIG = { ... };

// Part 2A (Part 1의 CONFIG 사용 가능)
const filters = new FilterService(CONFIG);

// Part 2B (Part 1, 2A 모두 사용 가능)
const app = new App(CONFIG, filters);
```

**중요**: 이것이 순서가 중요한 이유입니다!

---

### 왜 압축 버전도 만들었나요?

초기에는 파일 크기를 줄이기 위해 압축(minify)을 시도했습니다.

- **압축 전**: 57KB → 저장 실패
- **압축 후**: 50KB → 여전히 저장 실패
- **분할 (압축 안 함)**: 34KB + 27KB + 29KB → 저장 성공!

**결론**: 압축보다 **분할**이 핵심입니다.

---

## 📞 도움이 필요하면

1. [README.md](./README.md) 먼저 확인
2. 브라우저 콘솔(F12) 에러 메시지 확인
3. 이 가이드의 "문제 해결" 섹션 확인
4. 그래도 해결 안 되면 이슈 등록

---

## 📚 추가 자료

- [README.md](./README.md) - 프로젝트 전체 가이드
- [build.sh](./build.sh) - 빌드 스크립트
- [package.json](./package.json) - npm 명령어

---

**마지막 업데이트**: 2026-02-11
**버전**: 3.0.0
