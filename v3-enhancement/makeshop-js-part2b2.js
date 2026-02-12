/**
 * 파트너맵 v3 - 메인 스크립트 (Part 2/2)
 * 책임: 초기화 오케스트레이터, 모듈 통합, 이벤트 핸들러
 * 메이크샵 D4 호환: async/await를 Promise 체이닝으로 변경
 */

(function(window) {
    'use strict';

    // ========================================
    // 전역 인스턴스
    // ========================================

    var apiClient = null;
    var mapService = null;
    var filterService = null;
    var searchService = null;
    var uiService = null;
    var analyticsService = null;

    // ========================================
    // 유틸리티 함수
    // ========================================

    /**
     * HTML 이스케이프 (XSS 방지)
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    window.escapeHtml = function(text) {
        if (!text) return '';

        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return String(text).replace(/[&<>"']/g, function(m) {
            return map[m];
        });
    };

    /**
     * 디바운스 함수
     * @param {Function} func - 디바운스할 함수
     * @param {number} wait - 대기 시간 (밀리초)
     * @returns {Function} 디바운스된 함수
     */
    window.debounce = function(func, wait) {
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

    /**
     * Ripple 효과 생성 (Material Design)
     * @param {Event} event - 클릭 이벤트
     * @param {HTMLElement} element - Ripple을 추가할 요소
     */
    window.createRipple = function(event, element) {
        // Ripple 컨테이너 클래스 추가
        if (!element.classList.contains('pm-ripple-container')) {
            element.classList.add('pm-ripple-container');
        }

        // Ripple 요소 생성
        var ripple = document.createElement('span');
        ripple.classList.add('pm-ripple');

        // 클릭 위치 계산
        var rect = element.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Ripple 크기 계산 (요소의 대각선 길이)
        var size = Math.max(rect.width, rect.height) * 2;

        // Ripple 스타일 설정
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';

        // Ripple 추가
        element.appendChild(ripple);

        // 애니메이션 종료 후 제거
        setTimeout(function() {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    };

    // ========================================
    // Ripple 효과 초기화
    // ========================================

    /**
     * Ripple 효과 초기화
     * 모든 버튼에 Ripple 이벤트 리스너 추가
     */
    function setupRipple() {
        var buttons = document.querySelectorAll(
            '#partnermap-container button, ' +
            '#partnermap-container .pm-action-btn, ' +
            '#partnermap-container .pm-gps-btn, ' +
            '#partnermap-container .pm-filter-tab, ' +
            '#partnermap-container .pm-share-btn'
        );

        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                window.createRipple(e, this);
            });
        });

        console.log('[Ripple] Ripple 효과 초기화 완료 (' + buttons.length + '개 버튼)');
    }

    // ========================================
    // GPS 기능
    // ========================================

    /**
     * GPS 버튼 설정
     */
    function setupGPSButton() {
        var gpsBtn = document.getElementById('pm-gps-btn');
        if (!gpsBtn) return;

        gpsBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                uiService.showToast('GPS를 지원하지 않는 브라우저입니다.', 'error');
                return;
            }

            uiService.showToast('위치 정보를 가져오는 중...', 'info');

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

                    console.log('[GPS] 현재 위치:', lat, lng);

                    // 지도 이동
                    if (mapService) {
                        mapService.setReferencePoint(lat, lng);
                    }

                    // 필터 서비스에 기준점 설정
                    if (filterService) {
                        filterService.setReferencePoint(lat, lng);

                        // 거리순 정렬로 변경
                        var sortSelect = document.getElementById('pm-sort-select');
                        if (sortSelect) {
                            sortSelect.value = 'distance';
                            filterService.applyFilters();
                        }
                    }

                    // Analytics 추적 - GPS 검색 성공
                    if (window.AnalyticsService && window.analyticsInstance) {
                        window.analyticsInstance.trackGPSSearch(lat, lng, true);
                    }

                    uiService.showToast('현재 위치로 이동했습니다.', 'success');
                },
                function(error) {
                    console.error('[GPS] 위치 정보 오류:', error);

                    // Analytics 추적 - GPS 검색 실패
                    if (window.AnalyticsService && window.analyticsInstance) {
                        window.analyticsInstance.trackGPSSearch(null, null, false);
                    }

                    var message = CONFIG.errorMessages.gpsError;
                    if (error.code === 1) {
                        message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                    } else if (error.code === 2) {
                        message = '위치 정보를 사용할 수 없습니다.';
                    } else if (error.code === 3) {
                        message = '위치 정보 요청 시간이 초과되었습니다.';
                    }

                    uiService.showToast(message, 'error');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * 기준점 초기화 버튼 설정
     */
    function setupClearReferenceButton() {
        var clearBtn = document.getElementById('pm-clear-reference-btn');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', function() {
            if (mapService) {
                mapService.clearReferencePoint();
            }

            var sortSelect = document.getElementById('pm-sort-select');
            if (sortSelect) {
                sortSelect.value = 'name';
            }

            if (filterService) {
                filterService.applyFilters();
            }

            clearBtn.style.display = 'none';
            uiService.showToast('기준점이 초기화되었습니다.', 'info');
        });
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 파트너맵 초기화 (async/await 제거, Promise 체이닝 사용)
     */
    function initPartnerMap() {
        try {
            console.log('[Main] 파트너맵 v3 초기화 시작');

            // 0. 설정 검증
            var validation = CONFIG.validate();
            if (!validation.isValid) {
                console.error('[Main] 설정 오류:', validation.errors);
                validation.errors.forEach(function(error) {
                    console.error('  - ' + error);
                });
            }

            // 1. UI 서비스 초기화 (로딩 표시를 위해 가장 먼저)
            uiService = new window.UIServiceClass(CONFIG);
            window.UIService = uiService;  // 전역 인스턴스 등록
            uiService.showLoading();
            uiService.showSkeletonList(5);  // 스켈레톤 로딩 표시

            // 2. API 클라이언트 초기화
            apiClient = new window.PartnerAPI(CONFIG);
            console.log('[Main] API 클라이언트 생성 완료');

            // 3. 네이버 지도 SDK 로드
            mapService = new window.MapService(CONFIG);
            window.MapService = mapService;  // 전역 인스턴스 등록

            // ⭐ async/await 제거, Promise 체이닝 사용
            mapService.loadSDK()
                .then(function() {
                    // 4. 파트너 데이터 로드
                    console.log('[Main] 파트너 데이터 로드 시작...');
                    return apiClient.loadPartnerData();
                })
                .then(function(partners) {
                    console.log('[Main] 파트너 데이터 로드 완료 (' + partners.length + '개)');

                    // 5. 지도 초기화
                    mapService.init('naverMap');
                    console.log('[Main] 지도 초기화 완료');

                    // 6. 필터 서비스 초기화
                    filterService = new window.FilterService(CONFIG);
                    window.FilterService = filterService;  // 전역 인스턴스 등록
                    filterService.init(partners);

                    // 7. 검색 서비스 초기화
                    searchService = new window.SearchService(CONFIG);
                    window.SearchService = searchService;  // 전역 인스턴스 등록
                    searchService.init(partners);

                    // 8. UI 서비스 초기화 (이벤트 리스너)
                    uiService.init();

                    // 8.5. Analytics 서비스 초기화
                    if (window.AnalyticsService) {
                        analyticsService = new window.AnalyticsService(CONFIG);
                        window.analyticsInstance = analyticsService;  // 전역 인스턴스 등록
                        analyticsService.init('G-XXXXXXXXXX');  // 실제 GA4 측정 ID로 교체 필요
                        console.log('[Main] Analytics 서비스 초기화 완료');
                    }

                    // 9. 마커 생성
                    mapService.createMarkers(partners);

                    // 10. 스켈레톤 숨김 & 파트너 리스트 렌더링
                    uiService.hideSkeletonList();
                    uiService.renderPartnerList(partners);

                    // 11. GPS 버튼 설정
                    setupGPSButton();

                    // 12. 기준점 초기화 버튼 설정
                    setupClearReferenceButton();

                    // 13. Ripple 효과 초기화
                    setupRipple();

                    // 14. URL 파라미터 처리 (특정 파트너 직접 접근)
                    handleUrlParams(partners);

                    // 15. 로딩 숨김
                    uiService.hideLoading();

                    // 16. 성공 알림
                    uiService.showToast(partners.length + '개의 제휴 업체를 불러왔습니다.', 'success');

                    console.log('[Main] 초기화 완료');
                })
                .catch(function(error) {
                    console.error('[Main] 초기화 실패:', error);

                    if (uiService) {
                        uiService.hideLoading();
                        uiService.showToast('지도를 불러오는 중 오류가 발생했습니다.', 'error');
                    }

                    // 오류 메시지 표시 - createElement 대신 미리 만들어진 요소 사용
                    var errorDiv = document.getElementById('pm-error-message');
                    if (errorDiv) {
                        errorDiv.style.cssText = 'display: block; padding: 40px; text-align: center; color: #F44336;';
                        errorDiv.innerHTML = '<h2>오류 발생</h2><p>' + CONFIG.errorMessages.apiError + '</p>' +
                                             '<p style="font-size: 14px; color: #808080;">자세한 내용은 콘솔을 확인해주세요.</p>';
                    }
                });

        } catch (error) {
            console.error('[Main] 초기화 실패:', error);

            if (uiService) {
                uiService.hideLoading();
                uiService.showToast('지도를 불러오는 중 오류가 발생했습니다.', 'error');
            }

            // 오류 메시지 표시
            var errorDiv = document.getElementById('pm-error-message');
            if (errorDiv) {
                errorDiv.style.cssText = 'display: block; padding: 40px; text-align: center; color: #F44336;';
                errorDiv.innerHTML = '<h2>오류 발생</h2><p>' + CONFIG.errorMessages.apiError + '</p>' +
                                     '<p style="font-size: 14px; color: #808080;">자세한 내용은 콘솔을 확인해주세요.</p>';
            }
        }
    }

    /**
     * URL 파라미터 처리
     * @param {Array} partners - 파트너 배열
     */
    function handleUrlParams(partners) {
        var urlParams = new URLSearchParams(window.location.search);
        var partnerId = urlParams.get('partner');

        if (partnerId) {
            var partner = partners.find(function(p) {
                return p.id == partnerId;
            });

            if (partner) {
                console.log('[Main] URL 파라미터로 파트너 직접 접근:', partner.name);

                // 모달 표시
                setTimeout(function() {
                    uiService.showPartnerDetail(partner);

                    // 지도 이동
                    if (mapService) {
                        mapService.moveTo(partner);
                    }
                }, 500);
            }
        }
    }

    // ========================================
    // 페이지 로드 시 초기화
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPartnerMap);
    } else {
        initPartnerMap();
    }

    // ========================================
    // 전역 등록 (디버깅용)
    // ========================================

    window.PartnerMapApp = {
        apiClient: function() { return apiClient; },
        mapService: function() { return mapService; },
        filterService: function() { return filterService; },
        searchService: function() { return searchService; },
        uiService: function() { return uiService; },
        config: CONFIG
    };

})(window);
