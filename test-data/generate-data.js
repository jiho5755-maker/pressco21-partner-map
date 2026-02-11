/**
 * 파트너맵 v3 - 테스트 데이터 생성 스크립트
 * 200개 실제 운영 수준 테스트 데이터 자동 생성
 */

const fs = require('fs');
const path = require('path');

// 카테고리 정의 (7개)
const CATEGORIES = ['압화', '플라워디자인', '투명식물표본', '캔들', '석고', '리본', '디퓨저'];

// 파트너 유형 정의
const PARTNER_TYPES = ['협회', '인플루언서', '일반'];

// 지역별 좌표 범위 (실제 한국 지역 중심점)
const REGIONS = [
    { name: '서울', count: 30, lat: 37.5665, lng: 126.9780, range: 0.1 },
    { name: '경기', count: 25, lat: 37.4138, lng: 127.5183, range: 0.2 },
    { name: '부산', count: 15, lat: 35.1796, lng: 129.0756, range: 0.08 },
    { name: '대구', count: 12, lat: 35.8714, lng: 128.6014, range: 0.07 },
    { name: '인천', count: 12, lat: 37.4563, lng: 126.7052, range: 0.08 },
    { name: '광주', count: 10, lat: 35.1595, lng: 126.8526, range: 0.06 },
    { name: '대전', count: 10, lat: 36.3504, lng: 127.3845, range: 0.06 },
    { name: '울산', count: 8, lat: 35.5384, lng: 129.3114, range: 0.05 },
    { name: '세종', count: 5, lat: 36.4800, lng: 127.2890, range: 0.04 },
    { name: '경남', count: 15, lat: 35.4606, lng: 128.2132, range: 0.15 },
    { name: '경북', count: 12, lat: 36.4919, lng: 128.8889, range: 0.15 },
    { name: '전남', count: 10, lat: 34.8679, lng: 126.9910, range: 0.12 },
    { name: '전북', count: 10, lat: 35.7175, lng: 127.1530, range: 0.12 },
    { name: '충남', count: 8, lat: 36.5184, lng: 126.8000, range: 0.1 },
    { name: '충북', count: 8, lat: 36.8000, lng: 127.7000, range: 0.1 },
    { name: '강원', count: 5, lat: 37.8228, lng: 128.1555, range: 0.15 },
    { name: '제주', count: 5, lat: 33.4996, lng: 126.5312, range: 0.08 }
];

// 협회 이름 풀
const ASSOCIATIONS = [
    '한국압화협회',
    '한국플라워디자인협회',
    '대한투명표본협회',
    '한국캔들협회',
    '한국석고공예협회',
    '대한리본공예협회',
    '한국아로마협회',
    ''  // 일부는 협회 없음
];

// 설명 템플릿
const DESCRIPTIONS = [
    '전통 기법을 활용한 작품 제작을 전문으로 합니다.',
    '초보자부터 전문가까지 체계적인 교육 프로그램을 제공합니다.',
    '고품질 재료와 노하우로 최상의 결과물을 만들어드립니다.',
    '원데이 클래스부터 자격증 과정까지 다양한 수업을 운영합니다.',
    '개인 맞춤형 레슨으로 빠른 실력 향상을 돕습니다.',
    '20년 경력의 전문 강사가 직접 지도합니다.',
    '소규모 클래스로 세심한 관리를 제공합니다.',
    ''  // 일부는 설명 없음
];

/**
 * 랜덤 요소 선택
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 랜덤 범위 내 숫자 생성
 */
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 좌표 생성 (지역 범위 내)
 */
function generateCoordinates(region) {
    const lat = region.lat + randomInRange(-region.range, region.range);
    const lng = region.lng + randomInRange(-region.range, region.range);
    return {
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
    };
}

/**
 * 주소 생성
 */
function generateAddress(region, index) {
    const districts = ['중구', '남구', '북구', '동구', '서구', '강남구', '강북구', '송파구', '강서구'];
    const streets = ['중앙로', '역삼로', '테헤란로', '강남대로', '시청로', '대학로', '문화로', '예술로'];

    const district = randomChoice(districts);
    const street = randomChoice(streets);
    const number = Math.floor(Math.random() * 200) + 1;

    return region.name + '특별시 ' + district + ' ' + street + ' ' + number;
}

/**
 * 전화번호 생성
 */
function generatePhone() {
    // 20% 확률로 전화번호 없음 (불완전 데이터 시뮬레이션)
    if (Math.random() < 0.2) return '';

    const areaCodes = ['02', '031', '032', '033', '041', '042', '043', '051', '052', '053', '054', '055', '061', '062', '063', '064'];
    const areaCode = randomChoice(areaCodes);
    const middle = String(Math.floor(Math.random() * 9000) + 1000);
    const last = String(Math.floor(Math.random() * 9000) + 1000);

    return areaCode + '-' + middle + '-' + last;
}

/**
 * 이메일 생성
 */
function generateEmail(name, index) {
    // 20% 확률로 이메일 없음
    if (Math.random() < 0.2) return '';

    const domains = ['naver.com', 'gmail.com', 'daum.net', 'kakao.com'];
    const sanitizedName = name.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();

    return sanitizedName + index + '@' + randomChoice(domains);
}

/**
 * 파트너 데이터 생성
 */
function generatePartner(id, region, indexInRegion) {
    const coords = generateCoordinates(region);
    const category = randomChoice(CATEGORIES);
    const hasMultiCategory = Math.random() < 0.3;  // 30% 확률로 다중 카테고리
    const categories = hasMultiCategory
        ? category + ',' + randomChoice(CATEGORIES.filter(c => c !== category))
        : category;

    const partnerType = randomChoice(PARTNER_TYPES);
    const name = region.name + category + '공방' + indexInRegion;
    const association = partnerType === '협회' ? randomChoice(ASSOCIATIONS.filter(a => a !== '')) : randomChoice(ASSOCIATIONS);

    return {
        id: String(id),
        name: name,
        category: categories,
        address: generateAddress(region, indexInRegion),
        lat: coords.lat,
        lng: coords.lng,
        phone: generatePhone(),
        email: generateEmail(name, id),
        description: randomChoice(DESCRIPTIONS),
        logoUrl: 'https://via.placeholder.com/150?text=' + encodeURIComponent(name),
        imageUrl: 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(category),
        association: association,
        partnerType: partnerType
    };
}

/**
 * 전체 데이터 생성
 */
function generateAllPartners() {
    const partners = [];
    let currentId = 1;

    REGIONS.forEach(region => {
        for (let i = 1; i <= region.count; i++) {
            partners.push(generatePartner(currentId, region, i));
            currentId++;
        }
    });

    return partners;
}

/**
 * JSON 파일 저장
 */
function saveToFile(partners) {
    const outputPath = path.join(__dirname, 'partners-200.json');
    const jsonString = JSON.stringify(partners, null, 2);

    fs.writeFileSync(outputPath, jsonString, 'utf8');

    console.log('✅ 테스트 데이터 생성 완료!');
    console.log('📊 총 파트너 수:', partners.length);
    console.log('📁 저장 위치:', outputPath);

    // 통계 출력
    const stats = {
        regions: {},
        categories: {},
        partnerTypes: {}
    };

    partners.forEach(p => {
        // 지역 통계
        const region = p.address.split(' ')[0].replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('도', '');
        stats.regions[region] = (stats.regions[region] || 0) + 1;

        // 카테고리 통계
        p.category.split(',').forEach(cat => {
            stats.categories[cat.trim()] = (stats.categories[cat.trim()] || 0) + 1;
        });

        // 파트너 유형 통계
        stats.partnerTypes[p.partnerType] = (stats.partnerTypes[p.partnerType] || 0) + 1;
    });

    console.log('\n📈 지역별 분포:');
    Object.keys(stats.regions).sort().forEach(region => {
        console.log('  ' + region + ': ' + stats.regions[region] + '개');
    });

    console.log('\n📈 카테고리별 분포:');
    Object.keys(stats.categories).sort().forEach(cat => {
        console.log('  ' + cat + ': ' + stats.categories[cat] + '개');
    });

    console.log('\n📈 파트너 유형별 분포:');
    Object.keys(stats.partnerTypes).sort().forEach(type => {
        console.log('  ' + type + ': ' + stats.partnerTypes[type] + '개');
    });
}

// 실행
const partners = generateAllPartners();
saveToFile(partners);
