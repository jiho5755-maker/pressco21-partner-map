/**
 * 파트너맵 v3 - UI 컴포넌트 (Part 1/2) - 메이크샵 최적화 버전
 * 책임: 토스트, 모달, 파트너 카드, 즐겨찾기, 공유
 *
 * [수정 사항]
 * - 인라인 이벤트 핸들러 완전 제거
 * - 이벤트 위임 방식으로 전환
 * - &quot; 엔티티 제거 (싱글 쿼트 사용)
 * - window.UIService 전역 호출 패턴 제거
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

        // 이벤트 위임: 파트너 리스트
        var listContainer = document.getElementById('pm-partner-list');
        if (listContainer) {
            listContainer.addEventListener('click', function(e) {
                self.handleListClick(e);
            });
        }

        // 이벤트 위임: 모달 바디
        var modalBody = document.getElementById('pm-modal-body');
        if (modalBody) {
            modalBody.addEventListener('click', function(e) {
                self.handleModalClick(e);
            });
        }

        // 이벤트 위임: 이미지 로드 실패
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-fallback')) {
                e.target.src = e.target.getAttribute('data-fallback');
            }
        }, true);

        // 공유 모달 이벤트
        var shareModalClose = document.getElementById('pm-share-modal-close');
        if (shareModalClose) {
            shareModalClose.addEventListener('click', function() {
                self.closeShareModal();
            });
        }

        var shareCopyBtn = document.getElementById('pm-share-copy');
        if (shareCopyBtn) {
            shareCopyBtn.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                if (partnerId) {
                    var shareUrl = window.location.origin + window.location.pathname + '?partner=' + partnerId;
                    self.copyLink(shareUrl);
                }
            });
        }

        var shareKakaoBtn = document.getElementById('pm-share-kakao');
        if (shareKakaoBtn) {
            shareKakaoBtn.addEventListener('click', function() {
                var partnerId = this.getAttribute('data-partner-id');
                if (partnerId) {
                    self.shareKakao(partnerId);
                }
            });
        }

        console.log('[UI] UI 초기화 완료 (이벤트 위임 방식)');
    };

    /**
     * 리스트 클릭 이벤트 처리
     * @param {Event} e - 이벤트
     */
    UIService.prototype.handleListClick = function(e) {
        var self = this;

        // 즐겨찾기 버튼
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            e.stopPropagation();
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId, e);
            }
            return;
        }

        // 파트너 카드
        var card = e.target.closest('.pm-partner-card');
        if (card) {
            var partnerId = card.getAttribute('data-partner-id');
            var partner = self.partners.find(function(p) {
                return p.id == partnerId;
            });

            if (partner) {
                self.showPartnerDetail(partner);

                // 지도 이동
                if (window.MapService && window.MapService.moveTo) {
                    window.MapService.moveTo(partner);
                }
            }
        }
    };

    /**
     * 모달 클릭 이벤트 처리
     * @param {Event} e - 이벤트
     */
    UIService.prototype.handleModalClick = function(e) {
        var self = this;

        // 즐겨찾기 버튼
        var favoriteBtn = e.target.closest('.pm-favorite-btn');
        if (favoriteBtn) {
            var partnerId = favoriteBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.toggleFavorite(partnerId);
            }
            return;
        }

        // 공유 버튼
        var shareBtn = e.target.closest('.pm-share-btn');
        if (shareBtn) {
            var partnerId = shareBtn.getAttribute('data-partner-id');
            if (partnerId) {
                self.showShareModal(partnerId);
            }
            return;
        }
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

        console.log('[UI] 파트너 리스트 렌더링 완료 (' + partners.length + '개)');
    };

    /**
     * 파트너 카드 HTML 생성 (인라인 핸들러 제거)
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    UIService.prototype.createPartnerCardHTML = function(partner) {
        var self = this;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
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
            distanceHtml = '<span class="pm-distance-badge">📏 ' + partner.distance.toFixed(1) + 'km</span>';
        }

        // ✅ 수정: 인라인 핸들러 제거, data 속성만 사용
        return '<div class="pm-partner-card" data-partner-id="' + partner.id + '">' +
               '<button class="pm-favorite-btn ' + favoriteClass + '" ' +
               'data-partner-id="' + partner.id + '" ' +
               'type="button" ' +
               'title="즐겨찾기">' +
               favoriteIcon +
               '</button>' +
               (distanceHtml ? '<div class="pm-distance-indicator">' + distanceHtml + '</div>' : '') +
               '<div class="pm-partner-logo">' +
               '<img src="' + logoUrl + '" ' +
               'alt="' + escapedName + '" ' +
               'data-fallback="' + self.config.defaultLogoPath + '">' +
               '</div>' +
               '<div class="pm-partner-info">' +
               '<h4>' + escapedName + '</h4>' +
               '<div class="pm-partner-categories">' + categoryTags + '</div>' +
               '<p class="pm-partner-address">📍 ' + escapedAddress + '</p>' +
               '<p class="pm-partner-phone">📞 ' + escapedPhone + '</p>' +
               '</div>' +
               '</div>';
    };

    // ========================================
    // 모달
    // ========================================

    /**
     * 파트너 상세 모달 표시 (인라인 핸들러 제거)
     * @param {Object} partner - 파트너 데이터
     */
    UIService.prototype.showPartnerDetail = function(partner) {
        var self = this;

        var modal = document.getElementById('pm-modal');
        var modalBody = document.getElementById('pm-modal-body');
        if (!modal || !modalBody) return;

        var isFavorite = self.isFavorite(partner.id);
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
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

        // ✅ 수정: 인라인 핸들러 제거, data 속성만 사용
        var html = '<div class="pm-modal-header">' +
                   '<img src="' + logoUrl + '" ' +
                   'alt="' + escapedName + '" ' +
                   'data-fallback="' + self.config.defaultLogoPath + '">' +
                   '<h2>' + escapedName + '</h2>' +
                   (categoryTags ? '<div class="pm-partner-categories">' + categoryTags + '</div>' : '') +
                   '</div>' +
                   '<div class="pm-modal-actions">' +
                   '<button class="pm-action-btn pm-favorite-btn ' + favoriteClass + '" ' +
                   'type="button" ' +
                   'data-partner-id="' + partner.id + '">' +
                   favoriteIcon + ' ' + favoriteText +
                   '</button>' +
                   '<button class="pm-action-btn pm-share-btn" ' +
                   'type="button" ' +
                   'data-partner-id="' + partner.id + '">' +
                   '📤 공유하기' +
                   '</button>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>소개</h3>' +
                   '<p>' + escapedDescription + '</p>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>위치 정보</h3>' +
                   '<p class="pm-address">📍 ' + escapedAddress + '</p>' +
                   '<div class="pm-navigation-buttons">' +
                   '<a href="//map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" class="pm-nav-btn pm-nav-naver">🗺️ 네이버 지도</a>' +
                   '<a href="//map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" class="pm-nav-btn pm-nav-kakao">🗺️ 카카오맵</a>' +
                   '</div>' +
                   '</div>' +
                   '<div class="pm-modal-section">' +
                   '<h3>연락처</h3>' +
                   '<p>📞 <a href="tel:' + partner.phone + '">' + escapedPhone + '</a></p>' +
                   (escapedEmail ? '<p>📧 <a href="mailto:' + partner.email + '">' + escapedEmail + '</a></p>' : '') +
                   '</div>';

        // 홈페이지, 인스타그램
        if (partner.homepage || partner.instagram) {
            html += '<div class="pm-modal-section">' +
                    '<h3>링크</h3>';

            if (partner.homepage) {
                html += '<p>🌐 <a href="' + partner.homepage + '" target="_blank">홈페이지</a></p>';
            }

            if (partner.instagram) {
                var instagramUrl = partner.instagram.startsWith('http') ? partner.instagram : '//instagram.com/' + partner.instagram;
                html += '<p>📷 <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
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
            // Fallback - HTML에 미리 만들어진 요소 사용
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

    // 생성자만 등록
    window.UIServiceClass = UIService;

})(window);
