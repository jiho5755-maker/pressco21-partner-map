/**
 * 파트너맵 v3 - 터치 UX 서비스
 * 책임: 스와이프, Pull to Refresh, 롱프레스, 햅틱, 리플 효과
 * 메이크샵 호환: ES5 문법, IIFE 패턴, 이스케이프 처리
 */

(function(window) {
    'use strict';

    /**
     * 터치 서비스
     * @param {Object} config - CONFIG 객체
     */
    function TouchService(config) {
        this.config = config || {};

        // 터치 상태
        this.touchState = {
            startX: 0,
            startY: 0,
            startTime: 0,
            currentX: 0,
            currentY: 0,
            isDragging: false,
            element: null
        };

        // 설정 (기본값)
        this.settings = {
            swipeThreshold: 50,        // 스와이프 최소 거리 (px)
            swipeTimeout: 300,         // 스와이프 최대 시간 (ms)
            longPressDelay: 500,       // 롱프레스 지연 시간 (ms)
            pullRefreshThreshold: 80,  // Pull to Refresh 임계값 (px)
            rippleDuration: 600        // 리플 효과 지속 시간 (ms)
        };

        // 롱프레스 타이머
        this.longPressTimer = null;

        // Pull to Refresh 상태
        this.pullRefreshState = {
            isPulling: false,
            startY: 0,
            currentY: 0
        };
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 터치 서비스 초기화
     */
    TouchService.prototype.init = function() {
        var self = this;

        console.log('[Touch] 터치 서비스 초기화 시작');

        // 모바일 감지
        if (!self.isMobileDevice()) {
            console.log('[Touch] 데스크톱 환경 - 터치 기능 제한');
            return;
        }

        // Pull to Refresh 인디케이터 생성
        self.createPullRefreshIndicator();

        console.log('[Touch] 터치 서비스 초기화 완료');
    };

    /**
     * 모바일 기기 감지
     * @returns {boolean}
     */
    TouchService.prototype.isMobileDevice = function() {
        // 화면 너비 기준
        if (window.innerWidth >= 768) {
            return false;
        }

        // User Agent 기준
        var ua = navigator.userAgent || navigator.vendor || window.opera;
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    };

    // ========================================
    // 스와이프 감지
    // ========================================

    /**
     * 스와이프 이벤트 등록
     * @param {HTMLElement} element - 대상 요소
     * @param {Function} callback - 콜백 함수 (direction, distance)
     */
    TouchService.prototype.onSwipe = function(element, callback) {
        var self = this;

        if (!element) return;

        // Passive Listener 옵션
        var passiveOption = self.supportsPassive() ? { passive: false } : false;

        element.addEventListener('touchstart', function(e) {
            var touch = e.touches[0];
            self.touchState.startX = touch.clientX;
            self.touchState.startY = touch.clientY;
            self.touchState.startTime = Date.now();
            self.touchState.element = element;
        }, passiveOption);

        element.addEventListener('touchmove', function(e) {
            var touch = e.touches[0];
            self.touchState.currentX = touch.clientX;
            self.touchState.currentY = touch.clientY;
            self.touchState.isDragging = true;
        }, passiveOption);

        element.addEventListener('touchend', function(e) {
            if (!self.touchState.isDragging) return;

            var deltaX = self.touchState.currentX - self.touchState.startX;
            var deltaY = self.touchState.currentY - self.touchState.startY;
            var deltaTime = Date.now() - self.touchState.startTime;

            // 스와이프 거리 및 시간 검증
            var absX = Math.abs(deltaX);
            var absY = Math.abs(deltaY);

            if (deltaTime < self.settings.swipeTimeout &&
                (absX > self.settings.swipeThreshold || absY > self.settings.swipeThreshold)) {

                // 방향 판단
                var direction = '';
                var distance = 0;

                if (absX > absY) {
                    // 좌우 스와이프
                    direction = deltaX > 0 ? 'right' : 'left';
                    distance = absX;
                } else {
                    // 상하 스와이프
                    direction = deltaY > 0 ? 'down' : 'up';
                    distance = absY;
                }

                // 콜백 실행
                if (callback) {
                    callback(direction, distance);
                }

                // 햅틱 피드백
                self.hapticFeedback('light');
            }

            // 상태 초기화
            self.touchState.isDragging = false;
            self.touchState.element = null;
        }, passiveOption);
    };

    // ========================================
    // 롱프레스 감지
    // ========================================

    /**
     * 롱프레스 이벤트 등록
     * @param {HTMLElement} element - 대상 요소
     * @param {Function} callback - 콜백 함수
     */
    TouchService.prototype.onLongPress = function(element, callback) {
        var self = this;

        if (!element) return;

        element.addEventListener('touchstart', function(e) {
            var touch = e.touches[0];
            self.touchState.startX = touch.clientX;
            self.touchState.startY = touch.clientY;

            // 롱프레스 타이머 시작
            self.longPressTimer = setTimeout(function() {
                if (callback) {
                    callback(e);
                }
                self.hapticFeedback('medium');
            }, self.settings.longPressDelay);
        });

        element.addEventListener('touchmove', function(e) {
            // 이동 시 타이머 취소
            var touch = e.touches[0];
            var deltaX = Math.abs(touch.clientX - self.touchState.startX);
            var deltaY = Math.abs(touch.clientY - self.touchState.startY);

            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(self.longPressTimer);
            }
        });

        element.addEventListener('touchend', function() {
            clearTimeout(self.longPressTimer);
        });

        element.addEventListener('touchcancel', function() {
            clearTimeout(self.longPressTimer);
        });
    };

    // ========================================
    // Pull to Refresh
    // ========================================

    /**
     * Pull to Refresh 인디케이터 생성
     */
    TouchService.prototype.createPullRefreshIndicator = function() {
        var indicator = document.getElementById('pm-pull-indicator');
        if (indicator) return; // 이미 존재

        var container = document.getElementById('partnermap-container');
        if (!container) return;

        var html = '<div id="pm-pull-indicator" class="pm-pull-indicator" style="display: none;">' +
                   '<div class="pm-pull-spinner"></div>' +
                   '<span class="pm-pull-text">새로고침하려면 당기세요</span>' +
                   '</div>';

        container.insertAdjacentHTML('afterbegin', html);
    };

    /**
     * Pull to Refresh 이벤트 등록
     * @param {HTMLElement} scrollElement - 스크롤 대상 요소
     * @param {Function} callback - 콜백 함수
     */
    TouchService.prototype.onPullRefresh = function(scrollElement, callback) {
        var self = this;

        if (!scrollElement) return;

        var indicator = document.getElementById('pm-pull-indicator');
        if (!indicator) {
            self.createPullRefreshIndicator();
            indicator = document.getElementById('pm-pull-indicator');
        }

        var indicatorText = indicator ? indicator.querySelector('.pm-pull-text') : null;

        scrollElement.addEventListener('touchstart', function(e) {
            // 스크롤이 최상단일 때만
            if (scrollElement.scrollTop === 0) {
                var touch = e.touches[0];
                self.pullRefreshState.startY = touch.clientY;
                self.pullRefreshState.isPulling = true;
            }
        });

        scrollElement.addEventListener('touchmove', function(e) {
            if (!self.pullRefreshState.isPulling) return;

            var touch = e.touches[0];
            self.pullRefreshState.currentY = touch.clientY;
            var deltaY = self.pullRefreshState.currentY - self.pullRefreshState.startY;

            if (deltaY > 0) {
                e.preventDefault();

                // 인디케이터 표시
                if (indicator) {
                    indicator.style.display = 'flex';
                    indicator.style.height = Math.min(deltaY, 100) + 'px';

                    if (deltaY >= self.settings.pullRefreshThreshold) {
                        if (indicatorText) {
                            indicatorText.textContent = '놓으면 새로고침';
                        }
                        indicator.classList.add('pm-pull-ready');
                    } else {
                        if (indicatorText) {
                            indicatorText.textContent = '새로고침하려면 당기세요';
                        }
                        indicator.classList.remove('pm-pull-ready');
                    }
                }
            }
        }, { passive: false });

        scrollElement.addEventListener('touchend', function() {
            if (!self.pullRefreshState.isPulling) return;

            var deltaY = self.pullRefreshState.currentY - self.pullRefreshState.startY;

            if (deltaY >= self.settings.pullRefreshThreshold) {
                // 새로고침 실행
                if (indicatorText) {
                    indicatorText.textContent = '새로고침 중...';
                }

                if (callback) {
                    callback(function() {
                        // 완료 후 인디케이터 숨김
                        setTimeout(function() {
                            if (indicator) {
                                indicator.style.display = 'none';
                                indicator.classList.remove('pm-pull-ready');
                            }
                        }, 300);
                    });
                }

                self.hapticFeedback('medium');
            } else {
                // 취소
                if (indicator) {
                    indicator.style.display = 'none';
                    indicator.classList.remove('pm-pull-ready');
                }
            }

            // 상태 초기화
            self.pullRefreshState.isPulling = false;
            self.pullRefreshState.startY = 0;
            self.pullRefreshState.currentY = 0;
        });
    };

    // ========================================
    // 햅틱 피드백
    // ========================================

    /**
     * 햅틱 피드백 (Vibration API)
     * @param {string} type - 강도 ('light', 'medium', 'heavy')
     */
    TouchService.prototype.hapticFeedback = function(type) {
        if (!navigator.vibrate) return;

        var pattern = {
            light: 10,
            medium: 20,
            heavy: 50
        };

        var duration = pattern[type] || pattern.light;

        try {
            navigator.vibrate(duration);
        } catch (error) {
            // iOS는 Vibration API를 지원하지 않음
            console.log('[Touch] Haptic not supported');
        }
    };

    // ========================================
    // 리플 효과 (Material Design)
    // ========================================

    /**
     * 리플 효과 추가
     * @param {HTMLElement} element - 대상 요소
     * @param {Event} event - 터치 이벤트
     */
    TouchService.prototype.addRipple = function(element, event) {
        var self = this;

        if (!element) return;

        // 상대 위치 계산
        var rect = element.getBoundingClientRect();
        var touch = event.touches ? event.touches[0] : event;
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;

        // 리플 요소 생성
        var ripple = document.createElement('span');
        ripple.className = 'pm-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // 부모 요소에 추가
        if (!element.classList.contains('pm-ripple-container')) {
            element.classList.add('pm-ripple-container');
        }
        element.appendChild(ripple);

        // 애니메이션 완료 후 제거
        setTimeout(function() {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, self.settings.rippleDuration);
    };

    /**
     * 리플 효과 이벤트 등록
     * @param {HTMLElement} element - 대상 요소
     */
    TouchService.prototype.enableRipple = function(element) {
        var self = this;

        if (!element) return;

        element.addEventListener('touchstart', function(e) {
            self.addRipple(this, e);
        });
    };

    // ========================================
    // 터치 활성 상태
    // ========================================

    /**
     * 터치 활성 상태 추가
     * @param {HTMLElement} element - 대상 요소
     */
    TouchService.prototype.enableTouchActive = function(element) {
        if (!element) return;

        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });

        element.addEventListener('touchend', function() {
            var self = this;
            setTimeout(function() {
                self.classList.remove('touch-active');
            }, 150);
        });

        element.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        });
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * Passive Listener 지원 확인
     * @returns {boolean}
     */
    TouchService.prototype.supportsPassive = function() {
        var supportsPassive = false;

        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                    return true;
                }
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
        } catch (e) {
            // Not supported
        }

        return supportsPassive;
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.TouchService = TouchService;

})(window);
