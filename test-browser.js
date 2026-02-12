/**
 * Playwright를 사용한 브라우저 자동 테스트
 * 문제 진단 및 스크린샷 캡처
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPartnerMap() {
    console.log('🚀 Playwright 브라우저 테스트 시작\n');

    const browser = await chromium.launch({
        headless: false,  // 브라우저 UI 표시
        slowMo: 500  // 디버깅을 위해 느리게 실행
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 콘솔 로그 캡처
    const consoleLogs = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleLogs.push({ type, text });
        console.log(`[브라우저 ${type}]`, text);
    });

    // 네트워크 요청 캡처
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method()
        });
    });

    page.on('response', async response => {
        const url = response.url();
        const status = response.status();

        if (status >= 400) {
            console.log(`❌ [네트워크 오류] ${status} - ${url}`);
        }
    });

    // JavaScript 오류 캡처
    const jsErrors = [];
    page.on('pageerror', error => {
        jsErrors.push(error.message);
        console.log('❌ [JavaScript 오류]', error.message);
    });

    try {
        console.log('1️⃣ test-simple.html 페이지 로드 중...\n');
        await page.goto('http://localhost:8000/test-simple.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ 페이지 로드 완료\n');

        // 페이지 제목 확인
        const title = await page.title();
        console.log('📄 페이지 제목:', title);

        // 스크린샷 저장
        await page.screenshot({
            path: 'test-simple-screenshot.png',
            fullPage: true
        });
        console.log('📸 스크린샷 저장: test-simple-screenshot.png\n');

        // 2초 대기 (데이터 로드 시간)
        console.log('⏳ 데이터 로드 대기 중 (3초)...\n');
        await page.waitForTimeout(3000);

        // 페이지 내용 확인
        const bodyText = await page.textContent('body');
        console.log('📊 페이지 내용 미리보기:');
        console.log(bodyText.substring(0, 500) + '...\n');

        // 특정 요소 확인
        const hasOutput = await page.locator('#output').count();
        console.log('✅ #output 요소 존재:', hasOutput > 0);

        // 로그 요소 개수 확인
        const logCount = await page.locator('.log').count();
        console.log('✅ .log 요소 개수:', logCount);

        // 에러 로그 확인
        const errorLogCount = await page.locator('.log.error').count();
        console.log('⚠️  에러 로그 개수:', errorLogCount);

        if (errorLogCount > 0) {
            console.log('\n❌ 에러 로그 내용:');
            const errorLogs = await page.locator('.log.error').allTextContents();
            errorLogs.forEach((log, i) => {
                console.log(`  ${i + 1}. ${log}`);
            });
        }

        console.log('\n2️⃣ index.html 페이지 테스트...\n');

        await page.goto('http://localhost:8000/index.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ index.html 로드 완료\n');

        // 스크린샷 저장
        await page.screenshot({
            path: 'index-screenshot.png',
            fullPage: true
        });
        console.log('📸 스크린샷 저장: index-screenshot.png\n');

        // 5초 대기 (지도 로드 시간)
        console.log('⏳ 지도 로드 대기 중 (5초)...\n');
        await page.waitForTimeout(5000);

        // 지도 컨테이너 확인
        const hasMap = await page.locator('#pm-map-container').count();
        console.log('✅ 지도 컨테이너 존재:', hasMap > 0);

        // 로딩 오버레이 확인
        const loadingVisible = await page.locator('#pm-loading-overlay').isVisible();
        console.log('⏳ 로딩 오버레이 표시:', loadingVisible);

        // 파트너 카드 개수 확인
        const cardCount = await page.locator('.pm-partner-card').count();
        console.log('✅ 파트너 카드 개수:', cardCount);

        // 최종 스크린샷
        await page.screenshot({
            path: 'index-final-screenshot.png',
            fullPage: true
        });
        console.log('📸 최종 스크린샷 저장: index-final-screenshot.png\n');

        // 브라우저 콘솔에서 데이터 확인
        console.log('3️⃣ 브라우저 JavaScript 실행...\n');

        const appData = await page.evaluate(() => {
            const result = {
                hasPartnerMapApp: typeof window.PartnerMapApp !== 'undefined',
                hasConfig: typeof window.CONFIG !== 'undefined',
                hasPartnerAPI: typeof window.PartnerAPI !== 'undefined',
                configTestMode: window.CONFIG ? window.CONFIG.useTestData : null,
                mapService: null,
                filterService: null
            };

            if (window.PartnerMapApp) {
                try {
                    const mapSvc = window.PartnerMapApp.mapService();
                    const filterSvc = window.PartnerMapApp.filterService();

                    if (mapSvc) {
                        result.mapService = {
                            hasMap: !!mapSvc.map,
                            markerCount: mapSvc.markers ? mapSvc.markers.length : 0
                        };
                    }

                    if (filterSvc) {
                        result.filterService = {
                            allPartnersCount: filterSvc.allPartners ? filterSvc.allPartners.length : 0,
                            filteredPartnersCount: filterSvc.filteredPartners ? filterSvc.filteredPartners.length : 0
                        };
                    }
                } catch (e) {
                    result.error = e.message;
                }
            }

            return result;
        });

        console.log('📊 애플리케이션 상태:');
        console.log(JSON.stringify(appData, null, 2));

        // 요약
        console.log('\n📋 테스트 요약:');
        console.log('  - 콘솔 로그 개수:', consoleLogs.length);
        console.log('  - JavaScript 오류:', jsErrors.length);
        console.log('  - 네트워크 요청:', networkRequests.length);

        if (jsErrors.length > 0) {
            console.log('\n❌ JavaScript 오류 목록:');
            jsErrors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error}`);
            });
        }

        // 진단 결과 저장
        const diagnostics = {
            timestamp: new Date().toISOString(),
            consoleLogs,
            jsErrors,
            networkRequests: networkRequests.slice(0, 20),  // 처음 20개만
            appData
        };

        fs.writeFileSync(
            'diagnostics.json',
            JSON.stringify(diagnostics, null, 2)
        );

        console.log('\n💾 진단 결과 저장: diagnostics.json');

    } catch (error) {
        console.error('\n❌ 테스트 실패:', error.message);

        // 오류 발생 시에도 스크린샷 저장
        await page.screenshot({
            path: 'error-screenshot.png',
            fullPage: true
        });
        console.log('📸 오류 스크린샷 저장: error-screenshot.png');
    } finally {
        console.log('\n🏁 테스트 완료. 브라우저를 5초 후 닫습니다...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

// 실행
testPartnerMap().catch(console.error);
