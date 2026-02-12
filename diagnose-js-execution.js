/**
 * JavaScript 실행 상태 상세 진단
 * 왜 PartnerMapApp이 초기화되지 않는지 확인
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function diagnoseJSExecution() {
  console.log('🔬 JavaScript 실행 상태 상세 진단 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 모든 콘솔 메시지 캡처
  const allLogs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      args: msg.args().length,
      timestamp: new Date().toISOString()
    };
    allLogs.push(logEntry);
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // 에러 캡처
  const allErrors = [];
  page.on('pageerror', error => {
    allErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log(`[ERROR] ${error.message}`);
  });

  console.log('페이지 로드 중...');
  await page.goto('https://www.foreverlove.co.kr/shop/page.html?id=2602', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 10초 대기
  await page.waitForTimeout(10000);

  console.log('\n=== 상세 진단 시작 ===\n');

  // 1. 스크립트 로드 확인
  console.log('1️⃣  스크립트 로드 상태 확인:');
  const scriptStatus = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map(script => ({
      src: script.src,
      loaded: !script.error,
      async: script.async,
      defer: script.defer
    })).filter(s =>
      s.src.includes('page.2602.js') ||
      s.src.includes('naver') ||
      s.src.includes('map')
    );
  });
  console.log(JSON.stringify(scriptStatus, null, 2));

  // 2. CONFIG 상세 확인
  console.log('\n2️⃣  CONFIG 객체 상세:');
  const configDetails = await page.evaluate(() => {
    if (typeof window.CONFIG === 'undefined') return { exists: false };
    return {
      exists: true,
      useTestData: window.CONFIG.useTestData,
      testDataPath: window.CONFIG.testDataPath,
      googleSheetApiUrl: window.CONFIG.googleSheetApiUrl,
      naverMapNcpKeyId: window.CONFIG.naverMapNcpKeyId ? '설정됨' : '없음'
    };
  });
  console.log(JSON.stringify(configDetails, null, 2));

  // 3. 전역 객체 존재 여부
  console.log('\n3️⃣  전역 객체 존재 여부:');
  const globalObjects = await page.evaluate(() => {
    return {
      CONFIG: typeof window.CONFIG,
      PARTNERMAP_CONFIG: typeof window.PARTNERMAP_CONFIG,
      PartnerAPI: typeof window.PartnerAPI,
      PartnerMapApp: typeof window.PartnerMapApp,
      naver: typeof window.naver,
      naverMaps: typeof window.naver !== 'undefined' ? typeof window.naver.maps : 'naver 없음',
      jQuery: typeof window.jQuery || typeof window.$
    };
  });
  console.log(JSON.stringify(globalObjects, null, 2));

  // 4. 메인 스크립트가 실행되었는지 확인
  console.log('\n4️⃣  메인 스크립트 실행 흔적 확인:');
  const executionTrace = await page.evaluate(() => {
    // page.2602.js가 실행되면서 남겼을 흔적들
    return {
      hasIIFE: document.querySelector('script[src*="page.2602.js"]') !== null,
      windowKeys: Object.keys(window).filter(key =>
        key.toLowerCase().includes('partner') ||
        key.toLowerCase().includes('map') ||
        key === 'CONFIG'
      ),
      documentReady: document.readyState,
      DOMContentLoaded: 'DOMContentLoaded 완료됨'
    };
  });
  console.log(JSON.stringify(executionTrace, null, 2));

  // 5. 네트워크 요청 상태 확인 (데이터 로드 시도 여부)
  console.log('\n5️⃣  데이터 로드 시도 여부:');
  const networkLog = await page.evaluate(() => {
    // Performance API로 네트워크 요청 확인
    const resources = performance.getEntriesByType('resource');
    return resources
      .filter(r =>
        r.name.includes('googleapis.com') ||
        r.name.includes('partners-200.json') ||
        r.name.includes('test-data')
      )
      .map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: r.transferSize
      }));
  });
  console.log(JSON.stringify(networkLog, null, 2));
  if (networkLog.length === 0) {
    console.log('⚠️  데이터 로드 시도가 전혀 없음!');
  }

  // 6. 직접 PartnerMapApp 초기화 시도
  console.log('\n6️⃣  수동 초기화 시도:');
  const manualInit = await page.evaluate(() => {
    try {
      // page.2602.js의 IIFE가 실행되었다면 window.PartnerMapApp이 있어야 함
      if (typeof window.PartnerMapApp !== 'undefined') {
        return { status: 'PartnerMapApp 존재', app: Object.keys(window.PartnerMapApp) };
      }

      // IIFE가 실행되지 않았을 수도 있으므로 코드 확인
      const script = document.querySelector('script[src*="page.2602.js"]');
      if (!script) {
        return { status: 'page.2602.js 스크립트 태그 없음' };
      }

      return {
        status: 'PartnerMapApp 없음',
        scriptSrc: script.src,
        scriptLoaded: !script.error
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });
  console.log(JSON.stringify(manualInit, null, 2));

  // 7. 실제 page.2602.js 내용 확인
  console.log('\n7️⃣  page.2602.js 응답 확인:');
  const scriptContent = await page.evaluate(async () => {
    try {
      const scriptUrl = 'https://www.foreverlove.co.kr/shopimages/jewoo/template/work/49398/page.2602.js?t=202602111444';
      const response = await fetch(scriptUrl);
      const text = await response.text();
      return {
        status: response.status,
        contentLength: text.length,
        hasIIFE: text.includes('(function()'),
        hasPartnerMapApp: text.includes('PartnerMapApp'),
        hasInit: text.includes('init'),
        firstLines: text.substring(0, 500),
        hasSyntaxError: false
      };
    } catch (error) {
      return { error: error.message };
    }
  });
  console.log(JSON.stringify(scriptContent, null, 2));

  // 8. localStorage 및 캐시 확인
  console.log('\n8️⃣  localStorage 및 캐시:');
  const storageStatus = await page.evaluate(() => {
    const cacheKey = 'partnermap_data_v3.0';
    const cached = localStorage.getItem(cacheKey);
    return {
      hasCachedData: !!cached,
      cacheSize: cached ? cached.length : 0,
      allKeys: Object.keys(localStorage).filter(key => key.includes('partner'))
    };
  });
  console.log(JSON.stringify(storageStatus, null, 2));

  // 결과 저장
  const report = {
    timestamp: new Date().toISOString(),
    allLogs,
    allErrors,
    scriptStatus,
    configDetails,
    globalObjects,
    executionTrace,
    networkLog,
    manualInit,
    scriptContent,
    storageStatus,
    diagnosis: {}
  };

  // 진단 결과
  report.diagnosis = {
    scriptLoaded: scriptStatus.length > 0,
    configExists: configDetails.exists,
    partnerMapAppExists: globalObjects.PartnerMapApp !== 'undefined',
    naverMapsLoaded: globalObjects.naverMaps !== 'naver 없음' && globalObjects.naverMaps !== 'undefined',
    dataLoadAttempted: networkLog.length > 0,
    possibleCauses: []
  };

  if (!report.diagnosis.scriptLoaded) {
    report.diagnosis.possibleCauses.push('page.2602.js 스크립트가 로드되지 않음');
  }
  if (!report.diagnosis.partnerMapAppExists) {
    report.diagnosis.possibleCauses.push('PartnerMapApp IIFE가 실행되지 않음 (구문 오류 가능성)');
  }
  if (!report.diagnosis.naverMapsLoaded) {
    report.diagnosis.possibleCauses.push('네이버 지도 SDK가 로드되지 않음');
  }
  if (!report.diagnosis.dataLoadAttempted) {
    report.diagnosis.possibleCauses.push('데이터 로드 시도가 전혀 없음 (초기화 실패)');
  }

  const reportPath = `/Users/jangjiho/workspace/partner-map/js-execution-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📊 상세 리포트 저장: ${reportPath}`);

  console.log('\n=== 진단 결과 ===');
  console.log('가능한 원인:');
  report.diagnosis.possibleCauses.forEach((cause, idx) => {
    console.log(`  ${idx + 1}. ${cause}`);
  });

  await browser.close();
  return report;
}

diagnoseJSExecution().catch(error => {
  console.error('진단 실패:', error);
  process.exit(1);
});
