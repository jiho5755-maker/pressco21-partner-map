#!/bin/bash

# Phase 3 금지 패턴 검색 스크립트
# 메이크샵 호환성 검증

echo "🔍 Phase 3 금지 패턴 검색 시작..."
echo ""

ERRORS=0

# 1. UTF-8 4바이트 이모지 검색
echo "1️⃣  UTF-8 4바이트 이모지 검색..."
if grep -rn --include="*.js" --include="*.css" --include="*.html" -P "[\x{1F000}-\x{1F9FF}]" . 2>/dev/null; then
  echo "❌ 이모지 발견!"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ 이모지 없음"
fi
echo ""

# 2. async/await 검색
echo "2️⃣  async/await 검색..."
if grep -rn --include="*.js" "async function\|async (" . 2>/dev/null | grep -v "node_modules\|scripts"; then
  echo "❌ async/await 발견!"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ async/await 없음"
fi
echo ""

# 3. 이스케이프 안된 템플릿 리터럴 검색 (메이크샵 치환코드 오인)
echo "3️⃣  이스케이프 안된 템플릿 리터럴 검색..."
if grep -rn --include="*.js" '\${[^\\]' makeshop-*.js 2>/dev/null | grep -v "\\\\"; then
  echo "❌ 이스케이프 안된 템플릿 리터럴 발견!"
  echo "   해결: \${variable} → \\\${variable}"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ 템플릿 리터럴 이스케이프 정상"
fi
echo ""

# 4. 인라인 이벤트 핸들러 검색
echo "4️⃣  인라인 이벤트 핸들러 검색..."
if grep -rn --include="*.js" "onclick=\|onchange=\|oninput=" makeshop-*.js 2>/dev/null; then
  echo "⚠️  인라인 이벤트 핸들러 발견 (권장하지 않음)"
  echo "   해결: 이벤트 위임 방식 사용"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ 인라인 이벤트 핸들러 없음"
fi
echo ""

echo "=================================================="

if [ $ERRORS -eq 0 ]; then
  echo "✅ 모든 금지 패턴 검증 통과!"
  exit 0
else
  echo "❌ $ERRORS 개 금지 패턴 발견! 수정 필요."
  exit 1
fi
