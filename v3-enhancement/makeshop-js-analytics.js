/**
 * 파트너맵 v3 - Google Analytics 4 추적 시스템
 * 책임: 사용자 행동 분석, 이벤트 추적, localStorage 기반 통계
 * 메이크샵 D4 호환: ES5 문법, IIFE 패턴, 템플릿 리터럴 이스케이프
 * 파일 크기: 약 10KB
 */

(function(window) {
    'use strict';

    /**
     * Analytics 서비스
     * @param {Object} config - CONFIG 객체
     */
    function AnalyticsService(config) {
        this.config = config;
        this.measurementId = 'G-XXXXXXXXXX';  // 실제 GA4 측정 ID로 교체 필요
        this.isInitialized = false;

        // localStorage 키
        this.viewCountKey = 'fresco21_partner_views_v3';
        this.searchHistoryKey = 'fresco21_search_history_v3';
        this.favoriteStatsKey = 'fresco21_favorite_stats_v3';
    }

    // ========================================
    // GA4 초기화
    // ========================================

    /**
     * GA4 초기화
     * @param {string} measurementId - GA4 측정 ID (선택)
     */
    AnalyticsService.prototype.init = function(measurementId) {
        var self = this;

        if (measurementId) {
            self.measurementId = measurementId;
        }

        // GA4 gtag.js가 로드되어 있는지 확인
        if (typeof window.gtag !== 'function') {
            console.warn('[Analytics] GA4 gtag.js가 로드되지 않았습니다.');
            return;
        }

        // GA4 초기화
        window.gtag('js', new Date());
        window.gtag('config', self.measurementId, {
            page_title: '파트너맵 v3',
            send_page_view: true
        });

        self.isInitialized = true;

        // 세션 시작 이벤트
        self.trackEvent('session_start', {
            timestamp: new Date().toISOString()
        });

        console.log('[Analytics] GA4 초기화 완료 - ID: ' + self.measurementId);
    };

    // ========================================
    // 이벤트 추적
    // ========================================

    /**
     * 공통 이벤트 추적 함수
     * @param {string} eventName - 이벤트 이름
     * @param {Object} params - 이벤트 파라미터
     */
    AnalyticsService.prototype.trackEvent = function(eventName, params) {
        var self = this;

        if (!self.isInitialized || typeof window.gtag !== 'function') {
            console.log('[Analytics] 이벤트 추적 (미초기화):', eventName, params);
            return;
        }

        // 기본 파라미터 추가
        var defaultParams = {
            timestamp: new Date().toISOString(),
            page_path: window.location.pathname,
            page_title: document.title
        };

        var eventParams = Object.assign({}, defaultParams, params);

        // GA4 이벤트 전송
        window.gtag('event', eventName, eventParams);

        console.log('[Analytics] 이벤트 추적:', eventName, eventParams);
    };

    // ========================================
    // 파트너 관련 이벤트
    // ========================================

    /**
     * 파트너 상세 조회 추적
     * @param {Object} partner - 파트너 데이터
     */
    AnalyticsService.prototype.trackPartnerView = function(partner) {
        var self = this;

        if (!partner) return;

        // GA4 이벤트
        self.trackEvent('partner_view', {
            partner_id: String(partner.id),
            partner_name: partner.name,
            partner_category: Array.isArray(partner.category) ? partner.category.join(', ') : partner.category,
            partner_region: self.extractRegion(partner.address),
            partner_type: Array.isArray(partner.partnerType) ? partner.partnerType.join(', ') : partner.partnerType
        });

        // localStorage 조회수 증가
        self.incrementViewCount(partner.id);
    };

    /**
     * 파트너 전화 클릭 추적
     * @param {Object} partner - 파트너 데이터
     */
    AnalyticsService.prototype.trackPartnerCall = function(partner) {
        var self = this;

        if (!partner) return;

        self.trackEvent('partner_call', {
            partner_id: String(partner.id),
            partner_name: partner.name,
            partner_phone: partner.phone
        });
    };

    // ========================================
    // 즐겨찾기 이벤트
    // ========================================

    /**
     * 즐겨찾기 추가 추적
     * @param {string} partnerId - 파트너 ID
     * @param {string} partnerName - 파트너 이름 (선택)
     */
    AnalyticsService.prototype.trackFavoriteAdd = function(partnerId, partnerName) {
        var self = this;

        self.trackEvent('favorite_add', {
            partner_id: String(partnerId),
            partner_name: partnerName || ''
        });

        // localStorage 통계 업데이트
        self.updateFavoriteStats('add');
    };

    /**
     * 즐겨찾기 제거 추적
     * @param {string} partnerId - 파트너 ID
     * @param {string} partnerName - 파트너 이름 (선택)
     */
    AnalyticsService.prototype.trackFavoriteRemove = function(partnerId, partnerName) {
        var self = this;

        self.trackEvent('favorite_remove', {
            partner_id: String(partnerId),
            partner_name: partnerName || ''
        });

        // localStorage 통계 업데이트
        self.updateFavoriteStats('remove');
    };

    // ========================================
    // 검색 이벤트
    // ========================================

    /**
     * 검색 추적
     * @param {string} query - 검색어
     * @param {number} resultCount - 검색 결과 수
     */
    AnalyticsService.prototype.trackSearch = function(query, resultCount) {
        var self = this;

        if (!query) return;

        self.trackEvent('search', {
            search_term: query,
            result_count: resultCount || 0
        });

        // localStorage 검색 기록 저장
        self.saveSearchHistory(query, resultCount);
    };

    // ========================================
    // 필터 이벤트
    // ========================================

    /**
     * 필터 변경 추적
     * @param {string} filterType - 필터 타입
     * @param {string} filterValue - 필터 값
     * @param {number} resultCount - 결과 수
     */
    AnalyticsService.prototype.trackFilterChange = function(filterType, filterValue, resultCount) {
        var self = this;

        self.trackEvent('filter_change', {
            filter_type: filterType,
            filter_value: filterValue,
            result_count: resultCount || 0
        });
    };

    // ========================================
    // GPS 이벤트
    // ========================================

    /**
     * GPS 검색 추적
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     * @param {boolean} success - 성공 여부
     */
    AnalyticsService.prototype.trackGPSSearch = function(lat, lng, success) {
        var self = this;

        self.trackEvent('gps_search', {
            latitude: lat || null,
            longitude: lng || null,
            success: success ? 'true' : 'false'
        });
    };

    // ========================================
    // 공유 이벤트
    // ========================================

    /**
     * 공유 시작 추적
     * @param {string} partnerId - 파트너 ID
     * @param {string} partnerName - 파트너 이름
     */
    AnalyticsService.prototype.trackShareStart = function(partnerId, partnerName) {
        var self = this;

        self.trackEvent('share_start', {
            partner_id: String(partnerId),
            partner_name: partnerName || ''
        });
    };

    /**
     * 링크 복사 추적
     * @param {string} partnerId - 파트너 ID
     */
    AnalyticsService.prototype.trackShareCopy = function(partnerId) {
        var self = this;

        self.trackEvent('share_copy', {
            partner_id: String(partnerId),
            method: 'copy_link'
        });
    };

    /**
     * 카카오톡 공유 추적
     * @param {string} partnerId - 파트너 ID
     */
    AnalyticsService.prototype.trackShareKakao = function(partnerId) {
        var self = this;

        self.trackEvent('share_kakao', {
            partner_id: String(partnerId),
            method: 'kakao'
        });
    };

    // ========================================
    // 지도 이벤트
    // ========================================

    /**
     * 지도 마커 클릭 추적
     * @param {string} partnerId - 파트너 ID
     * @param {string} partnerName - 파트너 이름
     */
    AnalyticsService.prototype.trackMapMarkerClick = function(partnerId, partnerName) {
        var self = this;

        self.trackEvent('map_marker_click', {
            partner_id: String(partnerId),
            partner_name: partnerName || ''
        });
    };

    /**
     * 지도 초기화 추적
     */
    AnalyticsService.prototype.trackMapReset = function() {
        var self = this;

        self.trackEvent('map_reset', {
            action: 'reset_to_default'
        });
    };

    // ========================================
    // 에러 추적
    // ========================================

    /**
     * 에러 추적
     * @param {string} errorType - 에러 타입
     * @param {string} errorMessage - 에러 메시지
     */
    AnalyticsService.prototype.trackError = function(errorType, errorMessage) {
        var self = this;

        self.trackEvent('error', {
            error_type: errorType,
            error_message: errorMessage
        });
    };

    // ========================================
    // localStorage 통계
    // ========================================

    /**
     * 조회수 증가
     * @param {string} partnerId - 파트너 ID
     */
    AnalyticsService.prototype.incrementViewCount = function(partnerId) {
        var self = this;

        try {
            var viewCounts = localStorage.getItem(self.viewCountKey);
            var counts = viewCounts ? JSON.parse(viewCounts) : {};

            partnerId = String(partnerId);

            if (counts[partnerId]) {
                counts[partnerId]++;
            } else {
                counts[partnerId] = 1;
            }

            localStorage.setItem(self.viewCountKey, JSON.stringify(counts));

        } catch (error) {
            console.error('[Analytics] 조회수 저장 오류:', error);
        }
    };

    /**
     * 조회수 조회
     * @param {string} partnerId - 파트너 ID
     * @returns {number} 조회수
     */
    AnalyticsService.prototype.getViewCount = function(partnerId) {
        var self = this;

        try {
            var viewCounts = localStorage.getItem(self.viewCountKey);
            var counts = viewCounts ? JSON.parse(viewCounts) : {};

            partnerId = String(partnerId);

            return counts[partnerId] || 0;

        } catch (error) {
            console.error('[Analytics] 조회수 조회 오류:', error);
            return 0;
        }
    };

    /**
     * 검색 기록 저장
     * @param {string} query - 검색어
     * @param {number} resultCount - 검색 결과 수
     */
    AnalyticsService.prototype.saveSearchHistory = function(query, resultCount) {
        var self = this;

        try {
            var historyData = localStorage.getItem(self.searchHistoryKey);
            var history = historyData ? JSON.parse(historyData) : [];

            var record = {
                query: query,
                resultCount: resultCount || 0,
                timestamp: new Date().toISOString()
            };

            history.unshift(record);

            // 최대 50개 유지
            if (history.length > 50) {
                history = history.slice(0, 50);
            }

            localStorage.setItem(self.searchHistoryKey, JSON.stringify(history));

        } catch (error) {
            console.error('[Analytics] 검색 기록 저장 오류:', error);
        }
    };

    /**
     * 검색 기록 조회
     * @param {number} limit - 최대 조회 개수
     * @returns {Array} 검색 기록 배열
     */
    AnalyticsService.prototype.getSearchHistory = function(limit) {
        var self = this;

        try {
            var historyData = localStorage.getItem(self.searchHistoryKey);
            var history = historyData ? JSON.parse(historyData) : [];

            if (limit && limit > 0) {
                return history.slice(0, limit);
            }

            return history;

        } catch (error) {
            console.error('[Analytics] 검색 기록 조회 오류:', error);
            return [];
        }
    };

    /**
     * 즐겨찾기 통계 업데이트
     * @param {string} action - 액션 ('add' | 'remove')
     */
    AnalyticsService.prototype.updateFavoriteStats = function(action) {
        var self = this;

        try {
            var statsData = localStorage.getItem(self.favoriteStatsKey);
            var stats = statsData ? JSON.parse(statsData) : {
                totalAdds: 0,
                totalRemoves: 0,
                lastUpdated: null
            };

            if (action === 'add') {
                stats.totalAdds++;
            } else if (action === 'remove') {
                stats.totalRemoves++;
            }

            stats.lastUpdated = new Date().toISOString();

            localStorage.setItem(self.favoriteStatsKey, JSON.stringify(stats));

        } catch (error) {
            console.error('[Analytics] 즐겨찾기 통계 업데이트 오류:', error);
        }
    };

    /**
     * 즐겨찾기 통계 조회
     * @returns {Object} 통계 데이터
     */
    AnalyticsService.prototype.getFavoriteStats = function() {
        var self = this;

        try {
            var statsData = localStorage.getItem(self.favoriteStatsKey);
            return statsData ? JSON.parse(statsData) : {
                totalAdds: 0,
                totalRemoves: 0,
                lastUpdated: null
            };

        } catch (error) {
            console.error('[Analytics] 즐겨찾기 통계 조회 오류:', error);
            return {
                totalAdds: 0,
                totalRemoves: 0,
                lastUpdated: null
            };
        }
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 주소에서 지역 추출
     * @param {string} address - 주소
     * @returns {string} 지역명
     */
    AnalyticsService.prototype.extractRegion = function(address) {
        if (!address) return '기타';

        var match = address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
        return match ? match[1] : '기타';
    };

    /**
     * localStorage 통계 초기화
     */
    AnalyticsService.prototype.clearStats = function() {
        var self = this;

        try {
            localStorage.removeItem(self.viewCountKey);
            localStorage.removeItem(self.searchHistoryKey);
            localStorage.removeItem(self.favoriteStatsKey);
            console.log('[Analytics] localStorage 통계 초기화 완료');
        } catch (error) {
            console.error('[Analytics] 통계 초기화 오류:', error);
        }
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.AnalyticsService = AnalyticsService;

})(window);
