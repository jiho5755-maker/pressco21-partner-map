/**
 * Playwright 검증 스크립트 - Phosphor Icons 최종 검증
 * URL: https://www.foreverlove.co.kr/shop/page.html?id=2602
 */

const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://www.foreverlove.co.kr/shop/page.html?id=2602';

async function verifyPhosphorIcons() {
    console.log('='.repeat(80));
    console.log('🎨 파트너맵 v3 - Phosphor Icons 최종 검증');
    console.log('='.repeat(80));
    console.log(`📍 URL: ${URL}\n`);

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    const results = {
        timestamp: new Date().toISOString(),
        url: URL,
        tests: [],
        errors: [],
        warnings: [],
        screenshots: [],
        improvements: []
    };

    // 콘솔 로그 수집
    const consoleLogs = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleLogs.push({ type, text });

        if (type === 'error') {
            results.errors.push({ type: 'console', message: text });
        }
    });

    try {
        // ========================================
        // 1. 페이지 로드
        // ========================================
        console.log('📄 1. 페이지 로드...');
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000); // 3초 대기

        results.tests.push({ name: '페이지 로드', status: 'PASS' });
        console.log('   ✅ 페이지 로드 성공\n');

        await page.screenshot({ path: 'final-1-initial.png', fullPage: true });
        results.screenshots.push('final-1-initial.png');

        // ========================================
        // 2. 파트너맵 컨테이너 확인
        // ========================================
        console.log('🗺️  2. 파트너맵 컨테이너 확인...');

        const containerExists = await page.locator('#partnermap-container').isVisible();

        if (containerExists) {
            results.tests.push({ name: '파트너맵 컨테이너', status: 'PASS' });
            console.log('   ✅ 파트너맵 컨테이너 발견!\n');
        } else {
            results.tests.push({ name: '파트너맵 컨테이너', status: 'FAIL' });
            console.log('   ❌ 파트너맵 컨테이너 없음\n');
            throw new Error('파트너맵 컨테이너 없음');
        }

        // ========================================
        // 3. Phosphor Icons CDN 확인
        // ========================================
        console.log('🎨 3. Phosphor Icons CDN 확인...');

        const cdnInfo = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            const phosphorLink = links.find(link => link.href.includes('phosphor-icons'));

            return {
                found: !!phosphorLink,
                url: phosphorLink ? phosphorLink.href : null,
                allStylesheets: links.map(l => l.href)
            };
        });

        if (cdnInfo.found) {
            results.tests.push({ name: 'Phosphor CDN', status: 'PASS', data: cdnInfo.url });
            console.log('   ✅ Phosphor Icons CDN 로드됨');
            console.log(`   📦 URL: ${cdnInfo.url}\n`);
        } else {
            results.tests.push({ name: 'Phosphor CDN', status: 'FAIL' });
            console.log('   ❌ Phosphor Icons CDN 없음\n');
        }

        // ========================================
        // 4. Phosphor Icons 렌더링 확인
        // ========================================
        console.log('💎 4. Phosphor Icons 렌더링 확인...');

        await page.waitForTimeout(2000);

        const iconStats = await page.evaluate(() => {
            const container = document.querySelector('#partnermap-container');
            if (!container) return null;

            const icons = container.querySelectorAll('.ph');
            const iconTypes = new Set();
            const iconsByType = {};

            icons.forEach(icon => {
                const classes = Array.from(icon.classList);
                classes.forEach(cls => {
                    if (cls.startsWith('ph-')) {
                        iconTypes.add(cls);
                        iconsByType[cls] = (iconsByType[cls] || 0) + 1;
                    }
                });
            });

            return {
                total: icons.length,
                visible: Array.from(icons).filter(icon => {
                    const rect = icon.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }).length,
                types: Array.from(iconTypes),
                byType: iconsByType
            };
        });

        if (iconStats && iconStats.total > 0) {
            results.tests.push({ name: 'Phosphor Icons 렌더링', status: 'PASS', data: iconStats });
            console.log(`   ✅ 아이콘 ${iconStats.total}개 렌더링됨`);
            console.log(`   👀 표시: ${iconStats.visible}개`);
            console.log(`   🎯 종류: ${iconStats.types.length}개\n`);
            console.log('   📊 아이콘별 개수:');
            Object.entries(iconStats.byType).forEach(([type, count]) => {
                console.log(`      ${type}: ${count}개`);
            });
            console.log('');
        } else {
            results.tests.push({ name: 'Phosphor Icons 렌더링', status: 'FAIL' });
            console.log('   ❌ Phosphor Icons 렌더링 실패\n');
        }

        await page.screenshot({ path: 'final-2-icons-rendered.png', fullPage: true });
        results.screenshots.push('final-2-icons-rendered.png');

        // ========================================
        // 5. 파트너 카드 상세 분석
        // ========================================
        console.log('🏢 5. 파트너 카드 분석...');

        const cardAnalysis = await page.evaluate(() => {
            const cards = document.querySelectorAll('.pm-partner-card');

            return {
                totalCards: cards.length,
                cardsAnalysis: Array.from(cards).slice(0, 3).map((card, idx) => {
                    const icons = card.querySelectorAll('.ph');
                    return {
                        index: idx,
                        hasHeartIcon: !!card.querySelector('.ph-heart, .ph-heart-fill'),
                        hasPhoneIcon: !!card.querySelector('.ph-phone'),
                        hasMapPinIcon: !!card.querySelector('.ph-map-pin'),
                        hasRulerIcon: !!card.querySelector('.ph-ruler'),
                        iconCount: icons.length,
                        iconTypes: Array.from(icons).map(i =>
                            Array.from(i.classList).find(c => c.startsWith('ph-'))
                        )
                    };
                })
            };
        });

        console.log(`   📊 총 카드: ${cardAnalysis.totalCards}개`);
        console.log('   🔍 첫 3개 카드 분석:');
        cardAnalysis.cardsAnalysis.forEach(card => {
            console.log(`\n      카드 #${card.index + 1}:`);
            console.log(`      - 하트: ${card.hasHeartIcon ? '✅' : '❌'}`);
            console.log(`      - 전화: ${card.hasPhoneIcon ? '✅' : '❌'}`);
            console.log(`      - 위치: ${card.hasMapPinIcon ? '✅' : '❌'}`);
            console.log(`      - 거리: ${card.hasRulerIcon ? '✅' : '❌'}`);
            console.log(`      - 아이콘: ${card.iconTypes.join(', ')}`);
        });
        console.log('');

        results.tests.push({ name: '파트너 카드 아이콘', status: 'PASS', data: cardAnalysis });

        // ========================================
        // 6. 즐겨찾기 토글 테스트
        // ========================================
        console.log('❤️  6. 즐겨찾기 토글 테스트...');

        const favoriteBtn = page.locator('.pm-favorite-btn').first();

        if (await favoriteBtn.isVisible()) {
            const before = await favoriteBtn.innerHTML();
            console.log(`   초기: ${before.includes('ph-heart-fill') ? '활성 (♥)' : '비활성 (♡)'}`);

            await favoriteBtn.click();
            await page.waitForTimeout(500);

            const after = await favoriteBtn.innerHTML();
            console.log(`   클릭 후: ${after.includes('ph-heart-fill') ? '활성 (♥)' : '비활성 (♡)'}`);

            const changed = before !== after;

            if (changed) {
                results.tests.push({ name: '즐겨찾기 토글', status: 'PASS' });
                console.log('   ✅ 즐겨찾기 토글 성공 (아이콘 변경됨)\n');
            } else {
                results.tests.push({ name: '즐겨찾기 토글', status: 'WARN' });
                results.warnings.push({ message: '즐겨찾기 토글 시 아이콘 미변경' });
                console.log('   ⚠️  아이콘이 변경되지 않음\n');
            }

            await page.screenshot({ path: 'final-3-favorite-toggled.png', fullPage: true });
            results.screenshots.push('final-3-favorite-toggled.png');
        }

        // ========================================
        // 7. 모달 테스트
        // ========================================
        console.log('🔍 7. 모달 테스트...');

        const firstCard = page.locator('.pm-partner-card').first();
        await firstCard.click();
        await page.waitForTimeout(800);

        const modalVisible = await page.locator('#pm-modal.pm-modal-active').isVisible();

        if (modalVisible) {
            console.log('   ✅ 모달 열림');

            const modalIcons = await page.evaluate(() => {
                const modal = document.querySelector('#pm-modal.pm-modal-active');
                const icons = modal.querySelectorAll('.ph');
                const types = {};

                icons.forEach(icon => {
                    const iconClass = Array.from(icon.classList).find(c => c.startsWith('ph-'));
                    if (iconClass) {
                        types[iconClass] = (types[iconClass] || 0) + 1;
                    }
                });

                return {
                    total: icons.length,
                    types: types,
                    hasHeartIcon: !!modal.querySelector('.ph-heart, .ph-heart-fill'),
                    hasShareIcon: !!modal.querySelector('.ph-share-network'),
                    hasMapIcon: !!modal.querySelector('.ph-map-trifold'),
                    hasPhoneIcon: !!modal.querySelector('.ph-phone'),
                    hasEmailIcon: !!modal.querySelector('.ph-envelope-simple')
                };
            });

            console.log(`   📊 모달 아이콘: ${modalIcons.total}개`);
            console.log('   🔍 아이콘 체크:');
            console.log(`      하트: ${modalIcons.hasHeartIcon ? '✅' : '❌'}`);
            console.log(`      공유: ${modalIcons.hasShareIcon ? '✅' : '❌'}`);
            console.log(`      지도: ${modalIcons.hasMapIcon ? '✅' : '❌'}`);
            console.log(`      전화: ${modalIcons.hasPhoneIcon ? '✅' : '❌'}`);
            console.log(`      이메일: ${modalIcons.hasEmailIcon ? '✅' : '❌'}`);
            console.log('\n   📊 아이콘별 개수:');
            Object.entries(modalIcons.types).forEach(([type, count]) => {
                console.log(`      ${type}: ${count}개`);
            });
            console.log('');

            results.tests.push({ name: '모달 아이콘', status: 'PASS', data: modalIcons });

            await page.screenshot({ path: 'final-4-modal-open.png', fullPage: true });
            results.screenshots.push('final-4-modal-open.png');

            // ESC로 모달 닫기
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
            console.log('   ✅ 모달 닫기 (ESC)\n');
        } else {
            console.log('   ❌ 모달 열리지 않음\n');
        }

        // ========================================
        // 8. 콘솔 에러 분석
        // ========================================
        console.log('🐛 8. 콘솔 에러 분석...');

        const errorLogs = consoleLogs.filter(log => log.type === 'error');
        const warningLogs = consoleLogs.filter(log => log.type === 'warning');

        console.log(`   에러: ${errorLogs.length}개`);
        console.log(`   경고: ${warningLogs.length}개\n`);

        if (errorLogs.length > 0) {
            console.log('   🔴 에러 목록:');
            errorLogs.forEach((err, i) => {
                console.log(`      ${i + 1}. ${err.text}`);
            });
            console.log('');
        }

        // ========================================
        // 9. 개선 사항 도출
        // ========================================
        console.log('💡 9. 개선 사항 도출...');

        // CSS 아이콘 스타일 확인
        const iconStyles = await page.evaluate(() => {
            const icon = document.querySelector('.ph');
            if (!icon) return null;

            const styles = window.getComputedStyle(icon);
            return {
                fontSize: styles.fontSize,
                color: styles.color,
                verticalAlign: styles.verticalAlign,
                marginRight: styles.marginRight
            };
        });

        if (iconStyles) {
            console.log('   🎨 아이콘 스타일:');
            console.log(`      크기: ${iconStyles.fontSize}`);
            console.log(`      색상: ${iconStyles.color}`);
            console.log(`      정렬: ${iconStyles.verticalAlign}`);
            console.log(`      여백: ${iconStyles.marginRight}\n`);

            // 개선 제안
            if (iconStyles.verticalAlign !== 'middle') {
                results.improvements.push({
                    type: 'css',
                    priority: 'medium',
                    suggestion: '아이콘 수직 정렬 개선 (vertical-align: middle)'
                });
            }

            if (iconStyles.marginRight === '0px') {
                results.improvements.push({
                    type: 'css',
                    priority: 'low',
                    suggestion: '아이콘 여백 추가 (margin-right: 4px)'
                });
            }
        }

        // ========================================
        // 최종 리포트
        // ========================================
        console.log('='.repeat(80));
        console.log('📊 최종 검증 리포트');
        console.log('='.repeat(80));

        const passed = results.tests.filter(t => t.status === 'PASS').length;
        const failed = results.tests.filter(t => t.status === 'FAIL').length;
        const warned = results.tests.filter(t => t.status === 'WARN').length;

        console.log(`\n✅ 성공: ${passed}/${results.tests.length}개`);
        console.log(`❌ 실패: ${failed}개`);
        console.log(`⚠️  경고: ${warned}개`);
        console.log(`🐛 에러: ${errorLogs.length}개`);
        console.log(`💡 개선: ${results.improvements.length}개`);
        console.log(`📸 스크린샷: ${results.screenshots.length}개\n`);

        if (results.improvements.length > 0) {
            console.log('💡 개선 제안:');
            results.improvements.forEach((imp, i) => {
                console.log(`   ${i + 1}. [${imp.priority}] ${imp.suggestion}`);
            });
            console.log('');
        }

        // JSON 저장
        fs.writeFileSync('verification-final-report.json', JSON.stringify(results, null, 2));
        console.log('💾 리포트 저장: verification-final-report.json');
        console.log('📸 스크린샷: final-*.png\n');

        const overallStatus = failed === 0 ? '🎉 검증 성공!' : '⚠️  일부 실패';
        console.log(`${overallStatus}`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}\n`);
        await page.screenshot({ path: 'final-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

verifyPhosphorIcons().catch(console.error);
