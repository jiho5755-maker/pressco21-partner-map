# 파트너맵 v3 - 테스트 데이터 패키지

## 개요

Google Sheets에 실제와 유사한 **100개의 파트너 테스트 데이터**를 생성하는 완전한 패키지입니다.

## 생성된 파일 목록

### 1. 핵심 파일

| 파일명 | 크기 | 설명 |
|--------|------|------|
| **test-data-generator.js** | 14KB | Google Apps Script 코드 (웹 앱 API 포함) |
| **test-partners-100.csv** | 50KB | 100개 파트너 CSV 데이터 |
| **test-partners-api-response.json** | 75KB | API 응답 형식 JSON (100개) |
| **test-partners-sample.json** | 2.4KB | API 응답 샘플 (3개) |

### 2. 가이드 문서

| 파일명 | 크기 | 설명 |
|--------|------|------|
| **QUICKSTART-TEST-DATA.md** | 4.7KB | 5분 빠른 시작 가이드 |
| **TEST-DATA-GUIDE.md** | 13KB | 상세 사용 가이드 (배포, 트러블슈팅) |
| **TEST-DATA-README.md** | 이 파일 | 패키지 개요 및 통계 |

---

## 빠른 시작 (5분)

### 방법 1: Google Apps Script (권장)

```
1. Google Sheets 새 문서 생성 → 시트 이름 "파트너목록"
2. 도구 → Apps Script
3. test-data-generator.js 복사 붙여넣기
4. 실행 → 권한 승인
5. Sheets로 돌아가기 → "파트너맵 도구" → "테스트 데이터 100개 생성"
```

**상세 가이드**: [QUICKSTART-TEST-DATA.md](./QUICKSTART-TEST-DATA.md)

### 방법 2: CSV 파일 가져오기

```
1. test-partners-100.csv 다운로드
2. Google Sheets → 파일 → 가져오기
3. CSV 파일 선택 → 구분 기호: 쉼표
```

---

## 데이터 구조

### 필드 (13개)

```
id, name, address, lat, lng, category,
partnerType, phone, email, description,
imageUrl, logoUrl, association
```

### 샘플 데이터

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
  "description": "향초 제작과 판매를 전문으로 하는 캔들샵입니다...",
  "imageUrl": "https://via.placeholder.com/400x300.png",
  "logoUrl": "https://via.placeholder.com/150x150.png",
  "association": null
}
```

---

## 데이터 통계

### 총 파트너 수
**100개** (헤더 제외)

### 카테고리별 분포

| 카테고리 | 개수 | 비율 |
|---------|------|------|
| 캔들 | 20개 | 20% |
| 플라워디자인 | 20개 | 20% |
| 압화 | 15개 | 15% |
| 리본 | 15개 | 15% |
| 투명식물표본 | 10개 | 10% |
| 석고 | 10개 | 10% |
| 디퓨저 | 10개 | 10% |

### 지역별 분포 (서울 8개 구)

| 지역 | 개수 | 비율 |
|------|------|------|
| 강남구 | 20개 | 20% |
| 서초구 | 15개 | 15% |
| 마포구 | 15개 | 15% |
| 종로구 | 10개 | 10% |
| 영등포구 | 10개 | 10% |
| 송파구 | 10개 | 10% |
| 용산구 | 10개 | 10% |
| 광진구 | 10개 | 10% |

### 파트너 유형별 분포

| 유형 | 개수 | 비율 |
|------|------|------|
| 일반 | 81개 | 81% |
| 인플루언서 | 10개 | 10% |
| 협회 | 9개 | 9% |

### 협회 소속

- **협회 소속**: 36개 (36%)
- **무소속**: 64개 (64%)

### 좌표 범위 (서울)

- **위도**: 37.472000 ~ 37.599198
- **경도**: 126.891073 ~ 127.130141

---

## API 배포

### 1단계: 웹 앱 배포

```
Apps Script → 배포 → 새 배포
- 유형: 웹 앱
- 설명: 파트너맵 API v3
- 실행: 나
- 액세스: 모든 사용자
```

### 2단계: URL 복사

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3단계: CONFIG 설정

**makeshop-js-part1.js** 수정:

```javascript
googleSheetApiUrl: 'YOUR_DEPLOYMENT_URL',  // ⭐
useTestData: false,  // ⭐ 운영 모드
```

### 4단계: API 테스트

```bash
curl "YOUR_DEPLOYMENT_URL" | jq '.count'
# 출력: 100
```

---

## API 응답 형식

```json
{
  "success": true,
  "partners": [
    { "id": 1, "name": "...", ... },
    { "id": 2, "name": "...", ... },
    ...
  ],
  "count": 100,
  "timestamp": "2026-02-12T10:39:33.940Z",
  "version": "v3.0"
}
```

---

## 특징

### 실제와 유사한 데이터

- **실제 서울 지역 주소** (강남구, 서초구, 마포구 등)
- **실제 좌표** (서울 범위 내)
- **실제와 유사한 이름** ("꽃향기 플라워샵", "힐링 압화공방" 등)
- **카테고리별 맞춤 설명** (2-3문장)
- **다양한 전화번호 형식** (02-xxxx-xxxx, 010-xxxx-xxxx)

### 카테고리별 특화

- **압화**: 공방, 아트, 스튜디오, 갤러리, 아카데미
- **플라워디자인**: 플라워샵, 플로리스트, 플라워스튜디오
- **캔들**: 캔들공방, 캔들스튜디오, 향초공방
- **디퓨저**: 디퓨저공방, 향공방, 아로마스튜디오
- **리본**: 리본아트, 리본스튜디오, 리본공예
- **석고**: 석고공예, 석고공방

### 지역별 특화

각 구의 실제 주요 도로명 사용:
- **강남구**: 테헤란로, 강남대로, 논현로, 압구정로
- **마포구**: 마포대로, 양화로, 동교로, 와우산로
- **종로구**: 종로, 세종대로, 삼청로, 북촌로

---

## 커스터마이징

### 더 많은 데이터 생성

**test-data-generator.js** 수정:

```javascript
// 지역별 count 변경
regions = [
  { name: '강남구', count: 50, ... },  // 20 → 50
  ...
];
```

### 카테고리 추가

```javascript
categories = {
  ...기존,
  '새카테고리': { count: 10, color: '#ABCDEF' }
};

suffixes = {
  ...기존,
  '새카테고리': ['공방', '스튜디오']
};

descriptionTemplates = {
  ...기존,
  '새카테고리': ['설명 템플릿...']
};
```

---

## 트러블슈팅

### 시트를 찾을 수 없습니다

**원인**: 시트 이름이 "파트너목록"이 아님

**해결**: 시트 이름을 정확히 **"파트너목록"**으로 변경 (띄어쓰기 없음)

### API 응답이 빈 배열

**원인**: 데이터가 생성되지 않음

**해결**:
1. "파트너맵 도구" → "테스트 데이터 100개 생성" 실행
2. 웹 앱 재배포

### 권한 승인 실패

**원인**: Google 보안 정책

**해결**:
1. **고급** → **프로젝트명(안전하지 않음)으로 이동** 클릭
2. **허용** 클릭

### CSV 한글 깨짐

**원인**: 인코딩 문제

**해결**: Google Sheets 가져오기 시 **인코딩: UTF-8** 선택

---

## 검증 방법

### 1. 데이터 개수 확인

```bash
wc -l test-partners-100.csv
# 출력: 101 (헤더 1 + 데이터 100)
```

### 2. API 응답 확인

브라우저에서 웹 앱 URL 열기:

```
https://script.google.com/macros/s/.../exec
```

**기대 결과**:

```json
{ "success": true, "count": 100, ... }
```

### 3. 프론트엔드 테스트

개발자 도구 콘솔:

```javascript
// 데이터 로드 확인
console.log(window.partners.length);  // 100

// 카테고리별 개수
window.partners.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
```

---

## 배포 체크리스트

운영 환경 배포 전:

- [ ] 총 100개 파트너 데이터 확인
- [ ] 모든 필드 값 채워짐 (association 제외)
- [ ] 위도/경도 범위 확인 (서울 내)
- [ ] 전화번호 형식 확인
- [ ] 이메일 형식 확인
- [ ] Google Sheets API URL 확인
- [ ] 웹 앱 배포 완료
- [ ] CONFIG 파일 업데이트
- [ ] 테스트 모드 비활성화 (`useTestData: false`)
- [ ] 프론트엔드 데이터 로드 테스트
- [ ] 지도 마커 표시 테스트
- [ ] 필터/검색 기능 테스트

---

## 관련 파일

### 프로젝트 파일

- **makeshop-js-part1.js** - CONFIG, API 클라이언트
- **makeshop-js-part2a.js** - 필터 서비스

### 테스트 데이터 파일

- **test-data-generator.js** - Google Apps Script
- **test-partners-100.csv** - CSV 데이터
- **test-partners-api-response.json** - JSON API 응답
- **test-partners-sample.json** - JSON 샘플

### 문서

- **QUICKSTART-TEST-DATA.md** - 5분 빠른 시작
- **TEST-DATA-GUIDE.md** - 상세 가이드
- **TEST-DATA-README.md** - 이 파일

---

## 참고 자료

- **Google Apps Script 문서**: https://developers.google.com/apps-script
- **Google Sheets API**: https://developers.google.com/sheets/api
- **메이크샵 개발 가이드**: MAKESHOP-DEVELOPMENT-GUIDE.md

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| v3.0 | 2026-02-12 | 초기 릴리스 - 100개 테스트 데이터 생성 |

---

## 작성 정보

- **작성자**: Claude Code (Sonnet 4.5)
- **생성 일시**: 2026-02-12
- **프로젝트**: 파트너맵 v3
- **목적**: Google Sheets 테스트 데이터 생성 자동화

---

## 라이선스

이 테스트 데이터 패키지는 파트너맵 프로젝트의 일부입니다.

---

## 문의

테스트 데이터 생성 중 문제 발생 시:

1. **QUICKSTART-TEST-DATA.md** - 빠른 시작 가이드 확인
2. **TEST-DATA-GUIDE.md** - 트러블슈팅 섹션 확인
3. Google Apps Script 로그 확인 (**보기** → **로그**)
4. 브라우저 개발자 도구 콘솔 확인

---

**Happy Testing!** 🌸
