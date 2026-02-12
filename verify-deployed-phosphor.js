/**
 * Playwright 검증 스크립트 - Phosphor Icons 배포 검증
 *
 * 실행 방법:
 * node verify-deployed-phosphor.js
 *
 * 또는 Playwright로:
 * npx playwright test verify-deployed-phosphor.js
 */

const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://www.foreverlove.co.kr/preview/?dgnset_id=49399&dgnset_type=RW&user_device_type=PC';

async function verifyDeployedPage() {
    console.log('='.repeat(70));
    console.log('🧪 파트너맵 v3 - Phosphor Icons 배포 검증');
    console.log('='.repeat(70));
    console.log('');

    const browser = await chromium.launch({
        headless: false, // 브라우저 보이도록
        slowMo: 500 // 느리게 실행
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    const results = {
        timestamp: new Date().toISOString(),
        url: URL,
        tests: [],
        errors: [],
        warnings: [],
        screenshots: []
    };

    // 콘솔 에러 수집
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
            results.errors.push({ type: 'console', message: text });
            console.log('❌ [Console Error]', text);
        } else if (type === 'warning') {
            results.warnings.push({ type: 'console', message: text });
        }
    });

    // 네트워크 에러 수집
    page.on('response', response => {
        if (!response.ok() && response.url().includes('phosphor')) {
            results.errors.push({
                type: 'network',
                url: response.url(),
                status: response.status()
            });
        }
    });

    try {
        // ========================================
        // 1. 페이지 로드
        // ========================================
        console.log('\n📄 1. 페이지 로드 테스트...');

        await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
        results.tests.push({ name: '페이지 로드', status: 'PASS', time: Date.now() });
        console.log('   ✅ 페이지 로드 성공');

        // 스크린샷 1: 초기 로드
        await page.screenshot({ path: 'screenshot-1-initial-load.png', fullPage: true });
        results.screenshots.push('screenshot-1-initial-load.png');

        // ========================================
        // 2. Phosphor Icons CDN 로드 확인
        // ========================================
        console.log('\n🎨 2. Phosphor Icons CDN 로드 확인...');

        const cdnLoaded = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.some(link => link.href.includes('phosphor-icons'));
        });

        if (cdnLoaded) {
            results.tests.push({ name: 'Phosphor CDN 링크', status: 'PASS' });
            console.log('   ✅ Phosphor Icons CDN 링크 확인됨');
        } else {
            results.tests.push({ name: 'Phosphor CDN 링크', status: 'FAIL' });
            results.errors.push({ type: 'test', message: 'Phosphor Icons CDN 링크 없음' });
            console.log('   ❌ Phosphor Icons CDN 링크 없음!');
        }

        // ========================================
        // 3. 파트너맵 컨테이너 확인
        // ========================================
        console.log('\n🗺️  3. 파트너맵 컨테이너 확인...');

        const containerExists = await page.locator('#partnermap-container').isVisible();

        if (containerExists) {
            results.tests.push({ name: '파트너맵 컨테이너', status: 'PASS' });
            console.log('   ✅ 파트너맵 컨테이너 존재');
        } else {
            results.tests.push({ name: '파트너맵 컨테이너', status: 'FAIL' });
            results.errors.push({ type: 'test', message: '파트너맵 컨테이너 없음' });
            console.log('   ❌ 파트너맵 컨테이너 없음!');
            throw new Error('파트너맵 컨테이너를 찾을 수 없습니다.');
        }

        // 로딩 완료 대기 (최대 10초)
        await page.waitForSelector('#pm-loading-overlay[style*="display: none"]', { timeout: 10000 }).catch(() => {
            console.log('   ⚠️  로딩 오버레이가 사라지지 않음 (데이터 로드 실패 가능성)');
        });

        // ========================================
        // 4. Phosphor Icons 렌더링 확인
        // ========================================
        console.log('\n💎 4. Phosphor Icons 렌더링 확인...');

        await page.waitForTimeout(2000); // 2초 대기 (아이콘 로드)

        const iconStats = await page.evaluate(() => {
            const icons = document.querySelectorAll('.ph');
            const iconTypes = new Set();

            icons.forEach(icon => {
                const classes = Array.from(icon.classList);
                classes.forEach(cls => {
                    if (cls.startsWith('ph-')) {
                        iconTypes.add(cls);
                    }
                });
            });

            return {
                total: icons.length,
                types: Array.from(iconTypes),
                visible: Array.from(icons).filter(icon => {
                    const rect = icon.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }).length
            };
        });

        console.log(`   📊 Phosphor Icons 통계:`);
        console.log(`      총 개수: ${iconStats.total}개`);
        console.log(`      표시됨: ${iconStats.visible}개`);
        console.log(`      종류: ${iconStats.types.length}개`);
        console.log(`      타입: ${iconStats.types.join(', ')}`);

        if (iconStats.total > 0) {
            results.tests.push({
                name: 'Phosphor Icons 렌더링',
                status: 'PASS',
                data: iconStats
            });
            console.log('   ✅ Phosphor Icons 렌더링 성공');
        } else {
            results.tests.push({ name: 'Phosphor Icons 렌더링', status: 'FAIL' });
            results.errors.push({ type: 'test', message: 'Phosphor Icons 렌더링 안 됨' });
            console.log('   ❌ Phosphor Icons 렌더링 실패!');
        }

        // 스크린샷 2: 아이콘 렌더링
        await page.screenshot({ path: 'screenshot-2-icons-rendered.png', fullPage: true });
        results.screenshots.push('screenshot-2-icons-rendered.png');

        // ========================================
        // 5. 파트너 카드 확인
        // ========================================
        console.log('\n🏢 5. 파트너 카드 확인...');

        const cardStats = await page.evaluate(() => {
            const cards = document.querySelectorAll('.pm-partner-card');
            const cardsWithIcons = Array.from(cards).filter(card => {
                return card.querySelector('.ph');
            });

            return {
                total: cards.length,
                withIcons: cardsWithIcons.length,
                hasHeartIcon: Array.from(cards).some(card =>
                    card.querySelector('.ph-heart, .ph-heart-fill')
                ),
                hasPhoneIcon: Array.from(cards).some(card =>
                    card.querySelector('.ph-phone')
                ),
                hasMapPinIcon: Array.from(cards).some(card =>
                    card.querySelector('.ph-map-pin')
                )
            };
        });

        console.log(`   📊 파트너 카드 통계:`);
        console.log(`      총 카드: ${cardStats.total}개`);
        console.log(`      아이콘 있음: ${cardStats.withIcons}개`);
        console.log(`      하트 아이콘: ${cardStats.hasHeartIcon ? '✅' : '❌'}`);
        console.log(`      전화 아이콘: ${cardStats.hasPhoneIcon ? '✅' : '❌'}`);
        console.log(`      위치 아이콘: ${cardStats.hasMapPinIcon ? '✅' : '❌'}`);

        if (cardStats.total > 0 && cardStats.withIcons > 0) {
            results.tests.push({
                name: '파트너 카드 아이콘',
                status: 'PASS',
                data: cardStats
            });
            console.log('   ✅ 파트너 카드 아이콘 정상');
        } else {
            results.tests.push({ name: '파트너 카드 아이콘', status: 'FAIL' });
            results.errors.push({ type: 'test', message: '파트너 카드에 아이콘 없음' });
            console.log('   ❌ 파트너 카드 아이콘 없음!');
        }

        // ========================================
        // 6. 즐겨찾기 기능 테스트
        // ========================================
        console.log('\n❤️  6. 즐겨찾기 기능 테스트...');

        const favoriteBtn = page.locator('.pm-favorite-btn').first();

        if (await favoriteBtn.isVisible()) {
            // 클릭 전 상태
            const beforeClick = await favoriteBtn.evaluate(btn => ({
                hasActive: btn.classList.contains('active'),
                innerHTML: btn.innerHTML
            }));

            console.log(`   초기 상태: ${beforeClick.hasActive ? '활성' : '비활성'}`);

            // 클릭
            await favoriteBtn.click();
            await page.waitForTimeout(500);

            // 클릭 후 상태
            const afterClick = await favoriteBtn.evaluate(btn => ({
                hasActive: btn.classList.contains('active'),
                innerHTML: btn.innerHTML
            }));

            console.log(`   클릭 후: ${afterClick.hasActive ? '활성' : '비활성'}`);

            // 아이콘 변경 확인
            const iconChanged = beforeClick.innerHTML !== afterClick.innerHTML;
            const stateChanged = beforeClick.hasActive !== afterClick.hasActive;

            if (stateChanged && iconChanged) {
                results.tests.push({ name: '즐겨찾기 토글', status: 'PASS' });
                console.log('   ✅ 즐겨찾기 토글 성공 (아이콘 변경됨)');
            } else {
                results.tests.push({ name: '즐겨찾기 토글', status: 'WARN' });
                results.warnings.push({ type: 'test', message: '즐겨찾기 토글 시 아이콘 변경 안 됨' });
                console.log('   ⚠️  즐겨찾기 토글되지만 아이콘 변경 안 됨');
            }

            // 스크린샷 3: 즐겨찾기 클릭 후
            await page.screenshot({ path: 'screenshot-3-favorite-clicked.png', fullPage: true });
            results.screenshots.push('screenshot-3-favorite-clicked.png');
        } else {
            results.tests.push({ name: '즐겨찾기 버튼', status: 'FAIL' });
            console.log('   ❌ 즐겨찾기 버튼 없음');
        }

        // ========================================
        // 7. 모달 테스트
        // ========================================
        console.log('\n🔍 7. 모달 테스트...');

        const firstCard = page.locator('.pm-partner-card').first();

        if (await firstCard.isVisible()) {
            await firstCard.click();
            await page.waitForTimeout(500);

            const modalVisible = await page.locator('#pm-modal.pm-modal-active').isVisible();

            if (modalVisible) {
                console.log('   ✅ 모달 열림');

                // 모달 내 아이콘 확인
                const modalIcons = await page.evaluate(() => {
                    const modal = document.querySelector('#pm-modal.pm-modal-active');
                    if (!modal) return null;

                    const icons = modal.querySelectorAll('.ph');
                    const iconTypes = new Set();

                    icons.forEach(icon => {
                        const classes = Array.from(icon.classList);
                        classes.forEach(cls => {
                            if (cls.startsWith('ph-')) iconTypes.add(cls);
                        });
                    });

                    return {
                        total: icons.length,
                        types: Array.from(iconTypes)
                    };
                });

                console.log(`   📊 모달 아이콘: ${modalIcons.total}개`);
                console.log(`      타입: ${modalIcons.types.join(', ')}`);

                if (modalIcons.total > 0) {
                    results.tests.push({
                        name: '모달 아이콘',
                        status: 'PASS',
                        data: modalIcons
                    });
                    console.log('   ✅ 모달 아이콘 정상');
                } else {
                    results.tests.push({ name: '모달 아이콘', status: 'FAIL' });
                    console.log('   ❌ 모달에 아이콘 없음');
                }

                // 스크린샷 4: 모달 열림
                await page.screenshot({ path: 'screenshot-4-modal-open.png', fullPage: true });
                results.screenshots.push('screenshot-4-modal-open.png');

                // 모달 닫기
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);

                const modalClosed = await page.locator('#pm-modal.pm-modal-active').isVisible() === false;

                if (modalClosed) {
                    results.tests.push({ name: '모달 닫기', status: 'PASS' });
                    console.log('   ✅ 모달 닫기 성공 (ESC)');
                } else {
                    results.tests.push({ name: '모달 닫기', status: 'WARN' });
                    console.log('   ⚠️  모달 닫기 실패');
                }
            } else {
                results.tests.push({ name: '모달 열기', status: 'FAIL' });
                console.log('   ❌ 모달 열리지 않음');
            }
        }

        // ========================================
        // 8. 성능 측정
        // ========================================
        console.log('\n⚡ 8. 성능 측정...');

        const performance = await page.evaluate(() => {
            const perf = window.performance;
            const timing = perf.timing;

            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: perf.getEntriesByType('paint')[0]?.startTime || 0,
                resources: perf.getEntriesByType('resource').filter(r =>
                    r.name.includes('phosphor')
                ).map(r => ({
                    url: r.name,
                    duration: r.duration,
                    size: r.transferSize
                }))
            };
        });

        console.log(`   ⏱️  DOM 로드: ${performance.domContentLoaded}ms`);
        console.log(`   ⏱️  전체 로드: ${performance.loadComplete}ms`);
        console.log(`   ⏱️  First Paint: ${performance.firstPaint.toFixed(0)}ms`);

        if (performance.resources.length > 0) {
            performance.resources.forEach(r => {
                console.log(`   📦 Phosphor: ${r.duration.toFixed(0)}ms, ${(r.size / 1024).toFixed(1)}KB`);
            });
        }

        results.tests.push({
            name: '성능',
            status: performance.loadComplete < 3000 ? 'PASS' : 'WARN',
            data: performance
        });

        // ========================================
        // 최종 리포트
        // ========================================
        console.log('\n' + '='.repeat(70));
        console.log('📊 최종 리포트');
        console.log('='.repeat(70));

        const passed = results.tests.filter(t => t.status === 'PASS').length;
        const failed = results.tests.filter(t => t.status === 'FAIL').length;
        const warned = results.tests.filter(t => t.status === 'WARN').length;

        console.log(`\n✅ 성공: ${passed}개`);
        console.log(`❌ 실패: ${failed}개`);
        console.log(`⚠️  경고: ${warned}개`);
        console.log(`🐛 에러: ${results.errors.length}개`);
        console.log(`📸 스크린샷: ${results.screenshots.length}개`);

        if (results.errors.length > 0) {
            console.log('\n🐛 에러 목록:');
            results.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. [${err.type}] ${err.message || err.url}`);
            });
        }

        // JSON 리포트 저장
        fs.writeFileSync(
            'verification-report.json',
            JSON.stringify(results, null, 2)
        );
        console.log('\n💾 상세 리포트 저장: verification-report.json');
        console.log('💾 스크린샷 저장: screenshot-*.png');

    } catch (error) {
        console.error('\n❌ 검증 중 오류 발생:', error.message);
        results.errors.push({ type: 'fatal', message: error.message, stack: error.stack });

        // 에러 스크린샷
        await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
        results.screenshots.push('screenshot-error.png');
    } finally {
        await browser.close();
        console.log('\n✅ 검증 완료!');
        console.log('='.repeat(70));
    }

    return results;
}

// 실행
if (require.main === module) {
    verifyDeployedPage().catch(console.error);
}

module.exports = { verifyDeployedPage };
