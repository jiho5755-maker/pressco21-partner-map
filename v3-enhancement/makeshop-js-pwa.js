/**
 * 파트너맵 v3 - PWA 서비스
 * 책임: Service Worker 등록, 설치 프롬프트, 오프라인 감지
 * 메이크샵 D4 호환: var 사용, ES5 문법, 템플릿 리터럴 이스케이프
 */

(function(window) {
    'use strict';

    /**
     * PWA 서비스
     * @param {Object} config - CONFIG 객체
     */
    function PWAService(config) {
        this.config = config;
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * PWA 서비스 초기화
     */
    PWAService.prototype.init = function() {
        var self = this;

        console.log('[PWA] PWA 서비스 초기화 시작');

        // 1. Service Worker 등록
        self.registerServiceWorker();

        // 2. 설치 프롬프트 리스너
        self.setupInstallPrompt();

        // 3. 온라인/오프라인 감지
        self.setupNetworkListeners();

        // 4. 설치 배너 UI
        self.setupInstallBanner();

        // 5. 업데이트 확인
        self.checkForUpdates();

        console.log('[PWA] PWA 서비스 초기화 완료');
    };

    // ========================================
    // Service Worker 등록
    // ========================================

    /**
     * Service Worker 등록
     */
    PWAService.prototype.registerServiceWorker = function() {
        var self = this;

        if (!('serviceWorker' in navigator)) {
            console.warn('[PWA] Service Worker를 지원하지 않는 브라우저입니다.');
            return;
        }

        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('[PWA] Service Worker 등록 성공:', registration.scope);

                // 업데이트 감지
                registration.addEventListener('updatefound', function() {
                    var newWorker = registration.installing;

                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] 새로운 버전 감지');
                            self.showUpdateNotification();
                        }
                    });
                });

                // 주기적으로 업데이트 확인 (1시간마다)
                setInterval(function() {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch(function(error) {
                console.error('[PWA] Service Worker 등록 실패:', error);
            });
    };

    // ========================================
    // 설치 프롬프트
    // ========================================

    /**
     * 설치 프롬프트 리스너 설정
     */
    PWAService.prototype.setupInstallPrompt = function() {
        var self = this;

        // beforeinstallprompt 이벤트 캡처
        window.addEventListener('beforeinstallprompt', function(e) {
            console.log('[PWA] beforeinstallprompt 이벤트 발생');

            // 기본 프롬프트 방지
            e.preventDefault();

            // 나중에 사용하기 위해 저장
            self.deferredPrompt = e;

            // 설치 배너 표시
            self.showInstallBanner();
        });

        // 설치 완료 감지
        window.addEventListener('appinstalled', function() {
            console.log('[PWA] 앱 설치 완료');
            self.isInstalled = true;
            self.deferredPrompt = null;
            self.hideInstallBanner();

            // 설치 완료 토스트
            if (window.UIService) {
                window.UIService.showToast('파트너맵이 설치되었습니다!', 'success');
            }

            // Analytics 추적
            if (window.analyticsInstance) {
                window.analyticsInstance.trackEvent('pwa_installed', {
                    platform: self.getPlatform()
                });
            }
        });
    };

    /**
     * 설치 배너 표시
     */
    PWAService.prototype.showInstallBanner = function() {
        var self = this;

        // 이미 설치된 경우 표시 안 함
        if (self.isInstalled || self.isStandalone()) {
            return;
        }

        var banner = document.getElementById('pm-install-banner');
        if (!banner) {
            // 배너 생성
            banner = document.createElement('div');
            banner.id = 'pm-install-banner';
            banner.className = 'pm-install-banner';
            banner.innerHTML =
                '<div class="pm-install-banner-content">' +
                '    <i class="ph ph-download-simple pm-install-icon"></i>' +
                '    <div class="pm-install-text">' +
                '        <strong>파트너맵 설치</strong>' +
                '        <span>홈 화면에 추가하여 앱처럼 사용하세요</span>' +
                '    </div>' +
                '    <button class="pm-install-btn" id="pm-install-btn-action">설치</button>' +
                '    <button class="pm-install-close" id="pm-install-btn-close" aria-label="닫기">' +
                '        <i class="ph ph-x"></i>' +
                '    </button>' +
                '</div>';

            document.body.appendChild(banner);

            // 이벤트 리스너
            document.getElementById('pm-install-btn-action').addEventListener('click', function() {
                self.promptInstall();
            });

            document.getElementById('pm-install-btn-close').addEventListener('click', function() {
                self.hideInstallBanner();

                // 24시간 동안 숨김 (localStorage)
                localStorage.setItem('pm_install_banner_hidden', Date.now().toString());
            });
        }

        // 24시간 이내에 숨긴 기록 확인
        var hiddenTime = localStorage.getItem('pm_install_banner_hidden');
        if (hiddenTime && (Date.now() - parseInt(hiddenTime)) < 24 * 60 * 60 * 1000) {
            return;
        }

        // 배너 표시 (애니메이션)
        setTimeout(function() {
            banner.classList.add('pm-install-banner-visible');
        }, 100);

        console.log('[PWA] 설치 배너 표시');
    };

    /**
     * 설치 배너 숨김
     */
    PWAService.prototype.hideInstallBanner = function() {
        var banner = document.getElementById('pm-install-banner');
        if (banner) {
            banner.classList.remove('pm-install-banner-visible');
            setTimeout(function() {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        }
    };

    /**
     * 설치 프롬프트 표시
     */
    PWAService.prototype.promptInstall = function() {
        var self = this;

        if (!self.deferredPrompt) {
            console.warn('[PWA] 설치 프롬프트가 준비되지 않았습니다.');

            // iOS Safari 안내
            if (self.isIOS()) {
                self.showIOSInstallGuide();
            } else {
                if (window.UIService) {
                    window.UIService.showToast('이미 설치되었거나 설치할 수 없습니다.', 'info');
                }
            }
            return;
        }

        // 프롬프트 표시
        self.deferredPrompt.prompt();

        // 사용자 선택 대기
        self.deferredPrompt.userChoice.then(function(choiceResult) {
            console.log('[PWA] 사용자 선택:', choiceResult.outcome);

            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] 사용자가 설치를 수락했습니다.');

                // Analytics 추적
                if (window.analyticsInstance) {
                    window.analyticsInstance.trackEvent('pwa_install_accepted', {
                        platform: self.getPlatform()
                    });
                }
            } else {
                console.log('[PWA] 사용자가 설치를 거부했습니다.');

                // Analytics 추적
                if (window.analyticsInstance) {
                    window.analyticsInstance.trackEvent('pwa_install_declined', {
                        platform: self.getPlatform()
                    });
                }
            }

            // 프롬프트 초기화
            self.deferredPrompt = null;
            self.hideInstallBanner();
        });
    };

    /**
     * iOS 설치 가이드 표시
     */
    PWAService.prototype.showIOSInstallGuide = function() {
        if (!window.UIService) return;

        var guide =
            '<div style="text-align: left; line-height: 1.8;">' +
            '    <h3 style="margin-bottom: 16px;">iOS에 설치하기</h3>' +
            '    <ol style="margin-left: 20px;">' +
            '        <li>하단의 <strong>공유</strong> 버튼을 누르세요</li>' +
            '        <li><strong>홈 화면에 추가</strong>를 선택하세요</li>' +
            '        <li><strong>추가</strong>를 눌러 완료하세요</li>' +
            '    </ol>' +
            '</div>';

        // 모달로 표시 (UIService의 showPartnerDetail 재활용)
        var modalBody = document.getElementById('pm-modal-body');
        if (modalBody) {
            modalBody.innerHTML = guide;
            var modal = document.getElementById('pm-modal');
            if (modal) {
                modal.classList.add('pm-modal-open');
            }
        }
    };

    // ========================================
    // 네트워크 감지
    // ========================================

    /**
     * 온라인/오프라인 리스너 설정
     */
    PWAService.prototype.setupNetworkListeners = function() {
        var self = this;

        window.addEventListener('online', function() {
            console.log('[PWA] 온라인 상태');
            self.isOnline = true;

            if (window.UIService) {
                window.UIService.showToast('인터넷에 연결되었습니다', 'success');
            }

            // 온라인 복귀 시 데이터 동기화
            self.syncDataOnline();
        });

        window.addEventListener('offline', function() {
            console.log('[PWA] 오프라인 상태');
            self.isOnline = false;

            if (window.UIService) {
                window.UIService.showToast('오프라인 상태입니다. 일부 기능이 제한됩니다.', 'warning');
            }
        });

        // 초기 상태 확인
        if (!navigator.onLine) {
            console.log('[PWA] 초기 상태: 오프라인');
        }
    };

    /**
     * 온라인 복귀 시 데이터 동기화
     */
    PWAService.prototype.syncDataOnline = function() {
        console.log('[PWA] 온라인 복귀 - 데이터 동기화 시작');

        // Background Sync API 사용 (Chrome/Edge만 지원)
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(function(registration) {
                return registration.sync.register('sync-partners');
            }).then(function() {
                console.log('[PWA] Background Sync 등록 완료');
            }).catch(function(error) {
                console.error('[PWA] Background Sync 실패:', error);
            });
        } else {
            // Background Sync 미지원 시 직접 동기화
            console.log('[PWA] Background Sync 미지원 - 직접 동기화');
            // 필요 시 직접 API 호출
        }
    };

    // ========================================
    // 업데이트 관리
    // ========================================

    /**
     * Service Worker 업데이트 확인
     */
    PWAService.prototype.checkForUpdates = function() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then(function(registration) {
            registration.update();
        });
    };

    /**
     * 업데이트 알림 표시
     */
    PWAService.prototype.showUpdateNotification = function() {
        if (!window.UIService) return;

        // 업데이트 배너 생성
        var banner = document.createElement('div');
        banner.className = 'pm-update-banner';
        banner.innerHTML =
            '<div class="pm-update-banner-content">' +
            '    <i class="ph ph-arrow-clockwise"></i>' +
            '    <span>새 버전이 있습니다</span>' +
            '    <button class="pm-update-btn" id="pm-update-btn">업데이트</button>' +
            '</div>';

        document.body.appendChild(banner);

        // 업데이트 버튼 클릭
        document.getElementById('pm-update-btn').addEventListener('click', function() {
            // Service Worker에 skipWaiting 메시지 전송
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }

            // 페이지 새로고침
            window.location.reload();
        });
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * Standalone 모드 확인 (이미 설치됨)
     * @returns {boolean} Standalone 모드 여부
     */
    PWAService.prototype.isStandalone = function() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    };

    /**
     * iOS 여부 확인
     * @returns {boolean} iOS 여부
     */
    PWAService.prototype.isIOS = function() {
        return /iPhone|iPad|iPod/.test(navigator.userAgent);
    };

    /**
     * Android 여부 확인
     * @returns {boolean} Android 여부
     */
    PWAService.prototype.isAndroid = function() {
        return /Android/.test(navigator.userAgent);
    };

    /**
     * 플랫폼 반환
     * @returns {string} 플랫폼 ('ios' | 'android' | 'desktop')
     */
    PWAService.prototype.getPlatform = function() {
        if (this.isIOS()) return 'ios';
        if (this.isAndroid()) return 'android';
        return 'desktop';
    };

    // ========================================
    // 설치 배너 스타일 (동적 추가)
    // ========================================

    /**
     * 설치 배너 UI 설정
     */
    PWAService.prototype.setupInstallBanner = function() {
        // 스타일 추가 (한 번만)
        if (document.getElementById('pm-install-banner-styles')) return;

        var style = document.createElement('style');
        style.id = 'pm-install-banner-styles';
        style.textContent =
            '.pm-install-banner {' +
            '    position: fixed;' +
            '    bottom: -100px;' +
            '    left: 0;' +
            '    right: 0;' +
            '    background: white;' +
            '    box-shadow: 0 -4px 16px rgba(0,0,0,0.1);' +
            '    padding: 16px;' +
            '    z-index: 10000;' +
            '    transition: bottom 0.3s ease;' +
            '}' +
            '.pm-install-banner-visible {' +
            '    bottom: 0;' +
            '}' +
            '.pm-install-banner-content {' +
            '    display: flex;' +
            '    align-items: center;' +
            '    gap: 16px;' +
            '    max-width: 1200px;' +
            '    margin: 0 auto;' +
            '}' +
            '.pm-install-icon {' +
            '    font-size: 32px;' +
            '    color: #7D9675;' +
            '    flex-shrink: 0;' +
            '}' +
            '.pm-install-text {' +
            '    flex: 1;' +
            '    display: flex;' +
            '    flex-direction: column;' +
            '    gap: 4px;' +
            '}' +
            '.pm-install-text strong {' +
            '    font-size: 16px;' +
            '    color: #2C3E2F;' +
            '}' +
            '.pm-install-text span {' +
            '    font-size: 14px;' +
            '    color: #666;' +
            '}' +
            '.pm-install-btn {' +
            '    background: linear-gradient(135deg, #7D9675 0%, #5A6F52 100%);' +
            '    color: white;' +
            '    border: none;' +
            '    border-radius: 8px;' +
            '    padding: 12px 24px;' +
            '    font-size: 14px;' +
            '    font-weight: 600;' +
            '    cursor: pointer;' +
            '    transition: all 0.3s ease;' +
            '    white-space: nowrap;' +
            '}' +
            '.pm-install-btn:hover {' +
            '    transform: translateY(-2px);' +
            '    box-shadow: 0 4px 12px rgba(125, 150, 117, 0.3);' +
            '}' +
            '.pm-install-close {' +
            '    background: transparent;' +
            '    border: none;' +
            '    color: #999;' +
            '    font-size: 24px;' +
            '    cursor: pointer;' +
            '    padding: 4px;' +
            '    display: flex;' +
            '    align-items: center;' +
            '    justify-content: center;' +
            '}' +
            '.pm-update-banner {' +
            '    position: fixed;' +
            '    top: 0;' +
            '    left: 0;' +
            '    right: 0;' +
            '    background: linear-gradient(135deg, #C9A961 0%, #B89750 100%);' +
            '    color: white;' +
            '    padding: 12px 16px;' +
            '    z-index: 10001;' +
            '    box-shadow: 0 2px 8px rgba(0,0,0,0.2);' +
            '}' +
            '.pm-update-banner-content {' +
            '    display: flex;' +
            '    align-items: center;' +
            '    justify-content: center;' +
            '    gap: 12px;' +
            '    max-width: 1200px;' +
            '    margin: 0 auto;' +
            '}' +
            '.pm-update-btn {' +
            '    background: white;' +
            '    color: #C9A961;' +
            '    border: none;' +
            '    border-radius: 6px;' +
            '    padding: 8px 16px;' +
            '    font-size: 14px;' +
            '    font-weight: 600;' +
            '    cursor: pointer;' +
            '}' +
            '@media (max-width: 768px) {' +
            '    .pm-install-text span {' +
            '        display: none;' +
            '    }' +
            '}';

        document.head.appendChild(style);
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.PWAService = PWAService;

})(window);
