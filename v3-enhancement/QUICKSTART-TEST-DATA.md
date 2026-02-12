# 파트너맵 v3 - 테스트 데이터 빠른 시작 가이드

## 5분 안에 100개 테스트 데이터 생성하기

### 1단계: Google Sheets 열기 (30초)

1. [Google Sheets](https://sheets.google.com) 접속
2. **새 스프레드시트** 생성
3. 시트 이름을 **"파트너목록"**으로 변경 (하단 탭 더블클릭)

### 2단계: Apps Script 에디터 열기 (30초)

1. 상단 메뉴: **도구(Extensions)** → **Apps Script**
2. 새 창이 열립니다.

### 3단계: 스크립트 복사 (1분)

1. 기본 코드 `function myFunction() {}` 삭제
2. **test-data-generator.js** 파일 전체 내용 복사
3. Apps Script 에디터에 붙여넣기
4. **저장** (Ctrl+S / Cmd+S)

### 4단계: 권한 승인 (1분)

1. 함수 선택: **onOpen**
2. **실행(Run)** 버튼 클릭
3. 권한 요청 팝업:
   - **검토** 클릭
   - **고급** 클릭
   - **프로젝트명(안전하지 않음)으로 이동** 클릭
   - **허용** 클릭

### 5단계: 데이터 생성 (30초)

1. Google Sheets로 돌아가기
2. 새로 생긴 메뉴 **"파트너맵 도구"** 클릭
3. **"테스트 데이터 100개 생성"** 클릭
4. 완료 알림 확인

### 완료!

**"파트너목록"** 시트에 100개의 파트너 데이터가 생성되었습니다.

---

## 다음 단계: API 배포 (5분)

### 1단계: 웹 앱 배포

1. Apps Script 에디터로 돌아가기
2. **배포** → **새 배포** 클릭
3. 설정:
   - **유형 선택**: 웹 앱
   - **설명**: 파트너맵 API v3
   - **다음 계정으로 실행**: 나
   - **액세스 권한**: 모든 사용자
4. **배포** 클릭
5. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/.../exec`)

### 2단계: API 테스트

1. Google Sheets로 돌아가기
2. **"파트너맵 도구"** → **"API 테스트"** 클릭
3. 성공 메시지 확인

### 3단계: CONFIG 설정

**makeshop-js-part1.js** 파일 수정:

```javascript
// ========================================
// Google Sheets API
// ========================================
googleSheetApiUrl: 'https://script.google.com/macros/s/YOUR_ID/exec',  // ⭐ 복사한 URL 붙여넣기
```

### 4단계: 운영 모드 활성화

```javascript
// ========================================
// 테스트 데이터 설정
// ========================================
useTestData: false,  // ⭐ false로 변경 (운영 모드)
```

---

## 문제 해결

### "시트를 찾을 수 없습니다" 에러

**해결**: 시트 이름을 정확히 **"파트너목록"**으로 변경하세요 (띄어쓰기 없음).

### 권한 승인 실패

**해결**:
1. 브라우저 시크릿/프라이빗 모드 사용
2. 다른 Google 계정으로 로그인
3. Google 계정 보안 설정 확인

### API 응답이 빈 배열

**해결**:
1. "파트너목록" 시트에 데이터가 있는지 확인
2. 웹 앱 재배포: **배포 관리** → **새 버전** → **배포**

---

## 확인 방법

### 브라우저에서 API 테스트

복사한 웹 앱 URL을 브라우저 주소창에 붙여넣고 Enter:

```
https://script.google.com/macros/s/YOUR_ID/exec
```

**기대 응답**:

```json
{
  "success": true,
  "partners": [ ... ],
  "count": 100,
  "timestamp": "2026-02-12T...",
  "version": "v3.0"
}
```

### 커맨드라인에서 테스트 (선택)

```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec" | jq '.count'
# 출력: 100
```

---

## 샘플 데이터 예시

생성된 데이터의 예시:

```json
{
  "id": 1,
  "name": "네이처 캔들스튜디오",
  "address": "서울특별시 강남구 강남대로 197",
  "lat": 37.506384,
  "lng": 127.056112,
  "category": "캔들",
  "partnerType": "일반",
  "phone": "02-9796-4956",
  "email": "네이처캔들스튜디오1@kakao.com",
  "description": "향초 제작과 판매를 전문으로 하는 캔들샵입니다. 원데이 클래스와 정규 과정을 제공합니다.",
  "imageUrl": "https://via.placeholder.com/400x300.png",
  "logoUrl": "https://via.placeholder.com/150x150.png",
  "association": null
}
```

---

## 데이터 통계

- **총 파트너 수**: 100개
- **카테고리**: 7종 (압화 15, 플라워디자인 20, 투명식물표본 10, 캔들 20, 석고 10, 리본 15, 디퓨저 10)
- **지역**: 서울 8개 구 (강남, 서초, 마포, 종로, 영등포, 송파, 용산, 광진)
- **파트너 유형**: 협회 10%, 인플루언서 15%, 일반 75%
- **좌표 범위**: 서울 내 (위도 37.47~37.60, 경도 126.89~127.14)

---

## 더 많은 정보

- **상세 가이드**: [TEST-DATA-GUIDE.md](./TEST-DATA-GUIDE.md)
- **Google Apps Script 코드**: [test-data-generator.js](./test-data-generator.js)
- **CSV 데이터**: [test-partners-100.csv](./test-partners-100.csv)
- **샘플 JSON**: [test-partners-sample.json](./test-partners-sample.json)

---

**작성**: Claude Code (Sonnet 4.5)
**날짜**: 2026-02-12
**버전**: v3.0
