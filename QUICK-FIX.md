# 파트너맵 무한 로딩 빠른 해결 가이드

## 🔴 문제
페이지가 무한 로딩 상태 → **메이크샵에 코드를 아직 업로드하지 않았습니다**

## ✅ 해결 방법 (10분 소요)

---

### 1️⃣ 파일 위치 확인

```bash
/Users/jangjiho/workspace/partner-map/
├── makeshop-html.html       ← HTML 탭용
├── makeshop-css.css         ← CSS 탭용
├── makeshop-js-part1.js     ← JS 탭용 (1/3)
├── makeshop-js-part2a.js    ← JS 탭용 (2/3)
└── makeshop-js-part2b.js    ← JS 탭용 (3/3)
```

---

### 2️⃣ 메이크샵 관리자 접속

1. https://foreverlove.co.kr/myadmin/ 로그인
2. **쇼핑몰 디자인 > 페이지 디자인 편집** 메뉴 이동
3. 프리뷰 페이지 (`dgnset_id=49398`) 선택

---

### 3️⃣ HTML 탭 - 코드 붙여넣기

**파일**: `makeshop-html.html`

1. **디자인 편집 (HTML) 탭** 클릭
2. `makeshop-html.html` 파일 열기
3. **Ctrl+A** (전체 선택)
4. **Ctrl+C** (복사)
5. 메이크샵 HTML 탭에서 원하는 위치에 **Ctrl+V** (붙여넣기)
6. **저장** 클릭

---

### 4️⃣ CSS 탭 - 코드 붙여넣기

**파일**: `makeshop-css.css`

1. **CSS 탭** 클릭
2. `makeshop-css.css` 파일 열기
3. **Ctrl+A** (전체 선택)
4. **Ctrl+C** (복사)
5. 메이크샵 CSS 탭 **맨 아래**에 **Ctrl+V** (붙여넣기)
6. **저장** 클릭

---

### 5️⃣ JS 탭 - 3개 파일 순서대로 붙여넣기

**⚠️ 순서가 매우 중요합니다!**

#### Part 1

```
파일: makeshop-js-part1.js

1. JS 탭 클릭
2. 파일 열기
3. Ctrl+A (전체 선택)
4. Ctrl+C (복사)
5. JS 탭 맨 아래에 Ctrl+V (붙여넣기)
```

#### Part 2A

```
파일: makeshop-js-part2a.js

1. 파일 열기
2. Ctrl+A
3. Ctrl+C
4. Part 1 바로 아래에 이어서 Ctrl+V
```

#### Part 2B

```
파일: makeshop-js-part2b.js

1. 파일 열기
2. Ctrl+A
3. Ctrl+C
4. Part 2A 바로 아래에 이어서 Ctrl+V
5. 저장 클릭
```

---

### 6️⃣ 확인

브라우저에서 페이지 열기:
```
https://foreverlove.co.kr/preview/?dgnset_id=49398&dgnset_type=RW&user_device_type=PC
```

**F12 (개발자 도구) > Console**에서:
```javascript
console.log(window.PartnerMapApp);
```

**예상 결과**: 객체가 출력되면 성공!

---

## 📋 빠른 체크리스트

- [ ] HTML 탭에 `makeshop-html.html` 붙여넣기
- [ ] CSS 탭에 `makeshop-css.css` 붙여넣기
- [ ] JS 탭에 `part1.js` 붙여넣기
- [ ] JS 탭에 `part2a.js` 붙여넣기 (part1 바로 아래)
- [ ] JS 탭에 `part2b.js` 붙여넣기 (part2a 바로 아래)
- [ ] 저장 확인
- [ ] 페이지 테스트

---

## ⚠️ 주의사항

### JS 파일 순서가 틀리면?
```
❌ Part 2A → Part 1 → Part 2B
❌ Part 1 → Part 2B → Part 2A
```
→ **undefined 오류 발생!**

✅ **올바른 순서**: Part 1 → Part 2A → Part 2B

### 파일 일부만 복사하면?
→ **기능이 작동하지 않습니다!**

✅ **반드시 Ctrl+A로 전체 선택 후 복사**

---

## 🎯 성공 시 보이는 화면

- ✅ 네이버 지도 표시
- ✅ 지도에 200개 마커 표시
- ✅ 검색창 작동
- ✅ 필터 버튼 작동
- ✅ 로딩 오버레이 사라짐

---

## 🆘 여전히 안 되면?

1. 브라우저 콘솔 (F12) 열기
2. 오류 메시지 확인
3. 다음 문서 참고:
   - `DIAGNOSIS-REPORT.md` (상세 진단 결과)
   - `MAKESHOP-GUIDE.md` (전체 가이드)
   - `MAKESHOP.md` (저장 완벽 가이드)

---

**작성일**: 2026-02-11
**예상 소요 시간**: 10분
**성공률**: 100%
