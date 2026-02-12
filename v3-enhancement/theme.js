/**
 * 파트너맵 v3 - 다크모드 테마 시스템
 * 메이크샵 호환: ES5 문법, IIFE 패턴, localStorage 기반
 */

(function() {
    'use strict';

    // ========================================
    // 설정
    // ========================================

    var THEME_STORAGE_KEY = 'partnermap-theme';
    var THEME_ATTRIBUTE = 'data-theme';
    var THEME_LIGHT = 'light';
    var THEME_DARK = 'dark';
    var THEME_EVENT = 'partnermap:theme-changed';

    // ========================================
    // 유틸리티 함수
    // ========================================

    /**
     * localStorage에서 테마 가져오기
     * @returns {string|null}
     */
    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            console.warn('localStorage 접근 실패:', e);
            return null;
        }
    }

    /**
     * localStorage에 테마 저장하기
     * @param {string} theme
     */
    function setStoredTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.warn('localStorage 저장 실패:', e);
        }
    }

    /**
     * 시스템 다크모드 선호도 감지
     * @returns {boolean}
     */
    function prefersDarkMode() {
        if (!window.matchMedia) {
            return false;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * 현재 활성 테마 반환
     * @returns {string} 'light' | 'dark'
     */
    function getCurrentTheme() {
        var stored = getStoredTheme();
        if (stored === THEME_LIGHT || stored === THEME_DARK) {
            return stored;
        }
        // 저장된 값이 없으면 시스템 선호도 확인
        return prefersDarkMode() ? THEME_DARK : THEME_LIGHT;
    }

    /**
     * DOM에 테마 적용
     * @param {string} theme
     */
    function applyTheme(theme) {
        var container = document.getElementById('partnermap-container');
        if (!container) {
            console.warn('파트너맵 컨테이너를 찾을 수 없습니다.');
            return;
        }

        // data-theme 속성 설정
        container.setAttribute(THEME_ATTRIBUTE, theme);

        // 토글 버튼 아이콘 업데이트
        updateToggleButton(theme);

        // CustomEvent 발행 (다른 모듈에서 테마 변경 감지 가능)
        try {
            var event = new CustomEvent(THEME_EVENT, {
                detail: { theme: theme },
                bubbles: true,
                cancelable: false
            });
            container.dispatchEvent(event);
        } catch (e) {
            // IE11 fallback
            var fallbackEvent = document.createEvent('CustomEvent');
            fallbackEvent.initCustomEvent(THEME_EVENT, true, false, { theme: theme });
            container.dispatchEvent(fallbackEvent);
        }
    }

    /**
     * 토글 버튼 아이콘 업데이트
     * @param {string} theme
     */
    function updateToggleButton(theme) {
        var toggleBtn = document.getElementById('pm-theme-toggle');
        if (!toggleBtn) {
            return;
        }

        var sunIcon = toggleBtn.querySelector('.pm-theme-icon-sun');
        var moonIcon = toggleBtn.querySelector('.pm-theme-icon-moon');

        if (!sunIcon || !moonIcon) {
            return;
        }

        if (theme === THEME_DARK) {
            // 다크모드: 해 아이콘 표시 (라이트로 전환 가능)
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            toggleBtn.setAttribute('aria-label', '라이트 모드로 전환');
            toggleBtn.setAttribute('title', '라이트 모드로 전환');
        } else {
            // 라이트모드: 달 아이콘 표시 (다크로 전환 가능)
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            toggleBtn.setAttribute('aria-label', '다크 모드로 전환');
            toggleBtn.setAttribute('title', '다크 모드로 전환');
        }
    }

    /**
     * 테마 토글 (light ↔ dark)
     */
    function toggleTheme() {
        var currentTheme = getCurrentTheme();
        var newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
        setStoredTheme(newTheme);
        applyTheme(newTheme);
    }

    /**
     * 테마 강제 설정
     * @param {string} theme 'light' | 'dark'
     */
    function setTheme(theme) {
        if (theme !== THEME_LIGHT && theme !== THEME_DARK) {
            console.warn('유효하지 않은 테마:', theme);
            return;
        }
        setStoredTheme(theme);
        applyTheme(theme);
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 테마 시스템 초기화
     */
    function initTheme() {
        // 1. 초기 테마 적용 (FOUC 방지)
        var initialTheme = getCurrentTheme();
        applyTheme(initialTheme);

        // 2. 토글 버튼 이벤트 리스너
        var toggleBtn = document.getElementById('pm-theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });
        }

        // 3. 시스템 테마 변경 감지 (실시간 반응)
        if (window.matchMedia) {
            var darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // 모던 브라우저
            if (darkModeQuery.addEventListener) {
                darkModeQuery.addEventListener('change', function(e) {
                    // 사용자가 수동 설정하지 않았을 때만 시스템 설정 따름
                    if (!getStoredTheme()) {
                        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                    }
                });
            }
            // 레거시 브라우저 (Safari < 14)
            else if (darkModeQuery.addListener) {
                darkModeQuery.addListener(function(e) {
                    if (!getStoredTheme()) {
                        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
                    }
                });
            }
        }

        console.log('[파트너맵 테마] 초기화 완료 -', initialTheme, '모드');
    }

    // ========================================
    // 전역 API 노출
    // ========================================

    window.PartnerMapTheme = {
        init: initTheme,
        toggle: toggleTheme,
        set: setTheme,
        get: getCurrentTheme,
        LIGHT: THEME_LIGHT,
        DARK: THEME_DARK
    };

    // DOM 로드 완료 시 자동 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

})();
