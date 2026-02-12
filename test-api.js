/**
 * Node.js 환경에서 API 테스트
 * 브라우저 없이 데이터 로드 확인
 */

const fs = require('fs');
const path = require('path');

// 테스트 데이터 로드
const testDataPath = path.join(__dirname, 'test-data', 'partners-200.json');

console.log('📊 파트너맵 v3 API 테스트\n');
console.log('1. 테스트 데이터 파일 확인...');
console.log('   경로:', testDataPath);

if (fs.existsSync(testDataPath)) {
    console.log('   ✅ 파일 존재\n');

    console.log('2. 데이터 로드 중...');
    const rawData = fs.readFileSync(testDataPath, 'utf8');
    const partners = JSON.parse(rawData);

    console.log('   ✅ 데이터 로드 성공: ' + partners.length + '개 파트너\n');

    console.log('3. 첫 번째 파트너 데이터:');
    const first = partners[0];
    console.log('   ID:', first.id);
    console.log('   이름:', first.name);
    console.log('   카테고리:', first.category);
    console.log('   주소:', first.address);
    console.log('   좌표: lat=' + first.lat + ', lng=' + first.lng);
    console.log('   전화:', first.phone);
    console.log('   이메일:', first.email);
    console.log('   파트너 유형:', first.partnerType);
    console.log('');

    console.log('4. 데이터 유효성 검증...');
    let valid = 0;
    let invalid = 0;

    partners.forEach(p => {
        if (p.id && p.name && p.lat && p.lng && p.address) {
            valid++;
        } else {
            invalid++;
            console.log('   ⚠️ 유효하지 않은 데이터:', p.id, p.name);
        }
    });

    console.log('   ✅ 유효한 데이터: ' + valid + '개');
    if (invalid > 0) {
        console.log('   ⚠️ 유효하지 않은 데이터: ' + invalid + '개');
    }

    console.log('');
    console.log('🎉 API 테스트 완료!');

} else {
    console.log('   ❌ 파일 없음');
}
