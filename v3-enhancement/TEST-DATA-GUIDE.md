# 파트너맵 v3 - 테스트 데이터 가이드

## 개요

파트너맵 프로젝트를 위한 100개의 실제와 유사한 테스트 데이터를 생성하는 가이드입니다.

## 생성된 파일

1. **test-data-generator.js** - Google Apps Script 코드
2. **test-partners-100.csv** - 100개 파트너 CSV 데이터
3. **TEST-DATA-GUIDE.md** - 이 가이드 문서

---

## 데이터 구조

### 필드 목록

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | 숫자 | 고유 ID | 1 |
| name | 문자열 | 파트너 이름 | 꽃향기 플라워샵 |
| address | 문자열 | 주소 | 서울특별시 강남구 테헤란로 123 |
| lat | 실수 | 위도 (6자리) | 37.504800 |
| lng | 실수 | 경도 (6자리) | 127.025100 |
| category | 문자열 | 카테고리 | 플라워디자인 |
| partnerType | 문자열 | 파트너 유형 | 일반 / 협회 / 인플루언서 |
| phone | 문자열 | 전화번호 | 02-1234-5678 또는 010-1234-5678 |
| email | 문자열 | 이메일 | example@naver.com |
| description | 문자열 | 설명 (2-3문장) | 강남구에 위치한 전문 압화 공방입니다... |
| imageUrl | URL | 이미지 URL | https://via.placeholder.com/400x300.png |
| logoUrl | URL | 로고 URL | https://via.placeholder.com/150x150.png |
| association | 문자열 | 협회명 (선택) | 한국플라워디자인협회 |

### 카테고리별 분포

- **압화**: 15개
- **플라워디자인**: 20개
- **투명식물표본**: 10개
- **캔들**: 20개
- **석고**: 10개
- **리본**: 15개
- **디퓨저**: 10개
- **총합**: 100개

### 지역별 분포

- **강남구**: 20개
- **서초구**: 15개
- **마포구**: 15개
- **종로구**: 10개
- **영등포구**: 10개
- **송파구**: 10개
- **용산구**: 10개
- **광진구**: 10개
- **총합**: 100개

### 파트너 유형 분포

- **협회**: 10% (10개)
- **인플루언서**: 15% (15개)
- **일반**: 75% (75개)

---

## 방법 1: Google Apps Script 사용 (권장)

Google Sheets에 직접 데이터를 생성하는 방법입니다.

### 1단계: Google Sheets 열기

1. 파트너 데이터가 저장된 Google Sheets를 엽니다.
2. 시트 이름이 **"파트너목록"**인지 확인합니다.
   - 없다면 새 시트를 만들고 이름을 "파트너목록"으로 변경하세요.

### 2단계: Apps Script 에디터 열기

1. 상단 메뉴에서 **도구(Extensions)** → **Apps Script** 클릭
2. 새 스크립트 에디터가 열립니다.

### 3단계: 스크립트 붙여넣기

1. 기본으로 생성된 `function myFunction() {}` 코드를 모두 삭제합니다.
2. **test-data-generator.js** 파일의 전체 내용을 복사하여 붙여넣습니다.

### 4단계: 스크립트 실행

1. 상단에서 함수 선택: **onOpen** 선택
2. **실행(Run)** 버튼 클릭
3. 권한 승인 요청이 나타나면 **검토** → **고급** → **프로젝트명(안전하지 않음)으로 이동** → **허용** 클릭

### 5단계: 데이터 생성

1. Google Sheets로 돌아갑니다.
2. 새로 생긴 메뉴 **"파트너맵 도구"** → **"테스트 데이터 100개 생성"** 클릭
3. 완료 알림이 표시되면 성공입니다.

### 6단계: 결과 확인

- **"파트너목록"** 시트에 100개의 파트너 데이터가 생성됩니다.
- 헤더 행은 보라색 배경으로 포맷팅됩니다.
- 열 너비가 자동으로 조정됩니다.

---

## 방법 2: CSV 파일 가져오기

CSV 파일을 Google Sheets에 직접 가져오는 방법입니다.

### 1단계: CSV 파일 다운로드

- **test-partners-100.csv** 파일을 다운로드합니다.

### 2단계: Google Sheets 열기

1. 새 Google Sheets를 생성하거나 기존 시트를 엽니다.

### 2-A: 새 시트로 가져오기

1. Google Drive에서 **새로 만들기** → **파일 업로드**
2. **test-partners-100.csv** 파일 선택
3. 업로드된 파일을 우클릭 → **연결 프로그램** → **Google Sheets**

### 2-B: 기존 시트에 가져오기

1. Google Sheets를 엽니다.
2. 상단 메뉴에서 **파일** → **가져오기** → **업로드**
3. **test-partners-100.csv** 파일 선택
4. 가져오기 설정:
   - **가져오기 위치**: 새 시트 / 기존 시트 대체 선택
   - **구분 기호 유형**: 쉼표
   - **텍스트를 숫자 및 날짜로 변환**: 체크
5. **데이터 가져오기** 클릭

### 3단계: 결과 확인

- 100개의 파트너 데이터가 시트에 추가됩니다.
- 첫 번째 행은 헤더입니다.

---

## 방법 3: 로컬 JSON 파일 생성 (개발용)

테스트 모드에서 사용할 수 있는 JSON 파일을 생성합니다.

### 1단계: CSV를 JSON으로 변환

```bash
cd /Users/jangjiho/workspace/partner-map/v3-enhancement

node -e "
const fs = require('fs');
const csv = fs.readFileSync('test-partners-100.csv', 'utf8');
const lines = csv.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');

const partners = lines.slice(1).map(line => {
  const values = line.split(',');
  const partner = {};
  headers.forEach((header, i) => {
    partner[header] = values[i];
  });
  return partner;
});

fs.writeFileSync('test-partners-100.json', JSON.stringify(partners, null, 2), 'utf8');
console.log('JSON 파일 생성 완료');
"
```

### 2단계: CONFIG 설정 변경

**makeshop-js-part1.js** 파일에서:

```javascript
// ========================================
// 테스트 데이터 설정
// ========================================
useTestData: true,  // ⭐ true로 변경
testDataPath: '/test-data/test-partners-100.json',
```

### 3단계: JSON 파일 배포

- **test-partners-100.json** 파일을 웹 서버의 `/test-data/` 경로에 업로드합니다.
- 또는 절대 경로로 변경: `testDataPath: '/절대경로/test-partners-100.json'`

---

## Google Sheets API 웹 앱 배포

생성된 데이터를 API로 제공하려면 Google Apps Script 웹 앱을 배포해야 합니다.

### 1단계: Apps Script 웹 앱 코드 추가

**test-data-generator.js** 하단에 다음 함수를 추가합니다:

```javascript
/**
 * 웹 앱 API 엔드포인트
 */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('파트너목록');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: '시트를 찾을 수 없습니다.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var partners = [];

  for (var i = 1; i < data.length; i++) {
    var partner = {};
    for (var j = 0; j < headers.length; j++) {
      partner[headers[j]] = data[i][j];
    }
    partners.push(partner);
  }

  var response = {
    partners: partners,
    count: partners.length
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2단계: 웹 앱 배포

1. Apps Script 에디터에서 **배포** → **새 배포** 클릭
2. 설정:
   - **유형 선택**: 웹 앱
   - **설명**: 파트너맵 API
   - **다음 계정으로 실행**: 나
   - **액세스 권한**: 모든 사용자
3. **배포** 클릭
4. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/...../exec`)

### 3단계: CONFIG에 URL 설정

**makeshop-js-part1.js** 파일에서:

```javascript
// ========================================
// Google Sheets API (v2와 동일)
// ========================================
googleSheetApiUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',  // ⭐ 복사한 URL로 변경
```

---

## 데이터 검증

생성된 데이터가 올바른지 확인하는 방법입니다.

### 1. 데이터 개수 확인

```bash
# CSV 파일 행 수 (헤더 포함 101줄이어야 함)
wc -l test-partners-100.csv
```

### 2. 필드 검증

- **id**: 1~100 범위
- **lat**: 37.47~37.60 범위 (서울)
- **lng**: 126.89~127.14 범위 (서울)
- **category**: 7개 카테고리 중 하나
- **partnerType**: 협회 / 인플루언서 / 일반

### 3. API 응답 테스트

```bash
curl "YOUR_GOOGLE_SHEETS_API_URL" | jq '.partners | length'
# 출력: 100
```

### 4. 프론트엔드 테스트

1. 파트너맵 웹 페이지를 엽니다.
2. 개발자 도구 콘솔에서:

```javascript
// 데이터 로드 확인
console.log(window.partners);  // 100개 배열

// 카테고리별 개수
window.partners.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
```

---

## 트러블슈팅

### 문제 1: Apps Script 권한 오류

**증상**: "이 앱은 확인되지 않았습니다" 메시지

**해결**:
1. **고급** 클릭
2. **프로젝트명(안전하지 않음)으로 이동** 클릭
3. **허용** 클릭

### 문제 2: 시트를 찾을 수 없음

**증상**: "시트를 찾을 수 없습니다" 오류

**해결**:
- 시트 이름이 정확히 **"파트너목록"**인지 확인하세요 (띄어쓰기, 대소문자 주의).

### 문제 3: CSV 인코딩 문제

**증상**: CSV 가져오기 시 한글이 깨짐

**해결**:
- CSV 파일을 UTF-8 인코딩으로 저장합니다.
- Google Sheets 가져오기 시 **인코딩: UTF-8** 선택

### 문제 4: API 응답이 빈 배열

**증상**: `{ partners: [] }`

**해결**:
1. Google Sheets에서 "파트너목록" 시트에 데이터가 있는지 확인
2. Apps Script의 `doGet()` 함수가 올바르게 배포되었는지 확인
3. 웹 앱 재배포: **배포 관리** → **새 버전** → **배포**

### 문제 5: 지도에 마커가 표시되지 않음

**증상**: 데이터는 로드되지만 지도에 마커 없음

**해결**:
1. 좌표 필드명 확인: `lat`, `lng` (API 응답)
2. 프론트엔드에서 `latitude`, `longitude`로 변환되는지 확인 (makeshop-js-part1.js 418-419줄)

---

## 커스터마이징

### 더 많은 데이터 생성

**test-data-generator.js**에서:

```javascript
// 지역 count 변경
{ name: '강남구', count: 40, ... },  // 20 → 40으로 변경
```

### 카테고리 비율 변경

```javascript
var categories = {
  '압화': { count: 30, ... },  // 15 → 30으로 변경
  '플라워디자인': { count: 30, ... },
  ...
};
```

### 새 카테고리 추가

```javascript
var categories = {
  ...기존 카테고리,
  '새카테고리': { count: 10, color: '#ABCDEF' }
};

var suffixes = {
  ...기존 suffixes,
  '새카테고리': ['공방', '스튜디오', '클래스']
};

var descriptionTemplates = {
  ...기존 템플릿,
  '새카테고리': [
    '{region}에 위치한 새카테고리 전문 공방입니다.',
    '새카테고리 작품 제작과 교육을 진행합니다.'
  ]
};
```

---

## 데이터 예시

### 예시 1: 강남구 플라워디자인 파트너

```csv
1,꽃향기 플라워샵,서울특별시 강남구 테헤란로 123,37.504800,127.025100,플라워디자인,일반,02-1234-5678,kkothyanggiplraweosaeb1@naver.com,강남구의 대표적인 플라워 디자인 스튜디오입니다. 웨딩 부케 센터피스 리스 등 다양한 플라워 작품을 제작합니다.,https://via.placeholder.com/400x300.png,https://via.placeholder.com/150x150.png,한국플라워디자인협회
```

### 예시 2: 마포구 캔들 인플루언서

```csv
45,힐링 캔들공방,서울특별시 마포구 양화로 78,37.551234,126.922345,캔들,인플루언서,010-5678-1234,hillingkaendeulgongbang45@gmail.com,마포구의 감성 캔들 공방입니다. 소이왁스를 활용한 친환경 캔들 제작을 진행합니다.,https://via.placeholder.com/400x300.png,https://via.placeholder.com/150x150.png,
```

---

## 배포 체크리스트

데이터를 운영 환경에 배포하기 전 확인 사항:

- [ ] 총 100개 파트너 데이터 확인
- [ ] 모든 필드 값이 채워져 있는지 확인 (association 제외)
- [ ] 위도/경도 범위가 서울 내인지 확인 (37.47~37.60, 126.89~127.14)
- [ ] 전화번호 형식 확인 (02-xxxx-xxxx 또는 010-xxxx-xxxx)
- [ ] 이메일 형식 확인 (xxx@domain.com)
- [ ] Google Sheets API URL 확인
- [ ] 웹 앱 배포 완료 및 URL 복사
- [ ] CONFIG 파일에 API URL 업데이트
- [ ] 테스트 모드 비활성화 (`useTestData: false`)
- [ ] 프론트엔드에서 데이터 로드 테스트
- [ ] 지도 마커 표시 테스트
- [ ] 필터/검색 기능 테스트

---

## 참고 자료

- **Google Apps Script 공식 문서**: https://developers.google.com/apps-script
- **Google Sheets API**: https://developers.google.com/sheets/api
- **파트너맵 v3 메인 코드**: `makeshop-js-part1.js`, `makeshop-js-part2a.js`
- **CONFIG 설정**: `makeshop-js-part1.js` 7-217줄

---

## 문의

테스트 데이터 생성 중 문제가 발생하면:

1. 이 가이드의 **트러블슈팅** 섹션 확인
2. Google Apps Script 로그 확인 (**보기** → **로그**)
3. 브라우저 개발자 도구 콘솔 확인

---

**생성 일시**: 2026-02-12
**버전**: v3.0
**작성자**: Claude Code (Sonnet 4.5)
