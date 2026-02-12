/**
 * 파트너맵 v3 - UI 컴포넌트 (Part 2B1 하반부) - 디버그용
 * 라인: 317~632
 * 책임: 모달, 즐겨찾기, 공유, 전역 등록
 */

(function(window) {
    'use strict';

    // 이 파일은 UIService 클래스의 나머지 메서드만 포함
    // 실제로는 상반부와 결합해야 하지만, 디버그 목적으로 분리

    // ========================================
    // 모달
    // ========================================

    /**
     * 파트너 상세 모달 표시 (인라인 핸들러 제거)
     * @param {Object} partner - 파트너 데이터
     */
    var showPartnerDetail = function(partner, config, isFavoriteFunc) {
        var isFavorite = isFavoriteFunc(partner.id);
        var favoriteIcon = isFavorite ? '❤️' : '🤍';
        var favoriteText = isFavorite ? '즐겨찾기됨' : '즐겨찾기';
        var favoriteClass = isFavorite ? 'active' : '';

        var logoUrl = partner.logo || config.defaultLogoPath;
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
                   'data-fallback="' + config.defaultLogoPath + '">' +
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
                   '<a href="https://map.naver.com/v5/search/' + encodeURIComponent(partner.address) + '" ' +
                   'target="_blank" class="pm-nav-btn pm-nav-naver">🗺️ 네이버 지도</a>' +
                   '<a href="https://map.kakao.com/?q=' + encodeURIComponent(partner.address) + '" ' +
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
                var instagramUrl = partner.instagram.startsWith('http') ? partner.instagram : 'https://instagram.com/' + partner.instagram;
                html += '<p>📷 <a href="' + instagramUrl + '" target="_blank">인스타그램</a></p>';
            }

            html += '</div>';
        }

        var modal = document.getElementById('pm-modal');
        var modalBody = document.getElementById('pm-modal-body');
        if (!modal || !modalBody) return;

        modalBody.innerHTML = html;

        modal.classList.add('pm-modal-active');
        document.body.style.overflow = 'hidden';
    };

    /**
     * 모달 닫기
     */
    var closeModal = function() {
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
    var toggleFavorite = function(partnerId, event, config, getFavoritesFunc, saveFavoritesFunc, showToastFunc, updateFavoriteButtonsFunc) {
        if (event) {
            event.stopPropagation();
        }

        var favorites = getFavoritesFunc();
        var index = favorites.indexOf(partnerId);

        if (index === -1) {
            // 추가
            favorites.push(partnerId);
            showToastFunc('즐겨찾기에 추가되었습니다.', 'success');
        } else {
            // 제거
            favorites.splice(index, 1);
            showToastFunc('즐겨찾기에서 제거되었습니다.', 'info');
        }

        saveFavoritesFunc(favorites);
        updateFavoriteButtonsFunc();
    };

    /**
     * 즐겨찾기 여부 확인
     * @param {string} partnerId - 파트너 ID
     * @returns {boolean}
     */
    var isFavorite = function(partnerId, getFavoritesFunc) {
        var favorites = getFavoritesFunc();
        return favorites.includes(partnerId);
    };

    /**
     * 즐겨찾기 목록 가져오기
     * @returns {Array} 파트너 ID 배열
     */
    var getFavorites = function(config) {
        try {
            var favorites = localStorage.getItem(config.favoritesKey);
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
    var saveFavorites = function(favorites, config) {
        try {
            localStorage.setItem(config.favoritesKey, JSON.stringify(favorites));
        } catch (error) {
            console.error('[UI] 즐겨찾기 저장 오류:', error);
        }
    };

    /**
     * 즐겨찾기 버튼 업데이트
     */
    var updateFavoriteButtons = function(isFavoriteFunc) {
        var buttons = document.querySelectorAll('.pm-favorite-btn');
        buttons.forEach(function(btn) {
            var partnerId = btn.getAttribute('data-partner-id');
            var isFav = isFavoriteFunc(partnerId);

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
    var showShareModal = function(partnerId) {
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
    var closeShareModal = function() {
        var modal = document.getElementById('pm-share-modal');
        if (modal) {
            modal.classList.remove('pm-modal-active');
        }
    };

    /**
     * 링크 복사
     * @param {string} url - 복사할 URL
     */
    var copyLink = function(url, showToastFunc, closeShareModalFunc) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(function() {
                    showToastFunc('링크가 복사되었습니다.', 'success');
                    closeShareModalFunc();
                })
                .catch(function(error) {
                    console.error('[UI] 링크 복사 오류:', error);
                    showToastFunc('링크 복사에 실패했습니다.', 'error');
                });
        } else {
            // Fallback - HTML에 미리 만들어진 요소 사용
            var textarea = document.getElementById('pm-clipboard-helper');
            if (!textarea) {
                showToastFunc('클립보드 복사를 지원하지 않는 브라우저입니다.', 'error');
                return;
            }

            textarea.value = url;
            textarea.style.display = 'block';
            textarea.select();

            try {
                document.execCommand('copy');
                showToastFunc('링크가 복사되었습니다.', 'success');
                closeShareModalFunc();
            } catch (error) {
                console.error('[UI] 링크 복사 오류:', error);
                showToastFunc('링크 복사에 실패했습니다.', 'error');
            }

            textarea.style.display = 'none';
            textarea.value = '';
        }
    };

    /**
     * 카카오톡 공유
     * @param {string} partnerId - 파트너 ID
     */
    var shareKakao = function(partnerId, showToastFunc, closeShareModalFunc) {
        // 카카오톡 공유는 카카오 SDK 필요
        // 여기서는 간단한 알림만 표시
        showToastFunc('카카오톡 공유 기능은 준비 중입니다.', 'info');
        closeShareModalFunc();
    };

    // ========================================
    // 전역 등록 (디버그용)
    // ========================================

    window.DEBUG_LOWER_FUNCTIONS = {
        showPartnerDetail: showPartnerDetail,
        closeModal: closeModal,
        toggleFavorite: toggleFavorite,
        isFavorite: isFavorite,
        getFavorites: getFavorites,
        saveFavorites: saveFavorites,
        updateFavoriteButtons: updateFavoriteButtons,
        showShareModal: showShareModal,
        closeShareModal: closeShareModal,
        copyLink: copyLink,
        shareKakao: shareKakao
    };

})(window);
