/**
 * Part 2B1a - 초기화 & 로딩 (라인 1-211)
 * 테스트: 메이크샵 저장 가능 여부
 */

(function(window) {
    'use strict';

    function UIService(config) {
        this.config = config;
        this.partners = [];
    }

    // ========================================
    // 초기화
    // ========================================

    UIService.prototype.init = function() {
        var self = this;

        var modalClose = document.getElementById('pm-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                self.closeModal();
            });
        }

        var modalOverlay = document.querySelector('#pm-modal .pm-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function() {
                self.closeModal();
            });
        }

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

        var listContainer = document.getElementById('pm-partner-list');
        if (listContainer) {
            listContainer.addEventListener('click', function(e) {
                self.handleListClick(e);
            });
        }

        var modalBody = document.getElementById('pm-modal-body');
        if (modalBody) {
            modalBody.addEventListener('click', function(e) {
                self.handleModalClick(e);
            });
        }

        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-fallback')) {
                e.target.src = e.target.getAttribute('data-fallback');
            }
        }, true);

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

        console.log('[UI] UI 초기화 완료');
    };

    UIService.prototype.handleListClick = function(e) {
        var self = this;

        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            e.stopPropagation();
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId, e);
            }
            return;
        }

        var card = e.target.closest('.pm-partner-card');
        if (card) {
            var partnerId = card.getAttribute('data-partner-id');
            var partner = self.partners.find(function(p) {
                return p.id == partnerId;
            });

            if (partner) {
                self.showPartnerDetail(partner);

                if (window.MapService && window.MapService.moveTo) {
                    window.MapService.moveTo(partner);
                }
            }
        }
    };

    UIService.prototype.handleModalClick = function(e) {
        var self = this;

        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId);
            }
            return;
        }

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

    UIService.prototype.showLoading = function() {
        var loading = document.getElementById('pm-loading-overlay');
        if (loading) {
            loading.style.display = 'flex';
        }
    };

    UIService.prototype.hideLoading = function() {
        var loading = document.getElementById('pm-loading-overlay');
        if (loading) {
            loading.style.display = 'none';
        }
    };

    // ========================================
    // 토스트
    // ========================================

    UIService.prototype.showToast = function(message, type) {
        var self = this;
        var container = document.getElementById('pm-toast-container');
        if (!container) return;

        type = type || 'info';

        var toastHTML = '<div class="pm-toast pm-toast-' + type + '">' +
                        (window.escapeHtml ? window.escapeHtml(message) : message) +
                        '</div>';
        container.insertAdjacentHTML('beforeend', toastHTML);

        var toast = container.lastElementChild;

        setTimeout(function() {
            toast.classList.add('pm-toast-show');
        }, 10);

        setTimeout(function() {
            toast.classList.remove('pm-toast-show');
            setTimeout(function() {
                container.removeChild(toast);
            }, 300);
        }, self.config.toastDuration);
    };

    window.UIServiceClass = UIService;

})(window);
