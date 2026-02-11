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
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');

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
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
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
            distanceHtml = '<span class="pm-distance-badge">📏 ' + partner.distance.toFixed(1) + 'km</span>';
        }

        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '">' +
               '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
               'data-partner-id="' + partner.id + '" ' +
               'onclick="window.UIService.toggleFavorite(\'' + partner.id + '\', event)" ' +
               'title="즐겨찾기">' +
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
               '<p class="pm-partner-address">📍 ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone">📞 ' + escapedPhone + '</p>' +
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
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
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
                   'data-partner-id="' + partner.id + '">' +
                   favoriteIcon + ' ' + favoriteText +
                   '</button>' +
                   '<button class="pm-action-btn pm-share-btn" ' +
                   'onclick="window.UIService.showShareModal(\'' + partner.id + '\')">' +
                   '📤 공유하기' +
                   '</button>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>소개</h3>' +
                   '<p>' + escapedDescription + '</p>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>위치 정보</h3>' +
                   '<p class="pm-address">📍 ' + escapedAddress + '</p>' +
                   '<div class="pm-navigation-buttons">' +
                   '<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" class="pm-nav-btn pm-nav-naver">🗺️ 네이버 지도</a>' +
                   '<a href="https://map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" class="pm-nav-btn pm-nav-kakao">🗺️ 카카오맵</a>' +
                   '</div>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>연락처</h3>' +
                   '<p>📞 <a href="tel:' + partner.phone + '">' + escapedPhone + '</a></p>' +
                   (escapedEmail ? '<p>📧 <a href="mailto:' + partner.email + '">' + escapedEmail + '</a></p>' : '') +
                   '</div>';

        // 홈페이지, 인스타그램
        if (partner.homepage || partner.instagram) {
            html += '<div class="pm-modal-section">' +
                    '<h3>링크</h3>';

            if (partner.homepage) {
                html += '<p>🌐 <a href="' + partner.homepage + '" target="_blank">홈페이지</a></p>';
            }

            if (partner.instagram) {
                var instagramUrl = partner.instagram.startsWith('http') ? partner.instagram : 'https://instagram.com/' + partner.instagram;
                html += '<p>📷 <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
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
                btn.textContent = btn.textContent.includes('즐겨찾기됨') ? '❤️ 즐겨찾기됨' : '❤️';
            } else {
                btn.classList.remove('active');
                btn.textContent = btn.textContent.includes('즐겨찾기') ? '🤍 즐겨찾기' : '🤍';
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

        // 공유 링크
        var shareUrl = window.location.origin + window.location.pathname + '?partner=' + partnerId;

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
     * 파트너맵 초기화
     */
    async function initPartnerMap() {
        try {
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
            await mapService.loadSDK();

            // 4. 파트너 데이터 로드
            console.log('[Main] 파트너 데이터 로드 시작...');
            var partners = await apiClient.loadPartnerData();
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

        } catch (error) {
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
        }
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
