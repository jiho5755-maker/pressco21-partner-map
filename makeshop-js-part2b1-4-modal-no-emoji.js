/**
 * 파트너맵 v3 - UI 컴포넌트 Part 4/6 - 모달
 * 책임: 파트너 상세 모달 표시, 모달 닫기
 *
 * [메이크샵 최적화]
 * - HTML 문자열 연결 최소화 (중간 변수 사용)
 * - 파일 크기: 5KB 이하
 * - 라인 수: 150줄 이하
 */

(function(window) {
    'use strict';

    var UIService = window.UIServiceClass;
    if (!UIService) {
        console.error('[UI] UIServiceClass가 로드되지 않았습니다.');
        return;
    }

    // ========================================
    // 모달
    // ========================================

    /**
     * 파트너 상세 모달 표시 (인라인 핸들러 제거, HTML 연결 최소화)
     * @param {Object} partner - 파트너 데이터
     */
    UIService.prototype.showPartnerDetail = function(partner) {
        var self = this;

        var modal = document.getElementById('pm-modal');
        var modalBody = document.getElementById('pm-modal-body');
        if (!modal || !modalBody) return;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIcon = isFavorite ? '♥' : '♡';
        var favoriteText = isFavorite ? '즐겨찾기됨' : '즐겨찾기';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var name = window.escapeHtml(partner.name);
        var address = window.escapeHtml(partner.address);
        var phone = window.escapeHtml(partner.phone || '-');
        var email = partner.email ? window.escapeHtml(partner.email) : '';
        var desc = partner.description ? window.escapeHtml(partner.description) : '소개 정보가 없습니다.';

        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        var headerHtml = '<div class="pm-modal-header"><img src="' + logoUrl + '" alt="' + name + '" ' +
                        'data-fallback="' + self.config.defaultLogoPath + '"><h2>' + name + '</h2>' +
                        (categoryTags ? '<div class="pm-partner-categories">' + categoryTags + '</div>' : '') + '</div>';

        var actionsHtml = '<div class="pm-modal-actions">' +
                         '<button class="pm-action-btn pm-favorite-btn ' + favoriteClass + '" type="button" data-partner-id="' +
                         partner.id + '">' + favoriteIcon + ' ' + favoriteText + '</button>' +
                         '<button class="pm-action-btn pm-share-btn" type="button" data-partner-id="' + partner.id + '">' +
                         '공유하기</button></div>';

        var introHtml = '<div class="pm-modal-section"><h3>소개</h3><p>' + desc + '</p></div>';

        var naverUrl = '//map.naver.com/v5/search/' + encodeURIComponent(partner.address);
        var kakaoUrl = '//map.kakao.com/?q=' + encodeURIComponent(partner.address);
        var navBtns = '<div class="pm-navigation-buttons">' +
                     '<a href="' + naverUrl + '" target="_blank" class="pm-nav-btn pm-nav-naver">[지도] 네이버 지도</a>' +
                     '<a href="' + kakaoUrl + '" target="_blank" class="pm-nav-btn pm-nav-kakao">[지도] 카카오맵</a></div>';

        var locationHtml = '<div class="pm-modal-section"><h3>위치 정보</h3>' +
                          '<p class="pm-address">' + address + '</p>' + navBtns + '</div>';

        var contactHtml = '<div class="pm-modal-section"><h3>연락처</h3>' +
                         '<p>전화: <a href="tel:' + partner.phone + '">' + phone + '</a></p>' +
                         (email ? '<p>이메일: <a href="mailto:' + partner.email + '">' + email + '</a></p>' : '') + '</div>';

        // 링크 섹션 (선택적)
        var linksHtml = '';
        if (partner.homepage || partner.instagram) {
            var homepageLink = '';
            if (partner.homepage) {
                homepageLink = '<p>[홈] <a href="' + partner.homepage + '" target="_blank">홈페이지</a></p>';
            }

            var instagramLink = '';
            if (partner.instagram) {
                var instagramUrl = partner.instagram.startsWith('http') ?
                                  partner.instagram :
                                  '//instagram.com/' + partner.instagram;
                instagramLink = '<p>[SNS] <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
            }

            linksHtml = '<div class="pm-modal-section">' +
                       '<h3>링크</h3>' +
                       homepageLink +
                       instagramLink +
                       '</div>';
        }

        // 최종 조합 (7줄)
        var html = headerHtml +
                  actionsHtml +
                  introHtml +
                  locationHtml +
                  contactHtml +
                  linksHtml;

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

})(window);
