#!/bin/bash

# 파트너맵 v3 빌드 스크립트
# 메이크샵 D4 플랫폼용 3-Part 분할 빌드

set -e

echo "🔨 파트너맵 v3 빌드 시작..."

# 1. Part 1: Config + API + Map
echo "📦 Part 1 생성 중..."
cat js/config.js js/api.js js/map.js > makeshop-js-part1.js
echo "✅ Part 1 완료 ($(wc -c < makeshop-js-part1.js | xargs) bytes)"

# 2. Part 2A: Filters + Search
echo "📦 Part 2A 생성 중..."
cat js/filters.js js/search.js > makeshop-js-part2a.js
echo "✅ Part 2A 완료 ($(wc -c < makeshop-js-part2a.js | xargs) bytes)"

# 3. Part 2B: UI + Main
echo "📦 Part 2B 생성 중..."
cat js/ui.js js/main.js > makeshop-js-part2b.js
echo "✅ Part 2B 완료 ($(wc -c < makeshop-js-part2b.js | xargs) bytes)"

# 4. 압축 버전 생성 (옵션)
if [ "$1" == "--minify" ]; then
    echo "🗜️ 압축 버전 생성 중..."
    sed 's|//.*||g; /^[[:space:]]*$/d; s/^[[:space:]]*//; s/[[:space:]]*$//' makeshop-js-part1.js > makeshop-js-part1.min.js
    sed 's|//.*||g; /^[[:space:]]*$/d; s/^[[:space:]]*//; s/[[:space:]]*$//' makeshop-js-part2a.js > makeshop-js-part2a.min.js
    sed 's|//.*||g; /^[[:space:]]*$/d; s/^[[:space:]]*//; s/[[:space:]]*$//' makeshop-js-part2b.js > makeshop-js-part2b.min.js
    echo "✅ 압축 완료"
fi

# 5. 파일 크기 확인
echo ""
echo "📊 파일 크기 요약:"
ls -lh makeshop-js-part*.js | grep -v ".min.js" | awk '{print "  " $9 " - " $5}'

echo ""
echo "🎉 빌드 완료!"
echo ""
echo "메이크샵 저장 방법:"
echo "1. HTML 탭: makeshop-html.html 전체 복사-붙여넣기"
echo "2. JS 탭: 아래 3개 파일을 순서대로 복사-붙여넣기"
echo "   - makeshop-js-part1.js"
echo "   - makeshop-js-part2a.js"
echo "   - makeshop-js-part2b.js"
