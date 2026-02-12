/**
 * 파트너맵 v3 - UI 컴포넌트 Part 1/6 - 초기화
 * 책임: UIService 클래스 정의, 이벤트 리스너 설정
 *
 * [메이크샵 최적화]
 * - 인라인 이벤트 핸들러 완전 제거
 * - 이벤트 위임 방식으로 전환
 * - 파일 크기: 3KB 이하
 * - 라인 수: 100줄 이하
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

    /**
     * UI 초기화
     */
    UIService.prototype.init = function() {
        var self = this;

        // 모달 이벤트
        self._initModalEvents();

        // 리스트/모달 바디 이벤트 위임
        self._initDelegatedEvents();

        // 공유 이벤트
        self._initShareEvents();

        console.log('[UI] UI 초기화 완료 (이벤트 위임 방식)');
    };

    /**
     * 모달 이벤트 초기화
     */
    UIService.prototype._initModalEvents = function() {
        var self = this;

        var modalClose = document.getElementById('pm-modal-close');
        if (modalClose) modalClose.addEventListener('click', function() { self.closeModal(); });

        var modalOverlay = document.querySelector('#pm-modal .pm-modal-overlay');
        if (modalOverlay) modalOverlay.addEventListener('click', function() { self.closeModal(); });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.closeModal();
                self.closeShareModal();
            }
        });

        var resetMapBtn = document.getElementById('pm-reset-map-btn');
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', function() {
                if (window.MapService && window.MapService.reset) {
                    window.MapService.reset();
                    self.showToast('지도가 초기화되었습니다.', 'success');
                }
            });
        }
    };

    /**
     * 이벤트 위임 초기화
     */
    UIService.prototype._initDelegatedEvents = function() {
        var self = this;

        var listContainer = document.getElementById('pm-partner-list');
        if (listContainer) listContainer.addEventListener('click', function(e) { self.handleListClick(e); });

        var modalBody = document.getElementById('pm-modal-body');
        if (modalBody) modalBody.addEventListener('click', function(e) { self.handleModalClick(e); });

        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-fallback')) {
                e.target.src = e.target.getAttribute('data-fallback');
            }
        }, true);
    };

    /**
     * 공유 이벤트 초기화
     */
    UIService.prototype._initShareEvents = function() {
        var self = this;

        var shareModalClose = document.getElementById('pm-share-modal-close');
        if (shareModalClose) shareModalClose.addEventListener('click', function() { self.closeShareModal(); });

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
                if (partnerId) self.shareKakao(partnerId);
            });
        }
    };

    /**
     * 리스트 클릭 이벤트 처리
     */
    UIService.prototype.handleListClick = function(e) {
        var self = this;
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            e.stopPropagation();
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) self.toggleFavorite(partnerId, e);
            return;
        }

        var card = e.target.closest('.pm-partner-card');
        if (card) {
            var partnerId = card.getAttribute('data-partner-id');
            var partner = self.partners.find(function(p) { return p.id == partnerId; });
            if (partner) {
                self.showPartnerDetail(partner);
                if (window.MapService && window.MapService.moveTo) window.MapService.moveTo(partner);
            }
        }
    };

    /**
     * 모달 클릭 이벤트 처리
     */
    UIService.prototype.handleModalClick = function(e) {
        var self = this;
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) self.toggleFavorite(partnerId);
            return;
        }

        var shareBtn = e.target.closest('.pm-share-btn');
        if (shareBtn) {
            var partnerId = shareBtn.getAttribute('data-partner-id');
            if (partnerId) self.showShareModal(partnerId);
            return;
        }
    };

    // 전역 생성자 등록
    window.UIServiceClass = UIService;

})(window);
