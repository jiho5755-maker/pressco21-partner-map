/**
 * 배포된 파트너맵 페이지 진단 스크립트
 * Playwright를 사용하여 실제 페이지의 상태를 확인합니다.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 진단 결과를 저장할 객체
const diagnosticReport = {
  timestamp: new Date().toISOString(),
  url: 'https://www.foreverlove.co.kr/shop/page.html?id=2602',
  consoleLogs: [],
  consoleErrors: [],
  networkRequests: [],
  domStructure: {},
  globalVariables: {},
  screenshots: [],
  loadingState: {},
  summary: {}
};

async function diagnose() {
  console.log('🔍 파트너맵 페이지 진단 시작...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 1. 콘솔 로그 수집
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };

    diagnosticReport.consoleLogs.push(logEntry);

    if (msg.type() === 'error') {
      diagnosticReport.consoleErrors.push(logEntry);
      console.log(`❌ [CONSOLE ERROR] ${msg.text()}`);
    } else {
      console.log(`📝 [CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  // JavaScript 오류 수집
  page.on('pageerror', error => {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    diagnosticReport.consoleErrors.push(errorEntry);
    console.log(`💥 [PAGE ERROR] ${error.message}`);
  });

  // 2. 네트워크 요청 수집
  page.on('request', request => {
    const url = request.url();
    const isRelevant =
      url.includes('googleapis.com') ||
      url.includes('partners-200.json') ||
      url.includes('nmap') ||
      url.includes('navermaps') ||
      url.includes('foreverlove.co.kr');

    if (isRelevant) {
      console.log(`📤 [REQUEST] ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    const isRelevant =
      url.includes('googleapis.com') ||
      url.includes('partners-200.json') ||
      url.includes('nmap') ||
      url.includes('navermaps') ||
      url.includes('foreverlove.co.kr');

    if (isRelevant) {
      const requestEntry = {
        url: url,
        status: response.status(),
        statusText: response.statusText(),
        method: response.request().method(),
        timestamp: new Date().toISOString()
      };

      diagnosticReport.networkRequests.push(requestEntry);

      const statusIcon = response.status() >= 200 && response.status() < 300 ? '✅' : '❌';
      console.log(`${statusIcon} [RESPONSE] ${response.status()} ${url}`);
    }
  });

  // 페이지 로드 시작
  const loadStartTime = Date.now();
  console.log('\n🌐 페이지 로드 시작...');

  await page.goto(diagnosticReport.url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // 5초, 10초, 15초 시점에 진단 실행
  const checkpoints = [5000, 10000, 15000];

  for (const delay of checkpoints) {
    await page.waitForTimeout(delay);
    const elapsed = (Date.now() - loadStartTime) / 1000;

    console.log(`\n⏱️  ${elapsed}초 경과 - 상태 확인 중...`);

    // 3. DOM 구조 확인
    const domCheck = await page.evaluate(() => {
      const container = document.querySelector('#partnermap-container');
      const loadingOverlay = document.querySelector('#pm-loading-overlay');
      const naverMap = document.querySelector('#naverMap');
      const markers = document.querySelectorAll('.marker, [class*="marker"]');

      return {
        containerExists: !!container,
        containerHTML: container ? container.outerHTML.substring(0, 500) : null,
        loadingOverlayExists: !!loadingOverlay,
        loadingOverlayDisplay: loadingOverlay ? window.getComputedStyle(loadingOverlay).display : null,
        naverMapExists: !!naverMap,
        naverMapHTML: naverMap ? naverMap.outerHTML.substring(0, 500) : null,
        markerCount: markers.length,
        bodyClasses: document.body.className,
        visibleElements: {
          header: !!document.querySelector('header'),
          footer: !!document.querySelector('footer'),
          mapContainer: !!document.querySelector('#naverMap')
        }
      };
    });

    diagnosticReport.domStructure[`${delay}ms`] = domCheck;

    console.log(`   📦 DOM 구조:`);
    console.log(`      - #partnermap-container: ${domCheck.containerExists ? '✅ 존재' : '❌ 없음'}`);
    console.log(`      - #pm-loading-overlay: ${domCheck.loadingOverlayExists ? '✅ 존재' : '❌ 없음'} (display: ${domCheck.loadingOverlayDisplay})`);
    console.log(`      - #naverMap: ${domCheck.naverMapExists ? '✅ 존재' : '❌ 없음'}`);
    console.log(`      - 마커 개수: ${domCheck.markerCount}개`);

    // 4. 전역 변수 확인
    const globalVars = await page.evaluate(() => {
      return {
        hasPartnerMapApp: typeof window.PartnerMapApp !== 'undefined',
        partnerMapAppKeys: window.PartnerMapApp ? Object.keys(window.PartnerMapApp) : [],
        hasCONFIG: typeof window.CONFIG !== 'undefined',
        configKeys: window.CONFIG ? Object.keys(window.CONFIG) : [],
        hasNaverMaps: typeof window.naver !== 'undefined' && typeof window.naver.maps !== 'undefined',
        naverMapsVersion: window.naver && window.naver.maps ? window.naver.maps.version : null,
        customGlobals: Object.keys(window).filter(key =>
          key.includes('partner') ||
          key.includes('Partner') ||
          key.includes('CONFIG') ||
          key.includes('map')
        )
      };
    });

    diagnosticReport.globalVariables[`${delay}ms`] = globalVars;

    console.log(`   🔧 전역 변수:`);
    console.log(`      - window.PartnerMapApp: ${globalVars.hasPartnerMapApp ? '✅ 존재' : '❌ 없음'}`);
    if (globalVars.hasPartnerMapApp) {
      console.log(`        keys: ${globalVars.partnerMapAppKeys.join(', ')}`);
    }
    console.log(`      - window.CONFIG: ${globalVars.hasCONFIG ? '✅ 존재' : '❌ 없음'}`);
    if (globalVars.hasCONFIG) {
      console.log(`        keys: ${globalVars.configKeys.join(', ')}`);
    }
    console.log(`      - window.naver.maps: ${globalVars.hasNaverMaps ? '✅ 존재' : '❌ 없음'}`);
    if (globalVars.hasNaverMaps) {
      console.log(`        version: ${globalVars.naverMapsVersion}`);
    }

    // 5. 스크린샷 캡처
    const screenshotPath = path.join(__dirname, `deployed-page-${delay}ms.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });
    diagnosticReport.screenshots.push(screenshotPath);
    console.log(`   📸 스크린샷 저장: ${screenshotPath}`);
  }

  // 6. 로딩 상태 최종 확인
  const loadEndTime = Date.now();
  const totalLoadTime = (loadEndTime - loadStartTime) / 1000;

  const finalLoadingState = await page.evaluate(() => {
    const loadingOverlay = document.querySelector('#pm-loading-overlay');
    const loadingDisplay = loadingOverlay ? window.getComputedStyle(loadingOverlay).display : null;

    return {
      isLoadingVisible: loadingDisplay === 'flex' || loadingDisplay === 'block',
      loadingDisplay: loadingDisplay,
      hasMapInstance: !!document.querySelector('#naverMap'),
      documentReadyState: document.readyState,
      performanceTiming: {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      }
    };
  });

  diagnosticReport.loadingState = {
    totalLoadTime: totalLoadTime,
    isInfiniteLoading: finalLoadingState.isLoadingVisible,
    loadingCompleted: !finalLoadingState.isLoadingVisible,
    ...finalLoadingState
  };

  console.log(`\n⏱️  최종 로딩 상태:`);
  console.log(`   - 총 소요 시간: ${totalLoadTime.toFixed(2)}초`);
  console.log(`   - 로딩 오버레이 표시: ${finalLoadingState.isLoadingVisible ? '❌ 여전히 표시됨 (무한 로딩)' : '✅ 숨겨짐 (정상)'}`);
  console.log(`   - 지도 인스턴스: ${finalLoadingState.hasMapInstance ? '✅ 존재' : '❌ 없음'}`);
  console.log(`   - Document Ready State: ${finalLoadingState.documentReadyState}`);

  // 요약 생성
  diagnosticReport.summary = {
    totalConsoleMessages: diagnosticReport.consoleLogs.length,
    totalErrors: diagnosticReport.consoleErrors.length,
    totalNetworkRequests: diagnosticReport.networkRequests.length,
    apiCallsSuccess: diagnosticReport.networkRequests.filter(r =>
      (r.url.includes('googleapis.com') || r.url.includes('partners-200.json')) &&
      r.status >= 200 && r.status < 300
    ).length,
    apiCallsFailed: diagnosticReport.networkRequests.filter(r =>
      (r.url.includes('googleapis.com') || r.url.includes('partners-200.json')) &&
      r.status >= 400
    ).length,
    hasInfiniteLoading: finalLoadingState.isLoadingVisible,
    criticalIssues: []
  };

  // 주요 이슈 탐지
  if (diagnosticReport.consoleErrors.length > 0) {
    diagnosticReport.summary.criticalIssues.push(`${diagnosticReport.consoleErrors.length}개의 JavaScript 오류 발견`);
  }
  if (finalLoadingState.isLoadingVisible) {
    diagnosticReport.summary.criticalIssues.push('무한 로딩 상태');
  }
  if (!diagnosticReport.globalVariables['15000ms']?.hasNaverMaps) {
    diagnosticReport.summary.criticalIssues.push('네이버 지도 SDK 로드 실패');
  }
  if (diagnosticReport.domStructure['15000ms']?.markerCount === 0) {
    diagnosticReport.summary.criticalIssues.push('마커가 표시되지 않음');
  }

  // 진단 리포트 저장
  const reportPath = path.join(__dirname, `diagnostic-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(diagnosticReport, null, 2), 'utf-8');
  console.log(`\n📊 진단 리포트 저장: ${reportPath}`);

  await browser.close();

  // 콘솔에 요약 출력
  console.log('\n' + '='.repeat(80));
  console.log('📋 진단 요약');
  console.log('='.repeat(80));
  console.log(`총 콘솔 메시지: ${diagnosticReport.summary.totalConsoleMessages}개`);
  console.log(`JavaScript 오류: ${diagnosticReport.summary.totalErrors}개`);
  console.log(`네트워크 요청: ${diagnosticReport.summary.totalNetworkRequests}개`);
  console.log(`API 호출 성공: ${diagnosticReport.summary.apiCallsSuccess}개`);
  console.log(`API 호출 실패: ${diagnosticReport.summary.apiCallsFailed}개`);
  console.log(`무한 로딩: ${diagnosticReport.summary.hasInfiniteLoading ? '❌ 예' : '✅ 아니오'}`);

  if (diagnosticReport.summary.criticalIssues.length > 0) {
    console.log('\n⚠️  주요 이슈:');
    diagnosticReport.summary.criticalIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  } else {
    console.log('\n✅ 주요 이슈 없음');
  }
  console.log('='.repeat(80));

  return diagnosticReport;
}

diagnose().catch(error => {
  console.error('❌ 진단 중 오류 발생:', error);
  process.exit(1);
});
