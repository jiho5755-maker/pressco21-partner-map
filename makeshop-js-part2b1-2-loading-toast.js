/**
 * 파트너맵 v3 - UI 컴포넌트 Part 2/6 - 로딩 & 토스트
 * 책임: 로딩 오버레이, 토스트 알림
 *
 * [메이크샵 최적화]
 * - HTML 문자열 연결 최소화 (10줄 이하)
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

        // 간단한 HTML 생성 (3줄 이하)
        var escapedMsg = window.escapeHtml ? window.escapeHtml(message) : message;
        var toastHTML = '<div class="pm-toast pm-toast-' + type + '">' + escapedMsg + '</div>';

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
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }, self.config.toastDuration);
    };

})(window);
