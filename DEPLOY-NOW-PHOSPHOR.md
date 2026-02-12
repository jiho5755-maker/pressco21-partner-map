# 🚀 파트너맵 v3 - Phosphor Icons 버전 배포 가이드

## 📋 메이크샵 붙여넣기 순서 (정확히 이 순서대로!)

### 1단계: HTML 탭
→ `makeshop-html.html` 전체 복사 → 붙여넣기 → 저장

### 2단계: CSS 탭
→ `makeshop-css.css` 전체 복사 → 붙여넣기 → 저장

### 3단계: JS 탭 (4개 파일, 순서 중요!)
1. **Part 1** (Config/API/Map): `makeshop-js-part1.js` → 저장
2. **Part 2A** (Filters/Search): `makeshop-js-part2a.js` → 저장
3. **Part 2B1** (UI/Phosphor Icons): `makeshop-js-part2b1.js` → 저장 ✨ 수정됨!
4. **Part 2B2** (Main): `makeshop-js-part2b2.js` → 저장

---

## 📁 파일 위치 (로컬)

```
/Users/jangjiho/workspace/partner-map/
├── makeshop-html.html          (8.6KB)  ← Phosphor CDN 추가
├── makeshop-css.css            (27KB)
├── makeshop-js-part1.js        (34KB)
├── makeshop-js-part2a.js       (27KB)
├── makeshop-js-part2b1.js      (20KB)   ← 17개 이모지 교체됨!
└── makeshop-js-part2b2.js      (12KB)
```

---

## 🎯 빠른 테스트 (로컬 브라우저)

브라우저에서 바로 열어서 테스트하려면:

### test-complete-phosphor.html 생성

아래 내용을 복사해서 `test-complete-phosphor.html`로 저장 → 브라우저에서 열기

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>파트너맵 v3 - Phosphor Icons 테스트</title>

    <!-- Phosphor Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">

    <!-- CSS 파일 로드 (로컬 경로로 변경) -->
    <link rel="stylesheet" href="./makeshop-css.css">
</head>
<body>
    <!-- HTML 내용 (makeshop-html.html의 body 부분만) -->
    <!-- 여기에 makeshop-html.html의 <div id="partnermap-container"> 부분 붙여넣기 -->

    <!-- Fuse.js -->
    <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>

    <!-- 네이버 지도 SDK -->
    <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=bfp8odep5r"></script>

    <!-- JS 파일들 (순서 중요!) -->
    <script src="./makeshop-js-part1.js"></script>
    <script src="./makeshop-js-part2a.js"></script>
    <script src="./makeshop-js-part2b1.js"></script>
    <script src="./makeshop-js-part2b2.js"></script>
</body>
</html>
```

---

## ✅ 메이크샵 배포 상세 절차

### HTML 탭

1. 메이크샵 어드민 로그인
2. **쇼핑몰 설정** → **디자인 모드**
3. **HTML 탭** 클릭
4. 기존 내용 전체 선택 (Ctrl+A / Cmd+A)
5. **makeshop-html.html** 파일 열기 → 전체 복사
6. 메이크샵에 붙여넣기
7. **저장** 버튼 클릭
8. ✅ "저장되었습니다" 확인

**주의**: Phosphor Icons CDN이 포함되어 있어야 합니다!
```html
<!-- Phosphor Icons (아이콘 라이브러리) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

---

### CSS 탭

1. **CSS 탭** 클릭
2. 기존 내용 전체 선택 (Ctrl+A / Cmd+A)
3. **makeshop-css.css** 파일 열기 → 전체 복사
4. 메이크샵에 붙여넣기
5. **저장** 버튼 클릭
6. ✅ "저장되었습니다" 확인

---

### JS 탭 (4개 파일 순서대로!)

#### Part 1: Config/API/Map

1. **JS 탭** → **새 파일** 또는 **Part 1** 선택
2. **makeshop-js-part1.js** 파일 열기 → 전체 복사
3. 붙여넣기 → **저장**
4. ✅ "저장되었습니다" 확인

#### Part 2A: Filters/Search

1. **JS 탭** → **새 파일** 또는 **Part 2A** 선택
2. **makeshop-js-part2a.js** 파일 열기 → 전체 복사
3. 붙여넣기 → **저장**
4. ✅ "저장되었습니다" 확인

#### Part 2B1: UI/Phosphor Icons ✨ 중요!

1. **JS 탭** → **새 파일** 또는 **Part 2B1** 선택
2. **makeshop-js-part2b1.js** 파일 열기 → 전체 복사
3. 붙여넣기 → **저장**
4. ✅ "저장되었습니다" 확인
5. **실패하면** → 이모지가 남아있는지 확인!

#### Part 2B2: Main

1. **JS 탭** → **새 파일** 또는 **Part 2B2** 선택
2. **makeshop-js-part2b2.js** 파일 열기 → 전체 복사
3. 붙여넣기 → **저장**
4. ✅ "저장되었습니다" 확인

---

## 🧪 검증 (배포 후)

### 1. 페이지 열기
- 메이크샵 미리보기 또는 실제 쇼핑몰 URL

### 2. F12 개발자 도구 열기
- **Console 탭** 확인
- 에러 없어야 함!

### 3. Network 탭 확인
```
[확인 사항]
✅ @phosphor-icons/web@2.1.2 로드 성공 (200 OK)
✅ fuse.js 로드 성공
✅ 네이버 지도 SDK 로드 성공
```

### 4. 아이콘 렌더링 확인

**파트너 카드**:
- [ ] 하트 아이콘 (즐겨찾기) → 벡터 그래픽
- [ ] 위치 아이콘 → 예쁜 핀 모양
- [ ] 전화 아이콘 → 벡터 전화기

**모달 (파트너 클릭 시)**:
- [ ] 하트 아이콘
- [ ] 공유 아이콘
- [ ] 지도 아이콘 (네이버/카카오)
- [ ] 전화/이메일 아이콘

### 5. 기능 테스트

- [ ] 즐겨찾기 버튼 클릭 → 하트 색상 변경
- [ ] 파트너 카드 클릭 → 모달 열림
- [ ] 모달 닫기 (X 버튼, ESC 키)
- [ ] 공유 버튼 클릭
- [ ] 지도 마커 클릭

---

## ❌ 문제 해결

### "데이터 수정 실패" 오류

**원인**: 파일에 이모지가 남아있음

**확인**:
```bash
# 터미널에서 실행
grep -n '[❤️🤍📞📍📏🗺️📤📧🌐📷]' makeshop-js-part2b1.js
```

**해결**:
- 결과 없음 → 이모지 완전 제거됨 (정상)
- 결과 있음 → 해당 라인 재확인 필요

### Phosphor Icons 안 보임

**원인**: CDN 로드 실패

**확인**:
1. HTML 탭에 CDN 링크 있는지 확인
2. F12 → Network 탭 → `phosphor` 검색
3. 빨간색(실패) → CDN URL 오타 확인

**해결**:
```html
<!-- 이 줄이 HTML 탭 상단에 있어야 함 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

### 아이콘이 이상하게 보임

**원인**: CSS 충돌

**해결**: CSS 탭에 추가
```css
#partnermap-container .ph {
    display: inline-block;
    vertical-align: middle;
    font-size: inherit;
    line-height: 1;
    margin-right: 4px;
}
```

---

## 📸 예상 결과

### 기존 (이모지/HTML 엔티티)
```
♥ 즐겨찾기
☎ 010-1234-5678
못생긴 텍스트 아이콘
```

### 신규 (Phosphor Icons)
```
[세련된 하트 벡터] 즐겨찾기
[세련된 전화 벡터] 010-1234-5678
선명한 벡터 그래픽
```

---

## 🎯 배포 체크리스트

### 배포 전
- [ ] 로컬에 6개 파일 확인
- [ ] 백업 파일 생성됨 (`makeshop-js-part2b1-before-phosphor.js`)

### 배포 중
- [ ] HTML 탭 저장 성공
- [ ] CSS 탭 저장 성공
- [ ] JS Part1 저장 성공
- [ ] JS Part2A 저장 성공
- [ ] JS Part2B1 저장 성공 (이모지 제거 버전!)
- [ ] JS Part2B2 저장 성공

### 배포 후
- [ ] 페이지 로드 성공
- [ ] 콘솔 에러 없음
- [ ] Phosphor Icons CDN 로드 확인
- [ ] 아이콘 렌더링 정상
- [ ] 즐겨찾기 토글 동작
- [ ] 모달 열림/닫힘

---

## 🔄 롤백 (문제 발생 시)

1. **JS Part2B1만 롤백**:
   - `makeshop-js-part2b1-before-phosphor.js` 내용 복사
   - JS Part2B1 탭에 붙여넣기
   - 저장

2. **HTML CDN 제거**:
   - HTML 탭에서 Phosphor Icons CDN 줄 삭제
   - 저장

---

## 💡 파일 요약

| 파일 | 크기 | 역할 | 변경사항 |
|------|------|------|---------|
| makeshop-html.html | 8.6KB | HTML 구조 | Phosphor CDN 추가 (+200B) |
| makeshop-css.css | 27KB | 스타일 | 변경 없음 |
| makeshop-js-part1.js | 34KB | Config/API/Map | 변경 없음 |
| makeshop-js-part2a.js | 27KB | Filters/Search | 변경 없음 |
| makeshop-js-part2b1.js | 20KB | UI/Icons | 17개 이모지 교체 (+632B) |
| makeshop-js-part2b2.js | 12KB | Main | 변경 없음 |

**총 크기**: 128KB (메이크샵 제한: 각 파일 40KB)

---

**작성일**: 2026-02-11
**버전**: Phosphor Icons v1.0
**배포 소요 시간**: 10분
**난이도**: 쉬움 (복사/붙여넣기만)
