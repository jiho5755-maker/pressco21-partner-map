/**
 * 파트너맵 위치 찾기 스크립트
 */

const { chromium } = require('playwright');

const URL = 'https://www.foreverlove.co.kr/preview/?dgnset_id=49399&dgnset_type=RW&user_device_type=PC';

async function findPartnerMap() {
    console.log('🔍 파트너맵 위치 찾기...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('✅ 페이지 로드 완료\n');

    // 1. 파트너맵 컨테이너 검색
    const containers = await page.evaluate(() => {
        const possible = [
            '#partnermap-container',
            '[id*="partner"]',
            '[class*="partner"]',
            '[id*="map"]',
            '[class*="map"]'
        ];

        const found = [];

        possible.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => {
                    found.push({
                        selector,
                        id: el.id || '(no id)',
                        className: el.className || '(no class)',
                        innerHTML: el.innerHTML.substring(0, 100)
                    });
                });
            }
        });

        return found;
    });

    console.log('📦 파트너맵 관련 요소:\n');
    if (containers.length > 0) {
        containers.forEach((c, i) => {
            console.log(`${i + 1}. ${c.selector}`);
            console.log(`   ID: ${c.id}`);
            console.log(`   Class: ${c.className}`);
            console.log(`   HTML: ${c.innerHTML}...`);
            console.log('');
        });
    } else {
        console.log('❌ 파트너맵 관련 요소 없음');
    }

    // 2. Phosphor Icons 링크 검색
    const phosphorLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.map(link => ({
            href: link.href,
            hasPhosphor: link.href.includes('phosphor')
        }));
    });

    console.log('\n📎 스타일시트 링크:\n');
    phosphorLinks.forEach((link, i) => {
        const marker = link.hasPhosphor ? '✅' : '  ';
        console.log(`${marker} ${i + 1}. ${link.href}`);
    });

    const hasPhosphor = phosphorLinks.some(l => l.hasPhosphor);
    console.log(`\n${hasPhosphor ? '✅' : '❌'} Phosphor Icons CDN: ${hasPhosphor ? '있음' : '없음'}`);

    // 3. 전체 HTML 구조 확인
    const structure = await page.evaluate(() => {
        return {
            title: document.title,
            hasPartnerDiv: !!document.querySelector('[id*="partner"]'),
            hasMapDiv: !!document.querySelector('[id*="map"]'),
            bodyClass: document.body.className,
            bodyId: document.body.id,
            mainContent: Array.from(document.querySelectorAll('main, #contents, #content, .container')).map(el => ({
                tag: el.tagName,
                id: el.id,
                class: el.className
            }))
        };
    });

    console.log('\n📊 페이지 구조:\n');
    console.log(`제목: ${structure.title}`);
    console.log(`Body ID: ${structure.bodyId || '(없음)'}`);
    console.log(`Body Class: ${structure.bodyClass || '(없음)'}`);
    console.log(`파트너 요소: ${structure.hasPartnerDiv ? '있음' : '없음'}`);
    console.log(`지도 요소: ${structure.hasMapDiv ? '있음' : '없음'}`);
    console.log('\n메인 컨텐츠:');
    structure.mainContent.forEach((el, i) => {
        console.log(`${i + 1}. <${el.tag}> id="${el.id}" class="${el.class}"`);
    });

    // 4. 스크린샷
    await page.screenshot({ path: 'find-partnermap-screenshot.png', fullPage: true });
    console.log('\n💾 스크린샷 저장: find-partnermap-screenshot.png');

    await browser.close();
}

findPartnerMap().catch(console.error);
