# Mobile UX Phase 2 배포 가이드 (간편판)

## 빠른 배포 (5분 완료)

### 1단계: 파일 업로드 (메이크샵 관리자)

**[메이크샵 관리자] > [디자인 설정] > [HTML 편집]**

#### CSS 전용 탭 (3개 파일)

```
✅ makeshop-css-variables.css  (11KB)
✅ makeshop-css-core.css        (28KB)
✅ makeshop-css-touch.css       (3.8KB)
```

#### JS 전용 탭 (5개 파일)

```
✅ makeshop-js-touch.js         (25KB)
✅ makeshop-js-part1.js         (34KB)
✅ makeshop-js-part2a.js        (30KB)
✅ makeshop-js-part2b1.js       (27KB)
✅ makeshop-js-part2b2.js       (18KB)
```

#### 디자인 편집 탭 (1개 파일)

```
✅ makeshop-html.html           (12KB)
```

---

### 2단계: HTML 탭 수정

**기존 `makeshop-html.html`을 열어 상단에 다음 코드 추가**:

```html
<!-- CSS 로드 (순서 중요!) -->
<link rel="stylesheet" href="/css/makeshop-css-variables.css">
<link rel="stylesheet" href="/css/makeshop-css-core.css">
<link rel="stylesheet" href="/css/makeshop-css-touch.css">
```

기존 `<link rel="stylesheet" href="/css/makeshop-css.css">` 삭제

---

### 3단계: 배포 전 체크리스트

```
✅ 파일 9개 업로드 완료
✅ CSS 로드 순서 확인 (variables → core → touch)
✅ JS 로드 순서 확인 (touch → part1 → part2a → part2b1 → part2b2)
✅ Phosphor Icons CDN 확인 (HTML에 이미 포함됨)
```

---

### 4단계: 배포 후 테스트

**모바일 기기 (iPhone 또는 Galaxy)로 접속 후**:

```
1. FAB 버튼 3개 우하단에 표시되는가? ✓
2. 아래로 스크롤 시 FAB 숨겨지는가? ✓
3. 위로 스크롤 시 FAB 나타나는가? ✓
4. GPS FAB 클릭 시 위치 권한 요청되는가? ✓
5. 필터 FAB 클릭 시 필터 섹션으로 이동하는가? ✓
6. 맨 위로 FAB 클릭 시 페이지 최상단으로 이동하는가? ✓
7. 페이지 최상단에서 아래로 당기면 Pull to Refresh 동작하는가? ✓
8. 지도에서 핀치 줌 동작하는가? ✓
9. 지도에서 더블탭 줌인 동작하는가? ✓
```

---

## 문제 해결

### FAB 버튼이 보이지 않아요

**원인**: 데스크톱 환경에서 테스트 중일 수 있습니다.

**해결**: Chrome DevTools > Device Toolbar (Cmd+Shift+M) 활성화

---

### Pull to Refresh가 동작하지 않아요

**원인**: iOS Safari의 기본 바운스 효과와 충돌

**해결**: `makeshop-css-touch.css`에 다음 코드 추가

```css
body {
    overscroll-behavior-y: contain;
}
```

---

### 핀치 줌이 늦게 반응해요

**원인**: 네이버 지도 SDK의 기본 동작과 충돌

**해결**: 정상 동작입니다. 약간의 지연은 네이버 지도 API의 특성입니다.

---

## 롤백 방법

문제 발생 시 이전 버전으로 롤백:

1. **CSS 파일 삭제**: `makeshop-css-variables.css`, `makeshop-css-core.css`, `makeshop-css-touch.css`
2. **기존 CSS 복원**: `makeshop-css.css` (백업본 업로드)
3. **HTML 수정**: CSS 로드 코드를 기존 방식으로 변경
4. **저장 및 적용**

---

## 추가 지원

상세한 문서는 `MOBILE-UX-PHASE2-COMPLETE.md` 참고

---

**배포 성공을 기원합니다!**
