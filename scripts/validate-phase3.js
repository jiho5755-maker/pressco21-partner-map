#!/usr/bin/env node

/**
 * Phase 3 파일 크기 검증 스크립트
 * 메이크샵 40KB 제한 확인
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'makeshop-css.css',
  'makeshop-js-part1.js',
  'makeshop-js-part2a.js',
  'makeshop-js-part2b1.js',
  'makeshop-js-part2b2.js'
];

const MAX_SIZE = 40 * 1024; // 40KB

console.log('🔍 Phase 3 파일 크기 검증 시작...\n');

let allPassed = true;

FILES.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file}: 파일 없음`);
    return;
  }

  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  const percentage = ((stats.size / MAX_SIZE) * 100).toFixed(1);
  const remaining = ((MAX_SIZE - stats.size) / 1024).toFixed(2);

  if (stats.size > MAX_SIZE) {
    console.log(`❌ ${file}: ${sizeKB}KB (${percentage}%) - 초과 ${(stats.size - MAX_SIZE) / 1024}KB`);
    allPassed = false;
  } else if (stats.size > MAX_SIZE * 0.9) {
    console.log(`⚠️  ${file}: ${sizeKB}KB (${percentage}%) - 여유 ${remaining}KB`);
  } else {
    console.log(`✅ ${file}: ${sizeKB}KB (${percentage}%) - 여유 ${remaining}KB`);
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ 모든 파일 크기 검증 통과!');
  process.exit(0);
} else {
  console.log('❌ 파일 크기 제한 초과! 최적화 필요.');
  process.exit(1);
}
