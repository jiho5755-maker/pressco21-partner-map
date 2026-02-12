# 이모지 → Phosphor Icons 교체 맵핑

## 📊 교체 대상 (15개 위치)

### makeshop-js-part2b1.js

| 라인 | 기존 이모지 | Phosphor Icon | 클래스명 | 컨텍스트 |
|------|------------|---------------|----------|---------|
| **192** | `'❤️' : '🤍'` | Heart Fill / Heart | `ph-heart-fill` / `ph-heart` | 카드 즐겨찾기 아이콘 |
| **209** | `'📏 '` | Ruler | `ph-ruler` | 거리 배지 |
| **228** | `'📍 '` | Map Pin | `ph-map-pin` | 카드 주소 |
| **229** | `'📞 '` | Phone | `ph-phone` | 카드 전화번호 |
| **250** | `'❤️' : '🤍'` | Heart Fill / Heart | `ph-heart-fill` / `ph-heart` | 모달 즐겨찾기 아이콘 |
| **282** | `'📤 공유하기'` | Share Network | `ph-share-network` | 공유 버튼 |
| **291** | `'📍 '` | Map Pin | `ph-map-pin` | 모달 주소 |
| **294** | `'🗺️ 네이버 지도'` | Map Trifold | `ph-map-trifold` | 네이버 지도 링크 |
| **296** | `'🗺️ 카카오맵'` | Map Trifold | `ph-map-trifold` | 카카오맵 링크 |
| **301** | `'📞 '` | Phone | `ph-phone` | 모달 전화번호 |
| **302** | `'📧 '` | Envelope Simple | `ph-envelope-simple` | 모달 이메일 (새 발견!) |
| **423** | `'❤️ 즐겨찾기됨'` | Heart Fill | `ph-heart-fill` | 즐겨찾기 업데이트 (활성) |
| **426** | `'🤍 즐겨찾기'` | Heart | `ph-heart` | 즐겨찾기 업데이트 (비활성) |

---

## 🎨 Phosphor Icons 클래스 구조

### 기본 사용법
```html
<!-- 기존 -->
<p>❤️ 즐겨찾기</p>

<!-- 신규 -->
<p><i class="ph ph-heart-fill"></i> 즐겨찾기</p>
```

### CSS 스타일링 (필요 시)
```css
#partnermap-container .ph {
    font-size: inherit; /* 부모 크기 상속 */
    vertical-align: middle; /* 텍스트 중앙 정렬 */
    margin-right: 4px; /* 텍스트와 간격 */
}
```

---

## 📝 수정 코드 예시

### 1. 카드 HTML (라인 192, 209, 228, 229)

#### ❌ 기존
```javascript
var favoriteIcon = isFavorite ? '❤️' : '🤍';

var distanceHtml = '<span class="pm-distance-badge">📏 ' + partner.distance.toFixed(1) + 'km</span>';

var cardHtml = '<p class="pm-partner-address">📍 ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone">📞 ' + escapedPhone + '</p>';
```

#### ✅ 신규
```javascript
var favoriteIconClass = isFavorite ? 'ph-heart-fill' : 'ph-heart';
var favoriteIcon = '<i class="ph ' + favoriteIconClass + '"></i>';

var distanceHtml = '<span class="pm-distance-badge"><i class="ph ph-ruler"></i> ' + partner.distance.toFixed(1) + 'km</span>';

var cardHtml = '<p class="pm-partner-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone"><i class="ph ph-phone"></i> ' + escapedPhone + '</p>';
```

---

### 2. 모달 HTML (라인 250, 282, 291, 294, 296, 301, 302)

#### ❌ 기존
```javascript
var favoriteIcon = isFavorite ? '❤️' : '🤍';

var modalContent = '<button class="pm-action-btn pm-share-btn">📤 공유하기</button>' +
                   '<p class="pm-address">📍 ' + escapedAddress + '</p>' +
                   '<a href="..." class="pm-nav-btn">🗺️ 네이버 지도</a>' +
                   '<a href="..." class="pm-nav-btn">🗺️ 카카오맵</a>' +
                   '<p>📞 <a href="tel:...">' + escapedPhone + '</a></p>' +
                   '<p>📧 <a href="mailto:...">' + escapedEmail + '</a></p>';
```

#### ✅ 신규
```javascript
var favoriteIconClass = isFavorite ? 'ph-heart-fill' : 'ph-heart';
var favoriteIcon = '<i class="ph ' + favoriteIconClass + '"></i>';

var modalContent = '<button class="pm-action-btn pm-share-btn"><i class="ph ph-share-network"></i> 공유하기</button>' +
                   '<p class="pm-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
                   '<a href="..." class="pm-nav-btn"><i class="ph ph-map-trifold"></i> 네이버 지도</a>' +
                   '<a href="..." class="pm-nav-btn"><i class="ph ph-map-trifold"></i> 카카오맵</a>' +
                   '<p><i class="ph ph-phone"></i> <a href="tel:...">' + escapedPhone + '</a></p>' +
                   '<p><i class="ph ph-envelope-simple"></i> <a href="mailto:...">' + escapedEmail + '</a></p>';
```

---

### 3. 즐겨찾기 업데이트 (라인 423, 426)

#### ❌ 기존
```javascript
if (isFav) {
    btn.textContent = btn.textContent.includes('즐겨찾기됨') ? '❤️ 즐겨찾기됨' : '❤️';
} else {
    btn.textContent = btn.textContent.includes('즐겨찾기') ? '🤍 즐겨찾기' : '🤍';
}
```

#### ✅ 신규
```javascript
if (isFav) {
    var text = btn.textContent.includes('즐겨찾기됨') ? '<i class="ph ph-heart-fill"></i> 즐겨찾기됨' : '<i class="ph ph-heart-fill"></i>';
    btn.innerHTML = text;
} else {
    var text = btn.textContent.includes('즐겨찾기') ? '<i class="ph ph-heart"></i> 즐겨찾기' : '<i class="ph ph-heart"></i>';
    btn.innerHTML = text;
}
```

**주의**: `textContent` → `innerHTML` 변경 필수!

---

## 📦 HTML 탭 수정 (CDN 추가)

### makeshop-html.html `<head>` 섹션 추가

```html
<head>
    <!-- 기존 meta, title 태그 -->

    <!-- ✨ Phosphor Icons CDN (Regular Style) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">

    <!-- 기존 CSS 링크 -->
</head>
```

**추가 용량**: ~200 bytes

---

## 📏 파일 크기 영향

### makeshop-js-part2b1.js

| 항목 | 기존 | 신규 | 차이 |
|------|------|------|------|
| 기본 크기 | 19.5KB | - | - |
| 이모지 제거 | - | -45 bytes | (3 bytes × 15개) |
| HTML 추가 | - | +600 bytes | (`<i class="ph ph-xxx"></i>` × 15) |
| 변수 추가 | - | +150 bytes | (favoriteIconClass 등) |
| **최종 크기** | 19.5KB | **20.2KB** | **+700 bytes** |
| **여유 공간** | 20.5KB | **19.8KB** | ✅ 안전 |

### makeshop-html.html

| 항목 | 기존 | 신규 | 차이 |
|------|------|------|------|
| 기본 크기 | 8.4KB | - | - |
| CDN 링크 | - | +200 bytes | - |
| **최종 크기** | 8.4KB | **8.6KB** | **+200 bytes** |
| **여유 공간** | 31.6KB | **31.4KB** | ✅ 안전 |

---

## 🧪 검증 체크리스트

### 로컬 테스트
- [ ] test-phosphor-icons.html 브라우저 확인
- [ ] CDN 로드 시간 < 3초
- [ ] 7개 아이콘 렌더링 정상
- [ ] 콘솔 에러 없음

### 메이크샵 저장 테스트
- [ ] HTML 탭 CDN 추가 → 저장 성공
- [ ] JS 탭 part2b1.js 교체 → 저장 성공
- [ ] 미리보기에서 아이콘 표시 확인
- [ ] 크로스 브라우저 (Chrome, Safari, Firefox)

### 기능 테스트
- [ ] 즐겨찾기 버튼 클릭 → 하트 변경
- [ ] 파트너 카드 클릭 → 모달 아이콘 표시
- [ ] 네이버/카카오 지도 링크 → 지도 아이콘
- [ ] 공유 버튼 → 공유 아이콘

---

## 🎯 다음 단계

1. ✅ **Phase 1 완료 조건**:
   - test-emoji-only.html 메이크샵 저장 테스트
   - test-phosphor-icons.html CDN 로드 검증
   - 이 맵핑 문서 확인

2. 🚀 **Phase 2 준비**:
   - makeshop-js-part2b1.js 백업
   - 15개 위치 일괄 교체
   - HTML 탭 CDN 추가
   - 메이크샵 배포 및 검증

---

**작성일**: 2026-02-11
**문서 버전**: 1.0
**총 교체 위치**: 15개
**예상 소요 시간**: Phase 2 작업 2시간
