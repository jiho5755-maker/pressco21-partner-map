/**
 * 빠른 스크린샷만 촬영
 */

const { chromium } = require('playwright');

async function captureScreenshot() {
    console.log('📸 스크린샷 촬영 시작...\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    try {
        console.log('1. index.html 로드 중...');
        await page.goto('http://localhost:8000/index.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        console.log('2. 5초 대기 (지도 및 마커 로딩)...');
        await page.waitForTimeout(5000);

        console.log('3. 스크린샷 촬영...');
        await page.screenshot({
            path: 'index-map-screenshot.png',
            fullPage: false  // viewport만 촬영
        });

        console.log('✅ 스크린샷 저장: index-map-screenshot.png\n');

        // 브라우저 데이터 확인
        const stats = await page.evaluate(() => {
            return {
                hasMap: !!document.getElementById('pm-map-container'),
                cardCount: document.querySelectorAll('.pm-partner-card').length,
                loadingVisible: document.getElementById('pm-loading-overlay')
                    ? window.getComputedStyle(document.getElementById('pm-loading-overlay')).display !== 'none'
                    : false
            };
        });

        console.log('📊 페이지 상태:');
        console.log('  - 지도 컨테이너: ' + (stats.hasMap ? '✅' : '❌'));
        console.log('  - 파트너 카드: ' + stats.cardCount + '개');
        console.log('  - 로딩 표시: ' + (stats.loadingVisible ? '⏳ Yes' : '✅ No'));

    } catch (error) {
        console.error('❌ 오류:', error.message);
    } finally {
        await browser.close();
        console.log('\n🏁 완료');
    }
}

captureScreenshot();
