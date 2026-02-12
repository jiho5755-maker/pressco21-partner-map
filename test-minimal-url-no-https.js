/**
 * 최소 URL 테스트 (프로토콜 제거 버전)
 * 목적: https:// 프로토콜이 문제인지 확인
 */

(function(window) {
    'use strict';

    // 테스트 1: 네이버 지도 URL (프로토콜 상대)
    var naverMapUrl = '//map.naver.com/v5/search/' + encodeURIComponent('서울시 강남구');

    // 테스트 2: 카카오맵 URL (프로토콜 상대)
    var kakaoMapUrl = '//map.kakao.com/?q=' + encodeURIComponent('서울시 강남구');

    // 테스트 3: 인스타그램 URL (프로토콜 상대)
    var instagramHandle = 'test_user';
    var instagramUrl = instagramHandle.indexOf('://') > -1 ? instagramHandle : '//instagram.com/' + instagramHandle;

    console.log('[URL 테스트 (프로토콜 제거)]');
    console.log('네이버:', naverMapUrl);
    console.log('카카오:', kakaoMapUrl);
    console.log('인스타:', instagramUrl);

})(window);
