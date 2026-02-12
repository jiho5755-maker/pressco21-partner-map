/*
================================================
  메이크샵 D4 배포 - JS 통합 버전
================================================
  포함: 모든 JS 파일 통합
  크기: 약 94KB (30KB 제한 초과)
  
  ⚠️ 주의: 메이크샵 JS 탭 30KB 제한으로 저장 실패 시
  03-js-part1.js, part2.js, part3.js 사용하세요
================================================
*/
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

/**
 * 파트너맵 v3 - API 래퍼
 * 책임: Google Sheets API 통신, 캐싱, 데이터 변환
 * v2 검증된 로직 재사용 (메이크샵은 렌더링 플랫폼만 사용)
 */

(function(window) {
    'use strict';

    /**
     * API 클라이언트
     * @param {Object} config - CONFIG 객체
     */
    function PartnerAPI(config) {
        this.config = config;
    }

    // ========================================
    // 캐시 관리 (v2 getCache/setCache 재사용)
    // ========================================

    /**
     * 캐시에서 데이터 가져오기
     * @returns {Array|null} 파트너 데이터 배열 또는 null
     */
    PartnerAPI.prototype.getCache = function() {
        try {
            var cached = localStorage.getItem(this.config.cacheKey);
            if (!cached) {
                return null;
            }

            var parsedData = JSON.parse(cached);

            // 버전 확인
            if (parsedData.version !== this.config.cacheVersion) {
                console.log('[Cache] 버전 불일치, 캐시 무효화');
                this.clearCache();
                return null;
            }

            // 만료 확인
            var now = Date.now();
            if (now - parsedData.timestamp > this.config.cacheDuration) {
                console.log('[Cache] 만료됨, 캐시 무효화');
                this.clearCache();
                return null;
            }

            // 빈 배열 확인 (v2 로직)
            if (!parsedData.data || parsedData.data.length === 0) {
                console.log('[Cache] 빈 배열, 캐시 무시');
                return null;
            }

            console.log('[Cache] 캐시 히트 (' + parsedData.data.length + '개 파트너)');
            return parsedData.data;

        } catch (error) {
            console.error('[Cache] 캐시 읽기 오류:', error);
            return null;
        }
    };

    /**
     * 캐시에 데이터 저장 (v2 setCache 재사용)
     * @param {Array} partners - 파트너 데이터 배열
     * @returns {boolean} 저장 성공 여부
     */
    PartnerAPI.prototype.setCache = function(partners) {
        try {
            var cacheData = {
                version: this.config.cacheVersion,
                timestamp: Date.now(),
                data: partners
            };

            localStorage.setItem(this.config.cacheKey, JSON.stringify(cacheData));
            console.log('[Cache] 캐시 저장 완료 (' + partners.length + '개 파트너)');
            return true;

        } catch (error) {
            console.error('[Cache] 캐시 저장 오류:', error);
            return false;
        }
    };

    /**
     * 캐시 삭제
     */
    PartnerAPI.prototype.clearCache = function() {
        try {
            localStorage.removeItem(this.config.cacheKey);
            console.log('[Cache] 캐시 삭제 완료');
        } catch (error) {
            console.error('[Cache] 캐시 삭제 오류:', error);
        }
    };

    // ========================================
    // Google Sheets API (v2 loadPartnerData 재사용)
    // ========================================

    /**
     * Google Sheets에서 파트너 데이터 로드
     * v2 main.js loadPartnerData() 함수 재사용 (508-561줄)
     * @param {boolean} forceRefresh - 강제 새로고침 여부
     * @returns {Promise<Array>} 파트너 데이터 배열
     */
    PartnerAPI.prototype.loadPartnerData = function(forceRefresh) {
        var self = this;

        // 캐시 확인 (강제 새로고침이 아닌 경우)
        if (!forceRefresh) {
            var cached = self.getCache();
            if (cached && cached.length > 0) {
                return Promise.resolve(cached);
            }
        }

        console.log('[API] 파트너 데이터 로드 시작');

        // 테스트 데이터 모드 (개발용)
        if (self.config.useTestData) {
            console.log('[API] 테스트 데이터 모드 활성화');
            return fetch(self.config.testDataPath)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('테스트 데이터 로드 실패: ' + response.status);
                    }
                    return response.json();
                })
                .then(function(rawPartners) {
                    console.log('[API] 테스트 데이터 로드 완료:', rawPartners.length + '개');
                    return self.processPartnerData(rawPartners);
                })
                .catch(function(error) {
                    console.error('[API] 테스트 데이터 로드 오류:', error);
                    return [];
                });
        }

        // 운영 모드: Google Sheets API
        return fetch(self.config.googleSheetApiUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Google Sheets API 호출 실패: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                console.log('[API] 응답 수신:', data);

                // API 응답 구조 확인 (v2와 동일: data.partners 사용)
                var rawPartners = data.partners || data;

                console.log('[API] rawPartners:', rawPartners);

                if (!Array.isArray(rawPartners)) {
                    console.error('[API] 잘못된 데이터 형식:', data);
                    return [];
                }

                console.log('[API] 파트너 수:', rawPartners.length);

                // 데이터 가공 위임
                return self.processPartnerData(rawPartners);
            })
            .catch(function(error) {
                console.error('[API] 데이터 로드 실패:', error);
                return [];
            });
    };

    /**
     * 파트너 데이터 가공 (공통 로직)
     * @param {Array} rawPartners - 원본 파트너 데이터
     * @returns {Array} 가공된 파트너 데이터
     */
    PartnerAPI.prototype.processPartnerData = function(rawPartners) {
        var self = this;

        if (!Array.isArray(rawPartners)) {
            console.error('[API] 잘못된 데이터 형식:', rawPartners);
            return [];
        }

        // 데이터 가공 (v2 로직 재사용)
        var partners = rawPartners
            .filter(function(p) {
                return p.lat && p.lng;
            })
            .map(function(p) {
                return {
                    id: p.id,
                    name: p.name,
                    category: p.category ? p.category.split(',').map(function(c) {
                        return c.trim();
                    }) : [],
                    address: p.address,
                    latitude: parseFloat(p.lat),  // ⭐ CRITICAL: lat → latitude
                    longitude: parseFloat(p.lng),  // ⭐ CRITICAL: lng → longitude
                    phone: p.phone,
                    email: p.email,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    logoUrl: p.logoUrl,
                    association: p.association || '',
                    partnerType: p.partnerType
                        ? (typeof p.partnerType === 'string'
                            ? p.partnerType.split(',').map(function(t) {
                                return t.trim();
                            })
                            : p.partnerType)
                        : []
                };
            });

        console.log('[API] 가공 완료 (' + partners.length + '개 파트너)');

        // 캐시 저장
        self.setCache(partners);

        return partners;
    };

    /**
     * 단일 파트너 조회
     * @param {string} partnerId - 파트너 ID
     * @returns {Promise<Object|null>} 파트너 데이터 또는 null
     */
    PartnerAPI.prototype.getPartner = function(partnerId) {
        var self = this;

        return self.loadPartnerData(false)
            .then(function(partners) {
                var partner = partners.find(function(p) {
                    return String(p.id) === String(partnerId);
                });

                return partner || null;
            });
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.PartnerAPI = PartnerAPI;

})(window);

/**
 * 파트너맵 v3 - 지도 시스템
 * 책임: 네이버 지도 SDK, 마커 관리, 클러스터링 (O(n) 그리드 기반)
 * 메이크샵 호환: 템플릿 리터럴 이스케이프 적용
 */

(function(window) {
    'use strict';

    /**
     * 지도 서비스
     * @param {Object} config - CONFIG 객체
     */
    function MapService(config) {
        this.config = config;
        this.map = null;
        this.markers = [];  // { partner, marker } 배열
        this.clusterMarkers = [];  // 클러스터 마커 배열
        this.referencePoint = null;  // 기준점 (GPS 등)
        this.referencePointMarker = null;  // 기준점 마커 (지도 클릭 또는 GPS)
        this.isDragging = false;  // 드래그 상태 추적
    }

    // ========================================
    // SDK 로드
    // ========================================

    /**
     * 네이버 지도 SDK 로드 확인 (HTML에서 이미 로드됨)
     * @returns {Promise<void>}
     */
    MapService.prototype.loadSDK = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            // SDK가 이미 로드된 경우
            if (window.naver && window.naver.maps) {
                console.log('[Map] 네이버 지도 SDK 로드 확인');
                resolve();
                return;
            }

            // SDK 로드 대기 (최대 5초)
            console.log('[Map] 네이버 지도 SDK 로드 대기 중...');
            var checkCount = 0;
            var checkInterval = setInterval(function() {
                checkCount++;
                if (window.naver && window.naver.maps) {
                    clearInterval(checkInterval);
                    console.log('[Map] 네이버 지도 SDK 로드 완료');
                    resolve();
                } else if (checkCount > 50) {
                    clearInterval(checkInterval);
                    console.error('[Map] 네이버 지도 SDK 로드 타임아웃');
                    reject(new Error('네이버 지도 SDK 로드 실패: HTML 탭에 SDK 스크립트가 누락되었습니다.'));
                }
            }, 100);
        });
    };

    // ========================================
    // 지도 초기화
    // ========================================

    /**
     * 지도 초기화
     * @param {string} containerId - 지도 컨테이너 DOM ID
     * @returns {Object} 네이버 지도 인스턴스
     */
    MapService.prototype.init = function(containerId) {
        var self = this;

        if (!window.naver || !window.naver.maps) {
            throw new Error('네이버 지도 SDK가 로드되지 않았습니다.');
        }

        var mapOptions = {
            center: new naver.maps.LatLng(
                self.config.defaultCenter.lat,
                self.config.defaultCenter.lng
            ),
            zoom: self.config.defaultZoom,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            },
            mapTypeControl: true
        };

        self.map = new naver.maps.Map(containerId, mapOptions);

        // 드래그 이벤트 리스너
        naver.maps.Event.addListener(self.map, 'dragstart', function() {
            self.isDragging = true;
        });

        naver.maps.Event.addListener(self.map, 'dragend', function() {
            setTimeout(function() {
                self.isDragging = false;
            }, 100);
        });

        // 지도 클릭 이벤트 (기준점 설정)
        naver.maps.Event.addListener(self.map, 'click', function(e) {
            if (self.isDragging) return;

            if (e && e.coord) {
                var lat = e.coord._lat || e.coord.y;
                var lng = e.coord._lng || e.coord.x;

                if (lat && lng) {
                    self.setReferencePointWithMarker(lat, lng);

                    // FilterService에 기준점 전달
                    if (window.FilterService) {
                        window.FilterService.setReferencePoint(lat, lng);

                        // 거리순 정렬로 자동 변경
                        var sortSelect = document.getElementById('pm-sort-select');
                        if (sortSelect) {
                            sortSelect.value = 'distance';
                            window.FilterService.applyFilters();
                        }
                    }

                    if (window.UIService) {
                        window.UIService.showToast('기준점이 설정되었습니다.', 'success');
                    }
                }
            }
        });

        // 줌/idle 이벤트 (마커 가시성 업데이트)
        naver.maps.Event.addListener(self.map, 'idle', function() {
            self.updateMarkerVisibility();
        });

        console.log('[Map] 지도 초기화 완료');
        return self.map;
    };

    // ========================================
    // 마커 생성
    // ========================================

    /**
     * 마커 생성 (기존 마커 제거 후 생성)
     * @param {Array} partners - 파트너 데이터 배열
     */
    MapService.prototype.createMarkers = function(partners) {
        var self = this;

        // 기존 마커 제거
        self.clearMarkers();

        partners.forEach(function(partner) {
            // 좌표 검증
            if (!partner.latitude || !partner.longitude) {
                console.warn('[Map] 좌표 누락:', partner.name);
                return;
            }

            var position = new naver.maps.LatLng(partner.latitude, partner.longitude);

            var marker = new naver.maps.Marker({
                position: position,
                map: null,  // 초기에는 숨김
                icon: {
                    content: self.createMarkerIcon(partner),
                    anchor: new naver.maps.Point(20, 20)
                }
            });

            // 클릭 이벤트
            naver.maps.Event.addListener(marker, 'click', function() {
                if (window.UIService && window.UIService.showPartnerDetail) {
                    window.UIService.showPartnerDetail(partner);
                }
            });

            self.markers.push({
                partner: partner,
                marker: marker
            });
        });

        console.log('[Map] 마커 생성 완료 (' + partners.length + '개)');

        // 가시성 업데이트
        self.updateMarkerVisibility();
    };

    /**
     * 마커 아이콘 HTML 생성
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    MapService.prototype.createMarkerIcon = function(partner) {
        var self = this;

        // 색상 결정: 파트너 유형 > 카테고리 > 기본
        var color = self.config.getPartnerTypeColor(partner.partnerType);

        // 꽃 아이콘 SVG
        var flowerIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="margin-right: 6px;">' +
            '<path d="M12 2C12 2 10.5 6 10.5 8.5C10.5 9.88 11.12 11 12 11C12.88 11 13.5 9.88 13.5 8.5C13.5 6 12 2 12 2Z"/>' +
            '<path d="M16.24 7.76C16.24 7.76 15 11.5 16 13C16.5 13.75 17.5 14 18.5 13.5C19.5 13 20 12 19.5 10.5C19 9 16.24 7.76 16.24 7.76Z"/>' +
            '<path d="M7.76 7.76C7.76 7.76 5 9 4.5 10.5C4 12 4.5 13 5.5 13.5C6.5 14 7.5 13.75 8 13C9 11.5 7.76 7.76 7.76 7.76Z"/>' +
            '<path d="M12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12Z"/>' +
            '<path d="M8.5 16.5C8.5 16.5 6.5 19 7 20.5C7.5 22 9 22 10 21C11 20 10.5 18 9.5 17C8.5 16 8.5 16.5 8.5 16.5Z"/>' +
            '<path d="M15.5 16.5C15.5 16.5 17.5 19 17 20.5C16.5 22 15 22 14 21C13 20 13.5 18 14.5 17C15.5 16 15.5 16.5 15.5 16.5Z"/>' +
            '</svg>';

        // XSS 방지: escapeHtml 사용
        var escapedName = window.escapeHtml ? window.escapeHtml(partner.name) : partner.name;

        // HTML 반환 (문자열 연결 사용 - 메이크샵 호환)
        return '<div style="' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 4px;' +
            'background: white;' +
            'padding: 10px 16px;' +
            'border-radius: 9999px;' +
            'box-shadow: 0 8px 32px rgba(0,0,0,0.12);' +
            'border: 2px solid ' + color + ';' +
            'font-family: -apple-system, BlinkMacSystemFont, sans-serif;' +
            'font-size: 14px;' +
            'font-weight: 600;' +
            'color: ' + color + ';' +
            'white-space: nowrap;' +
            'transition: all 0.3s ease;' +
            'cursor: pointer;' +
            '" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 12px 40px rgba(0,0,0,0.2)\';" ' +
            'onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 8px 32px rgba(0,0,0,0.12)\';">' +
            flowerIcon +
            escapedName +
            '</div>';
    };

    /**
     * 클러스터 마커 아이콘 HTML 생성
     * @param {number} count - 클러스터 내 파트너 수
     * @returns {string} HTML 문자열
     */
    MapService.prototype.createClusterIcon = function(count) {
        return '<div style="' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'width: 50px;' +
            'height: 50px;' +
            'background: linear-gradient(135deg, #7D9675 0%, #5A6F52 100%);' +
            'border-radius: 50%;' +
            'box-shadow: 0 8px 24px rgba(0,0,0,0.2);' +
            'font-family: -apple-system, BlinkMacSystemFont, sans-serif;' +
            'font-size: 16px;' +
            'font-weight: 700;' +
            'color: white;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
            '" onmouseover="this.style.transform=\'scale(1.1)\';" ' +
            'onmouseout="this.style.transform=\'scale(1)\';">' +
            count +
            '</div>';
    };

    // ========================================
    // 마커 가시성 & 클러스터링
    // ========================================

    /**
     * 줌/뷰포트에 따른 마커 가시성 업데이트
     */
    MapService.prototype.updateMarkerVisibility = function() {
        var self = this;

        if (!self.map) return;

        var bounds = self.map.getBounds();
        if (!bounds) return;

        var zoom = self.map.getZoom();

        // 기존 클러스터 마커 제거
        self.clusterMarkers.forEach(function(marker) {
            marker.setMap(null);
        });
        self.clusterMarkers = [];

        if (zoom <= self.config.clusterZoom) {
            // === 클러스터 모드 ===
            var visibleItems = [];

            self.markers.forEach(function(item) {
                // 개별 마커 숨김
                item.marker.setMap(null);

                // Viewport 내 마커만 수집
                if (bounds.hasLatLng(item.marker.getPosition())) {
                    visibleItems.push(item);
                }
            });

            // 그리드 기반 클러스터링 (O(n))
            var clusters = self.computeGridClusters(visibleItems, zoom);

            clusters.forEach(function(cluster) {
                if (cluster.length === 1) {
                    // 단일 마커는 그대로 표시
                    cluster[0].marker.setMap(self.map);
                } else {
                    // 클러스터 마커 생성
                    self.createClusterMarker(cluster);
                }
            });

        } else {
            // === 일반 모드: 개별 마커 표시 ===
            self.markers.forEach(function(item) {
                var inBounds = bounds.hasLatLng(item.marker.getPosition());

                if (inBounds && !item.marker.getMap()) {
                    item.marker.setMap(self.map);
                } else if (!inBounds && item.marker.getMap()) {
                    item.marker.setMap(null);
                }
            });
        }
    };

    /**
     * 그리드 기반 클러스터링 (O(n) 성능)
     * @param {Array} items - 마커 아이템 배열
     * @param {number} zoom - 현재 줌 레벨
     * @returns {Array} 클러스터 배열
     */
    MapService.prototype.computeGridClusters = function(items, zoom) {
        var self = this;

        // 줌 레벨에 따른 그리드 크기 (도 단위)
        var gridSize = Math.pow(2, 12 - zoom) * 0.01;

        var grid = {};

        items.forEach(function(item) {
            var lat = item.partner.latitude;
            var lng = item.partner.longitude;

            // 그리드 키 생성
            var gridX = Math.floor(lng / gridSize);
            var gridY = Math.floor(lat / gridSize);
            var key = gridX + '_' + gridY;

            if (!grid[key]) {
                grid[key] = [];
            }

            grid[key].push(item);
        });

        // 그리드를 배열로 변환
        var clusters = Object.values(grid);

        // 최소 클러스터 크기 필터링
        return clusters.filter(function(cluster) {
            return cluster.length >= self.config.clusterMinSize || cluster.length === 1;
        });
    };

    /**
     * 클러스터 마커 생성
     * @param {Array} cluster - 클러스터 아이템 배열
     */
    MapService.prototype.createClusterMarker = function(cluster) {
        var self = this;

        // 클러스터 중심 계산 (평균)
        var avgLat = 0;
        var avgLng = 0;

        cluster.forEach(function(item) {
            avgLat += item.partner.latitude;
            avgLng += item.partner.longitude;
        });

        avgLat /= cluster.length;
        avgLng /= cluster.length;

        var position = new naver.maps.LatLng(avgLat, avgLng);

        var marker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: self.createClusterIcon(cluster.length),
                anchor: new naver.maps.Point(25, 25)
            },
            zIndex: 100
        });

        // 클릭 시 줌인
        naver.maps.Event.addListener(marker, 'click', function() {
            self.map.setCenter(position);
            self.map.setZoom(self.map.getZoom() + 2);
        });

        self.clusterMarkers.push(marker);
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 모든 마커 제거
     */
    MapService.prototype.clearMarkers = function() {
        var self = this;

        self.markers.forEach(function(item) {
            item.marker.setMap(null);
        });
        self.markers = [];

        self.clusterMarkers.forEach(function(marker) {
            marker.setMap(null);
        });
        self.clusterMarkers = [];
    };

    /**
     * 지도 초기화 (중심/줌 리셋)
     */
    MapService.prototype.reset = function() {
        var self = this;

        if (!self.map) return;

        self.map.setCenter(new naver.maps.LatLng(
            self.config.defaultCenter.lat,
            self.config.defaultCenter.lng
        ));
        self.map.setZoom(self.config.defaultZoom);
    };

    /**
     * 특정 파트너로 지도 이동
     * @param {Object} partner - 파트너 데이터
     */
    MapService.prototype.moveTo = function(partner) {
        var self = this;

        if (!self.map || !partner.latitude || !partner.longitude) return;

        var position = new naver.maps.LatLng(partner.latitude, partner.longitude);
        self.map.setCenter(position);
        self.map.setZoom(15);  // 상세 줌 레벨
    };

    /**
     * 기준점 설정 (GPS 등)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    MapService.prototype.setReferencePoint = function(lat, lng) {
        var self = this;

        self.referencePoint = { lat: lat, lng: lng };

        if (!self.map) return;

        // 기준점 마커 표시 (선택 사항)
        var position = new naver.maps.LatLng(lat, lng);
        self.map.setCenter(position);
        self.map.setZoom(self.config.gpsZoomLevel);
    };

    /**
     * 기준점 설정 및 마커 표시 (지도 클릭용)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    MapService.prototype.setReferencePointWithMarker = function(lat, lng) {
        var self = this;

        // 기존 마커 제거
        if (self.referencePointMarker) {
            self.referencePointMarker.setMap(null);
        }

        self.referencePoint = { lat: lat, lng: lng };

        if (!self.map) return;

        var position = new naver.maps.LatLng(lat, lng);

        // 기준점 마커 생성
        self.referencePointMarker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: '<div style="width:40px;height:40px;line-height:40px;' +
                         'text-align:center;font-size:28px;color:#C9A961;' +
                         'animation:pulse 1.5s infinite;">' +
                         '<i class="ph-fill ph-map-pin"></i></div>',
                anchor: new naver.maps.Point(20, 40)
            },
            zIndex: 1000
        });

        self.map.setCenter(position);

        // 초기화 버튼 표시
        var clearBtn = document.getElementById('pm-clear-reference-btn');
        if (clearBtn) {
            clearBtn.style.display = 'block';
        }
    };

    /**
     * 기준점 및 마커 초기화
     */
    MapService.prototype.clearReferencePoint = function() {
        var self = this;

        if (self.referencePointMarker) {
            self.referencePointMarker.setMap(null);
            self.referencePointMarker = null;
        }

        self.referencePoint = null;

        if (window.FilterService) {
            window.FilterService.setReferencePoint(null, null);
        }
    };

    /**
     * Haversine 거리 계산 (킬로미터)
     * @param {number} lat1 - 위도1
     * @param {number} lng1 - 경도1
     * @param {number} lat2 - 위도2
     * @param {number} lng2 - 경도2
     * @returns {number} 거리 (km)
     */
    MapService.prototype.calculateDistance = function(lat1, lng1, lat2, lng2) {
        var R = 6371;  // 지구 반지름 (km)

        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.MapService = MapService;

})(window);

/**
 * 파트너맵 v3 - 필터링 시스템
 * 책임: 4중 필터, 활성 배지, URL 동기화
 */

(function(window) {
    'use strict';

    /**
     * 필터 서비스
     * @param {Object} config - CONFIG 객체
     */
    function FilterService(config) {
        this.config = config;
        this.partners = [];
        this.filteredPartners = [];
        this.currentFilters = {
            category: 'all',
            region: 'all',
            association: 'all',
            partnerType: 'all',
            favorites: false,
            search: ''
        };
        this.referencePoint = null;  // GPS 기준점
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 필터 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    FilterService.prototype.init = function(partners) {
        var self = this;

        self.partners = partners;
        self.filteredPartners = partners;

        // 필터 버튼 생성
        self.generateFilterButtons();

        // 이벤트 리스너 설정
        self.setupEventListeners();

        // URL 파라미터 로드
        self.loadUrlParams();

        console.log('[Filter] 필터 초기화 완료');
    };

    /**
     * 필터 버튼 생성
     */
    FilterService.prototype.generateFilterButtons = function() {
        var self = this;

        // 카테고리 추출
        var categories = self.extractUniqueValues('category');
        self.renderFilterGroup('category', categories);

        // 지역 추출
        var regions = self.extractRegions();
        self.renderFilterGroup('region', regions);

        // 협회 추출
        var associations = self.extractUniqueValues('association', true);
        self.renderFilterGroup('association', associations);

        // 파트너 유형 추출
        var partnerTypes = self.extractUniqueValues('partnerType');
        self.renderFilterGroup('partnerType', partnerTypes);
    };

    /**
     * 고유 값 추출
     * @param {string} field - 필드명
     * @param {boolean} splitComma - 쉼표로 분리 여부
     * @returns {Array} 고유 값 배열
     */
    FilterService.prototype.extractUniqueValues = function(field, splitComma) {
        var self = this;
        var values = new Set();

        self.partners.forEach(function(partner) {
            var value = partner[field];

            if (!value) return;

            if (splitComma && typeof value === 'string') {
                value.split(',').forEach(function(v) {
                    var trimmed = v.trim();
                    if (trimmed) values.add(trimmed);
                });
            } else if (Array.isArray(value)) {
                value.forEach(function(v) {
                    if (v) values.add(v);
                });
            } else {
                values.add(value);
            }
        });

        return Array.from(values).sort();
    };

    /**
     * 지역 추출 (주소에서 시/도 추출)
     * @returns {Array} 지역 배열
     */
    FilterService.prototype.extractRegions = function() {
        var self = this;
        var regions = new Set();

        self.partners.forEach(function(partner) {
            var region = self.extractRegionFromAddress(partner.address);
            if (region) regions.add(region);
        });

        return Array.from(regions).sort();
    };

    /**
     * 주소에서 시/도 추출
     * @param {string} address - 주소
     * @returns {string} 시/도
     */
    FilterService.prototype.extractRegionFromAddress = function(address) {
        if (!address) return null;

        var match = address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
        return match ? match[1] : '기타';
    };

    /**
     * 필터 그룹 렌더링
     * @param {string} type - 필터 타입
     * @param {Array} values - 필터 값 배열
     */
    FilterService.prototype.renderFilterGroup = function(type, values) {
        var container = document.getElementById('pm-filter-' + type);
        if (!container) return;

        var html = '<button class="filter-btn active" data-filter-type="' + type + '" data-filter-value="all">전체</button>';

        values.forEach(function(value) {
            html += '<button class="filter-btn" data-filter-type="' + type + '" data-filter-value="' + value + '">' +
                    window.escapeHtml(value) +
                    '</button>';
        });

        container.innerHTML = html;
    };

    /**
     * 이벤트 리스너 설정
     */
    FilterService.prototype.setupEventListeners = function() {
        var self = this;

        // 필터 탭 전환
        var tabs = document.querySelectorAll('.pm-filter-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var filterType = this.getAttribute('data-filter-type');

                // 탭 활성화
                tabs.forEach(function(t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // 필터 그룹 표시
                var groups = document.querySelectorAll('.pm-filter-group');
                groups.forEach(function(g) { g.classList.remove('active'); });

                var targetGroup = document.getElementById('pm-filter-' + filterType);
                if (targetGroup) {
                    targetGroup.classList.add('active');
                }
            });
        });

        // 필터 버튼 클릭
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-btn')) {
                var filterType = e.target.getAttribute('data-filter-type');
                var filterValue = e.target.getAttribute('data-filter-value');

                // 같은 그룹 내 활성화 토글
                var parent = e.target.parentElement;
                var siblings = parent.querySelectorAll('.filter-btn');
                siblings.forEach(function(btn) { btn.classList.remove('active'); });
                e.target.classList.add('active');

                // 필터 적용
                self.setFilter(filterType, filterValue);
            }
        });

        // 활성 필터 배지 제거
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('pm-badge-remove')) {
                var filterType = e.target.getAttribute('data-filter-type');
                self.setFilter(filterType, 'all');
            }
        });

        // 정렬 변경
        var sortSelect = document.getElementById('pm-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                self.sortPartners(this.value);
                self.applyFilters();
            });
        }
    };

    // ========================================
    // 필터 적용
    // ========================================

    /**
     * 필터 설정
     * @param {string} type - 필터 타입
     * @param {string} value - 필터 값
     */
    FilterService.prototype.setFilter = function(type, value) {
        var self = this;

        if (type === 'favorites') {
            self.currentFilters.favorites = (value === 'true' || value === true);
        } else {
            self.currentFilters[type] = value;
        }

        // 필터 적용
        self.applyFilters();

        // URL 동기화
        self.updateUrlParams();

        // 활성 필터 배지 업데이트
        self.updateActiveFilterBadges();
    };

    /**
     * 검색 설정
     * @param {string} query - 검색어
     */
    FilterService.prototype.setSearch = function(query) {
        var self = this;

        self.currentFilters.search = query;
        self.applyFilters();
    };

    /**
     * 필터 적용
     */
    FilterService.prototype.applyFilters = function() {
        var self = this;

        self.filteredPartners = self.partners.filter(function(partner) {
            // 카테고리
            if (self.currentFilters.category !== 'all') {
                var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
                if (!categories.includes(self.currentFilters.category)) {
                    return false;
                }
            }

            // 지역
            if (self.currentFilters.region !== 'all') {
                var region = self.extractRegionFromAddress(partner.address);
                if (region !== self.currentFilters.region) {
                    return false;
                }
            }

            // 협회
            if (self.currentFilters.association !== 'all') {
                var associations = partner.association
                    ? partner.association.split(',').map(function(a) { return a.trim(); })
                    : [];
                if (!associations.includes(self.currentFilters.association)) {
                    return false;
                }
            }

            // 파트너 유형
            if (self.currentFilters.partnerType !== 'all') {
                if (!partner.partnerType || !partner.partnerType.includes(self.currentFilters.partnerType)) {
                    return false;
                }
            }

            // 즐겨찾기
            if (self.currentFilters.favorites) {
                var favorites = JSON.parse(localStorage.getItem(self.config.favoritesKey) || '[]');
                if (!favorites.includes(partner.id)) {
                    return false;
                }
            }

            // 검색
            if (self.currentFilters.search) {
                var query = self.currentFilters.search.toLowerCase();
                var nameMatch = partner.name.toLowerCase().includes(query);
                var addressMatch = partner.address.toLowerCase().includes(query);
                if (!nameMatch && !addressMatch) {
                    return false;
                }
            }

            return true;
        });

        // 정렬 적용
        var sortType = document.getElementById('pm-sort-select');
        if (sortType) {
            self.sortPartners(sortType.value);
        }

        // 지도 및 리스트 업데이트
        if (window.MapService && window.MapService.createMarkers) {
            window.MapService.createMarkers(self.filteredPartners);
        }

        if (window.UIService && window.UIService.renderPartnerList) {
            window.UIService.renderPartnerList(self.filteredPartners);
        }

        // 결과 카운트 업데이트
        var resultCountElement = document.getElementById('pm-result-count-text');
        if (resultCountElement) {
            resultCountElement.textContent = '전체 ' + self.filteredPartners.length + '개 업체';
        }

        console.log('[Filter] 필터 적용 완료 (' + self.filteredPartners.length + '개 결과)');
    };

    // ========================================
    // 정렬
    // ========================================

    /**
     * 파트너 정렬
     * @param {string} sortType - 정렬 타입 ('name', 'distance', 'recent')
     */
    FilterService.prototype.sortPartners = function(sortType) {
        var self = this;

        switch (sortType) {
            case 'name':
                self.filteredPartners.sort(function(a, b) {
                    return a.name.localeCompare(b.name, 'ko');
                });
                break;

            case 'distance':
                if (self.referencePoint) {
                    // 거리 계산 및 파트너 객체에 추가
                    self.filteredPartners.forEach(function(partner) {
                        partner.distance = self.calculateDistance(
                            self.referencePoint.lat,
                            self.referencePoint.lng,
                            partner.latitude,
                            partner.longitude
                        );
                    });

                    // 정렬
                    self.filteredPartners.sort(function(a, b) {
                        return a.distance - b.distance;
                    });
                } else {
                    // 기준점이 없으면 안내 메시지
                    if (window.UIService) {
                        window.UIService.showToast(
                            '지도를 클릭하거나 GPS 버튼을 눌러 기준점을 설정하세요.',
                            'info'
                        );
                    }
                }
                break;

            case 'recent':
                // ID가 최근 추가순이라고 가정
                self.filteredPartners.sort(function(a, b) {
                    return b.id - a.id;
                });
                break;
        }
    };

    /**
     * Haversine 거리 계산 (킬로미터)
     */
    FilterService.prototype.calculateDistance = function(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    /**
     * 기준점 설정 (GPS)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    FilterService.prototype.setReferencePoint = function(lat, lng) {
        var self = this;
        self.referencePoint = { lat: lat, lng: lng };
    };

    // ========================================
    // 활성 필터 배지
    // ========================================

    /**
     * 활성 필터 배지 업데이트
     */
    FilterService.prototype.updateActiveFilterBadges = function() {
        var self = this;
        var container = document.getElementById('pm-active-filters');
        if (!container) return;

        var badges = [];

        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];

            if (value !== 'all' && value !== '' && value !== false) {
                var label = self.getFilterLabel(type, value);
                badges.push({
                    type: type,
                    value: value,
                    label: label
                });
            }
        });

        if (badges.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        var html = badges.map(function(badge) {
            return '<span class="pm-active-badge">' +
                   window.escapeHtml(badge.label) +
                   '<button class="pm-badge-remove" data-filter-type="' + badge.type + '" aria-label="제거">×</button>' +
                   '</span>';
        }).join('');

        container.innerHTML = html;
        container.style.display = 'flex';
    };

    /**
     * 필터 레이블 가져오기
     * @param {string} type - 필터 타입
     * @param {string} value - 필터 값
     * @returns {string} 레이블
     */
    FilterService.prototype.getFilterLabel = function(type, value) {
        var labels = {
            category: '카테고리: ',
            region: '지역: ',
            association: '협회: ',
            partnerType: '유형: ',
            favorites: '즐겨찾기',
            search: '검색: '
        };

        if (type === 'favorites') {
            return labels[type];
        }

        return labels[type] + value;
    };

    // ========================================
    // URL 동기화
    // ========================================

    /**
     * URL 파라미터 업데이트
     */
    FilterService.prototype.updateUrlParams = function() {
        var self = this;

        var params = new URLSearchParams();

        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];
            if (value !== 'all' && value !== '' && value !== false) {
                params.set(type, value);
            }
        });

        var newUrl = window.location.pathname;
        if (params.toString()) {
            newUrl += '?' + params.toString();
        }

        window.history.replaceState({}, '', newUrl);
    };

    /**
     * URL 파라미터 로드
     */
    FilterService.prototype.loadUrlParams = function() {
        var self = this;

        var params = new URLSearchParams(window.location.search);

        params.forEach(function(value, key) {
            if (self.currentFilters.hasOwnProperty(key)) {
                self.currentFilters[key] = value === 'true' ? true : value;
            }
        });

        // UI 동기화
        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];
            if (value !== 'all' && value !== '' && value !== false) {
                var btn = document.querySelector('.filter-btn[data-filter-type="' + type + '"][data-filter-value="' + value + '"]');
                if (btn) {
                    var siblings = btn.parentElement.querySelectorAll('.filter-btn');
                    siblings.forEach(function(s) { s.classList.remove('active'); });
                    btn.classList.add('active');
                }
            }
        });
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 필터 초기화
     */
    FilterService.prototype.resetFilters = function() {
        var self = this;

        self.currentFilters = {
            category: 'all',
            region: 'all',
            association: 'all',
            partnerType: 'all',
            favorites: false,
            search: ''
        };

        // UI 리셋
        var allBtns = document.querySelectorAll('.filter-btn');
        allBtns.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter-value') === 'all') {
                btn.classList.add('active');
            }
        });

        self.applyFilters();
        self.updateUrlParams();
        self.updateActiveFilterBadges();
    };

    /**
     * 필터된 파트너 가져오기
     * @returns {Array} 필터된 파트너 배열
     */
    FilterService.prototype.getFilteredPartners = function() {
        return this.filteredPartners;
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.FilterService = FilterService;

})(window);

/**
 * 파트너맵 v3 - 검색 시스템
 * 책임: Fuse.js 퍼지 검색, 자동완성
 */

(function(window) {
    'use strict';

    /**
     * 검색 서비스
     * @param {Object} config - CONFIG 객체
     */
    function SearchService(config) {
        this.config = config;
        this.partners = [];
        this.fuse = null;
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 검색 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    SearchService.prototype.init = function(partners) {
        var self = this;

        self.partners = partners;

        // Fuse.js 검색 엔진 초기화
        if (typeof Fuse !== 'undefined') {
            self.fuse = new Fuse(partners, self.config.fuseOptions);
            console.log('[Search] Fuse.js 검색 초기화 완료');
        } else {
            console.warn('[Search] Fuse.js가 로드되지 않음, 기본 검색 사용');
        }

        // 이벤트 리스너 설정
        self.setupEventListeners();
    };

    /**
     * 이벤트 리스너 설정
     */
    SearchService.prototype.setupEventListeners = function() {
        var self = this;

        var searchInput = document.getElementById('pm-search-input');
        var searchBtn = document.getElementById('pm-search-btn');
        var autocomplete = document.getElementById('pm-autocomplete');

        if (!searchInput) return;

        // 입력 이벤트 (디바운스)
        var debounceTimer = null;
        searchInput.addEventListener('input', function(e) {
            var query = e.target.value.trim();

            clearTimeout(debounceTimer);

            if (query.length < self.config.searchMinLength) {
                self.hideAutocomplete();
                return;
            }

            debounceTimer = setTimeout(function() {
                self.showAutocomplete(query);
            }, self.config.debounceDelay);
        });

        // 검색 버튼 클릭
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                var query = searchInput.value.trim();
                if (query.length >= self.config.searchMinLength) {
                    self.performSearch(query);
                }
            });
        }

        // Enter 키
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var query = searchInput.value.trim();
                if (query.length >= self.config.searchMinLength) {
                    self.performSearch(query);
                }
            } else if (e.key === 'Escape') {
                self.hideAutocomplete();
            }
        });

        // 외부 클릭 시 자동완성 닫기
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && autocomplete && !autocomplete.contains(e.target)) {
                self.hideAutocomplete();
            }
        });

        // 포커스 시 자동완성 표시
        searchInput.addEventListener('focus', function() {
            var query = searchInput.value.trim();
            if (query.length >= self.config.searchMinLength) {
                self.showAutocomplete(query);
            }
        });
    };

    // ========================================
    // 검색
    // ========================================

    /**
     * 검색 수행
     * @param {string} query - 검색어
     */
    SearchService.prototype.performSearch = function(query) {
        var self = this;

        self.hideAutocomplete();

        // FilterService에 검색어 전달
        if (window.FilterService && window.FilterService.setSearch) {
            window.FilterService.setSearch(query);
        }

        console.log('[Search] 검색 수행: ' + query);
    };

    /**
     * 퍼지 검색
     * @param {string} query - 검색어
     * @returns {Array} 검색 결과 배열
     */
    SearchService.prototype.search = function(query) {
        var self = this;

        if (!query || query.length < self.config.searchMinLength) {
            return [];
        }

        var results = [];

        if (self.fuse) {
            // Fuse.js 퍼지 검색
            var fuseResults = self.fuse.search(query);
            results = fuseResults.map(function(r) {
                return r.item;
            });
        } else {
            // 기본 검색 (Fallback)
            var q = query.toLowerCase();
            results = self.partners.filter(function(p) {
                return p.name.toLowerCase().includes(q) ||
                       p.address.toLowerCase().includes(q) ||
                       (p.category && p.category.toString().toLowerCase().includes(q));
            });
        }

        return results;
    };

    // ========================================
    // 자동완성
    // ========================================

    /**
     * 자동완성 표시
     * @param {string} query - 검색어
     */
    SearchService.prototype.showAutocomplete = function(query) {
        var self = this;

        var autocomplete = document.getElementById('pm-autocomplete');
        if (!autocomplete) return;

        var results = self.search(query).slice(0, self.config.autocompleteLimit);

        if (results.length === 0) {
            self.hideAutocomplete();
            return;
        }

        var html = results.map(function(partner) {
            var escapedName = window.escapeHtml ? window.escapeHtml(partner.name) : partner.name;
            var escapedAddress = window.escapeHtml ? window.escapeHtml(partner.address) : partner.address;

            // 주소 자르기
            var shortAddress = escapedAddress.length > 30 ? escapedAddress.substring(0, 30) + '...' : escapedAddress;

            return '<li class="pm-autocomplete-item" data-partner-id="' + partner.id + '">' +
                   '<span class="pm-autocomplete-name">' + escapedName + '</span>' +
                   '<span class="pm-autocomplete-address">' + shortAddress + '</span>' +
                   '</li>';
        }).join('');

        autocomplete.innerHTML = '<ul class="pm-autocomplete-list">' + html + '</ul>';
        autocomplete.style.display = 'block';

        // 클릭 이벤트
        var items = autocomplete.querySelectorAll('.pm-autocomplete-item');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                self.selectAutocomplete(partnerId);
            });
        });
    };

    /**
     * 자동완성 숨김
     */
    SearchService.prototype.hideAutocomplete = function() {
        var autocomplete = document.getElementById('pm-autocomplete');
        if (autocomplete) {
            autocomplete.style.display = 'none';
            autocomplete.innerHTML = '';
        }
    };

    /**
     * 자동완성 선택
     * @param {string} partnerId - 파트너 ID
     */
    SearchService.prototype.selectAutocomplete = function(partnerId) {
        var self = this;

        var partner = self.partners.find(function(p) {
            return p.id == partnerId;
        });

        if (!partner) return;

        // 검색창에 이름 채우기
        var searchInput = document.getElementById('pm-search-input');
        if (searchInput) {
            searchInput.value = partner.name;
        }

        // 자동완성 닫기
        self.hideAutocomplete();

        // 파트너 상세 모달 표시
        if (window.UIService && window.UIService.showPartnerDetail) {
            window.UIService.showPartnerDetail(partner);
        }

        // 지도 이동
        if (window.MapService && window.MapService.moveTo) {
            window.MapService.moveTo(partner);
        }

        console.log('[Search] 자동완성 선택: ' + partner.name);
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 검색어 초기화
     */
    SearchService.prototype.clearSearch = function() {
        var searchInput = document.getElementById('pm-search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        this.hideAutocomplete();

        if (window.FilterService && window.FilterService.setSearch) {
            window.FilterService.setSearch('');
        }
    };

    /**
     * 검색어 가져오기
     * @returns {string} 현재 검색어
     */
    SearchService.prototype.getQuery = function() {
        var searchInput = document.getElementById('pm-search-input');
        return searchInput ? searchInput.value.trim() : '';
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.SearchService = SearchService;

})(window);

/**
 * 파트너맵 v3 - UI 컴포넌트
 * 책임: 토스트, 모달, 파트너 카드, 즐겨찾기, 공유
 */

(function(window) {
    'use strict';

    /**
     * UI 서비스
     * @param {Object} config - CONFIG 객체
     */
    function UIService(config) {
        this.config = config;
        this.partners = [];
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * UI 초기화
     */
    UIService.prototype.init = function() {
        var self = this;

        // 모달 닫기 버튼
        var modalClose = document.getElementById('pm-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                self.closeModal();
            });
        }

        // 모달 오버레이 클릭
        var modalOverlay = document.querySelector('#pm-modal .pm-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function() {
                self.closeModal();
            });
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.closeModal();
                self.closeShareModal();
            }
        });

        // 지도 리셋 버튼
        var resetMapBtn = document.getElementById('pm-reset-map-btn');
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', function() {
                if (window.MapService && window.MapService.reset) {
                    window.MapService.reset();
                    self.showToast('지도가 초기화되었습니다.', 'success');
                }
            });
        }

        console.log('[UI] UI 초기화 완료');
    };

    // ========================================
    // 로딩
    // ========================================

    /**
     * 로딩 표시
     */
    UIService.prototype.showLoading = function() {
        var loading = document.getElementById('pm-loading-overlay');
        if (loading) {
            loading.style.display = 'flex';
        }
    };

    /**
     * 로딩 숨김
     */
    UIService.prototype.hideLoading = function() {
        var loading = document.getElementById('pm-loading-overlay');
        if (loading) {
            loading.style.display = 'none';
        }
    };

    // ========================================
    // 토스트 알림
    // ========================================

    /**
     * 토스트 알림 표시
     * @param {string} message - 메시지
     * @param {string} type - 타입 ('success', 'error', 'warning', 'info')
     */
    UIService.prototype.showToast = function(message, type) {
        var self = this;
        var container = document.getElementById('pm-toast-container');
        if (!container) return;

        type = type || 'info';

        // createElement 대신 innerHTML 사용 (메이크샵 호환)
        var toastHTML = '<div class="pm-toast pm-toast-' + type + '">' +
                        (window.escapeHtml ? window.escapeHtml(message) : message) +
                        '</div>';
        container.insertAdjacentHTML('beforeend', toastHTML);

        var toast = container.lastElementChild;

        // 애니메이션
        setTimeout(function() {
            toast.classList.add('pm-toast-show');
        }, 10);

        // 자동 제거
        setTimeout(function() {
            toast.classList.remove('pm-toast-show');
            setTimeout(function() {
                container.removeChild(toast);
            }, 300);
        }, self.config.toastDuration);
    };

    // ========================================
    // 파트너 리스트
    // ========================================

    /**
     * 파트너 리스트 렌더링
     * @param {Array} partners - 파트너 배열
     */
    UIService.prototype.renderPartnerList = function(partners) {
        var self = this;
        self.partners = partners;

        var listContainer = document.getElementById('pm-partner-list');
        if (!listContainer) return;

        if (partners.length === 0) {
            listContainer.innerHTML = '<p class="pm-empty-message">검색 결과가 없습니다.</p>';
            return;
        }

        var html = partners.map(function(partner) {
            return self.createPartnerCardHTML(partner);
        }).join('');

        listContainer.innerHTML = html;

        // 카드 클릭 이벤트
        var cards = listContainer.querySelectorAll('.pm-partner-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function(e) {
                // 즐겨찾기 버튼 클릭은 제외
                if (e.target.classList.contains('pm-favorite-btn') ||
                    e.target.closest('.pm-favorite-btn')) {
                    return;
                }

                var partnerId = this.getAttribute('data-partner-id');
                var partner = partners.find(function(p) {
                    return p.id == partnerId;
                });

                if (partner) {
                    self.showPartnerDetail(partner);

                    // 지도 이동
                    if (window.MapService && window.MapService.moveTo) {
                        window.MapService.moveTo(partner);
                    }
                }
            });
        });

        console.log('[UI] 파트너 리스트 렌더링 완료 (' + partners.length + '개)');
    };

    /**
     * 파트너 카드 HTML 생성
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    UIService.prototype.createPartnerCardHTML = function(partner) {
        var self = this;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIconClass = isFavorite ? 'ph-fill ph-heart' : 'ph ph-heart';
        var favoriteIcon = '<i class="' + favoriteIconClass + '"></i>';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');

        // 카테고리 태그
        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        // 거리 표시 (있는 경우)
        var distanceHtml = '';
        if (partner.distance !== undefined) {
            distanceHtml = '<span class="pm-distance-badge"><i class="ph ph-ruler"></i> ' + partner.distance.toFixed(1) + 'km</span>';
        }

        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '" role="article" aria-label="' + escapedName + ' 업체 정보">' +
               '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
               'data-partner-id="' + partner.id + '" ' +
               'onclick="window.UIService.toggleFavorite(\'' + partner.id + '\', event)" ' +
               'title="즐겨찾기" ' +
               'aria-label="' + escapedName + ' ' + (isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가') + '">' +
               favoriteIcon +
               '</button>' +
               (distanceHtml ? '<div class="pm-distance-indicator">' + distanceHtml + '</div>' : '') +
               '<div class="pm-partner-logo">' +
               '<img src="' + logoUrl + '" ' +
               'alt="' + escapedName + '" ' +
               'onerror="this.src=\'' + self.config.defaultLogoPath + '\'">' +
               '</div>' +
               '<div class="pm-partner-info">' +
               '<h4>' + escapedName + '</h4>' +
               '<div class="pm-partner-categories">' + categoryTags + '</div>' +
               '<p class="pm-partner-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone"><i class="ph ph-phone"></i> ' + escapedPhone + '</p>' +
               '</div>' +
               '</div>';
    };

    // ========================================
    // 모달
    // ========================================

    /**
     * 파트너 상세 모달 표시
     * @param {Object} partner - 파트너 데이터
     */
    UIService.prototype.showPartnerDetail = function(partner) {
        var self = this;

        var modal = document.getElementById('pm-modal');
        var modalBody = document.getElementById('pm-modal-body');
        if (!modal || !modalBody) return;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIconClass = isFavorite ? 'ph-fill ph-heart' : 'ph ph-heart';
        var favoriteIcon = '<i class="' + favoriteIconClass + '"></i>';
        var favoriteText = isFavorite ? '즐겨찾기됨' : '즐겨찾기';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');
        var escapedEmail = partner.email ? window.escapeHtml(partner.email) : '';
        var escapedDescription = partner.description ? window.escapeHtml(partner.description) : '소개 정보가 없습니다.';

        // 카테고리 태그
        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        var html = '<div class="pm-modal-header">' +
                   '<img src="' + logoUrl + '" ' +
                   'alt="' + escapedName + '" ' +
                   'onerror="this.src=\'' + self.config.defaultLogoPath + '\'">' +
                   '<h2>' + escapedName + '</h2>' +
                   (categoryTags ? '<div class="pm-partner-categories">' + categoryTags + '</div>' : '') +
                   '</div>' +
                   '<div class="pm-modal-actions">' +
                   '<button class="pm-action-btn pm-favorite-btn ' + favoriteClass + '" ' +
                   'onclick="window.UIService.toggleFavorite(\'' + partner.id + '\')" ' +
                   'data-partner-id="' + partner.id + '" ' +
                   'aria-label="' + favoriteText + '">' +
                   favoriteIcon + ' ' + favoriteText +
                   '</button>' +
                   '<button class="pm-action-btn pm-share-btn" ' +
                   'onclick="window.UIService.showShareModal(\'' + partner.id + '\')" ' +
                   'aria-label="' + escapedName + ' 공유하기">' +
                   '<i class="ph ph-share-network"></i> 공유하기' +
                   '</button>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>소개</h3>' +
                   '<p>' + escapedDescription + '</p>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>위치 정보</h3>' +
                   '<p class="pm-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
                   '<div class="pm-navigation-buttons">' +
                   '<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" rel="noopener noreferrer" ' +
                   'class="pm-nav-btn pm-nav-naver" ' +
                   'aria-label="네이버 지도에서 ' + escapedName + ' 위치 보기">' +
                   '<i class="ph ph-map-trifold"></i> 네이버 지도</a>' +
                   '<a href="https://map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" rel="noopener noreferrer" ' +
                   'class="pm-nav-btn pm-nav-kakao" ' +
                   'aria-label="카카오맵에서 ' + escapedName + ' 위치 보기">' +
                   '<i class="ph ph-map-trifold"></i> 카카오맵</a>' +
                   '</div>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>연락처</h3>' +
                   '<p><i class="ph ph-phone"></i> <a href="tel:' + partner.phone + '">' + escapedPhone + '</a></p>' +
                   (escapedEmail ? '<p><i class="ph ph-envelope-simple"></i> <a href="mailto:' + partner.email + '">' + escapedEmail + '</a></p>' : '') +
                   '</div>';

        // 홈페이지, 인스타그램
        if (partner.homepage || partner.instagram) {
            html += '<div class="pm-modal-section">' +
                    '<h3>링크</h3>';

            if (partner.homepage) {
                html += '<p><i class="ph ph-globe"></i> <a href="' + partner.homepage + '" target="_blank">홈페이지</a></p>';
            }

            if (partner.instagram) {
                var instagramUrl = partner.instagram.startsWith('http') ? partner.instagram : 'https://instagram.com/' + partner.instagram;
                html += '<p><i class="ph ph-camera"></i> <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
            }

            html += '</div>';
        }

        modalBody.innerHTML = html;

        modal.classList.add('pm-modal-active');
        document.body.style.overflow = 'hidden';
    };

    /**
     * 모달 닫기
     */
    UIService.prototype.closeModal = function() {
        var modal = document.getElementById('pm-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
            document.body.style.overflow = '';
        }
    };

    // ========================================
    // 즐겨찾기
    // ========================================

    /**
     * 즐겨찾기 토글
     * @param {string} partnerId - 파트너 ID
     * @param {Event} event - 이벤트 (선택)
     */
    UIService.prototype.toggleFavorite = function(partnerId, event) {
        var self = this;

        if (event) {
            event.stopPropagation();
        }

        var favorites = self.getFavorites();
        var index = favorites.indexOf(partnerId);

        if (index === -1) {
            // 추가
            favorites.push(partnerId);
            self.showToast('즐겨찾기에 추가되었습니다.', 'success');
        } else {
            // 제거
            favorites.splice(index, 1);
            self.showToast('즐겨찾기에서 제거되었습니다.', 'info');
        }

        self.saveFavorites(favorites);
        self.updateFavoriteButtons();
    };

    /**
     * 즐겨찾기 여부 확인
     * @param {string} partnerId - 파트너 ID
     * @returns {boolean}
     */
    UIService.prototype.isFavorite = function(partnerId) {
        var favorites = this.getFavorites();
        return favorites.includes(partnerId);
    };

    /**
     * 즐겨찾기 목록 가져오기
     * @returns {Array} 파트너 ID 배열
     */
    UIService.prototype.getFavorites = function() {
        var self = this;
        try {
            var favorites = localStorage.getItem(self.config.favoritesKey);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('[UI] 즐겨찾기 로드 오류:', error);
            return [];
        }
    };

    /**
     * 즐겨찾기 목록 저장
     * @param {Array} favorites - 파트너 ID 배열
     */
    UIService.prototype.saveFavorites = function(favorites) {
        var self = this;
        try {
            localStorage.setItem(self.config.favoritesKey, JSON.stringify(favorites));
        } catch (error) {
            console.error('[UI] 즐겨찾기 저장 오류:', error);
        }
    };

    /**
     * 즐겨찾기 버튼 업데이트
     */
    UIService.prototype.updateFavoriteButtons = function() {
        var self = this;

        var buttons = document.querySelectorAll('.pm-favorite-btn');
        buttons.forEach(function(btn) {
            var partnerId = btn.getAttribute('data-partner-id');
            var isFav = self.isFavorite(partnerId);

            if (isFav) {
                btn.classList.add('active');
                var hasText = btn.textContent.includes('즐겨찾기됨');
                btn.innerHTML = hasText ? '<i class="ph-fill ph-heart"></i> 즐겨찾기됨' : '<i class="ph-fill ph-heart"></i>';
            } else {
                btn.classList.remove('active');
                var hasText = btn.textContent.includes('즐겨찾기');
                btn.innerHTML = hasText ? '<i class="ph ph-heart"></i> 즐겨찾기' : '<i class="ph ph-heart"></i>';
            }
        });
    };

    // ========================================
    // 공유
    // ========================================

    /**
     * 공유 모달 표시
     * @param {string} partnerId - 파트너 ID
     */
    UIService.prototype.showShareModal = function(partnerId) {
        var self = this;

        var modal = document.getElementById('pm-share-modal');
        if (!modal) return;

        modal.classList.add('pm-modal-active');

        // 공유 링크 (기존 쿼리 파라미터 유지)
        var baseUrl = window.location.origin + window.location.pathname;
        var existingParams = window.location.search;
        var shareUrl;

        if (existingParams && existingParams.length > 1) {
            // 기존 파라미터가 있으면 & 로 추가
            shareUrl = baseUrl + existingParams + '&partner=' + partnerId;
        } else {
            // 기존 파라미터가 없으면 ? 로 시작
            shareUrl = baseUrl + '?partner=' + partnerId;
        }

        // 링크 복사 버튼
        var copyBtn = document.getElementById('pm-share-copy');
        if (copyBtn) {
            copyBtn.onclick = function() {
                self.copyLink(shareUrl);
            };
        }

        // 카카오톡 공유 버튼
        var kakaoBtn = document.getElementById('pm-share-kakao');
        if (kakaoBtn) {
            kakaoBtn.onclick = function() {
                self.shareKakao(partnerId);
            };
        }
    };

    /**
     * 공유 모달 닫기
     */
    UIService.prototype.closeShareModal = function() {
        var modal = document.getElementById('pm-share-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
        }
    };

    /**
     * 링크 복사
     * @param {string} url - 복사할 URL
     */
    UIService.prototype.copyLink = function(url) {
        var self = this;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(function() {
                    self.showToast('링크가 복사되었습니다.', 'success');
                    self.closeShareModal();
                })
                .catch(function(error) {
                    console.error('[UI] 링크 복사 오류:', error);
                    self.showToast('링크 복사에 실패했습니다.', 'error');
                });
        } else {
            // Fallback - HTML에 미리 만들어진 요소 사용 (createElement 제거)
            var textarea = document.getElementById('pm-clipboard-helper');
            if (!textarea) {
                self.showToast('클립보드 복사를 지원하지 않는 브라우저입니다.', 'error');
                return;
            }

            textarea.value = url;
            textarea.style.display = 'block';
            textarea.select();

            try {
                document.execCommand('copy');
                self.showToast('링크가 복사되었습니다.', 'success');
                self.closeShareModal();
            } catch (error) {
                console.error('[UI] 링크 복사 오류:', error);
                self.showToast('링크 복사에 실패했습니다.', 'error');
            }

            textarea.style.display = 'none';
            textarea.value = '';
        }
    };

    /**
     * 카카오톡 공유
     * @param {string} partnerId - 파트너 ID
     */
    UIService.prototype.shareKakao = function(partnerId) {
        var self = this;

        // 카카오톡 공유는 카카오 SDK 필요
        // 여기서는 간단한 알림만 표시
        self.showToast('카카오톡 공유 기능은 준비 중입니다.', 'info');
        self.closeShareModal();
    };

    // ========================================
    // 전역 등록
    // ========================================

    // 전역 인스턴스 (이벤트 핸들러에서 접근하기 위해)
    window.UIService = null;

    // 생성자만 등록
    window.UIServiceClass = UIService;

    // 전역 헬퍼 함수 (HTML onclick에서 사용)
    window.closeShareModal = function() {
        if (window.UIService) {
            window.UIService.closeShareModal();
        }
    };

})(window);

/**
 * 파트너맵 v3 - 메인 스크립트
 * 책임: 초기화 오케스트레이터, 모듈 통합, 이벤트 핸들러
 */

(function(window) {
    'use strict';

    // ========================================
    // 전역 인스턴스
    // ========================================

    var apiClient = null;
    var mapService = null;
    var filterService = null;
    var searchService = null;
    var uiService = null;

    // ========================================
    // 유틸리티 함수
    // ========================================

    /**
     * HTML 이스케이프 (XSS 방지)
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    window.escapeHtml = function(text) {
        if (!text) return '';

        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return String(text).replace(/[&<>"']/g, function(m) {
            return map[m];
        });
    };

    /**
     * 디바운스 함수
     * @param {Function} func - 디바운스할 함수
     * @param {number} wait - 대기 시간 (밀리초)
     * @returns {Function} 디바운스된 함수
     */
    window.debounce = function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    };

    // ========================================
    // GPS 기능
    // ========================================

    /**
     * GPS 버튼 설정
     */
    function setupGPSButton() {
        var gpsBtn = document.getElementById('pm-gps-btn');
        if (!gpsBtn) return;

        gpsBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                uiService.showToast('GPS를 지원하지 않는 브라우저입니다.', 'error');
                return;
            }

            uiService.showToast('위치 정보를 가져오는 중...', 'info');

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

                    console.log('[GPS] 현재 위치:', lat, lng);

                    // 지도 이동
                    if (mapService) {
                        mapService.setReferencePoint(lat, lng);
                    }

                    // 필터 서비스에 기준점 설정
                    if (filterService) {
                        filterService.setReferencePoint(lat, lng);

                        // 거리순 정렬로 변경
                        var sortSelect = document.getElementById('pm-sort-select');
                        if (sortSelect) {
                            sortSelect.value = 'distance';
                            filterService.applyFilters();
                        }
                    }

                    uiService.showToast('현재 위치로 이동했습니다.', 'success');
                },
                function(error) {
                    console.error('[GPS] 위치 정보 오류:', error);

                    var message = CONFIG.errorMessages.gpsError;
                    if (error.code === 1) {
                        message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                    } else if (error.code === 2) {
                        message = '위치 정보를 사용할 수 없습니다.';
                    } else if (error.code === 3) {
                        message = '위치 정보 요청 시간이 초과되었습니다.';
                    }

                    uiService.showToast(message, 'error');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * 기준점 초기화 버튼 설정
     */
    function setupClearReferenceButton() {
        var clearBtn = document.getElementById('pm-clear-reference-btn');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', function() {
            if (mapService) {
                mapService.clearReferencePoint();
            }

            var sortSelect = document.getElementById('pm-sort-select');
            if (sortSelect) {
                sortSelect.value = 'name';
            }

            if (filterService) {
                filterService.applyFilters();
            }

            clearBtn.style.display = 'none';
            uiService.showToast('기준점이 초기화되었습니다.', 'info');
        });
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 파트너맵 초기화 (메이크샵 호환: Promise 체이닝)
     */
    function initPartnerMap() {
        console.log('[Main] 파트너맵 v3 초기화 시작');

        // 0. 설정 검증
        var validation = CONFIG.validate();
        if (!validation.isValid) {
            console.error('[Main] 설정 오류:', validation.errors);
            validation.errors.forEach(function(error) {
                console.error('  - ' + error);
            });
        }

        // 1. UI 서비스 초기화 (로딩 표시를 위해 가장 먼저)
        uiService = new window.UIServiceClass(CONFIG);
        window.UIService = uiService;  // 전역 인스턴스 등록
        uiService.showLoading();

        // 2. API 클라이언트 초기화
        apiClient = new window.PartnerAPI(CONFIG);
        console.log('[Main] API 클라이언트 생성 완료');

        // 3. 네이버 지도 SDK 로드
        mapService = new window.MapService(CONFIG);
        window.MapService = mapService;  // 전역 인스턴스 등록

        // Promise 체이닝으로 비동기 처리
        mapService.loadSDK()
            .then(function() {
                // 4. 파트너 데이터 로드
                console.log('[Main] 파트너 데이터 로드 시작...');
                return apiClient.loadPartnerData();
            })
            .then(function(partners) {
                console.log('[Main] 파트너 데이터 로드 완료 (' + partners.length + '개)');

                // 5. 지도 초기화
                mapService.init('naverMap');
                console.log('[Main] 지도 초기화 완료');

                // 6. 필터 서비스 초기화
                filterService = new window.FilterService(CONFIG);
                window.FilterService = filterService;  // 전역 인스턴스 등록
                filterService.init(partners);

                // 7. 검색 서비스 초기화
                searchService = new window.SearchService(CONFIG);
                window.SearchService = searchService;  // 전역 인스턴스 등록
                searchService.init(partners);

                // 8. UI 서비스 초기화 (이벤트 리스너)
                uiService.init();

                // 9. 마커 생성
                mapService.createMarkers(partners);

                // 10. 파트너 리스트 렌더링
                uiService.renderPartnerList(partners);

                // 11. GPS 버튼 설정
                setupGPSButton();

                // 12. 기준점 초기화 버튼 설정
                setupClearReferenceButton();

                // 13. URL 파라미터 처리 (특정 파트너 직접 접근)
                handleUrlParams(partners);

                // 14. 로딩 숨김
                uiService.hideLoading();

                // 15. 성공 알림
                uiService.showToast(partners.length + '개의 제휴 업체를 불러왔습니다.', 'success');

                console.log('[Main] 초기화 완료');
            })
            .catch(function(error) {
                console.error('[Main] 초기화 실패:', error);

                if (uiService) {
                    uiService.hideLoading();
                    uiService.showToast('지도를 불러오는 중 오류가 발생했습니다.', 'error');
                }

                // 오류 메시지 표시 - createElement 대신 미리 만들어진 요소 사용
                var errorDiv = document.getElementById('pm-error-message');
                if (errorDiv) {
                    errorDiv.style.cssText = 'display: block; padding: 40px; text-align: center; color: #F44336;';
                    errorDiv.innerHTML = '<h2>오류 발생</h2><p>' + CONFIG.errorMessages.apiError + '</p>' +
                                         '<p style="font-size: 14px; color: #808080;">자세한 내용은 콘솔을 확인해주세요.</p>';
                }
            });
    }

    /**
     * URL 파라미터 처리
     * @param {Array} partners - 파트너 배열
     */
    function handleUrlParams(partners) {
        var urlParams = new URLSearchParams(window.location.search);
        var partnerId = urlParams.get('partner');

        if (partnerId) {
            var partner = partners.find(function(p) {
                return p.id == partnerId;
            });

            if (partner) {
                console.log('[Main] URL 파라미터로 파트너 직접 접근:', partner.name);

                // 모달 표시
                setTimeout(function() {
                    uiService.showPartnerDetail(partner);

                    // 지도 이동
                    if (mapService) {
                        mapService.moveTo(partner);
                    }
                }, 500);
            }
        }
    }

    // ========================================
    // 페이지 로드 시 초기화
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPartnerMap);
    } else {
        initPartnerMap();
    }

    // ========================================
    // 전역 등록 (디버깅용)
    // ========================================

    window.PartnerMapApp = {
        apiClient: function() { return apiClient; },
        mapService: function() { return mapService; },
        filterService: function() { return filterService; },
        searchService: function() { return searchService; },
        uiService: function() { return uiService; },
        config: CONFIG
    };

})(window);
