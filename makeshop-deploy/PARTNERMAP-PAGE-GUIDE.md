# 파트너맵 개별 페이지 배포 가이드

## 📦 파일 설명

**partnermap-complete.html** (37KB)
- 완전한 HTML 파일 (복사 붙여넣기 한 번으로 배포)
- HTML + CSS 인라인 포함
- JS는 별도 파일 참조 (크기 때문)

---

## 🚀 빠른 배포 (3단계)

### 1️⃣ JS 파일 업로드

**메이크샵 관리자 > 파일 관리 > 파일 업로드**

다음 3개 파일을 업로드:
```
📁 /upload/파트너맵/
  ├─ js-part1.js (03-js-part1.js 업로드)
  ├─ js-part2.js (03-js-part2.js 업로드)
  └─ js-part3.js (03-js-part3.js 업로드)
```

⚠️ **중요**: 폴더명이 정확히 `파트너맵`이어야 합니다!

---

### 2️⃣ 개별 페이지 생성

**메이크샵 관리자 > 디자인 관리 > 페이지 관리**

1. **새 페이지 추가** 클릭
2. 페이지 정보 입력:
   - **페이지명**: `파트너맵` (또는 원하는 이름)
   - **URL**: `partnermap` (또는 원하는 URL)
3. **HTML 편집기** 모드로 전환
4. **partnermap-complete.html 파일 전체 내용 복사**
5. **붙여넣기**
6. **저장**

---

### 3️⃣ 페이지 확인

**브라우저에서 접속:**
```
https://your-store.makeshop.co.kr/partnermap
```

**정상 작동 확인:**
- ✅ 지도 표시
- ✅ 파트너 리스트 표시
- ✅ 검색 기능
- ✅ 필터 기능

---

## 🔧 문제 해결

### 문제 1: "전체 0개 업체" 표시

**원인:** JS 파일 경로 오류

**해결:**
1. 메이크샵 파일 관리에서 경로 확인:
   ```
   /upload/파트너맵/js-part1.js
   /upload/파트너맵/js-part2.js
   /upload/파트너맵/js-part3.js
   ```
2. 폴더명 또는 파일명이 다르면 HTML에서 수정:
   ```html
   <script src="/upload/당신의폴더명/js-part1.js"></script>
   ```

---

### 문제 2: 네이버 지도 SDK 오류

**원인:** Client ID 또는 도메인 등록 문제

**해결:**
1. 네이버 클라우드 플랫폼에서 도메인 등록 확인
2. Client ID가 맞는지 확인 (`bfp8odep5r`)
3. HTML에서 SDK 스크립트 확인:
   ```html
   <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=bfp8odep5r"></script>
   ```

---

### 문제 3: CSS가 적용되지 않음

**원인:** Phosphor Icons CDN 차단

**해결:**
- 브라우저 콘솔(F12)에서 CDN 로드 확인
- 차단되었다면 메이크샵 지원팀에 CDN 허용 요청

---

## 📊 브라우저 콘솔 확인

**정상 작동 시 콘솔 메시지:**
```
[Main] 파트너맵 v3 초기화 시작
[Main] API 클라이언트 생성 완료
[Map] 네이버 지도 SDK 로드 완료 ✅
[Main] 파트너 데이터 로드 완료 (200개) ✅
[Main] 지도 초기화 완료
[Main] 초기화 완료 ✅
```

**에러 발생 시:**
```
❌ [Map] 네이버 지도 SDK 로드 타임아웃
❌ [Main] 초기화 실패: Error: ...
```
→ JS 파일 경로 또는 SDK 스크립트 확인

---

## 🎯 장점

### 복사 붙여넣기 한 번으로 배포
- HTML 파일 하나만 관리
- CSS 인라인 포함
- 수정 후 다시 복사 붙여넣기만 하면 됨

### 버전 관리 용이
- Git에서 `partnermap-complete.html` 하나만 추적
- 변경사항 쉽게 확인

---

## ⚙️ 고급 설정

### Client ID 변경

HTML에서 SDK 스크립트 부분 수정:
```html
<!-- 기존 -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=bfp8odep5r"></script>

<!-- 새 ID로 변경 -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=새로운ID"></script>
```

### 테스트 데이터 끄기 (운영 모드)

03-js-part1.js 파일에서:
```javascript
// 개발 모드 (테스트 데이터 200개)
useTestData: true,

// 운영 모드 (Google Sheets API)
useTestData: false,
```

---

## 📝 파일 구조

```
makeshop-deploy/
├── partnermap-complete.html  ⭐ 이 파일만 복사 붙여넣기!
├── 03-js-part1.js            (파일 업로드)
├── 03-js-part2.js            (파일 업로드)
├── 03-js-part3.js            (파일 업로드)
└── PARTNERMAP-PAGE-GUIDE.md  (이 가이드)
```

---

**배포 완료!** 🎉

문제가 있으면 브라우저 콘솔(F12)을 확인하고 에러 메시지를 참고하세요.
