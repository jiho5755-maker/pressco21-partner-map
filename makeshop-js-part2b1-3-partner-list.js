/**
 * 파트너맵 v3 - UI 컴포넌트 Part 3/6 - 파트너 리스트
 * 책임: 파트너 리스트 렌더링, 카드 HTML 생성
 *
 * [메이크샵 최적화]
 * - HTML 문자열 연결 최소화 (중간 변수 사용)
 * - 파일 크기: 4KB 이하
 * - 라인 수: 120줄 이하
 */

(function(window) {
    'use strict';

    var UIService = window.UIServiceClass;
    if (!UIService) {
        console.error('[UI] UIServiceClass가 로드되지 않았습니다.');
        return;
    }

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

        console.log('[UI] 파트너 리스트 렌더링 완료 (' + partners.length + '개)');
    };

    /**
     * 파트너 카드 HTML 생성 (인라인 핸들러 제거, HTML 연결 최소화)
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    UIService.prototype.createPartnerCardHTML = function(partner) {
        var self = this;

        // 즐겨찾기 상태
        var isFavorite = self.isFavorite(partner.id);
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
        var favoriteClass = isFavorite ? 'active' : '';

        // 기본 데이터
        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');

        // 카테고리 태그
        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        // 거리 표시
        var distanceHtml = '';
        if (partner.distance !== undefined) {
            distanceHtml = '<div class="pm-distance-indicator">' +
                          '<span class="pm-distance-badge">📏 ' + partner.distance.toFixed(1) + 'km</span>' +
                          '</div>';
        }

        // 즐겨찾기 버튼 (5줄)
        var favoriteBtn = '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
                         'data-partner-id="' + partner.id + '" ' +
                         'type="button" title="즐겨찾기">' +
                         favoriteIcon +
                         '</button>';

        // 로고 (4줄)
        var logoHtml = '<div class="pm-partner-logo">' +
                      '<img src="' + logoUrl + '" alt="' + escapedName + '" ' +
                      'data-fallback="' + self.config.defaultLogoPath + '">' +
                      '</div>';

        // 파트너 정보 (7줄)
        var infoHtml = '<div class="pm-partner-info">' +
                      '<h4>' + escapedName + '</h4>' +
                      '<div class="pm-partner-categories">' + categoryTags + '</div>' +
                      '<p class="pm-partner-address">📍 ' + escapedAddress + '</p>' +
                      '<p class="pm-partner-phone">📞 ' + escapedPhone + '</p>' +
                      '</div>';

        // 최종 조합 (5줄)
        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '">' +
               favoriteBtn +
               distanceHtml +
               logoHtml +
               infoHtml +
               '</div>';
    };

})(window);
