# 메이크샵 배포 파일 (Phase 1 완료)

## ⚠️ 중요: 배포 방식 선택

메이크샵 페이지 배포 방식에는 **2가지**가 있습니다:

1. **페이지 탭 방식** (HTML/CSS/JS 탭) → `즉시배포-단계별가이드.md` 참조 ⭐
2. **파일 업로드 방식** (/upload/ 폴더) → `DEPLOY-GUIDE.md` 참조

**대부분의 경우 1번(페이지 탭)을 사용합니다.**

---

## 📦 파일 목록

```
makeshop-deploy/
├── 01-html.html                      (10KB)  ✅ HTML 탭
├── 02-css.css                        (26KB)  ✅ CSS 탭
├── 03-js-part1.js                    (24KB)  ✅ 파일 업로드
├── 03-js-part2.js                    (37KB)  ⚠️ 파일 업로드 (30KB 초과)
├── 03-js-part3.js                    (31KB)  ⚠️ 파일 업로드 (30KB 초과)
├── 즉시배포-단계별가이드.md          ⭐ 페이지 탭 배포 (권장)
├── 메이크샵-페이지-탭-배포가이드.md  📊 문제 분석 (Sequential Thinking)
├── DEPLOY-GUIDE.md                      배포 가이드 (파일 업로드 방식)
└── README.md                            이 파일
```

## 🚀 빠른 배포 (12분)

### ⭐ 권장: 페이지 탭 방식

**`즉시배포-단계별가이드.md` 파일을 참조하세요!**

간단 요약:
1. 네이버 클라우드에 `https://www.foreverlove.co.kr/*` URL 추가 (2분)
2. 메이크샵 파일 관리에 JS 파일 업로드 (5분)
3. 페이지 HTML/CSS 탭에 코드 붙여넣기 (3분)
4. 스크립트 태그 추가 및 테스트 (2분)

---

### 대안: 파일 업로드 방식 (고급 사용자)

**⚠️ 주의**: 이 방식은 메이크샵 "디자인 관리" 전체 페이지에 적용됩니다. 개별 페이지에는 위의 "페이지 탭 방식"을 사용하세요.

#### 1단계: HTML 탭
```
메이크샵 관리자 > 디자인 관리 > HTML 탭
01-html.html 전체 복사 → <body> 안에 붙여넣기
```

#### 2단계: CSS 탭
```
메이크샵 관리자 > 디자인 관리 > CSS 탭
02-css.css 전체 복사 → 붙여넣기
저장
```

#### 3단계: JS 파일 업로드
```
메이크샵 관리자 > 파일 관리 > 파일 업로드

📁 /upload/파트너맵/ 폴더 생성
  ├─ js-part1.js (03-js-part1.js 업로드)
  ├─ js-part2.js (03-js-part2.js 업로드)
  └─ js-part3.js (03-js-part3.js 업로드)
```

**⚠️ 중요**: 폴더명이 정확히 `파트너맵`이어야 합니다!

#### 4단계: HTML 탭에 스크립트 추가
```html
<!-- <body> 끝나기 직전에 순서대로 추가 -->

<!-- 1. Fuse.js (검색 라이브러리) -->
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>

<!-- 2. 네이버 지도 SDK (반드시 JS 파일들보다 먼저!) -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=bfp8odep5r"></script>

<!-- 3. 파트너맵 JS 파일들 -->
<script src="/upload/파트너맵/js-part1.js"></script>
<script src="/upload/파트너맵/js-part2.js"></script>
<script src="/upload/파트너맵/js-part3.js"></script>
```

⚠️ **중요**: 순서를 지켜야 네이버 지도가 정상 작동합니다!

#### 5단계: 저장 및 테스트
```
저장 → 미리보기 → 동작 확인
```

## ✅ 필수 확인 사항

- [x] Phosphor Icons CDN 로드 (HTML 탭)
- [x] 네이버 지도 SDK CDN 로드 (HTML 탭)
- [x] Fuse.js CDN 로드 (HTML 탭)
- [x] 이모지 완전 제거 (Phosphor Icons 대체)
- [x] 템플릿 리터럴 이스케이프 (`\${variable}`)
- [x] WCAG AA 색상 대비
- [x] 접근성 aria-label 추가

## ⚠️ 문제 해결

### Part 2/3 파일 크기 초과
- Part 2 (37KB) 및 Part 3 (31KB)가 30KB 제한을 초과합니다
- **해결**: 메이크샵 파일 업로드 기능 사용 (JS 탭이 아님)
- 파일 업로드는 크기 제한이 더 넉넉합니다

### 저장 시 "데이터 수정 실패"
- 원인: 템플릿 리터럴 (`${variable}`) 미이스케이프
- 해결: 모든 JS 파일에서 `${` → `\${` 확인

### 아이콘이 안 보임
- 원인: Phosphor Icons CDN 차단
- 해결: HTML 탭에서 CDN 링크 확인
  ```html
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css">
  ```

## 📊 Phase 1 완료 현황

### ✅ 완료
- Phosphor Icons 통합 (16개 위치)
- WCAG AA 색상 대비 개선
- 접근성 강화 (26개 aria-label)
- :focus-visible 키보드 포커스
- Git 커밋: ca1e84c, 80631e5, ac7e65b
- Git 푸시: main 브랜치

### 🎯 예상 성과
- Lighthouse 접근성: 95+
- 메이크샵 호환성: 100%
- 이모지 에러: 0건

---

**배포 완료 후**: 브라우저에서 페이지 열기 → F12 콘솔 확인 → 에러 없으면 성공!

**다음 Phase**: Google Analytics 통합 + 조회수 추적
