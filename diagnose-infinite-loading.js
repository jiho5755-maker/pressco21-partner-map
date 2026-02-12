/**
 * 파트너맵 무한 로딩 진단 스크립트
 * - 브라우저 콘솔 로그 수집
 * - 네트워크 요청 실패 추적
 * - JavaScript 오류 캡처
 * - 로딩 오버레이 상태 확인
 */

const { chromium } = require('playwright');

async function diagnoseInfiniteLoading() {
  console.log('🔍 파트너맵 무한 로딩 진단 시작...\n');

  const browser = await chromium.launch({
    headless: false,  // 브라우저 창 표시
    slowMo: 500       // 동작 속도 늦춤
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 수집 데이터
  const consoleMessages = [];
  const errors = [];
  const failedRequests = [];
  const apiCalls = [];

  // 1. 콘솔 메시지 수집
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });

    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
  });

  // 2. JavaScript 오류 수집
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    console.error(`❌ [PAGE ERROR] ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}`);
    }
  });

  // 3. 네트워크 요청 추적
  page.on('request', request => {
    const url = request.url();

    // API 호출 및 중요 리소스만 추적
    if (url.includes('/api/') ||
        url.includes('.json') ||
        url.includes('partners') ||
        url.includes('foreverlove.co.kr')) {
      apiCalls.push({
        url,
        method: request.method(),
        timestamp: new Date().toISOString()
      });
      console.log(`📡 [REQUEST] ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    // 실패한 요청 수집 (4xx, 5xx)
    if (status >= 400) {
      const body = await response.text().catch(() => 'Cannot read body');
      failedRequests.push({
        url,
        status,
        statusText: response.statusText(),
        body: body.substring(0, 500),
        timestamp: new Date().toISOString()
      });

      console.error(`❌ [FAILED] ${status} ${url}`);
      console.error(`   Body: ${body.substring(0, 200)}`);
    } else if (url.includes('.json') || url.includes('/api/')) {
      console.log(`✅ [SUCCESS] ${status} ${url}`);
    }
  });

  // 4. 페이지 로드
  console.log('\n🌐 페이지 로드 중...');
  try {
    await page.goto('https://foreverlove.co.kr/preview/?dgnset_id=49398&dgnset_type=RW&user_device_type=PC', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
  } catch (error) {
    console.error(`❌ 페이지 로드 실패: ${error.message}`);
  }

  // 5. 초기 상태 확인
  console.log('\n⏳ 10초 대기 중 (로딩 상태 관찰)...');
  await page.waitForTimeout(10000);

  // 6. DOM 상태 진단
  console.log('\n🔍 DOM 상태 진단...');

  const domDiagnosis = await page.evaluate(() => {
    const results = {
      loadingOverlay: null,
      mapContainer: null,
      configLoaded: false,
      partnerManagerLoaded: false,
      mapInitialized: false,
      globalVariables: {}
    };

    // 로딩 오버레이 상태
    const overlay = document.getElementById('partner-map-loading');
    if (overlay) {
      results.loadingOverlay = {
        exists: true,
        display: window.getComputedStyle(overlay).display,
        opacity: window.getComputedStyle(overlay).opacity,
        innerHTML: overlay.innerHTML.substring(0, 100)
      };
    }

    // 지도 컨테이너 상태
    const container = document.getElementById('partner-map-container');
    if (container) {
      results.mapContainer = {
        exists: true,
        innerHTML: container.innerHTML.substring(0, 200),
        childElementCount: container.childElementCount
      };
    }

    // 전역 변수 확인
    results.configLoaded = typeof window.PARTNER_MAP_CONFIG !== 'undefined';
    results.partnerManagerLoaded = typeof window.PartnerManager !== 'undefined';

    if (window.PARTNER_MAP_CONFIG) {
      results.globalVariables.config = {
        useTestData: window.PARTNER_MAP_CONFIG.useTestData,
        testDataUrl: window.PARTNER_MAP_CONFIG.testDataUrl,
        apiEndpoint: window.PARTNER_MAP_CONFIG.apiEndpoint
      };
    }

    // 지도 초기화 여부
    results.mapInitialized = !!document.querySelector('#partner-map-container > div');

    return results;
  });

  console.log('\n📊 DOM 진단 결과:');
  console.log(JSON.stringify(domDiagnosis, null, 2));

  // 7. 스크립트 로드 상태 확인
  console.log('\n📜 로드된 스크립트 확인...');

  const loadedScripts = await page.evaluate(() => {
    return Array.from(document.scripts).map(script => ({
      src: script.src || 'inline',
      async: script.async,
      defer: script.defer,
      loaded: script.getAttribute('data-loaded') || 'unknown'
    })).filter(s =>
      s.src.includes('config.js') ||
      s.src.includes('partner-manager.js') ||
      s.src.includes('main.js') ||
      s.src.includes('kakao')
    );
  });

  console.log('로드된 주요 스크립트:');
  loadedScripts.forEach(s => console.log(`  - ${s.src}`));

  // 8. 카카오맵 API 상태 확인
  console.log('\n🗺️ 카카오맵 API 상태 확인...');

  const kakaoStatus = await page.evaluate(() => {
    return {
      kakaoLoaded: typeof window.kakao !== 'undefined',
      kakaoMapsLoaded: typeof window.kakao?.maps !== 'undefined',
      appkey: window.kakao?.maps ? 'API 로드됨' : 'API 미로드'
    };
  });

  console.log(JSON.stringify(kakaoStatus, null, 2));

  // 9. 최종 보고서 생성
  console.log('\n' + '='.repeat(80));
  console.log('📋 진단 요약 보고서');
  console.log('='.repeat(80));

  console.log(`\n1️⃣ 콘솔 메시지: ${consoleMessages.length}개`);
  if (consoleMessages.length > 0) {
    consoleMessages.slice(0, 10).forEach(m => {
      console.log(`   [${m.type}] ${m.text}`);
    });
  }

  console.log(`\n2️⃣ JavaScript 오류: ${errors.length}개`);
  errors.forEach(e => {
    console.log(`   ❌ ${e.message}`);
    if (e.stack) {
      console.log(`      ${e.stack.split('\n')[0]}`);
    }
  });

  console.log(`\n3️⃣ 실패한 네트워크 요청: ${failedRequests.length}개`);
  failedRequests.forEach(r => {
    console.log(`   ❌ ${r.status} ${r.url}`);
  });

  console.log(`\n4️⃣ API 호출: ${apiCalls.length}개`);
  apiCalls.forEach(a => {
    console.log(`   📡 ${a.method} ${a.url}`);
  });

  console.log('\n5️⃣ 로딩 오버레이 상태:');
  if (domDiagnosis.loadingOverlay) {
    console.log(`   Display: ${domDiagnosis.loadingOverlay.display}`);
    console.log(`   Opacity: ${domDiagnosis.loadingOverlay.opacity}`);
  } else {
    console.log('   ❌ 로딩 오버레이를 찾을 수 없음');
  }

  console.log('\n6️⃣ 전역 변수 상태:');
  console.log(`   Config 로드: ${domDiagnosis.configLoaded ? '✅' : '❌'}`);
  console.log(`   PartnerManager 로드: ${domDiagnosis.partnerManagerLoaded ? '✅' : '❌'}`);
  console.log(`   지도 초기화: ${domDiagnosis.mapInitialized ? '✅' : '❌'}`);
  console.log(`   카카오맵 API: ${kakaoStatus.kakaoMapsLoaded ? '✅' : '❌'}`);

  if (domDiagnosis.globalVariables.config) {
    console.log('\n7️⃣ Config 설정:');
    console.log(`   useTestData: ${domDiagnosis.globalVariables.config.useTestData}`);
    console.log(`   testDataUrl: ${domDiagnosis.globalVariables.config.testDataUrl}`);
    console.log(`   apiEndpoint: ${domDiagnosis.globalVariables.config.apiEndpoint}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 핵심 문제 추정:');
  console.log('='.repeat(80));

  // 문제 진단
  if (errors.length > 0) {
    console.log('❌ JavaScript 오류가 발생했습니다 - 스크립트 실행 실패');
  }
  if (failedRequests.length > 0) {
    console.log('❌ 네트워크 요청 실패 - 리소스 로드 불가');
  }
  if (!domDiagnosis.configLoaded) {
    console.log('❌ config.js 로드 실패 - 설정 파일을 찾을 수 없음');
  }
  if (!domDiagnosis.partnerManagerLoaded) {
    console.log('❌ partner-manager.js 로드 실패 - 핵심 모듈 누락');
  }
  if (!kakaoStatus.kakaoMapsLoaded) {
    console.log('❌ 카카오맵 API 로드 실패 - 지도 초기화 불가');
  }
  if (domDiagnosis.loadingOverlay && domDiagnosis.loadingOverlay.display !== 'none') {
    console.log('❌ 로딩 오버레이가 숨겨지지 않음 - hideLoading() 미호출');
  }

  console.log('\n⏸️ 브라우저를 30초간 열어둡니다. 수동 확인 후 종료하세요...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('\n✅ 진단 완료');
}

diagnoseInfiniteLoading().catch(error => {
  console.error('진단 스크립트 실행 오류:', error);
  process.exit(1);
});
