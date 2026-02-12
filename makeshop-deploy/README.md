# 메이크샵 배포 파일 (Phase 1 완료)

## 📦 파일 목록

```
makeshop-deploy/
├── 01-html.html          (9.9KB)  ✅ HTML 탭에 복사
├── 02-css.css            (26KB)   ✅ CSS 탭에 복사
├── 03-js-part1.js        (24KB)   ✅ 파일 업로드
├── 03-js-part2.js        (37KB)   ⚠️ 파일 업로드 (30KB 초과)
├── 03-js-part3.js        (31KB)   ⚠️ 파일 업로드 (30KB 초과)
├── DEPLOY-GUIDE.md                 배포 가이드 (상세)
└── README.md                       이 파일
```

## 🚀 빠른 배포 (5분)

### 1단계: HTML 탭
```
메이크샵 관리자 > 디자인 관리 > HTML 탭
01-html.html 전체 복사 → <body> 안에 붙여넣기
```

### 2단계: CSS 탭
```
메이크샵 관리자 > 디자인 관리 > CSS 탭
02-css.css 전체 복사 → 붙여넣기
저장
```

### 3단계: JS 파일 업로드
```
메이크샵 관리자 > 파일 관리 > 파일 업로드

📁 /upload/partnermap/ 폴더 생성
  ├─ js-part1.js (03-js-part1.js 업로드)
  ├─ js-part2.js (03-js-part2.js 업로드)
  └─ js-part3.js (03-js-part3.js 업로드)
```

### 4단계: HTML 탭에 스크립트 추가
```html
<!-- 01-html.html </div> 닫는 태그 바로 아래에 추가 -->
<script src="/upload/partnermap/js-part1.js"></script>
<script src="/upload/partnermap/js-part2.js"></script>
<script src="/upload/partnermap/js-part3.js"></script>
```

### 5단계: 저장 및 테스트
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
