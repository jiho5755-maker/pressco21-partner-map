/**
 * Part 2B1c - 모달 (라인 331-437)
 * 테스트: 메이크샵 저장 가능 여부
 * 주의: URL 포함 구간
 */

(function(window) {
    'use strict';

    window.UIServiceClass.prototype.showPartnerDetail = function(partner) {
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

        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        var html = '<div class="pm-modal-header">' +
                   '<img src="' + logoUrl + '" ' +
                   'alt="' + escapedName + '" ' +
                   'data-fallback="' + self.config.defaultLogoPath + '">' +
                   '<h2>' + escapedName + '</h2>' +
                   (categoryTags ? '<div class="pm-partner-categories">' + categoryTags + '</div>' : '') +
                   '</div>' +
                   '<div class="pm-modal-actions">' +
                   '<button class="pm-action-btn pm-favorite-btn ' + favoriteClass + '" ' +
                   'type="button" ' +
                   'data-partner-id="' + partner.id + '">' +
                   favoriteIcon + ' ' + favoriteText +
                   '</button>' +
                   '<button class="pm-action-btn pm-share-btn" ' +
                   'type="button" ' +
                   'data-partner-id="' + partner.id + '">' +
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

    window.UIServiceClass.prototype.closeModal = function() {
        var modal = document.getElementById('pm-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
            document.body.style.overflow = '';
        }
    };

})(window);
