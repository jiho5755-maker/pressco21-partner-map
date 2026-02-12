/**
 * 파트너맵 v3 - UI 컴포넌트 Part 5/6 - 즐겨찾기
 * 책임: 즐겨찾기 토글, 저장, 로드, 버튼 업데이트
 *
 * [메이크샵 최적화]
 * - HTML 문자열 연결 없음
 * - 파일 크기: 2.5KB 이하
 * - 라인 수: 80줄 이하
 */

(function(window) {
    'use strict';

    var UIService = window.UIServiceClass;
    if (!UIService) {
        console.error('[UI] UIServiceClass가 로드되지 않았습니다.');
        return;
    }

    // ========================================
    // 즐겨찾기
    // ========================================

    /**
     * 즐겨찾기 토글
     * @param {string} partnerId - 파트너 ID
     * @param {Event} event - 이벤트 (선택)
     */
    UIService.prototype.toggleFavorite = function(partnerId, event) {
        var self = this;

        if (event) {
            event.stopPropagation();
        }

        var favorites = self.getFavorites();
        var index = favorites.indexOf(partnerId);

        if (index === -1) {
            // 추가
            favorites.push(partnerId);
            self.showToast('즐겨찾기에 추가되었습니다.', 'success');
        } else {
            // 제거
            favorites.splice(index, 1);
            self.showToast('즐겨찾기에서 제거되었습니다.', 'info');
        }

        self.saveFavorites(favorites);
        self.updateFavoriteButtons();
    };

    /**
     * 즐겨찾기 여부 확인
     * @param {string} partnerId - 파트너 ID
     * @returns {boolean}
     */
    UIService.prototype.isFavorite = function(partnerId) {
        var favorites = this.getFavorites();
        return favorites.indexOf(partnerId) !== -1;
    };

    /**
     * 즐겨찾기 목록 가져오기
     * @returns {Array} 파트너 ID 배열
     */
    UIService.prototype.getFavorites = function() {
        var self = this;
        try {
            var favorites = localStorage.getItem(self.config.favoritesKey);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('[UI] 즐겨찾기 로드 오류:', error);
            return [];
        }
    };

    /**
     * 즐겨찾기 목록 저장
     * @param {Array} favorites - 파트너 ID 배열
     */
    UIService.prototype.saveFavorites = function(favorites) {
        var self = this;
        try {
            localStorage.setItem(self.config.favoritesKey, JSON.stringify(favorites));
        } catch (error) {
            console.error('[UI] 즐겨찾기 저장 오류:', error);
        }
    };

    /**
     * 즐겨찾기 버튼 업데이트
     */
    UIService.prototype.updateFavoriteButtons = function() {
        var self = this;

        var buttons = document.querySelectorAll('.pm-favorite-btn');
        buttons.forEach(function(btn) {
            var partnerId = btn.getAttribute('data-partner-id');
            var isFav = self.isFavorite(partnerId);

            if (isFav) {
                btn.classList.add('active');
                var text = btn.textContent;
                btn.textContent = text.indexOf('즐겨찾기됨') !== -1 ? '❤️ 즐겨찾기됨' : '❤️';
            } else {
                btn.classList.remove('active');
                var text = btn.textContent;
                btn.textContent = text.indexOf('즐겨찾기') !== -1 ? '🤍 즐겨찾기' : '🤍';
            }
        });
    };

})(window);
