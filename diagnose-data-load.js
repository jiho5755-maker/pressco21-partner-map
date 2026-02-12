/**
 * 파트너 데이터 로드 진단
 */

const { chromium } = require('playwright');

const URL = 'https://www.foreverlove.co.kr/shop/page.html?id=2602';

async function diagnoseDataLoad() {
    console.log('🔍 파트너 데이터 로드 진단\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 네트워크 요청 감시
    const apiRequests = [];
    page.on('request', request => {
        const url = request.url();
        if (url.includes('api') || url.includes('partner') || url.includes('.json')) {
            apiRequests.push({
                method: request.method(),
                url: url,
                status: 'pending'
            });
        }
    });

    page.on('response', response => {
        const url = response.url();
        if (url.includes('api') || url.includes('partner') || url.includes('.json')) {
            const req = apiRequests.find(r => r.url === url);
            if (req) {
                req.status = response.status();
                req.statusText = response.statusText();
            }
        }
    });

    // 콘솔 로그 수집
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    try {
        await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);

        console.log('📡 네트워크 요청:\n');
        if (apiRequests.length > 0) {
            apiRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.method} ${req.url}`);
                console.log(`   상태: ${req.status} ${req.statusText || ''}\n`);
            });
        } else {
            console.log('   ⚠️  API 요청 없음!\n');
        }

        console.log('📝 콘솔 로그:\n');
        const relevantLogs = consoleLogs.filter(log =>
            log.text.includes('[') || log.text.includes('API') || log.text.includes('파트너')
        );

        if (relevantLogs.length > 0) {
            relevantLogs.forEach((log, i) => {
                const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : '📌';
                console.log(`${icon} [${log.type}] ${log.text}`);
            });
            console.log('');
        } else {
            console.log('   (관련 로그 없음)\n');
        }

        console.log('🔎 JavaScript 전역 변수 확인:\n');
        const globals = await page.evaluate(() => {
            return {
                hasApiClient: typeof window.ApiClient !== 'undefined',
                hasMapService: typeof window.MapService !== 'undefined',
                hasFilterService: typeof window.FilterService !== 'undefined',
                hasUIService: typeof window.UIService !== 'undefined',
                hasConfig: typeof window.CONFIG !== 'undefined',
                configValue: window.CONFIG ? {
                    apiBaseUrl: window.CONFIG.apiBaseUrl,
                    spreadsheetId: window.CONFIG.spreadsheetId,
                    gid: window.CONFIG.gid
                } : null
            };
        });

        console.log(`   ApiClient: ${globals.hasApiClient ? '✅' : '❌'}`);
        console.log(`   MapService: ${globals.hasMapService ? '✅' : '❌'}`);
        console.log(`   FilterService: ${globals.hasFilterService ? '✅' : '❌'}`);
        console.log(`   UIService: ${globals.hasUIService ? '✅' : '❌'}`);
        console.log(`   CONFIG: ${globals.hasConfig ? '✅' : '❌'}\n`);

        if (globals.configValue) {
            console.log('   📋 CONFIG 값:');
            console.log(`      API URL: ${globals.configValue.apiBaseUrl}`);
            console.log(`      Spreadsheet ID: ${globals.configValue.spreadsheetId}`);
            console.log(`      GID: ${globals.configValue.gid}\n`);
        }

        console.log('🗺️  지도 상태:\n');
        const mapState = await page.evaluate(() => {
            const mapElement = document.getElementById('naverMap');
            const mapService = window.MapService;

            return {
                mapExists: !!mapElement,
                mapServiceReady: mapService && typeof mapService.map !== 'undefined',
                partners: mapService && mapService.partners ? mapService.partners.length : 0
            };
        });

        console.log(`   지도 요소: ${mapState.mapExists ? '✅' : '❌'}`);
        console.log(`   MapService 준비: ${mapState.mapServiceReady ? '✅' : '❌'}`);
        console.log(`   로드된 파트너: ${mapState.partners}개\n`);

        console.log('📊 UI 상태:\n');
        const uiState = await page.evaluate(() => {
            return {
                loadingVisible: !!document.querySelector('#pm-loading-overlay[style*="display: flex"]'),
                partnerListEmpty: document.querySelector('#pm-partner-list').innerHTML.includes('검색 결과가 없습니다'),
                resultCount: document.querySelector('#pm-result-count-text')?.textContent || ''
            };
        });

        console.log(`   로딩 오버레이: ${uiState.loadingVisible ? '표시 중' : '숨김'}`);
        console.log(`   파트너 리스트: ${uiState.partnerListEmpty ? '비어있음' : '데이터 있음'}`);
        console.log(`   결과 카운트: ${uiState.resultCount}\n`);

        // 스크린샷
        await page.screenshot({ path: 'diagnose-data-load.png', fullPage: true });
        console.log('💾 스크린샷 저장: diagnose-data-load.png\n');

    } catch (error) {
        console.error(`❌ 오류: ${error.message}\n`);
    } finally {
        await browser.close();
        console.log('✅ 진단 완료!');
    }
}

diagnoseDataLoad().catch(console.error);
