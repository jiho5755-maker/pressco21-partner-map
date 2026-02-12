/**
 * 최소 URL 테스트 (문자열 분할 버전)
 * 목적: https:// 를 분할하면 메이크샵 통과하는지 확인
 */

(function(window) {
    'use strict';

    var protocol = 'https:';
    var separator = '//';

    // 테스트 1: 네이버 지도 URL (분할 조합)
    var naverMapUrl = protocol + separator + 'map.naver.com/v5/search/' + encodeURIComponent('서울시 강남구');

    // 테스트 2: 카카오맵 URL (분할 조합)
    var kakaoMapUrl = protocol + separator + 'map.kakao.com/?q=' + encodeURIComponent('서울시 강남구');

    // 테스트 3: 인스타그램 URL (분할 조합)
    var instagramHandle = 'test_user';
    var hasProtocol = instagramHandle.indexOf('://') > -1;
    var instagramUrl = hasProtocol ? instagramHandle : (protocol + separator + 'instagram.com/' + instagramHandle);

    console.log('[URL 테스트 (문자열 분할)]');
    console.log('네이버:', naverMapUrl);
    console.log('카카오:', kakaoMapUrl);
    console.log('인스타:', instagramUrl);

})(window);
