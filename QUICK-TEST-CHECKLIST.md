# Part 2B1 메이크샵 저장 실패 - 빠른 테스트 체크리스트

## 🎯 목표
메이크샵에서 저장 실패하는 정확한 코드 라인 특정

## 📋 테스트 순서 (우선순위)

### 1단계: 최소 URL 테스트 (가장 빠름)
메이크샵 관리자 > [디자인] > [스마트디자인 관리] > [JS] 탭

#### ✅ 테스트 1: 기본 URL
```
파일: test-minimal-url.js (807B)
예상: 실패 (https:// 때문)
```

#### ✅ 테스트 2: 프로토콜 제거
```
파일: test-minimal-url-no-https.js (889B)
예상: 성공 가능성 높음
```

#### ✅ 테스트 3: 문자열 분할
```
파일: test-minimal-url-split.js (1.0K)
예상: 성공 가능성 높음
```

**결과 판정**:
- 테스트 1 실패 + 테스트 2/3 성공 → **URL이 원인 확정**
- 모두 실패 → 다른 원인 (2단계로)
- 모두 성공 → 다른 원인 (2단계로)

---

### 2단계: Part 2B1c 모달 테스트

#### ✅ 테스트 4: URL 포함 버전
```
파일: test-part2b1c-modal.js (4.6K)
예상: 실패 (URL 때문)
```

#### ✅ 테스트 5: URL 제거 버전
```
파일: test-part2b1c-modal-no-url.js (4.8K)
예상: 성공
```

**결과 판정**:
- 테스트 4 실패 + 테스트 5 성공 → **모달의 URL이 원인 확정**
- 둘 다 실패 → 모달의 다른 부분이 문제 (추가 분할 필요)

---

### 3단계: 4분할 개별 테스트 (2단계 실패 시)

#### ✅ 테스트 6: 초기화 & 로딩
```
파일: test-part2b1a-init-loading.js (6.3K)
내용: init, 이벤트 리스너, 로딩, 토스트
의심도: 🟡 중간 (window.location 사용)
```

#### ✅ 테스트 7: 파트너 리스트
```
파일: test-part2b1b-partner-list.js (2.9K)
내용: renderPartnerList, createPartnerCardHTML
의심도: 🟢 낮음 (단순 HTML 문자열)
```

#### ✅ 테스트 8: 즐겨찾기 & 공유
```
파일: test-part2b1d-favorite-share.js (5.1K)
내용: toggleFavorite, showShareModal, copyLink
의심도: 🟢 낮음 (localStorage만 사용)
```

---

## 🔍 예상 시나리오

### 시나리오 A: URL이 원인 (가능성 90%)
```
테스트 1 (minimal-url.js) → ❌ 실패
테스트 2 (minimal-url-no-https.js) → ✅ 성공
```
**해결 방안**: 프로토콜 상대 URL 또는 문자열 분할 사용

### 시나리오 B: encodeURIComponent가 원인 (가능성 5%)
```
테스트 1-3 모두 → ❌ 실패
```
**해결 방안**: encodeURIComponent를 다른 방식으로 교체

### 시나리오 C: 복합 원인 (가능성 5%)
```
테스트 5 (modal-no-url.js) → ❌ 실패
```
**해결 방안**: 모달 코드를 더 세밀하게 분할

---

## 💡 빠른 해결 시나리오

### 만약 테스트 1 실패 + 테스트 2 성공이면

**즉시 적용 가능한 수정**:

```javascript
// ❌ 기존 (실패)
'<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" '

// ✅ 수정 1: 프로토콜 상대 URL
'<a href="//map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" '

// ✅ 수정 2: 문자열 분할
var protocol = 'https:';
var sep = '//';
'<a href="' + protocol + sep + 'map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" '

// ✅ 수정 3: CONFIG로 이동 (Part 1에서 정의)
// CONFIG에 추가: naverMapBaseUrl: 'https://map.naver.com/v5/search/'
'<a href="' + self.config.naverMapBaseUrl + encodeURIComponent(partner.address) + '" '
```

---

## 📊 테스트 결과 기록

```
[ ] 테스트 1: test-minimal-url.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 2: test-minimal-url-no-https.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 3: test-minimal-url-split.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 4: test-part2b1c-modal.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 5: test-part2b1c-modal-no-url.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 6: test-part2b1a-init-loading.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 7: test-part2b1b-partner-list.js
    결과: [ 성공 / 실패 ]
    에러: _______________________

[ ] 테스트 8: test-part2b1d-favorite-share.js
    결과: [ 성공 / 실패 ]
    에러: _______________________
```

---

## ⚡ 다음 액션

### 즉시 실행
1. `test-minimal-url.js` 저장 시도 (가장 작은 파일부터)
2. 결과에 따라 다음 테스트 선택
3. 원인 특정되면 즉시 수정 적용

### 원인 특정 후
1. 원본 파일(`makeshop-js-part2b1-no-inline.js`) 수정
2. 메이크샵에 재업로드
3. 브라우저에서 동작 테스트

---

## 📁 파일 위치

모든 테스트 파일:
```
/Users/jangjiho/workspace/partner-map/
```

- 1단계 (최소 테스트): `test-minimal-url*.js`
- 2단계 (모달): `test-part2b1c-modal*.js`
- 3단계 (4분할): `test-part2b1a~d-*.js`
- 가이드: `TEST-GUIDE-PART2B1.md`
