/**
 * 파트너맵 v3 - 테스트 데이터 생성기
 * Google Apps Script에서 실행하여 100개의 테스트 파트너 데이터 생성
 */

function generateTestPartners() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('파트너목록');

  if (!sheet) {
    Logger.log('시트를 찾을 수 없습니다. "파트너목록" 이름의 시트를 만들어주세요.');
    return;
  }

  // 헤더 행
  var headers = [
    'id', 'name', 'address', 'lat', 'lng', 'category',
    'partnerType', 'phone', 'email', 'description',
    'imageUrl', 'logoUrl', 'association'
  ];

  // 카테고리 정의
  var categories = {
    '압화': { count: 15, color: '#FFB8A8' },
    '플라워디자인': { count: 20, color: '#E8D5E8' },
    '투명식물표본': { count: 10, color: '#A8E0C8' },
    '캔들': { count: 20, color: '#F5E6CA' },
    '석고': { count: 10, color: '#F5E6CA' },
    '리본': { count: 15, color: '#D4E4F7' },
    '디퓨저': { count: 10, color: '#F0E4D4' }
  };

  // 지역별 정의 (서울 구)
  var regions = [
    {
      name: '강남구',
      count: 20,
      lat: { min: 37.4800, max: 37.5300 },
      lng: { min: 127.0100, max: 127.0800 },
      streets: ['테헤란로', '강남대로', '논현로', '압구정로', '봉은사로', '삼성로', '언주로']
    },
    {
      name: '서초구',
      count: 15,
      lat: { min: 37.4700, max: 37.5100 },
      lng: { min: 126.9700, max: 127.0300 },
      streets: ['서초대로', '강남대로', '반포대로', '효령로', '방배로', '동작대로']
    },
    {
      name: '마포구',
      count: 15,
      lat: { min: 37.5400, max: 37.5700 },
      lng: { min: 126.8900, max: 126.9600 },
      streets: ['마포대로', '양화로', '동교로', '와우산로', '서강로', '월드컵로']
    },
    {
      name: '종로구',
      count: 10,
      lat: { min: 37.5700, max: 37.6000 },
      lng: { min: 126.9700, max: 127.0100 },
      streets: ['종로', '세종대로', '창경궁로', '율곡로', '삼청로', '북촌로']
    },
    {
      name: '영등포구',
      count: 10,
      lat: { min: 37.5100, max: 37.5400 },
      lng: { min: 126.8900, max: 126.9300 },
      streets: ['여의대로', '국회대로', '당산로', '영등포로', '도림로']
    },
    {
      name: '송파구',
      count: 10,
      lat: { min: 37.4900, max: 37.5300 },
      lng: { min: 127.0800, max: 127.1400 },
      streets: ['올림픽로', '송파대로', '백제고분로', '동남로', '위례성대로']
    },
    {
      name: '용산구',
      count: 10,
      lat: { min: 37.5200, max: 37.5500 },
      lng: { min: 126.9600, max: 127.0000 },
      streets: ['한강대로', '이태원로', '서빙고로', '녹사평대로', '한남대로']
    },
    {
      name: '광진구',
      count: 10,
      lat: { min: 37.5300, max: 37.5600 },
      lng: { min: 127.0700, max: 127.1100 },
      streets: ['천호대로', '아차산로', '광나루로', '자양로', '구의동로']
    }
  ];

  // 파트너 유형
  var partnerTypes = ['협회', '인플루언서', '일반'];
  var partnerTypeWeights = [0.1, 0.15, 0.75]; // 협회 10%, 인플루언서 15%, 일반 75%

  // 협회 목록
  var associations = [
    '한국플라워디자인협회',
    '한국압화협회',
    '한국캔들공예협회',
    '한국석고공예협회',
    '한국리본공예협회',
    ''  // 무소속
  ];

  // 파트너 이름 접두사
  var prefixes = ['꽃향기', '힐링', '아름다운', '행복한', '사랑의', '프레스코', '로즈', '블룸', '가든',
                  '플로라', '나무와꽃', '그린', '네이처', '포레스트', '썬', '문라이트', '스타',
                  '드림', '하모니', '엘레강스', '샤인', '스위트', '러블리', '멜로디', '실크',
                  '벨', '팰리스', '스튜디오', '아뜰리에', '갤러리', '라운지', '파크', '가든'];

  // 파트너 이름 접미사
  var suffixes = {
    '압화': ['공방', '아트', '스튜디오', '갤러리', '아카데미', '클래스', '작업실'],
    '플라워디자인': ['플라워샵', '플라워', '플로리스트', '플라워스튜디오', '플라워디자인', '꽃집', '플라워클래스'],
    '투명식물표본': ['공방', '아트', '스튜디오', '클래스', '작업실', '연구소', '갤러리'],
    '캔들': ['캔들공방', '캔들스튜디오', '캔들샵', '캔들클래스', '캔들아트', '향초공방'],
    '석고': ['공방', '아트', '스튜디오', '클래스', '작업실', '석고공예'],
    '리본': ['공방', '리본아트', '리본스튜디오', '리본클래스', '리본공예'],
    '디퓨저': ['디퓨저공방', '향공방', '아로마스튜디오', '디퓨저샵', '향클래스']
  };

  // 설명 템플릿
  var descriptionTemplates = {
    '압화': [
      '{region}에 위치한 전문 압화 공방입니다. 다양한 압화 클래스와 작품 제작을 진행하고 있습니다.',
      '압화 작품 제작 및 교육을 전문으로 하는 공방입니다. 초보자부터 전문가까지 맞춤형 클래스를 제공합니다.',
      '자연의 아름다움을 압화로 담아내는 작업실입니다. 원데이 클래스와 정규 과정을 운영하고 있습니다.'
    ],
    '플라워디자인': [
      '{region}의 대표적인 플라워 디자인 스튜디오입니다. 웨딩 부케, 센터피스, 리스 등 다양한 플라워 작품을 제작합니다.',
      '전문 플로리스트가 운영하는 플라워샵입니다. 플라워 클래스와 맞춤 주문 제작을 진행합니다.',
      '감각적인 플라워 디자인과 체계적인 교육 프로그램을 제공하는 스튜디오입니다.'
    ],
    '투명식물표본': [
      '투명 식물 표본 제작 전문 공방입니다. 독특한 식물 표본 작품과 DIY 클래스를 운영합니다.',
      '식물의 아름다움을 투명하게 담아내는 작업실입니다. 원데이 클래스와 취미반을 운영하고 있습니다.',
      '{region}에서 투명 식물 표본 클래스를 진행하는 전문 공방입니다.'
    ],
    '캔들': [
      '수제 캔들 제작 전문 공방입니다. 다양한 향과 디자인의 캔들 클래스를 운영하고 있습니다.',
      '향초 제작과 판매를 전문으로 하는 캔들샵입니다. 원데이 클래스와 정규 과정을 제공합니다.',
      '{region}의 감성 캔들 공방입니다. 소이왁스를 활용한 친환경 캔들 제작을 진행합니다.'
    ],
    '석고': [
      '석고 공예 작품 제작 및 교육을 진행하는 전문 공방입니다. 석고 방향제, 디퓨저 등을 제작합니다.',
      '석고를 활용한 다양한 공예품 클래스를 운영하는 작업실입니다.',
      '{region}에서 석고 공예 교육을 전문으로 하는 공방입니다.'
    ],
    '리본': [
      '리본 공예 전문 공방입니다. 리본 플라워, 리본 자수, 리본 악세서리 클래스를 진행합니다.',
      '섬세한 리본 아트 작품 제작과 교육을 하는 스튜디오입니다.',
      '{region}의 리본 공예 클래스 전문 공방입니다. 다양한 리본 아트 과정을 제공합니다.'
    ],
    '디퓨저': [
      '천연 디퓨저 제작 전문 공방입니다. 다양한 향과 디자인의 디퓨저 클래스를 운영합니다.',
      '아로마 디퓨저와 방향제를 제작하는 향 공방입니다. 원데이 클래스와 정규반을 운영하고 있습니다.',
      '{region}에서 천연 디퓨저 클래스를 진행하는 전문 공방입니다.'
    ]
  };

  // 데이터 생성
  var partners = [];
  var partnerId = 1;

  // 헤더 추가
  partners.push(headers);

  // 각 지역별로 파트너 생성
  regions.forEach(function(region) {
    var categoryList = Object.keys(categories);
    var categoryIndex = 0;

    for (var i = 0; i < region.count; i++) {
      // 카테고리 순환 배정 (전체 비율 유지)
      var category = categoryList[categoryIndex % categoryList.length];
      categoryIndex++;

      // 좌표 랜덤 생성
      var lat = randomInRange(region.lat.min, region.lat.max);
      var lng = randomInRange(region.lng.min, region.lng.max);

      // 주소 생성
      var street = region.streets[Math.floor(Math.random() * region.streets.length)];
      var number = Math.floor(Math.random() * 300) + 1;
      var address = '서울특별시 ' + region.name + ' ' + street + ' ' + number;

      // 이름 생성
      var prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      var suffix = suffixes[category][Math.floor(Math.random() * suffixes[category].length)];
      var name = prefix + ' ' + suffix;

      // 파트너 유형 (가중치 기반)
      var partnerType = weightedRandom(partnerTypes, partnerTypeWeights);

      // 협회 (파트너 유형이 '협회'인 경우 협회명 필수)
      var association = '';
      if (partnerType === '협회') {
        association = associations[Math.floor(Math.random() * (associations.length - 1))];
      } else if (Math.random() < 0.3) {
        // 일반/인플루언서도 30% 확률로 협회 소속
        association = associations[Math.floor(Math.random() * (associations.length - 1))];
      }

      // 전화번호 (서울 02 또는 휴대폰 010)
      var phone = Math.random() > 0.5
        ? '02-' + randomDigits(4) + '-' + randomDigits(4)
        : '010-' + randomDigits(4) + '-' + randomDigits(4);

      // 이메일
      var emailPrefix = name.replace(/\s+/g, '').toLowerCase();
      var emailDomains = ['naver.com', 'gmail.com', 'kakao.com', 'daum.net'];
      var email = emailPrefix + partnerId + '@' + emailDomains[Math.floor(Math.random() * emailDomains.length)];

      // 설명
      var templates = descriptionTemplates[category];
      var description = templates[Math.floor(Math.random() * templates.length)];
      description = description.replace('{region}', region.name);

      // 이미지 URL (플레이스홀더)
      var imageUrl = 'https://via.placeholder.com/400x300.png?text=' + encodeURIComponent(name);
      var logoUrl = 'https://via.placeholder.com/150x150.png?text=' + encodeURIComponent(name);

      // 데이터 행 추가
      partners.push([
        partnerId,
        name,
        address,
        lat.toFixed(6),
        lng.toFixed(6),
        category,
        partnerType,
        phone,
        email,
        description,
        imageUrl,
        logoUrl,
        association
      ]);

      partnerId++;
    }
  });

  // 시트에 데이터 쓰기
  sheet.clearContents();
  sheet.getRange(1, 1, partners.length, partners[0].length).setValues(partners);

  // 헤더 포맷팅
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#E8D5E8');

  // 열 너비 자동 조정
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  Logger.log('테스트 데이터 생성 완료: ' + (partners.length - 1) + '개 파트너');
  SpreadsheetApp.getUi().alert('테스트 데이터 생성 완료!\n총 ' + (partners.length - 1) + '개의 파트너 데이터가 생성되었습니다.');
}

// === 유틸리티 함수 ===

/**
 * 범위 내 랜덤 실수 생성
 */
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * N자리 랜덤 숫자 문자열 생성
 */
function randomDigits(n) {
  var result = '';
  for (var i = 0; i < n; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

/**
 * 가중치 기반 랜덤 선택
 */
function weightedRandom(items, weights) {
  var total = weights.reduce(function(sum, w) { return sum + w; }, 0);
  var random = Math.random() * total;

  var cumulative = 0;
  for (var i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * 커스텀 메뉴 추가 (스프레드시트 열 때 자동 실행)
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('파트너맵 도구')
      .addItem('테스트 데이터 100개 생성', 'generateTestPartners')
      .addItem('API 테스트', 'testAPI')
      .addToUi();
}

// ========================================
// 웹 앱 API 엔드포인트
// ========================================

/**
 * 웹 앱 GET 요청 핸들러
 * API 엔드포인트: https://script.google.com/macros/s/YOUR_ID/exec
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('파트너목록');

    if (!sheet) {
      return createErrorResponse('시트를 찾을 수 없습니다. "파트너목록" 시트를 생성해주세요.');
    }

    var data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return createErrorResponse('데이터가 없습니다. 먼저 "테스트 데이터 100개 생성"을 실행하세요.');
    }

    var headers = data[0];
    var partners = [];

    // 헤더를 기준으로 객체 변환
    for (var i = 1; i < data.length; i++) {
      var partner = {};
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        var value = data[i][j];

        // 빈 문자열 처리
        if (value === '') {
          value = null;
        }

        partner[header] = value;
      }
      partners.push(partner);
    }

    var response = {
      success: true,
      partners: partners,
      count: partners.length,
      timestamp: new Date().toISOString(),
      version: 'v3.0'
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return createErrorResponse('서버 오류: ' + error.message);
  }
}

/**
 * 에러 응답 생성
 */
function createErrorResponse(message) {
  var response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * API 테스트 함수 (메뉴에서 실행)
 */
function testAPI() {
  var result = doGet();
  var content = result.getContent();
  var data = JSON.parse(content);

  var ui = SpreadsheetApp.getUi();

  if (data.success) {
    ui.alert('API 테스트 성공!\n\n' +
             '파트너 수: ' + data.count + '개\n' +
             '타임스탬프: ' + data.timestamp + '\n' +
             '버전: ' + data.version + '\n\n' +
             '웹 앱 배포 후 이 API를 사용할 수 있습니다.');
  } else {
    ui.alert('API 테스트 실패!\n\n에러: ' + data.error);
  }
}
