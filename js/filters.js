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
                    self.filteredPartners.sort(function(a, b) {
                        var distA = self.calculateDistance(
                            self.referencePoint.lat,
                            self.referencePoint.lng,
                            a.latitude,
                            a.longitude
                        );
                        var distB = self.calculateDistance(
                            self.referencePoint.lat,
                            self.referencePoint.lng,
                            b.latitude,
                            b.longitude
                        );
                        return distA - distB;
                    });
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
