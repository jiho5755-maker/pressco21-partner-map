/**
 * 최소 URL 테스트
 * 목적: 메이크샵이 URL을 거부하는지 확인
 */

(function(window) {
    'use strict';

    // 테스트 1: 네이버 지도 URL
    var naverMapUrl = 'https://map.naver.com/v5/search/' + encodeURIComponent('서울시 강남구');

    // 테스트 2: 카카오맵 URL
    var kakaoMapUrl = 'https://map.kakao.com/?q=' + encodeURIComponent('서울시 강남구');

    // 테스트 3: 인스타그램 URL 조건부 생성
    var instagramHandle = 'test_user';
    var instagramUrl = instagramHandle.startsWith('http') ? instagramHandle : 'https://instagram.com/' + instagramHandle;

    console.log('[URL 테스트]');
    console.log('네이버:', naverMapUrl);
    console.log('카카오:', kakaoMapUrl);
    console.log('인스타:', instagramUrl);

})(window);
