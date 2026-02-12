/**
 * Part 2B1b - 파트너 리스트 (라인 212-330)
 * 테스트: 메이크샵 저장 가능 여부
 */

(function(window) {
    'use strict';

    // UIService 메서드 추가

    window.UIServiceClass.prototype.renderPartnerList = function(partners) {
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

    window.UIServiceClass.prototype.createPartnerCardHTML = function(partner) {
        var self = this;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');

        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        var distanceHtml = '';
        if (partner.distance !== undefined) {
            distanceHtml = '<span class="pm-distance-badge">📏 ' + partner.distance.toFixed(1) + 'km</span>';
        }

        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '">' +
               '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
               'data-partner-id="' + partner.id + '" ' +
               'type="button" ' +
               'title="즐겨찾기">' +
               favoriteIcon +
               '</button>' +
               (distanceHtml ? '<div class="pm-distance-indicator">' + distanceHtml + '</div>' : '') +
               '<div class="pm-partner-logo">' +
               '<img src="' + logoUrl + '" ' +
               'alt="' + escapedName + '" ' +
               'data-fallback="' + self.config.defaultLogoPath + '">' +
               '</div>' +
               '<div class="pm-partner-info">' +
               '<h4>' + escapedName + '</h4>' +
               '<div class="pm-partner-categories">' + categoryTags + '</div>' +
               '<p class="pm-partner-address">📍 ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone">📞 ' + escapedPhone + '</p>' +
               '</div>' +
               '</div>';
    };

})(window);
