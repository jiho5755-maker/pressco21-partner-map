/*
================================================
  메이크샵 D4 배포 - JS Part 1/3
================================================
  포함: config.js + api.js + search.js
  크기: 약 25KB
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

// ========================================

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

// ========================================

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
