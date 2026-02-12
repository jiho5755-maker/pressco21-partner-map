# Phase 2 배포 가이드 - Phosphor Icons 적용

## 📊 수정 요약

### 변경된 파일 (2개)

| 파일 | 기존 | 수정 후 | 변화 | 상태 |
|------|------|---------|------|------|
| **makeshop-html.html** | 8.4KB | 8.6KB | +200 bytes | ✅ OK (8.7KB / 40KB) |
| **makeshop-js-part2b1.js** | 19.5KB | 20KB | +632 bytes | ✅ OK (20KB / 40KB) |

**총 증가**: +832 bytes (0.8KB)

---

## 🎨 적용된 변경사항

### 1. HTML 파일 (makeshop-html.html)

**추가된 내용**:
```html
<!-- Phosphor Icons (아이콘 라이브러리) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
```

**위치**: 파일 상단 (Fuse.js 스크립트 바로 위)

---

### 2. JavaScript 파일 (makeshop-js-part2b1.js)

**교체된 이모지** (17개 위치):

| 이모지 | Phosphor Icon | 개수 | 위치 |
|--------|---------------|------|------|
| ❤️ | Heart Fill | 4개 | 카드, 모달, 업데이트 |
| 🤍 | Heart | 3개 | 카드, 모달, 업데이트 |
| 📞 | Phone | 2개 | 카드, 모달 |
| 📍 | Map Pin | 2개 | 카드, 모달 |
| 📏 | Ruler | 1개 | 거리 배지 |
| 🗺️ | Map Trifold | 2개 | 네이버/카카오 지도 |
| 📤 | Share Network | 1개 | 공유 버튼 |
| 📧 | Envelope Simple | 1개 | 이메일 |
| 🌐 | Globe | 1개 | 홈페이지 |
| 📷 | Instagram Logo | 1개 | 인스타그램 |

**주요 코드 변경**:
- 이모지 문자열 → `<i class="ph ph-xxx"></i>` HTML 태그
- `textContent` → `innerHTML` (즐겨찾기 업데이트 함수)

---

## 🚀 배포 절차

### 준비 사항

- [x] 백업 파일 생성 완료 (`makeshop-js-part2b1-before-phosphor.js`)
- [x] 파일 크기 40KB 이하 확인
- [x] 로컬 테스트 환경 준비 (선택)

---

### 1단계: HTML 탭 수정

1. 메이크샵 어드민 로그인
2. **쇼핑몰 설정** → **디자인 모드** → **HTML 탭**
3. 기존 내용 **전체 복사** (백업용 텍스트 파일에 저장)
4. **makeshop-html.html** 내용으로 전체 교체
5. **저장** 클릭
6. 결과 확인:
   - ✅ "저장되었습니다" → 다음 단계로
   - ❌ "데이터 수정 실패" → 이모지가 남아있는지 재확인

---

### 2단계: JS 탭 Part2B1 수정

1. 메이크샵 어드민 → **디자인 모드** → **JS 탭**
2. **Part 2B1** 파일 선택 (파트너 UI 컴포넌트)
3. 기존 내용 **전체 복사** (백업용)
4. **makeshop-js-part2b1.js** 내용으로 전체 교체
5. **저장** 클릭
6. 결과 확인:
   - ✅ "저장되었습니다" → 성공!
   - ❌ "데이터 수정 실패" → 이모지 누락 확인

---

### 3단계: 브라우저 검증

1. **쇼핑몰 미리보기** 열기
2. F12 개발자 도구 → **Console 탭**
3. **Phosphor Icons 로드 확인**:
   ```
   [예상 로그]
   Network 탭에서 @phosphor-icons/web@2.1.2 로드 성공 (200 OK)
   ```

4. **아이콘 렌더링 확인**:
   - 파트너 카드의 하트 아이콘 (♥ → 벡터 하트)
   - 주소, 전화번호 아이콘
   - 모달의 각종 아이콘

5. **기능 테스트**:
   - [ ] 즐겨찾기 버튼 클릭 → 하트 아이콘 변경
   - [ ] 파트너 카드 클릭 → 모달 열림, 아이콘 표시
   - [ ] 네이버/카카오 지도 링크 → 지도 아이콘 표시
   - [ ] 공유 버튼 → 공유 아이콘 표시

---

### 4단계: 크로스 브라우저 테스트 (선택)

**데스크톱**:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox

**모바일**:
- [ ] iOS Safari
- [ ] Android Chrome

**확인 사항**:
- 아이콘 렌더링 정상
- CDN 로드 성공 (3초 이내)
- 레이아웃 깨짐 없음

---

## 🔧 문제 해결

### Case 1: "데이터 수정 실패" 오류

**원인**: 파일에 이모지가 남아있음

**해결**:
```bash
# 로컬에서 이모지 검사
grep -n '[❤️🤍📞📍📏🗺️📤📧🌐📷]' makeshop-js-part2b1.js
```

- 결과가 없으면 → 이모지 완전 제거됨
- 결과가 있으면 → 해당 라인 재수정

---

### Case 2: Phosphor Icons 로드 실패

**증상**: 아이콘이 안 보이거나 깨짐

**확인**:
1. F12 → Network 탭 → `phosphor` 검색
2. `https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css` 상태 확인

**해결**:
- **404 Not Found** → CDN URL 오타 확인
- **CORS Error** → 메이크샵 보안 정책 (지원팀 문의)
- **Timeout** → 네트워크 문제 (새로고침)

---

### Case 3: 아이콘은 보이는데 위치가 이상함

**원인**: CSS 충돌

**해결**:
```css
/* makeshop-css.css에 추가 */
#partnermap-container .ph {
    display: inline-block;
    vertical-align: middle;
    font-size: inherit;
    line-height: 1;
    margin-right: 4px;
}
```

---

### Case 4: 즐겨찾기 버튼 클릭 시 아이콘이 안 바뀜

**원인**: `textContent` → `innerHTML` 변경 누락

**확인**:
```javascript
// makeshop-js-part2b1.js 라인 421-428 확인
// innerHTML이 있어야 함
btn.innerHTML = text; // ✅ OK
btn.textContent = text; // ❌ NG
```

---

## 🎯 검증 체크리스트

### 저장 성공 여부
- [ ] HTML 탭 저장 성공
- [ ] JS Part2B1 탭 저장 성공

### 아이콘 렌더링
- [ ] 파트너 카드 하트 아이콘
- [ ] 파트너 카드 주소/전화 아이콘
- [ ] 거리 배지 ruler 아이콘
- [ ] 모달 하트 아이콘
- [ ] 모달 공유 버튼 아이콘
- [ ] 모달 지도 링크 아이콘
- [ ] 모달 연락처 아이콘

### 기능 동작
- [ ] 즐겨찾기 토글 시 하트 변경
- [ ] 모달 열림/닫힘
- [ ] 공유 버튼 클릭
- [ ] 지도 링크 클릭 시 새 탭 열림

### 성능
- [ ] CDN 로드 < 3초
- [ ] 페이지 로드 < 2초
- [ ] 콘솔 에러 없음

---

## 📸 예상 결과

### 기존 (HTML 엔티티)
```
♥ 즐겨찾기
☎ 010-1234-5678
⚲ 서울시 강남구...
```
- 못생김
- 흑백만 가능
- 크기 조절 제한

### 신규 (Phosphor Icons)
```
[하트 아이콘] 즐겨찾기
[전화 아이콘] 010-1234-5678
[위치 아이콘] 서울시 강남구...
```
- 세련됨
- 벡터 그래픽 (선명)
- 색상/크기 자유롭게 조절
- 9,000개 아이콘 사용 가능

---

## 🔄 롤백 방법

**문제 발생 시 즉시 롤백**:

1. **JS 탭 롤백**:
   - Part2B1 탭 열기
   - 백업한 내용 붙여넣기
   - 저장

2. **HTML 탭 롤백**:
   - HTML 탭 열기
   - Phosphor Icons CDN 줄 삭제
   - 저장

**또는 백업 파일 사용**:
```bash
# 로컬에 백업 파일 있음
makeshop-js-part2b1-before-phosphor.js (19.5KB)
```

---

## 📚 참고 자료

### Phosphor Icons
- 공식 사이트: https://phosphoricons.com/
- CDN: https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/
- 사용법: `<i class="ph ph-icon-name"></i>`

### 적용된 아이콘 전체 목록
1. `ph-heart-fill` - 즐겨찾기 활성
2. `ph-heart` - 즐겨찾기 비활성
3. `ph-phone` - 전화
4. `ph-map-pin` - 위치
5. `ph-ruler` - 거리
6. `ph-map-trifold` - 지도
7. `ph-share-network` - 공유
8. `ph-envelope-simple` - 이메일
9. `ph-globe` - 홈페이지
10. `ph-instagram-logo` - 인스타그램

---

## ✅ 배포 완료 후

1. **검증 완료 보고**:
   - 모든 체크리스트 확인
   - 스크린샷 캡처 (아이콘 렌더링)
   - 성능 지표 기록 (CDN 로드 시간)

2. **다음 Phase 준비**:
   - Phase 3: UI 고도화 Wave 1 (모달/토스트 애니메이션)
   - 예상 시작일: Phase 2 완료 후 1주일

3. **메모리 업데이트**:
   - MEMORY.md에 "이모지 제거 완료" 기록
   - "Phosphor Icons 적용 성공" 추가

---

**작성일**: 2026-02-11
**버전**: Phase 2 v1.0
**예상 배포 시간**: 10분
**위험도**: 낮음 (롤백 가능)
