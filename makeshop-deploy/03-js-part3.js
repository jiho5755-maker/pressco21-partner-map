/*
================================================
  메이크샵 D4 배포 - JS Part 3/3
================================================
  포함: ui.js + main.js
  크기: 약 31KB
================================================
*/
/**
 * 파트너맵 v3 - UI 컴포넌트
 * 책임: 토스트, 모달, 파트너 카드, 즐겨찾기, 공유
 */

(function(window) {
    'use strict';

    /**
     * UI 서비스
     * @param {Object} config - CONFIG 객체
     */
    function UIService(config) {
        this.config = config;
        this.partners = [];
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * UI 초기화
     */
    UIService.prototype.init = function() {
        var self = this;

        // 모달 닫기 버튼
        var modalClose = document.getElementById('pm-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                self.closeModal();
            });
        }

        // 모달 오버레이 클릭
        var modalOverlay = document.querySelector('#pm-modal .pm-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function() {
                self.closeModal();
            });
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.closeModal();
                self.closeShareModal();
            }
        });

        // 지도 리셋 버튼
        var resetMapBtn = document.getElementById('pm-reset-map-btn');
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', function() {
                if (window.MapService && window.MapService.reset) {
                    window.MapService.reset();
                    self.showToast('지도가 초기화되었습니다.', 'success');
                }
            });
        }

        console.log('[UI] UI 초기화 완료');
    };

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

        // createElement 대신 innerHTML 사용 (메이크샵 호환)
        var toastHTML = '<div class="pm-toast pm-toast-' + type + '">' +
                        (window.escapeHtml ? window.escapeHtml(message) : message) +
                        '</div>';
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
                container.removeChild(toast);
            }, 300);
        }, self.config.toastDuration);
    };

    // ========================================
    // 파트너 리스트
    // ========================================

    /**
     * 파트너 리스트 렌더링
     * @param {Array} partners - 파트너 배열
     */
    UIService.prototype.renderPartnerList = function(partners) {
        var self = this;
        self.partners = partners;

        var listContainer = document.getElementById('pm-partner-list');
        if (!listContainer) return;

        if (partners.length === 0) {
            listContainer.innerHTML = '<p class="pm-empty-message">검색 결과가 없습니다.</p>';
            return;
        }

        var html = partners.map(function(partner) {
            return self.createPartnerCardHTML(partner);
        }).join('');

        listContainer.innerHTML = html;

        // 카드 클릭 이벤트
        var cards = listContainer.querySelectorAll('.pm-partner-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function(e) {
                // 즐겨찾기 버튼 클릭은 제외
                if (e.target.classList.contains('pm-favorite-btn') ||
                    e.target.closest('.pm-favorite-btn')) {
                    return;
                }

                var partnerId = this.getAttribute('data-partner-id');
                var partner = partners.find(function(p) {
                    return p.id == partnerId;
                });

                if (partner) {
                    self.showPartnerDetail(partner);

                    // 지도 이동
                    if (window.MapService && window.MapService.moveTo) {
                        window.MapService.moveTo(partner);
                    }
                }
            });
        });

        console.log('[UI] 파트너 리스트 렌더링 완료 (' + partners.length + '개)');
    };

    /**
     * 파트너 카드 HTML 생성
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    UIService.prototype.createPartnerCardHTML = function(partner) {
        var self = this;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIconClass = isFavorite ? 'ph-fill ph-heart' : 'ph ph-heart';
        var favoriteIcon = '<i class="' + favoriteIconClass + '"></i>';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');

        // 카테고리 태그
        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        // 거리 표시 (있는 경우)
        var distanceHtml = '';
        if (partner.distance !== undefined) {
            distanceHtml = '<span class="pm-distance-badge"><i class="ph ph-ruler"></i> ' + partner.distance.toFixed(1) + 'km</span>';
        }

        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '" role="article" aria-label="' + escapedName + ' 업체 정보">' +
               '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
               'data-partner-id="' + partner.id + '" ' +
               'onclick="window.UIService.toggleFavorite(\'' + partner.id + '\', event)" ' +
               'title="즐겨찾기" ' +
               'aria-label="' + escapedName + ' ' + (isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가') + '">' +
               favoriteIcon +
               '</button>' +
               (distanceHtml ? '<div class="pm-distance-indicator">' + distanceHtml + '</div>' : '') +
               '<div class="pm-partner-logo">' +
               '<img src="' + logoUrl + '" ' +
               'alt="' + escapedName + '" ' +
               'onerror="this.src=\'' + self.config.defaultLogoPath + '\'">' +
               '</div>' +
               '<div class="pm-partner-info">' +
               '<h4>' + escapedName + '</h4>' +
               '<div class="pm-partner-categories">' + categoryTags + '</div>' +
               '<p class="pm-partner-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone"><i class="ph ph-phone"></i> ' + escapedPhone + '</p>' +
               '</div>' +
               '</div>';
    };

    // ========================================
    // 모달
    // ========================================

    /**
     * 파트너 상세 모달 표시
     * @param {Object} partner - 파트너 데이터
     */
    UIService.prototype.showPartnerDetail = function(partner) {
        var self = this;

        var modal = document.getElementById('pm-modal');
        var modalBody = document.getElementById('pm-modal-body');
        if (!modal || !modalBody) return;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIconClass = isFavorite ? 'ph-fill ph-heart' : 'ph ph-heart';
        var favoriteIcon = '<i class="' + favoriteIconClass + '"></i>';
        var favoriteText = isFavorite ? '즐겨찾기됨' : '즐겨찾기';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || self.config.defaultLogoPath;
        var escapedName = window.escapeHtml(partner.name);
        var escapedAddress = window.escapeHtml(partner.address);
        var escapedPhone = window.escapeHtml(partner.phone || '-');
        var escapedEmail = partner.email ? window.escapeHtml(partner.email) : '';
        var escapedDescription = partner.description ? window.escapeHtml(partner.description) : '소개 정보가 없습니다.';

        // 카테고리 태그
        var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
        var categoryTags = categories.map(function(cat) {
            return '<span class="pm-category-tag">' + window.escapeHtml(cat) + '</span>';
        }).join('');

        var html = '<div class="pm-modal-header">' +
                   '<img src="' + logoUrl + '" ' +
                   'alt="' + escapedName + '" ' +
                   'onerror="this.src=\'' + self.config.defaultLogoPath + '\'">' +
                   '<h2>' + escapedName + '</h2>' +
                   (categoryTags ? '<div class="pm-partner-categories">' + categoryTags + '</div>' : '') +
                   '</div>' +
                   '<div class="pm-modal-actions">' +
                   '<button class="pm-action-btn pm-favorite-btn ' + favoriteClass + '" ' +
                   'onclick="window.UIService.toggleFavorite(\'' + partner.id + '\')" ' +
                   'data-partner-id="' + partner.id + '" ' +
                   'aria-label="' + favoriteText + '">' +
                   favoriteIcon + ' ' + favoriteText +
                   '</button>' +
                   '<button class="pm-action-btn pm-share-btn" ' +
                   'onclick="window.UIService.showShareModal(\'' + partner.id + '\')" ' +
                   'aria-label="' + escapedName + ' 공유하기">' +
                   '<i class="ph ph-share-network"></i> 공유하기' +
                   '</button>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>소개</h3>' +
                   '<p>' + escapedDescription + '</p>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>위치 정보</h3>' +
                   '<p class="pm-address"><i class="ph ph-map-pin"></i> ' + escapedAddress + '</p>' +
                   '<div class="pm-navigation-buttons">' +
                   '<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" rel="noopener noreferrer" ' +
                   'class="pm-nav-btn pm-nav-naver" ' +
                   'aria-label="네이버 지도에서 ' + escapedName + ' 위치 보기">' +
                   '<i class="ph ph-map-trifold"></i> 네이버 지도</a>' +
                   '<a href="https://map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" rel="noopener noreferrer" ' +
                   'class="pm-nav-btn pm-nav-kakao" ' +
                   'aria-label="카카오맵에서 ' + escapedName + ' 위치 보기">' +
                   '<i class="ph ph-map-trifold"></i> 카카오맵</a>' +
                   '</div>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>연락처</h3>' +
                   '<p><i class="ph ph-phone"></i> <a href="tel:' + partner.phone + '">' + escapedPhone + '</a></p>' +
                   (escapedEmail ? '<p><i class="ph ph-envelope-simple"></i> <a href="mailto:' + partner.email + '">' + escapedEmail + '</a></p>' : '') +
                   '</div>';

        // 홈페이지, 인스타그램
        if (partner.homepage || partner.instagram) {
            html += '<div class="pm-modal-section">' +
                    '<h3>링크</h3>';

            if (partner.homepage) {
                html += '<p><i class="ph ph-globe"></i> <a href="' + partner.homepage + '" target="_blank">홈페이지</a></p>';
            }

            if (partner.instagram) {
                var instagramUrl = partner.instagram.startsWith('http') ? partner.instagram : 'https://instagram.com/' + partner.instagram;
                html += '<p><i class="ph ph-camera"></i> <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
            }

            html += '</div>';
        }

        modalBody.innerHTML = html;

        modal.classList.add('pm-modal-active');
        document.body.style.overflow = 'hidden';
    };

    /**
     * 모달 닫기
     */
    UIService.prototype.closeModal = function() {
        var modal = document.getElementById('pm-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
            document.body.style.overflow = '';
        }
    };

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
        return favorites.includes(partnerId);
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
                var hasText = btn.textContent.includes('즐겨찾기됨');
                btn.innerHTML = hasText ? '<i class="ph-fill ph-heart"></i> 즐겨찾기됨' : '<i class="ph-fill ph-heart"></i>';
            } else {
                btn.classList.remove('active');
                var hasText = btn.textContent.includes('즐겨찾기');
                btn.innerHTML = hasText ? '<i class="ph ph-heart"></i> 즐겨찾기' : '<i class="ph ph-heart"></i>';
            }
        });
    };

    // ========================================
    // 공유
    // ========================================

    /**
     * 공유 모달 표시
     * @param {string} partnerId - 파트너 ID
     */
    UIService.prototype.showShareModal = function(partnerId) {
        var self = this;

        var modal = document.getElementById('pm-share-modal');
        if (!modal) return;

        modal.classList.add('pm-modal-active');

        // 공유 링크 (기존 쿼리 파라미터 유지)
        var baseUrl = window.location.origin + window.location.pathname;
        var existingParams = window.location.search;
        var shareUrl;

        if (existingParams && existingParams.length > 1) {
            // 기존 파라미터가 있으면 & 로 추가
            shareUrl = baseUrl + existingParams + '&partner=' + partnerId;
        } else {
            // 기존 파라미터가 없으면 ? 로 시작
            shareUrl = baseUrl + '?partner=' + partnerId;
        }

        // 링크 복사 버튼
        var copyBtn = document.getElementById('pm-share-copy');
        if (copyBtn) {
            copyBtn.onclick = function() {
                self.copyLink(shareUrl);
            };
        }

        // 카카오톡 공유 버튼
        var kakaoBtn = document.getElementById('pm-share-kakao');
        if (kakaoBtn) {
            kakaoBtn.onclick = function() {
                self.shareKakao(partnerId);
            };
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
            // Fallback - HTML에 미리 만들어진 요소 사용 (createElement 제거)
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

    // 전역 인스턴스 (이벤트 핸들러에서 접근하기 위해)
    window.UIService = null;

    // 생성자만 등록
    window.UIServiceClass = UIService;

    // 전역 헬퍼 함수 (HTML onclick에서 사용)
    window.closeShareModal = function() {
        if (window.UIService) {
            window.UIService.closeShareModal();
        }
    };

})(window);

// ========================================

/**
 * 파트너맵 v3 - 메인 스크립트
 * 책임: 초기화 오케스트레이터, 모듈 통합, 이벤트 핸들러
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

                    uiService.showToast('현재 위치로 이동했습니다.', 'success');
                },
                function(error) {
                    console.error('[GPS] 위치 정보 오류:', error);

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
     * 파트너맵 초기화 (메이크샵 호환: Promise 체이닝)
     */
    function initPartnerMap() {
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

        // 2. API 클라이언트 초기화
        apiClient = new window.PartnerAPI(CONFIG);
        console.log('[Main] API 클라이언트 생성 완료');

        // 3. 네이버 지도 SDK 로드
        mapService = new window.MapService(CONFIG);
        window.MapService = mapService;  // 전역 인스턴스 등록

        // Promise 체이닝으로 비동기 처리
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

                // 9. 마커 생성
                mapService.createMarkers(partners);

                // 10. 파트너 리스트 렌더링
                uiService.renderPartnerList(partners);

                // 11. GPS 버튼 설정
                setupGPSButton();

                // 12. 기준점 초기화 버튼 설정
                setupClearReferenceButton();

                // 13. URL 파라미터 처리 (특정 파트너 직접 접근)
                handleUrlParams(partners);

                // 14. 로딩 숨김
                uiService.hideLoading();

                // 15. 성공 알림
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
