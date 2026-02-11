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

        // 📍 마커 생성
        self.referencePointMarker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: '<div style="width:40px;height:40px;line-height:40px;' +
                         'text-align:center;font-size:28px;' +
                         'animation:pulse 1.5s infinite;">📍</div>',
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
