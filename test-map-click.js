/**
 * 지도 클릭으로 기준점 설정 테스트
 */

const { chromium } = require('playwright');

async function testMapClick() {
    console.log('🧪 지도 클릭 기능 테스트 시작\n');

    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    // 콘솔 로그 캡처
    page.on('console', msg => {
        console.log('[브라우저]', msg.text());
    });

    try {
        console.log('1. index.html 로드 중...');
        await page.goto('http://localhost:8000/index.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        console.log('2. 5초 대기 (지도 및 마커 로딩)...');
        await page.waitForTimeout(5000);

        console.log('3. 지도 중앙 좌표 가져오기...');
        const mapCenter = await page.evaluate(() => {
            if (window.PartnerMapApp && window.PartnerMapApp.mapService()) {
                const map = window.PartnerMapApp.mapService().map;
                if (map) {
                    const center = map.getCenter();
                    return {
                        lat: center.y || center._lat,
                        lng: center.x || center._lng
                    };
                }
            }
            return null;
        });

        console.log('   지도 중심:', mapCenter);

        console.log('4. 지도 영역 찾기...');
        const mapElement = await page.locator('#naverMap').boundingBox();
        if (!mapElement) {
            throw new Error('지도 요소를 찾을 수 없습니다');
        }

        console.log('   지도 위치:', mapElement);

        console.log('5. 지도 중앙 클릭...');
        const clickX = mapElement.x + mapElement.width / 2;
        const clickY = mapElement.y + mapElement.height / 2;

        await page.mouse.click(clickX, clickY);

        console.log('6. 2초 대기 (기준점 마커 표시)...');
        await page.waitForTimeout(2000);

        console.log('7. 기준점 설정 확인...');
        const referencePoint = await page.evaluate(() => {
            if (window.PartnerMapApp && window.PartnerMapApp.mapService()) {
                const mapService = window.PartnerMapApp.mapService();
                return {
                    hasReferencePoint: !!mapService.referencePoint,
                    hasReferenceMarker: !!mapService.referencePointMarker,
                    referencePoint: mapService.referencePoint
                };
            }
            return null;
        });

        console.log('   기준점 상태:', referencePoint);

        if (referencePoint && referencePoint.hasReferencePoint) {
            console.log('   ✅ 기준점 설정 성공!');
        } else {
            console.log('   ❌ 기준점 설정 실패');
        }

        console.log('8. 거리순 정렬 확인...');
        const sortValue = await page.evaluate(() => {
            const sortSelect = document.getElementById('pm-sort-select');
            return sortSelect ? sortSelect.value : null;
        });

        console.log('   정렬 모드:', sortValue);

        if (sortValue === 'distance') {
            console.log('   ✅ 거리순 정렬 자동 적용!');
        } else {
            console.log('   ⚠️  거리순 정렬이 적용되지 않았습니다');
        }

        console.log('9. 기준점 초기화 버튼 확인...');
        const clearBtnVisible = await page.evaluate(() => {
            const clearBtn = document.getElementById('pm-clear-reference-btn');
            return clearBtn ? clearBtn.style.display !== 'none' : false;
        });

        console.log('   초기화 버튼 표시:', clearBtnVisible ? '✅ Yes' : '❌ No');

        console.log('10. 스크린샷 촬영...');
        await page.screenshot({
            path: 'test-map-click-screenshot.png',
            fullPage: false
        });

        console.log('    ✅ 스크린샷 저장: test-map-click-screenshot.png');

        console.log('\n📋 테스트 요약:');
        console.log('  - 지도 클릭: ✅');
        console.log('  - 기준점 설정:', referencePoint?.hasReferencePoint ? '✅' : '❌');
        console.log('  - 기준점 마커:', referencePoint?.hasReferenceMarker ? '✅' : '❌');
        console.log('  - 거리순 정렬:', sortValue === 'distance' ? '✅' : '❌');
        console.log('  - 초기화 버튼:', clearBtnVisible ? '✅' : '❌');

        console.log('\n🎉 테스트 완료! 5초 후 브라우저를 닫습니다...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('\n❌ 테스트 실패:', error.message);
        await page.screenshot({ path: 'test-map-click-error.png' });
    } finally {
        await browser.close();
    }
}

testMapClick();
