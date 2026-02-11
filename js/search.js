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
