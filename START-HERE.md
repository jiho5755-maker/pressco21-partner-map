# 🚀 파트너맵 v3 - Phosphor Icons 버전 시작 가이드

## 📝 TL;DR (빠른 시작)

### 로컬 브라우저 테스트 (1분)

```bash
# 브라우저에서 바로 열기
open test-complete-phosphor.html
```

**끝!** 파트너맵이 Phosphor Icons와 함께 작동합니다.

---

### 메이크샵 배포 (10분)

**순서대로 복사 → 붙여넣기 → 저장**:

1. **HTML 탭**: `makeshop-html.html`
2. **CSS 탭**: `makeshop-css.css`
3. **JS 탭**:
   - Part 1: `makeshop-js-part1.js`
   - Part 2A: `makeshop-js-part2a.js`
   - Part 2B1: `makeshop-js-part2b1.js` ⭐ (Phosphor Icons 적용!)
   - Part 2B2: `makeshop-js-part2b2.js`

**끝!** 메이크샵에서 Phosphor Icons가 작동합니다.

---

## 📁 필요한 파일 (6개)

```
✅ makeshop-html.html          (8.6KB)  → HTML 탭
✅ makeshop-css.css            (27KB)   → CSS 탭
✅ makeshop-js-part1.js        (34KB)   → JS Part 1
✅ makeshop-js-part2a.js       (27KB)   → JS Part 2A
✅ makeshop-js-part2b1.js      (20KB)   → JS Part 2B1 ⭐
✅ makeshop-js-part2b2.js      (12KB)   → JS Part 2B2
```

**총 6개 파일 모두 같은 폴더에 있습니다!**

---

## 🧪 로컬 테스트 상세

### 1. 파일 열기

```bash
# 방법 1: 명령어
open test-complete-phosphor.html

# 방법 2: 파인더
# test-complete-phosphor.html 더블클릭
```

### 2. 확인 사항

**F12 개발자 도구 열기**:

#### Console 탭
```
[예상 로그]
🧪 파트너맵 v3 - Phosphor Icons 로컬 테스트
✅ 확인 사항: ...
```

#### Network 탭
```
[확인]
✅ @phosphor-icons/web@2.1.2 (200 OK)
✅ fuse.js (200 OK)
✅ naver maps SDK (200 OK)
```

#### Elements 탭
```
[파트너 카드 HTML 확인]
<i class="ph ph-heart-fill"></i> ← 이런 아이콘이 있어야 함!
```

### 3. 기능 테스트

- [ ] 페이지 로드 성공
- [ ] 파트너 카드에 벡터 아이콘 표시
- [ ] 즐겨찾기 버튼 클릭 → 하트 변경
- [ ] 파트너 클릭 → 모달 열림
- [ ] 모달에 각종 아이콘 표시

---

## 🏪 메이크샵 배포 상세

### HTML 탭

**파일**: `makeshop-html.html`

**위치**: 메이크샵 어드민 → 쇼핑몰 설정 → 디자인 모드 → **HTML 탭**

**절차**:
1. HTML 탭 열기
2. 기존 내용 **전체 선택** (Ctrl+A / Cmd+A)
3. makeshop-html.html 파일 열기
4. **전체 복사** (Ctrl+C / Cmd+C)
5. 메이크샵에 **붙여넣기** (Ctrl+V / Cmd+V)
6. **저장** 버튼 클릭
7. ✅ "저장되었습니다" 확인

**주의**: 이 파일에 Phosphor Icons CDN이 포함되어 있습니다!

---

### CSS 탭

**파일**: `makeshop-css.css`

**위치**: 메이크샵 어드민 → 쇼핑몰 설정 → 디자인 모드 → **CSS 탭**

**절차**:
1. CSS 탭 열기
2. 기존 내용 **전체 선택** (Ctrl+A / Cmd+A)
3. makeshop-css.css 파일 열기
4. **전체 복사** (Ctrl+C / Cmd+C)
5. 메이크샵에 **붙여넣기** (Ctrl+V / Cmd+V)
6. **저장** 버튼 클릭
7. ✅ "저장되었습니다" 확인

---

### JS 탭 (4개 파일)

**위치**: 메이크샵 어드민 → 쇼핑몰 설정 → 디자인 모드 → **JS 탭**

**순서 중요! 반드시 이 순서대로:**

#### 1️⃣ Part 1 (Config/API/Map)

**파일**: `makeshop-js-part1.js` (34KB)

1. JS 탭 열기
2. **새 파일** 또는 기존 Part 1 선택
3. makeshop-js-part1.js 전체 복사 → 붙여넣기
4. **저장** → ✅ 성공 확인

#### 2️⃣ Part 2A (Filters/Search)

**파일**: `makeshop-js-part2a.js` (27KB)

1. **새 파일** 또는 기존 Part 2A 선택
2. makeshop-js-part2a.js 전체 복사 → 붙여넣기
3. **저장** → ✅ 성공 확인

#### 3️⃣ Part 2B1 (UI/Phosphor Icons) ⭐ 핵심!

**파일**: `makeshop-js-part2b1.js` (20KB)

**이 파일이 Phosphor Icons 적용 버전입니다!**

1. **새 파일** 또는 기존 Part 2B1 선택
2. makeshop-js-part2b1.js 전체 복사 → 붙여넣기
3. **저장** → ✅ 성공 확인
4. **실패 시**: 이모지가 남아있는지 확인!

#### 4️⃣ Part 2B2 (Main)

**파일**: `makeshop-js-part2b2.js` (12KB)

1. **새 파일** 또는 기존 Part 2B2 선택
2. makeshop-js-part2b2.js 전체 복사 → 붙여넣기
3. **저장** → ✅ 성공 확인

---

## ✅ 검증 (배포 후)

### 1. 페이지 열기

메이크샵 미리보기 또는 실제 쇼핑몰 URL

### 2. F12 개발자 도구

**Console 탭**:
```
[에러 없어야 함!]
```

**Network 탭**:
```
✅ @phosphor-icons/web@2.1.2 (200 OK, < 3초)
```

### 3. 아이콘 확인

**파트너 카드**:
- 하트 아이콘 (즐겨찾기)
- 위치 아이콘
- 전화 아이콘
- 거리 배지 아이콘

**모달 (파트너 클릭)**:
- 하트 아이콘
- 공유 아이콘
- 지도 아이콘 (네이버/카카오)
- 전화/이메일 아이콘

### 4. 기능 테스트

- [ ] 즐겨찾기 버튼 클릭 → 하트 색상 변경
- [ ] 파트너 카드 클릭 → 모달 열림
- [ ] 모달 닫기 (X, ESC)
- [ ] 공유 버튼 클릭
- [ ] 지도 링크 클릭

---

## ❌ 문제 해결

### "데이터 수정 실패"

**원인**: 이모지가 남아있음

**확인**:
```bash
grep -n '[❤️🤍📞📍]' makeshop-js-part2b1.js
```

**결과**:
- 아무것도 안 나옴 → ✅ OK
- 라인 번호 나옴 → ❌ 이모지 재확인

### Phosphor Icons 안 보임

**확인**:
1. HTML 탭에 CDN 링크 있는지?
2. F12 → Network → `phosphor` 검색
3. 빨간색? → CDN URL 오타

**해결**:
```html
<!-- HTML 탭 상단에 이 줄 필수! -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

---

## 📚 상세 문서

### 배포 가이드
→ **DEPLOY-NOW-PHOSPHOR.md**

### 교체 맵핑
→ **EMOJI-TO-PHOSPHOR-MAPPING.md**

### Phase 2 가이드
→ **PHASE2-DEPLOYMENT-GUIDE.md**

---

## 🎯 체크리스트

### 로컬 테스트
- [ ] test-complete-phosphor.html 브라우저에서 열림
- [ ] Phosphor Icons 로드 성공
- [ ] 아이콘 렌더링 정상
- [ ] 기능 동작 정상

### 메이크샵 배포
- [ ] HTML 탭 저장 성공
- [ ] CSS 탭 저장 성공
- [ ] JS Part 1 저장 성공
- [ ] JS Part 2A 저장 성공
- [ ] JS Part 2B1 저장 성공 ⭐
- [ ] JS Part 2B2 저장 성공

### 검증
- [ ] 페이지 로드 성공
- [ ] 콘솔 에러 없음
- [ ] Phosphor Icons CDN 로드
- [ ] 아이콘 렌더링 정상
- [ ] 즐겨찾기 토글 동작
- [ ] 모달 열림/닫힘

---

## 🆘 도움말

### 질문 1: 로컬 테스트가 안 돼요

**답변**: 6개 파일이 모두 같은 폴더에 있는지 확인하세요.

```
/workspace/partner-map/
├── test-complete-phosphor.html  ← 이 파일을 브라우저에서 열기
├── makeshop-html.html
├── makeshop-css.css
├── makeshop-js-part1.js
├── makeshop-js-part2a.js
├── makeshop-js-part2b1.js
└── makeshop-js-part2b2.js
```

### 질문 2: 메이크샵에서 순서가 헷갈려요

**답변**: 이 순서만 기억하세요!

1. HTML 탭 (1개)
2. CSS 탭 (1개)
3. JS 탭 (4개):
   - Part 1 → Part 2A → Part 2B1 → Part 2B2

### 질문 3: 어떤 파일이 수정됐나요?

**답변**: 2개만 수정됐습니다!

- `makeshop-html.html` (+200 bytes, CDN 추가)
- `makeshop-js-part2b1.js` (+632 bytes, 이모지 교체)

나머지 4개는 그대로입니다.

---

**작성일**: 2026-02-11
**버전**: Phosphor Icons v1.0
**난이도**: ⭐⭐☆☆☆ (쉬움)
