/**
 * 메이크샵 페이지의 HTML 소스 확인
 * - 파트너맵 관련 태그 존재 여부
 * - 스크립트 로드 경로 확인
 */

const { chromium } = require('playwright');

async function checkHtmlSource() {
  console.log('🔍 메이크샵 페이지 HTML 소스 확인...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://foreverlove.co.kr/preview/?dgnset_id=49398&dgnset_type=RW&user_device_type=PC', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForTimeout(5000);

  // HTML 전체 소스 가져오기
  const htmlContent = await page.content();

  console.log('📄 HTML 소스 분석 중...\n');

  // 파트너맵 관련 키워드 검색
  const keywords = [
    'partner-map',
    'config.js',
    'partner-manager.js',
    'main.js',
    'kakao.maps',
    'dapi.kakao.com',
    '/partner-map/',
    'PARTNER_MAP_CONFIG',
    'partner-map-container',
    'partner-map-loading'
  ];

  console.log('🔎 핵심 키워드 검색 결과:\n');

  keywords.forEach(keyword => {
    const found = htmlContent.includes(keyword);
    const count = (htmlContent.match(new RegExp(keyword, 'g')) || []).length;
    console.log(`${found ? '✅' : '❌'} "${keyword}" - ${count}개 발견`);
  });

  // 파트너맵 컨테이너 DOM 확인
  console.log('\n📦 파트너맵 컨테이너 DOM 확인:\n');

  const containerHtml = await page.evaluate(() => {
    const container = document.getElementById('partner-map-container');
    if (container) {
      return {
        found: true,
        innerHTML: container.innerHTML,
        outerHTML: container.outerHTML.substring(0, 500)
      };
    }
    return { found: false };
  });

  if (containerHtml.found) {
    console.log('✅ #partner-map-container 발견');
    console.log('OuterHTML:', containerHtml.outerHTML);
  } else {
    console.log('❌ #partner-map-container 없음');
  }

  // 로딩 오버레이 DOM 확인
  console.log('\n⏳ 로딩 오버레이 DOM 확인:\n');

  const loadingHtml = await page.evaluate(() => {
    const loading = document.getElementById('partner-map-loading');
    if (loading) {
      return {
        found: true,
        innerHTML: loading.innerHTML,
        outerHTML: loading.outerHTML.substring(0, 500)
      };
    }
    return { found: false };
  });

  if (loadingHtml.found) {
    console.log('✅ #partner-map-loading 발견');
    console.log('OuterHTML:', loadingHtml.outerHTML);
  } else {
    console.log('❌ #partner-map-loading 없음');
  }

  // 로드된 스크립트 태그 확인
  console.log('\n📜 페이지 내 <script> 태그 (partner-map 관련):\n');

  const scripts = await page.evaluate(() => {
    return Array.from(document.scripts).map(s => s.src || s.innerHTML.substring(0, 100));
  });

  const partnerMapScripts = scripts.filter(s =>
    s.includes('partner-map') ||
    s.includes('config.js') ||
    s.includes('partner-manager') ||
    s.includes('kakao.maps')
  );

  if (partnerMapScripts.length > 0) {
    partnerMapScripts.forEach(s => console.log(`  - ${s}`));
  } else {
    console.log('❌ 파트너맵 관련 <script> 태그 없음');
  }

  // HTML 소스에서 파트너맵 관련 부분 추출
  console.log('\n📝 HTML 소스 중 partner-map 관련 부분:\n');

  const partnerMapSections = htmlContent.split('\n').filter(line =>
    line.includes('partner-map') ||
    line.includes('config.js') ||
    line.includes('kakao.maps')
  );

  if (partnerMapSections.length > 0) {
    partnerMapSections.slice(0, 20).forEach(line => {
      console.log(line.trim());
    });
  } else {
    console.log('❌ HTML 소스에 파트너맵 관련 코드 없음');
  }

  // 메이크샵 템플릿 정보 확인
  console.log('\n🛍️ 메이크샵 템플릿 정보:\n');

  const templateInfo = await page.evaluate(() => {
    const meta = {};
    document.querySelectorAll('meta').forEach(m => {
      if (m.name || m.property) {
        meta[m.name || m.property] = m.content;
      }
    });
    return meta;
  });

  console.log(JSON.stringify(templateInfo, null, 2));

  await browser.close();
  console.log('\n✅ 분석 완료');
}

checkHtmlSource().catch(error => {
  console.error('분석 스크립트 실행 오류:', error);
  process.exit(1);
});
