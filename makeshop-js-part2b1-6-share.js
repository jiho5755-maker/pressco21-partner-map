/**
 * 파트너맵 v3 - UI 컴포넌트 Part 6/6 - 공유
 * 책임: 공유 모달, 링크 복사, 카카오톡 공유
 *
 * [메이크샵 최적화]
 * - HTML 문자열 연결 없음
 * - 파일 크기: 3KB 이하
 * - 라인 수: 100줄 이하
 */

(function(window) {
    'use strict';

    var UIService = window.UIServiceClass;
    if (!UIService) {
        console.error('[UI] UIServiceClass가 로드되지 않았습니다.');
        return;
    }

    // ========================================
    // 공유
    // ========================================

    /**
     * 공유 모달 표시
     * @param {string} partnerId - 파트너 ID
     */
    UIService.prototype.showShareModal = function(partnerId) {
        var modal = document.getElementById('pm-share-modal');
        if (!modal) return;

        modal.classList.add('pm-modal-active');

        // 공유 버튼에 파트너 ID 설정
        var copyBtn = document.getElementById('pm-share-copy');
        if (copyBtn) {
            copyBtn.setAttribute('data-partner-id', partnerId);
        }

        var kakaoBtn = document.getElementById('pm-share-kakao');
        if (kakaoBtn) {
            kakaoBtn.setAttribute('data-partner-id', partnerId);
        }
    };

    /**
     * 공유 모달 닫기
     */
    UIService.prototype.closeShareModal = function() {
        var modal = document.getElementById('pm-share-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
        }
    };

    /**
     * 링크 복사
     * @param {string} url - 복사할 URL
     */
    UIService.prototype.copyLink = function(url) {
        var self = this;

        // 모던 브라우저
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
            // 구형 브라우저 폴백
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

    /**
     * 카카오톡 공유
     * @param {string} partnerId - 파트너 ID
     */
    UIService.prototype.shareKakao = function(partnerId) {
        var self = this;

        // 카카오톡 공유는 카카오 SDK 필요
        // 여기서는 간단한 알림만 표시
        self.showToast('카카오톡 공유 기능은 준비 중입니다.', 'info');
        self.closeShareModal();
    };

    // ========================================
    // 전역 등록
    // ========================================

    // 전역 인스턴스 (메인에서 생성)
    window.UIService = null;

    console.log('[UI] UIService 모든 파트 로드 완료');

})(window);
