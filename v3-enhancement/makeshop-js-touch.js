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
    // FAB (Floating Action Button) 시스템
    // ========================================

    /**
     * FAB 서비스
     * @param {Object} config - CONFIG 객체
     */
    function FABService(config) {
        this.config = config || {};
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.isVisible = true;
        this.scrollDirection = 'up';
        this.scrollTimer = null;
    }

    /**
     * FAB 초기화
     */
    FABService.prototype.init = function() {
        var self = this;

        console.log('[FAB] FAB 서비스 초기화 시작');

        // 모바일 감지
        if (window.innerWidth >= 768) {
            console.log('[FAB] 데스크톱 환경 - FAB 숨김');
            return;
        }

        // GPS FAB 설정
        self.setupGPSFAB();

        // 필터 FAB 설정
        self.setupFilterFAB();

        // 맨 위로 FAB 설정
        self.setupScrollTopFAB();

        // 스크롤 이벤트 리스너
        self.handleScroll = self.debounce(function() {
            self.updateFABVisibility();
        }, 100);

        window.addEventListener('scroll', self.handleScroll, { passive: true });

        console.log('[FAB] FAB 서비스 초기화 완료');
    };

    /**
     * GPS FAB 설정
     */
    FABService.prototype.setupGPSFAB = function() {
        var gpsFab = document.getElementById('pm-fab-gps');
        if (!gpsFab) return;

        gpsFab.addEventListener('click', function() {
            // GPS 버튼 클릭 이벤트 트리거
            var gpsBtn = document.getElementById('pm-gps-btn');
            if (gpsBtn) {
                gpsBtn.click();
            }
        });

        console.log('[FAB] GPS FAB 설정 완료');
    };

    /**
     * 필터 FAB 설정
     */
    FABService.prototype.setupFilterFAB = function() {
        var filterFab = document.getElementById('pm-fab-filter');
        if (!filterFab) return;

        filterFab.addEventListener('click', function() {
            // 필터 섹션으로 스크롤
            var filterSection = document.querySelector('.pm-search-filter');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        console.log('[FAB] 필터 FAB 설정 완료');
    };

    /**
     * 맨 위로 FAB 설정
     */
    FABService.prototype.setupScrollTopFAB = function() {
        var scrollTopFab = document.getElementById('pm-fab-scroll-top');
        if (!scrollTopFab) return;

        scrollTopFab.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        console.log('[FAB] 맨 위로 FAB 설정 완료');
    };

    /**
     * 스크롤 방향에 따른 FAB 가시성 업데이트
     */
    FABService.prototype.updateFABVisibility = function() {
        var self = this;
        var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        var scrollingDown = currentScrollY > self.lastScrollY;

        // 스크롤 방향 감지
        if (scrollingDown && currentScrollY > self.scrollThreshold) {
            // 아래로 스크롤: FAB 숨김
            self.hideFABs();
        } else {
            // 위로 스크롤: FAB 표시
            self.showFABs();
        }

        // 맨 위로 버튼은 100px 이상 스크롤 시에만 표시
        var scrollTopFab = document.getElementById('pm-fab-scroll-top');
        if (scrollTopFab) {
            if (currentScrollY > 100) {
                scrollTopFab.style.display = 'flex';
            } else {
                scrollTopFab.style.display = 'none';
            }
        }

        self.lastScrollY = currentScrollY;
    };

    /**
     * FAB 숨김
     */
    FABService.prototype.hideFABs = function() {
        var fabContainer = document.querySelector('.pm-fab-container');
        if (fabContainer) {
            fabContainer.classList.add('pm-fab-hidden');
        }
    };

    /**
     * FAB 표시
     */
    FABService.prototype.showFABs = function() {
        var fabContainer = document.querySelector('.pm-fab-container');
        if (fabContainer) {
            fabContainer.classList.remove('pm-fab-hidden');
        }
    };

    /**
     * 디바운스 함수
     */
    FABService.prototype.debounce = function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    };

    // ========================================
    // 고급 제스처 (핀치 줌, 더블탭)
    // ========================================

    /**
     * 핀치 줌 활성화 (지도용)
     * @param {Object} map - 네이버 지도 인스턴스
     */
    TouchService.prototype.enablePinchZoom = function(map) {
        var self = this;
        var initialDistance = 0;
        var initialZoom = 0;

        if (!map) return;

        var mapElement = map.getElement();
        if (!mapElement) return;

        mapElement.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                initialDistance = self.getDistance(e.touches[0], e.touches[1]);
                initialZoom = map.getZoom();
            }
        }, { passive: true });

        mapElement.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();

                var currentDistance = self.getDistance(e.touches[0], e.touches[1]);
                var scale = currentDistance / initialDistance;

                // 줌 레벨 계산 (scale > 1: 줌인, scale < 1: 줌아웃)
                var zoomDelta = Math.log2(scale);
                var newZoom = Math.round(initialZoom + zoomDelta);

                // 줌 레벨 제한 (3 ~ 21)
                newZoom = Math.max(3, Math.min(21, newZoom));

                if (newZoom !== map.getZoom()) {
                    map.setZoom(newZoom);
                }
            }
        }, { passive: false });

        console.log('[Touch] 핀치 줌 활성화');
    };

    /**
     * 더블탭 줌인 활성화 (지도용)
     * @param {Object} map - 네이버 지도 인스턴스
     */
    TouchService.prototype.enableDoubleTapZoom = function(map) {
        var self = this;
        var lastTap = 0;
        var tapTimeout;

        if (!map) return;

        var mapElement = map.getElement();
        if (!mapElement) return;

        mapElement.addEventListener('touchend', function(e) {
            var currentTime = Date.now();
            var tapLength = currentTime - lastTap;

            clearTimeout(tapTimeout);

            if (tapLength < 300 && tapLength > 0) {
                // 더블탭 감지
                e.preventDefault();

                // 터치 위치로 줌인
                var touch = e.changedTouches[0];
                var rect = mapElement.getBoundingClientRect();
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;

                // 화면 좌표를 지도 좌표로 변환
                var projection = map.getProjection();
                var coord = projection.fromPageXYToCoord(new naver.maps.Point(touch.pageX, touch.pageY));

                // 줌인
                map.setZoom(map.getZoom() + 1);
                map.panTo(coord);

                // 햅틱 피드백
                self.hapticFeedback('light');

                lastTap = 0;
            } else {
                lastTap = currentTime;
            }
        });

        console.log('[Touch] 더블탭 줌인 활성화');
    };

    /**
     * 두 터치 포인트 간 거리 계산
     * @param {Touch} touch1 - 첫 번째 터치 포인트
     * @param {Touch} touch2 - 두 번째 터치 포인트
     * @returns {number} 거리 (픽셀)
     */
    TouchService.prototype.getDistance = function(touch1, touch2) {
        var dx = touch1.clientX - touch2.clientX;
        var dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // ========================================
    // Pull to Refresh 개선 (실제 통합)
    // ========================================

    /**
     * Pull to Refresh 활성화 (개선 버전)
     * @param {HTMLElement} element - 대상 요소
     * @param {Object} options - 옵션 { onRefresh: Function }
     */
    TouchService.prototype.enablePullToRefresh = function(element, options) {
        var self = this;

        if (!element) {
            console.warn('[Touch] Pull to Refresh 대상 요소 없음');
            return;
        }

        var indicator = document.getElementById('pm-pull-indicator');
        if (!indicator) {
            self.createPullRefreshIndicator();
            indicator = document.getElementById('pm-pull-indicator');
        }

        var indicatorText = indicator ? indicator.querySelector('.pm-pull-text') : null;
        var spinner = indicator ? indicator.querySelector('.pm-pull-spinner') : null;

        // Pull to Refresh 이벤트 등록
        self.onPullRefresh(element, function(done) {
            if (options && options.onRefresh) {
                // 새로고침 함수 실행
                var refreshPromise = options.onRefresh();

                if (refreshPromise && refreshPromise.then) {
                    // Promise 반환 시
                    refreshPromise
                        .then(function() {
                            console.log('[Touch] Pull to Refresh 완료');
                            if (indicatorText) {
                                indicatorText.textContent = '새로고침 완료!';
                            }
                            setTimeout(function() {
                                done();
                            }, 500);
                        })
                        .catch(function(error) {
                            console.error('[Touch] Pull to Refresh 오류:', error);
                            if (indicatorText) {
                                indicatorText.textContent = '새로고침 실패';
                            }
                            setTimeout(function() {
                                done();
                            }, 500);
                        });
                } else {
                    // Promise 미반환 시
                    setTimeout(function() {
                        done();
                    }, 1000);
                }
            } else {
                done();
            }
        });

        console.log('[Touch] Pull to Refresh 활성화 (실제 통합)');
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.TouchService = TouchService;
    window.FABService = FABService;

})(window);
