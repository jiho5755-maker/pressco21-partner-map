/**
 * 파트너맵 v3 - UI 컴포넌트 (Part 2B1 상반부) - 디버그용
 * 라인: 1~316
 * 책임: 초기화, 로딩, 토스트, 파트너 리스트 상반부
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

        // 이벤트 위임: 파트너 리스트
        var listContainer = document.getElementById('pm-partner-list');
        if (listContainer) {
            listContainer.addEventListener('click', function(e) {
                self.handleListClick(e);
            });
        }

        // 이벤트 위임: 모달 바디
        var modalBody = document.getElementById('pm-modal-body');
        if (modalBody) {
            modalBody.addEventListener('click', function(e) {
                self.handleModalClick(e);
            });
        }

        // 이벤트 위임: 이미지 로드 실패
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-fallback')) {
                e.target.src = e.target.getAttribute('data-fallback');
            }
        }, true);

        // 공유 모달 이벤트
        var shareModalClose = document.getElementById('pm-share-modal-close');
        if (shareModalClose) {
            shareModalClose.addEventListener('click', function() {
                self.closeShareModal();
            });
        }

        var shareCopyBtn = document.getElementById('pm-share-copy');
        if (shareCopyBtn) {
            shareCopyBtn.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                if (partnerId) {
                    var shareUrl = window.location.origin + window.location.pathname + '?partner=' + partnerId;
                    self.copyLink(shareUrl);
                }
            });
        }

        var shareKakaoBtn = document.getElementById('pm-share-kakao');
        if (shareKakaoBtn) {
            shareKakaoBtn.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                if (partnerId) {
                    self.shareKakao(partnerId);
                }
            });
        }

        console.log('[UI] UI 초기화 완료 (이벤트 위임 방식)');
    };

    /**
     * 리스트 클릭 이벤트 처리
     * @param {Event} e - 이벤트
     */
    UIService.prototype.handleListClick = function(e) {
        var self = this;

        // 즐겨찾기 버튼
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            e.stopPropagation();
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId, e);
            }
            return;
        }

        // 파트너 카드
        var card = e.target.closest('.pm-partner-card');
        if (card) {
            var partnerId = card.getAttribute('data-partner-id');
            var partner = self.partners.find(function(p) {
                return p.id == partnerId;
            });

            if (partner) {
                self.showPartnerDetail(partner);

                // 지도 이동
                if (window.MapService && window.MapService.moveTo) {
                    window.MapService.moveTo(partner);
                }
            }
        }
    };

    /**
     * 모달 클릭 이벤트 처리
     * @param {Event} e - 이벤트
     */
    UIService.prototype.handleModalClick = function(e) {
        var self = this;

        // 즐겨찾기 버튼
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId);
            }
            return;
        }

        // 공유 버튼
        var shareBtn = e.target.closest('.pm-share-btn');
        if (shareBtn) {
            var partnerId = shareBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.showShareModal(partnerId);
            }
            return;
        }
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

        console.log('[UI] 파트너 리스트 렌더링 완료 (' + partners.length + '개)');
    };

    /**
     * 파트너 카드 HTML 생성 (인라인 핸들러 제거)
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

        // ✅ 수정: 인라인 핸들러 제거, data 속성만 사용
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

    // ========================================
    // 전역 등록 (디버그용 - 임시)
    // ========================================

    window.UIServiceClass = UIService;

})(window);
