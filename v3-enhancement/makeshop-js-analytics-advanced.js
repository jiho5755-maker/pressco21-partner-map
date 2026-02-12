/**
 * 파트너맵 v3 - 고급 분석 시스템
 * 책임: 실시간 인기 파트너, 검색어 자동완성, 대시보드
 * 메이크샵 D4 호환: ES5 문법, IIFE 패턴, 템플릿 리터럴 이스케이프
 * 파일 크기: 약 28KB
 */

(function(window) {
    'use strict';

    // ========================================
    // 실시간 인기 파트너 서비스
    // ========================================

    /**
     * 인기 파트너 서비스
     * @param {Object} config - CONFIG 객체
     */
    function PopularPartnersService(config) {
        this.config = config;
        this.partners = [];
        this.updateInterval = 30000;  // 30초
        this.topCount = 10;
        this.intervalId = null;
        this.previousRanks = {};  // 이전 순위 저장
    }

    /**
     * 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    PopularPartnersService.prototype.init = function(partners) {
        var self = this;
        self.partners = partners;

        // 초기 렌더링
        self.renderPopularPartners();

        // 자동 업데이트 시작
        self.startAutoUpdate();

        console.log('[PopularPartners] 인기 파트너 서비스 초기화 완료');
    };

    /**
     * 인기 파트너 조회 (24시간 기준)
     * @returns {Array} 인기 파트너 ID 배열
     */
    PopularPartnersService.prototype.getPopularPartners = function() {
        var self = this;

        try {
            var viewCountKey = 'fresco21_partner_views_v3';
            var viewCounts = localStorage.getItem(viewCountKey);
            var counts = viewCounts ? JSON.parse(viewCounts) : {};

            var now = Date.now();
            var oneDayAgo = now - 24 * 60 * 60 * 1000;

            // 24시간 이내 데이터만 필터링
            var recentViews = {};
            for (var partnerId in counts) {
                var viewData = counts[partnerId];

                // 새 형식: { viewCount, lastViewed }
                if (typeof viewData === 'object' && viewData.lastViewed) {
                    if (viewData.lastViewed > oneDayAgo) {
                        recentViews[partnerId] = viewData.viewCount || 0;
                    }
                }
                // 구 형식: 숫자
                else if (typeof viewData === 'number') {
                    recentViews[partnerId] = viewData;
                }
            }

            // 조회수 기준 정렬
            var sorted = Object.keys(recentViews).sort(function(a, b) {
                return recentViews[b] - recentViews[a];
            });

            // Top N 반환
            return sorted.slice(0, self.topCount);

        } catch (error) {
            console.error('[PopularPartners] 인기 파트너 조회 오류:', error);
            return [];
        }
    };

    /**
     * 파트너 ID로 파트너 객체 가져오기
     * @param {string} partnerId - 파트너 ID
     * @returns {Object|null} 파트너 객체
     */
    PopularPartnersService.prototype.getPartnerById = function(partnerId) {
        var self = this;

        return self.partners.find(function(p) {
            return String(p.id) === String(partnerId);
        }) || null;
    };

    /**
     * 조회수 가져오기
     * @param {string} partnerId - 파트너 ID
     * @returns {number} 조회수
     */
    PopularPartnersService.prototype.getViewCount = function(partnerId) {
        try {
            var viewCountKey = 'fresco21_partner_views_v3';
            var viewCounts = localStorage.getItem(viewCountKey);
            var counts = viewCounts ? JSON.parse(viewCounts) : {};

            var viewData = counts[String(partnerId)];

            if (typeof viewData === 'object' && viewData.viewCount) {
                return viewData.viewCount;
            } else if (typeof viewData === 'number') {
                return viewData;
            }

            return 0;

        } catch (error) {
            console.error('[PopularPartners] 조회수 조회 오류:', error);
            return 0;
        }
    };

    /**
     * 순위 변동 계산
     * @param {string} partnerId - 파트너 ID
     * @param {number} currentRank - 현재 순위
     * @returns {number} 순위 변동 (양수: 상승, 음수: 하락, 0: 변동없음)
     */
    PopularPartnersService.prototype.getRankChange = function(partnerId, currentRank) {
        var self = this;

        var previousRank = self.previousRanks[partnerId];

        if (!previousRank) {
            return 0;  // 신규 진입
        }

        return previousRank - currentRank;  // 양수면 상승
    };

    /**
     * 현재 순위 저장
     * @param {Array} popularIds - 인기 파트너 ID 배열
     */
    PopularPartnersService.prototype.saveCurrentRanks = function(popularIds) {
        var self = this;

        popularIds.forEach(function(partnerId, index) {
            self.previousRanks[partnerId] = index + 1;
        });
    };

    /**
     * 인기 파트너 렌더링
     */
    PopularPartnersService.prototype.renderPopularPartners = function() {
        var self = this;

        var container = document.getElementById('pm-popular-partners');
        if (!container) return;

        var popularIds = self.getPopularPartners();

        if (popularIds.length === 0) {
            container.innerHTML = '<p class="pm-popular-empty">아직 인기 파트너가 없습니다.</p>';
            return;
        }

        var html = '<h3 class="pm-popular-title">실시간 인기 파트너 Top 10</h3>' +
                   '<ul class="pm-popular-list">';

        popularIds.forEach(function(partnerId, index) {
            var partner = self.getPartnerById(partnerId);
            if (!partner) return;

            var rank = index + 1;
            var rankChange = self.getRankChange(partnerId, rank);
            var arrow = '';
            var changeClass = '';

            if (rankChange > 0) {
                arrow = '▲';
                changeClass = 'up';
            } else if (rankChange < 0) {
                arrow = '▼';
                changeClass = 'down';
            } else {
                arrow = '━';
                changeClass = 'same';
            }

            var viewCount = self.getViewCount(partnerId);

            html += '<li class="pm-popular-item" data-partner-id="' + partnerId + '">' +
                    '<span class="pm-popular-rank">' + rank + '</span>' +
                    '<span class="pm-popular-change ' + changeClass + '">' + arrow + '</span>' +
                    '<span class="pm-popular-name">' + window.escapeHtml(partner.name) + '</span>' +
                    '<span class="pm-popular-views">' + viewCount + '회</span>' +
                    '</li>';
        });

        html += '</ul>';
        container.innerHTML = html;

        // 현재 순위 저장
        self.saveCurrentRanks(popularIds);

        // 클릭 이벤트 등록
        self.attachClickEvents();

        console.log('[PopularPartners] 인기 파트너 렌더링 완료 (' + popularIds.length + '개)');
    };

    /**
     * 클릭 이벤트 등록
     */
    PopularPartnersService.prototype.attachClickEvents = function() {
        var self = this;

        var items = document.querySelectorAll('.pm-popular-item');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                var partner = self.getPartnerById(partnerId);

                if (partner) {
                    // 파트너 상세 모달 표시
                    if (window.UIService && window.UIService.showPartnerDetail) {
                        window.UIService.showPartnerDetail(partner);
                    }

                    // 지도 이동
                    if (window.MapService && window.MapService.moveTo) {
                        window.MapService.moveTo(partner);
                    }
                }
            });
        });
    };

    /**
     * 자동 업데이트 시작
     */
    PopularPartnersService.prototype.startAutoUpdate = function() {
        var self = this;

        self.intervalId = setInterval(function() {
            self.renderPopularPartners();
        }, self.updateInterval);

        console.log('[PopularPartners] 자동 업데이트 시작 (30초 간격)');
    };

    /**
     * 자동 업데이트 중지
     */
    PopularPartnersService.prototype.stopAutoUpdate = function() {
        var self = this;

        if (self.intervalId) {
            clearInterval(self.intervalId);
            self.intervalId = null;
            console.log('[PopularPartners] 자동 업데이트 중지');
        }
    };

    // ========================================
    // 검색어 자동완성 서비스 (고급)
    // ========================================

    /**
     * 자동완성 서비스
     * @param {Object} config - CONFIG 객체
     */
    function AutocompleteService(config) {
        this.config = config;
        this.partners = [];
        this.suggestions = [];
        this.recentSearches = [];
        this.selectedIndex = -1;
        this.maxRecentSearches = 10;
        this.maxSuggestions = 5;
    }

    /**
     * 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    AutocompleteService.prototype.init = function(partners) {
        var self = this;

        self.partners = partners;

        // 최근 검색어 로드
        self.loadRecentSearches();

        // 이벤트 리스너 설정
        self.setupEventListeners();

        console.log('[Autocomplete] 자동완성 서비스 초기화 완료');
    };

    /**
     * 이벤트 리스너 설정
     */
    AutocompleteService.prototype.setupEventListeners = function() {
        var self = this;

        var input = document.getElementById('pm-search-input');
        var container = document.getElementById('pm-autocomplete-suggestions');

        if (!input || !container) return;

        // 입력 이벤트
        input.addEventListener('input', function(e) {
            var query = e.target.value.trim();

            if (query.length >= 2) {
                self.showSuggestions(query);
            } else {
                self.hideSuggestions();
            }
        });

        // 키보드 네비게이션
        input.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                self.selectNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                self.selectPrevious();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                self.applySelected();
            } else if (e.key === 'Escape') {
                self.hideSuggestions();
            }
        });

        // 포커스 시 최근 검색어 표시
        input.addEventListener('focus', function() {
            var query = input.value.trim();
            if (query.length === 0) {
                self.showRecentSearches();
            }
        });

        // 외부 클릭 시 숨김
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !container.contains(e.target)) {
                self.hideSuggestions();
            }
        });
    };

    /**
     * 제안 표시
     * @param {string} query - 검색어
     */
    AutocompleteService.prototype.showSuggestions = function(query) {
        var self = this;

        self.suggestions = [];

        // 1. 파트너 이름 검색
        if (window.SearchService && window.SearchService.search) {
            var results = window.SearchService.search(query);
            results.slice(0, 3).forEach(function(partner) {
                self.suggestions.push({
                    type: 'partner',
                    text: partner.name,
                    subtitle: partner.address,
                    data: partner
                });
            });
        }

        // 2. 최근 검색어 매칭
        self.recentSearches.forEach(function(search) {
            if (search.toLowerCase().includes(query.toLowerCase())) {
                self.suggestions.push({
                    type: 'recent',
                    text: search,
                    subtitle: '최근 검색'
                });
            }
        });

        // 3. 카테고리 매칭
        var categories = self.extractUniqueCategories();
        categories.forEach(function(category) {
            if (category.toLowerCase().includes(query.toLowerCase())) {
                self.suggestions.push({
                    type: 'category',
                    text: category,
                    subtitle: '카테고리'
                });
            }
        });

        // 중복 제거 및 제한
        self.suggestions = self.removeDuplicates(self.suggestions, 'text');
        self.suggestions = self.suggestions.slice(0, self.maxSuggestions);

        self.renderSuggestions();
    };

    /**
     * 최근 검색어 표시
     */
    AutocompleteService.prototype.showRecentSearches = function() {
        var self = this;

        if (self.recentSearches.length === 0) {
            self.hideSuggestions();
            return;
        }

        self.suggestions = self.recentSearches.slice(0, 5).map(function(search) {
            return {
                type: 'recent',
                text: search,
                subtitle: '최근 검색'
            };
        });

        self.renderSuggestions();
    };

    /**
     * 제안 렌더링
     */
    AutocompleteService.prototype.renderSuggestions = function() {
        var self = this;

        var container = document.getElementById('pm-autocomplete-suggestions');
        if (!container) return;

        if (self.suggestions.length === 0) {
            self.hideSuggestions();
            return;
        }

        var html = '';

        self.suggestions.forEach(function(suggestion, index) {
            var icon = 'ph-magnifying-glass';

            if (suggestion.type === 'recent') {
                icon = 'ph-clock-counter-clockwise';
            } else if (suggestion.type === 'category') {
                icon = 'ph-tag';
            } else if (suggestion.type === 'partner') {
                icon = 'ph-map-pin';
            }

            var selectedClass = index === self.selectedIndex ? 'selected' : '';

            html += '<div class="pm-suggestion-item ' + selectedClass + '" data-index="' + index + '">' +
                    '<i class="ph ' + icon + '"></i>' +
                    '<div class="pm-suggestion-text">' +
                    '<div class="pm-suggestion-main">' + window.escapeHtml(suggestion.text) + '</div>' +
                    '<div class="pm-suggestion-sub">' + window.escapeHtml(suggestion.subtitle) + '</div>' +
                    '</div>' +
                    '</div>';
        });

        container.innerHTML = html;
        container.style.display = 'block';

        // 클릭 이벤트 등록
        self.attachSuggestionClickEvents();
    };

    /**
     * 제안 클릭 이벤트 등록
     */
    AutocompleteService.prototype.attachSuggestionClickEvents = function() {
        var self = this;

        var items = document.querySelectorAll('.pm-suggestion-item');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'), 10);
                self.selectedIndex = index;
                self.applySelected();
            });
        });
    };

    /**
     * 제안 숨김
     */
    AutocompleteService.prototype.hideSuggestions = function() {
        var container = document.getElementById('pm-autocomplete-suggestions');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }

        this.selectedIndex = -1;
    };

    /**
     * 다음 항목 선택
     */
    AutocompleteService.prototype.selectNext = function() {
        var self = this;

        if (self.suggestions.length === 0) return;

        self.selectedIndex++;
        if (self.selectedIndex >= self.suggestions.length) {
            self.selectedIndex = 0;
        }

        self.renderSuggestions();
    };

    /**
     * 이전 항목 선택
     */
    AutocompleteService.prototype.selectPrevious = function() {
        var self = this;

        if (self.suggestions.length === 0) return;

        self.selectedIndex--;
        if (self.selectedIndex < 0) {
            self.selectedIndex = self.suggestions.length - 1;
        }

        self.renderSuggestions();
    };

    /**
     * 선택 적용
     */
    AutocompleteService.prototype.applySelected = function() {
        var self = this;

        var suggestion = self.suggestions[self.selectedIndex];
        if (!suggestion) return;

        var input = document.getElementById('pm-search-input');
        if (!input) return;

        // 입력창에 텍스트 설정
        input.value = suggestion.text;

        // 최근 검색어 저장
        self.saveSearch(suggestion.text);

        // 제안 숨김
        self.hideSuggestions();

        // 검색 수행
        if (window.SearchService && window.SearchService.performSearch) {
            window.SearchService.performSearch(suggestion.text);
        }

        // 파트너인 경우 상세 표시
        if (suggestion.type === 'partner' && suggestion.data) {
            if (window.UIService && window.UIService.showPartnerDetail) {
                window.UIService.showPartnerDetail(suggestion.data);
            }

            if (window.MapService && window.MapService.moveTo) {
                window.MapService.moveTo(suggestion.data);
            }
        }
    };

    /**
     * 최근 검색어 저장
     * @param {string} query - 검색어
     */
    AutocompleteService.prototype.saveSearch = function(query) {
        var self = this;

        if (!query || query.length < 2) return;

        // 중복 제거
        var index = self.recentSearches.indexOf(query);
        if (index > -1) {
            self.recentSearches.splice(index, 1);
        }

        // 맨 앞에 추가
        self.recentSearches.unshift(query);

        // 최대 개수 제한
        self.recentSearches = self.recentSearches.slice(0, self.maxRecentSearches);

        // localStorage 저장
        try {
            localStorage.setItem('pm_recent_searches', JSON.stringify(self.recentSearches));
        } catch (error) {
            console.error('[Autocomplete] 최근 검색어 저장 오류:', error);
        }
    };

    /**
     * 최근 검색어 로드
     */
    AutocompleteService.prototype.loadRecentSearches = function() {
        var self = this;

        try {
            var data = localStorage.getItem('pm_recent_searches');
            self.recentSearches = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Autocomplete] 최근 검색어 로드 오류:', error);
            self.recentSearches = [];
        }
    };

    /**
     * 고유 카테고리 추출
     * @returns {Array} 카테고리 배열
     */
    AutocompleteService.prototype.extractUniqueCategories = function() {
        var self = this;
        var categories = new Set();

        self.partners.forEach(function(partner) {
            if (Array.isArray(partner.category)) {
                partner.category.forEach(function(cat) {
                    categories.add(cat);
                });
            } else if (partner.category) {
                categories.add(partner.category);
            }
        });

        return Array.from(categories);
    };

    /**
     * 중복 제거
     * @param {Array} array - 배열
     * @param {string} key - 비교 키
     * @returns {Array} 중복 제거된 배열
     */
    AutocompleteService.prototype.removeDuplicates = function(array, key) {
        var seen = new Set();
        return array.filter(function(item) {
            var value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    };

    // ========================================
    // 대시보드 서비스
    // ========================================

    /**
     * 대시보드 서비스
     * @param {Object} config - CONFIG 객체
     */
    function DashboardService(config) {
        this.config = config;
        this.partners = [];
        this.stats = null;
        this.dashboardKey = 'fresco21_dashboard_key';
    }

    /**
     * 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    DashboardService.prototype.init = function(partners) {
        var self = this;

        self.partners = partners;

        // URL 파라미터 체크
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dashboard') === 'admin' &&
            urlParams.get('key') === self.config.dashboardKey) {
            self.showDashboard();
        }

        console.log('[Dashboard] 대시보드 서비스 초기화 완료');
    };

    /**
     * 통계 수집
     * @returns {Object} 통계 데이터
     */
    DashboardService.prototype.collectStats = function() {
        var self = this;

        var viewCountKey = 'fresco21_partner_views_v3';
        var searchHistoryKey = 'fresco21_search_history_v3';
        var favoriteStatsKey = 'fresco21_favorite_stats_v3';
        var favoritesKey = 'fresco21_favorites_v3';

        var viewCounts = JSON.parse(localStorage.getItem(viewCountKey) || '{}');
        var searchHistory = JSON.parse(localStorage.getItem(searchHistoryKey) || '[]');
        var favoriteStats = JSON.parse(localStorage.getItem(favoriteStatsKey) || '{}');
        var favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');

        // 총 조회수
        var totalViews = 0;
        var todayViews = 0;
        var now = Date.now();
        var todayStart = new Date().setHours(0, 0, 0, 0);

        for (var partnerId in viewCounts) {
            var viewData = viewCounts[partnerId];

            if (typeof viewData === 'object') {
                totalViews += viewData.viewCount || 0;

                if (viewData.lastViewed && viewData.lastViewed > todayStart) {
                    todayViews += viewData.viewCount || 0;
                }
            } else if (typeof viewData === 'number') {
                totalViews += viewData;
            }
        }

        // 인기 카테고리
        var categoryViews = {};
        for (var partnerId in viewCounts) {
            var partner = self.getPartnerById(partnerId);
            if (partner) {
                var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
                categories.forEach(function(cat) {
                    var viewCount = 0;
                    var viewData = viewCounts[partnerId];

                    if (typeof viewData === 'object') {
                        viewCount = viewData.viewCount || 0;
                    } else if (typeof viewData === 'number') {
                        viewCount = viewData;
                    }

                    categoryViews[cat] = (categoryViews[cat] || 0) + viewCount;
                });
            }
        }

        // 인기 지역
        var regionViews = {};
        for (var partnerId in viewCounts) {
            var partner = self.getPartnerById(partnerId);
            if (partner) {
                var region = self.extractRegionFromAddress(partner.address);
                var viewCount = 0;
                var viewData = viewCounts[partnerId];

                if (typeof viewData === 'object') {
                    viewCount = viewData.viewCount || 0;
                } else if (typeof viewData === 'number') {
                    viewCount = viewData;
                }

                regionViews[region] = (regionViews[region] || 0) + viewCount;
            }
        }

        // 인기 검색어
        var searchKeywords = {};
        searchHistory.forEach(function(record) {
            var query = record.query || record;
            searchKeywords[query] = (searchKeywords[query] || 0) + 1;
        });

        // 즐겨찾기 Top 10
        var favoritePartnerCounts = {};
        favorites.forEach(function(partnerId) {
            favoritePartnerCounts[partnerId] = (favoritePartnerCounts[partnerId] || 0) + 1;
        });

        self.stats = {
            totalViews: totalViews,
            todayViews: todayViews,
            categoryViews: categoryViews,
            regionViews: regionViews,
            searchKeywords: searchKeywords,
            favoriteCount: favorites.length,
            favoritePartnerCounts: favoritePartnerCounts,
            totalPartners: self.partners.length
        };

        return self.stats;
    };

    /**
     * 대시보드 표시
     */
    DashboardService.prototype.showDashboard = function() {
        var self = this;

        // 통계 수집
        self.collectStats();

        // 메인 컨테이너 숨기기
        var mainContainer = document.getElementById('pm-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }

        // 대시보드 컨테이너 생성
        var dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'pm-dashboard-container';
        dashboardContainer.className = 'pm-dashboard';
        document.body.appendChild(dashboardContainer);

        // 대시보드 렌더링
        self.renderDashboard(dashboardContainer);

        console.log('[Dashboard] 대시보드 표시');
    };

    /**
     * 대시보드 렌더링
     * @param {HTMLElement} container - 컨테이너 엘리먼트
     */
    DashboardService.prototype.renderDashboard = function(container) {
        var self = this;
        var stats = self.stats;

        var html = '<div class="pm-dashboard-header">' +
                   '<h1>파트너맵 통계 대시보드</h1>' +
                   '<button class="pm-dashboard-close" onclick="window.location.href=window.location.pathname">닫기</button>' +
                   '</div>' +

                   '<div class="pm-stat-cards">' +
                   '<div class="pm-stat-card">' +
                   '<i class="ph ph-database"></i>' +
                   '<div class="pm-stat-value">' + stats.totalPartners + '</div>' +
                   '<div class="pm-stat-label">총 파트너</div>' +
                   '</div>' +

                   '<div class="pm-stat-card">' +
                   '<i class="ph ph-eye"></i>' +
                   '<div class="pm-stat-value">' + stats.totalViews + '</div>' +
                   '<div class="pm-stat-label">총 조회수</div>' +
                   '</div>' +

                   '<div class="pm-stat-card">' +
                   '<i class="ph ph-calendar"></i>' +
                   '<div class="pm-stat-value">' + stats.todayViews + '</div>' +
                   '<div class="pm-stat-label">오늘 조회수</div>' +
                   '</div>' +

                   '<div class="pm-stat-card">' +
                   '<i class="ph ph-heart"></i>' +
                   '<div class="pm-stat-value">' + stats.favoriteCount + '</div>' +
                   '<div class="pm-stat-label">즐겨찾기</div>' +
                   '</div>' +
                   '</div>' +

                   '<div class="pm-dashboard-row">' +
                   '<div class="pm-dashboard-chart">' +
                   '<h2>인기 카테고리</h2>' +
                   '<canvas id="pm-category-chart"></canvas>' +
                   '</div>' +

                   '<div class="pm-dashboard-chart">' +
                   '<h2>인기 지역</h2>' +
                   '<canvas id="pm-region-chart"></canvas>' +
                   '</div>' +
                   '</div>' +

                   '<div class="pm-dashboard-row">' +
                   '<div class="pm-dashboard-table">' +
                   '<h2>인기 검색어 Top 10</h2>' +
                   self.renderSearchKeywordsTable() +
                   '</div>' +

                   '<div class="pm-dashboard-table">' +
                   '<h2>즐겨찾기 많은 파트너 Top 10</h2>' +
                   self.renderTopFavoritesTable() +
                   '</div>' +
                   '</div>' +

                   '<div class="pm-dashboard-actions">' +
                   '<button class="pm-btn pm-btn-primary" onclick="window.dashboardInstance.exportCSV()">CSV 내보내기</button>' +
                   '<button class="pm-btn pm-btn-secondary" onclick="window.dashboardInstance.printDashboard()">인쇄</button>' +
                   '</div>';

        container.innerHTML = html;

        // Chart.js 차트 렌더링
        setTimeout(function() {
            self.renderCharts();
        }, 100);
    };

    /**
     * 검색어 테이블 렌더링
     * @returns {string} HTML 문자열
     */
    DashboardService.prototype.renderSearchKeywordsTable = function() {
        var self = this;
        var stats = self.stats;

        var sorted = Object.keys(stats.searchKeywords).sort(function(a, b) {
            return stats.searchKeywords[b] - stats.searchKeywords[a];
        }).slice(0, 10);

        if (sorted.length === 0) {
            return '<p class="pm-empty">검색 기록이 없습니다.</p>';
        }

        var html = '<table class="pm-table">' +
                   '<thead><tr><th>순위</th><th>검색어</th><th>횟수</th></tr></thead>' +
                   '<tbody>';

        sorted.forEach(function(keyword, index) {
            html += '<tr>' +
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + window.escapeHtml(keyword) + '</td>' +
                    '<td>' + stats.searchKeywords[keyword] + '</td>' +
                    '</tr>';
        });

        html += '</tbody></table>';
        return html;
    };

    /**
     * 즐겨찾기 테이블 렌더링
     * @returns {string} HTML 문자열
     */
    DashboardService.prototype.renderTopFavoritesTable = function() {
        var self = this;
        var stats = self.stats;

        // 조회수 기준으로 정렬 (즐겨찾기가 없을 경우 대체)
        var viewCountKey = 'fresco21_partner_views_v3';
        var viewCounts = JSON.parse(localStorage.getItem(viewCountKey) || '{}');

        var sorted = Object.keys(viewCounts).sort(function(a, b) {
            var aCount = typeof viewCounts[a] === 'object' ? viewCounts[a].viewCount : viewCounts[a];
            var bCount = typeof viewCounts[b] === 'object' ? viewCounts[b].viewCount : viewCounts[b];
            return (bCount || 0) - (aCount || 0);
        }).slice(0, 10);

        if (sorted.length === 0) {
            return '<p class="pm-empty">데이터가 없습니다.</p>';
        }

        var html = '<table class="pm-table">' +
                   '<thead><tr><th>순위</th><th>파트너</th><th>조회수</th></tr></thead>' +
                   '<tbody>';

        sorted.forEach(function(partnerId, index) {
            var partner = self.getPartnerById(partnerId);
            if (!partner) return;

            var viewCount = typeof viewCounts[partnerId] === 'object'
                ? viewCounts[partnerId].viewCount
                : viewCounts[partnerId];

            html += '<tr>' +
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + window.escapeHtml(partner.name) + '</td>' +
                    '<td>' + (viewCount || 0) + '</td>' +
                    '</tr>';
        });

        html += '</tbody></table>';
        return html;
    };

    /**
     * Chart.js 차트 렌더링
     */
    DashboardService.prototype.renderCharts = function() {
        var self = this;
        var stats = self.stats;

        // Chart.js 로드 확인
        if (typeof Chart === 'undefined') {
            console.warn('[Dashboard] Chart.js가 로드되지 않음');
            return;
        }

        // 카테고리 차트
        var categoryCtx = document.getElementById('pm-category-chart');
        if (categoryCtx) {
            var categoryLabels = Object.keys(stats.categoryViews);
            var categoryData = Object.values(stats.categoryViews);

            new Chart(categoryCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        label: '조회수',
                        data: categoryData,
                        backgroundColor: '#7D9675'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 지역 차트
        var regionCtx = document.getElementById('pm-region-chart');
        if (regionCtx) {
            var regionLabels = Object.keys(stats.regionViews);
            var regionData = Object.values(stats.regionViews);

            new Chart(regionCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: regionLabels,
                    datasets: [{
                        data: regionData,
                        backgroundColor: [
                            '#7D9675',
                            '#96B38A',
                            '#A8C79F',
                            '#C4D9B9',
                            '#DFE8D5',
                            '#E8F0E0',
                            '#F4F8F1'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        console.log('[Dashboard] 차트 렌더링 완료');
    };

    /**
     * CSV 내보내기
     */
    DashboardService.prototype.exportCSV = function() {
        var self = this;
        var stats = self.stats;

        var csv = '구분,항목,값\n';

        // 기본 통계
        csv += '기본 통계,총 파트너,' + stats.totalPartners + '\n';
        csv += '기본 통계,총 조회수,' + stats.totalViews + '\n';
        csv += '기본 통계,오늘 조회수,' + stats.todayViews + '\n';
        csv += '기본 통계,즐겨찾기,' + stats.favoriteCount + '\n\n';

        // 카테고리
        csv += '인기 카테고리\n';
        for (var category in stats.categoryViews) {
            csv += ',' + category + ',' + stats.categoryViews[category] + '\n';
        }
        csv += '\n';

        // 지역
        csv += '인기 지역\n';
        for (var region in stats.regionViews) {
            csv += ',' + region + ',' + stats.regionViews[region] + '\n';
        }
        csv += '\n';

        // 검색어
        csv += '인기 검색어\n';
        var sortedKeywords = Object.keys(stats.searchKeywords).sort(function(a, b) {
            return stats.searchKeywords[b] - stats.searchKeywords[a];
        }).slice(0, 10);

        sortedKeywords.forEach(function(keyword) {
            csv += ',' + keyword + ',' + stats.searchKeywords[keyword] + '\n';
        });

        // Blob 생성 및 다운로드
        var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'partnermap-stats-' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();

        console.log('[Dashboard] CSV 내보내기 완료');
    };

    /**
     * 대시보드 인쇄
     */
    DashboardService.prototype.printDashboard = function() {
        window.print();
    };

    /**
     * 파트너 ID로 파트너 객체 가져오기
     * @param {string} partnerId - 파트너 ID
     * @returns {Object|null} 파트너 객체
     */
    DashboardService.prototype.getPartnerById = function(partnerId) {
        var self = this;

        return self.partners.find(function(p) {
            return String(p.id) === String(partnerId);
        }) || null;
    };

    /**
     * 주소에서 지역 추출
     * @param {string} address - 주소
     * @returns {string} 지역명
     */
    DashboardService.prototype.extractRegionFromAddress = function(address) {
        if (!address) return '기타';

        var match = address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
        return match ? match[1] : '기타';
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.PopularPartnersService = PopularPartnersService;
    window.AutocompleteService = AutocompleteService;
    window.DashboardService = DashboardService;

})(window);
