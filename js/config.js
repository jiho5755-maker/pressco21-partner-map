/**
 * 파트너맵 v3 - 설정 파일
 * 메이크샵 D4 플랫폼 최적화
 * v2 검증된 Google Sheets 기반 아키텍처 유지
 */

var CONFIG = {
    // ========================================
    // 네이버 지도 API (ncpKeyId 인증)
    // ========================================
    naverMapNcpKeyId: 'bfp8odep5r',

    // ========================================
    // Google Sheets API (v2와 동일)
    // ========================================
    googleSheetApiUrl: 'https://script.google.com/macros/s/AKfycbxfp4SbpsUCmQu0gnF02r8oMY0dzzadElkcTcFNSsxPNo3x4zsNcw-z8MvJ3F7xskP6Yw/exec',

    // ========================================
    // 테스트 데이터 설정
    // ========================================
    useTestData: true,  // 개발 시 true, 운영 시 false로 변경
    testDataPath: '/test-data/partners-200.json',

    // ========================================
    // 캐싱 설정
    // ========================================
    cacheKey: 'fresco21_partners_v3',
    cacheVersion: '3.0',
    cacheDuration: 24 * 60 * 60 * 1000,  // 24시간 (밀리초)

    // ========================================
    // 지도 기본 설정
    // ========================================
    defaultCenter: {
        lat: 37.5665,  // 서울 시청
        lng: 126.9780
    },
    defaultZoom: 11,
    clusterZoom: 10,  // 이 줌 레벨 이하에서 클러스터링 활성화
    minZoomForMarkers: 8,  // 이 줌 레벨 이상에서만 마커 표시

    // ========================================
    // 파트너 유형별 색상 매핑
    // ========================================
    partnerTypeColors: {
        '협회': '#5A7FA8',
        '인플루언서': '#C9A961',
        'default': '#7D9675'
    },

    // ========================================
    // 카테고리별 색상 매핑 (v2와 동일)
    // ========================================
    categoryColors: {
        '압화': '#FFB8A8',
        '플라워디자인': '#E8D5E8',
        '투명식물표본': '#A8E0C8',
        '캔들': '#F5E6CA',
        '석고': '#F5E6CA',
        '리본': '#D4E4F7',
        '디퓨저': '#F0E4D4',
        'default': '#7D9675'
    },

    // ========================================
    // 검색 설정 (Fuse.js)
    // ========================================
    fuseOptions: {
        keys: [
            { name: 'name', weight: 0.4 },
            { name: 'address', weight: 0.3 },
            { name: 'category', weight: 0.2 },
            { name: 'description', weight: 0.1 }
        ],
        threshold: 0.3,  // 낮을수록 엄격한 매칭
        ignoreLocation: true,
        minMatchCharLength: 2
    },

    // ========================================
    // UI 설정
    // ========================================
    toastDuration: 3000,  // 토스트 알림 표시 시간 (밀리초)
    autocompleteLimit: 5,  // 자동완성 최대 표시 개수
    searchMinLength: 2,  // 검색 최소 글자 수
    debounceDelay: 200,  // 검색 입력 디바운스 (밀리초)

    // ========================================
    // 클러스터링 설정
    // ========================================
    clusterGridSize: 60,  // 클러스터링 그리드 크기 (픽셀)
    clusterMinSize: 2,  // 최소 클러스터 크기

    // ========================================
    // GPS 설정
    // ========================================
    gpsSearchRadius: 5,  // GPS 주변 검색 반경 (킬로미터)
    gpsZoomLevel: 13,  // GPS 검색 시 줌 레벨

    // ========================================
    // 즐겨찾기 설정
    // ========================================
    favoritesKey: 'fresco21_favorites_v3',

    // ========================================
    // 이미지 설정
    // ========================================
    defaultLogoPath: '/images/default-logo.jpg',
    lazyLoadThreshold: 200,  // Lazy loading 트리거 거리 (픽셀)

    // ========================================
    // 반응형 브레이크포인트
    // ========================================
    breakpoints: {
        mobile: 768,
        tablet: 992,
        desktop: 1200
    },

    // ========================================
    // 에러 메시지
    // ========================================
    errorMessages: {
        networkError: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        apiError: '데이터를 불러오는 중 오류가 발생했습니다.',
        gpsError: 'GPS 위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.',
        noResults: '검색 결과가 없습니다.',
        cacheError: '캐시 저장 중 오류가 발생했습니다.'
    },

    // ========================================
    // 유틸리티 함수
    // ========================================

    /**
     * 환경 설정 검증
     * @returns {Object} 검증 결과 { isValid, errors }
     */
    validate: function() {
        var errors = [];

        if (!this.naverMapNcpKeyId) {
            errors.push('네이버 지도 NCP Key ID가 설정되지 않았습니다.');
        }

        if (!this.googleSheetApiUrl) {
            errors.push('Google Sheets API URL이 설정되지 않았습니다.');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * 주소에서 지역 추출 (v2 extractRegion 함수 재사용)
     * @param {string} address - 주소
     * @returns {string} 지역명
     */
    extractRegion: function(address) {
        if (!address) return '기타';

        var regions = [
            '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
            '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
        ];

        for (var i = 0; i < regions.length; i++) {
            if (address.indexOf(regions[i]) !== -1) {
                return regions[i];
            }
        }

        return '기타';
    },

    /**
     * 파트너 유형에 따른 색상 반환
     * @param {string} partnerType - 파트너 유형
     * @returns {string} 색상 코드
     */
    getPartnerTypeColor: function(partnerType) {
        return this.partnerTypeColors[partnerType] || this.partnerTypeColors.default;
    },

    /**
     * 카테고리에 따른 색상 반환
     * @param {string} category - 카테고리명
     * @returns {string} 색상 코드
     */
    getCategoryColor: function(category) {
        return this.categoryColors[category] || this.categoryColors.default;
    },

    /**
     * 현재 디바이스 타입 반환
     * @returns {string} 'mobile' | 'tablet' | 'desktop'
     */
    getDeviceType: function() {
        var width = window.innerWidth;

        if (width < this.breakpoints.mobile) {
            return 'mobile';
        } else if (width < this.breakpoints.tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
};

// 전역 객체에 등록 (메이크샵 호환)
if (typeof window !== 'undefined') {
    window.PARTNERMAP_CONFIG = CONFIG;
    window.CONFIG = CONFIG;
}
