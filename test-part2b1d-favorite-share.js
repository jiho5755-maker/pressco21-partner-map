/**
 * Part 2B1d - 즐겨찾기 & 공유 (라인 438-632)
 * 테스트: 메이크샵 저장 가능 여부
 */

(function(window) {
    'use strict';

    // ========================================
    // 즐겨찾기
    // ========================================

    window.UIServiceClass.prototype.toggleFavorite = function(partnerId, event) {
        var self = this;

        if (event) {
            event.stopPropagation();
        }

        var favorites = self.getFavorites();
        var index = favorites.indexOf(partnerId);

        if (index === -1) {
            favorites.push(partnerId);
            self.showToast('즐겨찾기에 추가되었습니다.', 'success');
        } else {
            favorites.splice(index, 1);
            self.showToast('즐겨찾기에서 제거되었습니다.', 'info');
        }

        self.saveFavorites(favorites);
        self.updateFavoriteButtons();
    };

    window.UIServiceClass.prototype.isFavorite = function(partnerId) {
        var favorites = this.getFavorites();
        return favorites.includes(partnerId);
    };

    window.UIServiceClass.prototype.getFavorites = function() {
        var self = this;
        try {
            var favorites = localStorage.getItem(self.config.favoritesKey);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('[UI] 즐겨찾기 로드 오류:', error);
            return [];
        }
    };

    window.UIServiceClass.prototype.saveFavorites = function(favorites) {
        var self = this;
        try {
            localStorage.setItem(self.config.favoritesKey, JSON.stringify(favorites));
        } catch (error) {
            console.error('[UI] 즐겨찾기 저장 오류:', error);
        }
    };

    window.UIServiceClass.prototype.updateFavoriteButtons = function() {
        var self = this;

        var buttons = document.querySelectorAll('.pm-favorite-btn');
        buttons.forEach(function(btn) {
            var partnerId = btn.getAttribute('data-partner-id');
            var isFav = self.isFavorite(partnerId);

            if (isFav) {
                btn.classList.add('active');
                btn.textContent = btn.textContent.includes('즐겨찾기됨') ? '❤️ 즐겨찾기됨' : '❤️';
            } else {
                btn.classList.remove('active');
                btn.textContent = btn.textContent.includes('즐겨찾기') ? '🤍 즐겨찾기' : '🤍';
            }
        });
    };

    // ========================================
    // 공유
    // ========================================

    window.UIServiceClass.prototype.showShareModal = function(partnerId) {
        var modal = document.getElementById('pm-share-modal');
        if (!modal) return;

        modal.classList.add('pm-modal-active');

        var copyBtn = document.getElementById('pm-share-copy');
        if (copyBtn) {
            copyBtn.setAttribute('data-partner-id', partnerId);
        }

        var kakaoBtn = document.getElementById('pm-share-kakao');
        if (kakaoBtn) {
            kakaoBtn.setAttribute('data-partner-id', partnerId);
        }
    };

    window.UIServiceClass.prototype.closeShareModal = function() {
        var modal = document.getElementById('pm-share-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
        }
    };

    window.UIServiceClass.prototype.copyLink = function(url) {
        var self = this;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(function() {
                    self.showToast('링크가 복사되었습니다.', 'success');
                    self.closeShareModal();
                })
                .catch(function(error) {
                    console.error('[UI] 링크 복사 오류:', error);
                    self.showToast('링크 복사에 실패했습니다.', 'error');
                });
        } else {
            var textarea = document.getElementById('pm-clipboard-helper');
            if (!textarea) {
                self.showToast('클립보드 복사를 지원하지 않는 브라우저입니다.', 'error');
                return;
            }

            textarea.value = url;
            textarea.style.display = 'block';
            textarea.select();

            try {
                document.execCommand('copy');
                self.showToast('링크가 복사되었습니다.', 'success');
                self.closeShareModal();
            } catch (error) {
                console.error('[UI] 링크 복사 오류:', error);
                self.showToast('링크 복사에 실패했습니다.', 'error');
            }

            textarea.style.display = 'none';
            textarea.value = '';
        }
    };

    window.UIServiceClass.prototype.shareKakao = function(partnerId) {
        var self = this;
        self.showToast('카카오톡 공유 기능은 준비 중입니다.', 'info');
        self.closeShareModal();
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.UIService = null;

})(window);
