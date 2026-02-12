/**
 * 파트너맵 v3 - 고급 모바일 기능
 * 책임: FAB Speed Dial, 드래그 가능 FAB, 제스처 튜토리얼, 지도 회전
 * 메이크샵 호환: ES5 문법, IIFE 패턴, 템플릿 리터럴 이스케이프
 */

(function(window) {
    'use strict';

    // ========================================
    // FAB Speed Dial 서비스
    // ========================================

    /**
     * FAB Speed Dial 서비스
     * @param {Object} config - CONFIG 객체
     */
    function FABSpeedDialService(config) {
        this.config = config || {};
        this.isOpen = false;
        this.mainFab = null;
        this.overlay = null;
        this.menuItems = [
            {
                id: 'share',
                icon: 'ph-share-network',
                label: '공유하기',
                action: 'share',
                color: '#4A90E2'
            },
            {
                id: 'favorites',
                icon: 'ph-heart',
                label: '즐겨찾기',
                action: 'showFavorites',
                color: '#E24A4A'
            },
            {
                id: 'recent',
                icon: 'ph-clock-counter-clockwise',
                label: '최근 본',
                action: 'showRecent',
                color: '#9B59B6'
            },
            {
                id: 'settings',
                icon: 'ph-gear',
                label: '설정',
                action: 'showSettings',
                color: '#95A5A6'
            }
        ];
    }

    /**
     * Speed Dial 초기화
     */
    FABSpeedDialService.prototype.init = function() {
        var self = this;

        console.log('[FAB Speed Dial] 초기화 시작');

        // 모바일 감지
        if (window.innerWidth >= 768) {
            console.log('[FAB Speed Dial] 데스크톱 환경 - 비활성화');
            return;
        }

        // HTML 요소 생성
        self.createSpeedDialHTML();

        // 메인 FAB 이벤트
        self.mainFab = document.getElementById('pm-fab-main');
        self.overlay = document.getElementById('pm-fab-overlay');

        if (self.mainFab) {
            self.mainFab.addEventListener('click', function() {
                self.toggle();
            });
        }

        // 오버레이 클릭 시 닫기
        if (self.overlay) {
            self.overlay.addEventListener('click', function() {
                self.close();
            });
        }

        // 각 메뉴 아이템 이벤트
        self.menuItems.forEach(function(item) {
            var menuBtn = document.getElementById('pm-fab-menu-' + item.id);
            if (menuBtn) {
                menuBtn.addEventListener('click', function() {
                    self.handleMenuClick(item.action);
                    self.close();
                });
            }
        });

        console.log('[FAB Speed Dial] 초기화 완료');
    };

    /**
     * Speed Dial HTML 생성
     */
    FABSpeedDialService.prototype.createSpeedDialHTML = function() {
        var self = this;
        var container = document.getElementById('partnermap-container');
        if (!container) return;

        // 이미 존재하면 제거
        var existing = document.getElementById('pm-fab-speed-dial');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        // 오버레이
        var overlayHtml = '<div id="pm-fab-overlay" class="pm-fab-overlay" style="display:none;"></div>';

        // Speed Dial 컨테이너
        var speedDialHtml = '<div id="pm-fab-speed-dial" class="pm-fab-speed-dial">';

        // 메뉴 아이템들 (역순으로 추가 - 아래에서 위로)
        self.menuItems.forEach(function(item) {
            speedDialHtml += '<button class="pm-fab-menu-item" id="pm-fab-menu-' + item.id + '" ' +
                           'data-action="' + item.action + '" ' +
                           'style="background: ' + item.color + ';" ' +
                           'aria-label="' + item.label + '">' +
                           '<i class="ph ' + item.icon + '"></i>' +
                           '<span class="pm-fab-label">' + item.label + '</span>' +
                           '</button>';
        });

        // 메인 FAB
        speedDialHtml += '<button id="pm-fab-main" class="pm-fab pm-fab-main" aria-label="메뉴 열기">' +
                        '<i class="ph ph-plus pm-fab-icon-plus"></i>' +
                        '<i class="ph ph-x pm-fab-icon-close" style="display:none;"></i>' +
                        '</button>';

        speedDialHtml += '</div>';

        // DOM에 추가
        container.insertAdjacentHTML('beforeend', overlayHtml);
        container.insertAdjacentHTML('beforeend', speedDialHtml);
    };

    /**
     * Speed Dial 토글
     */
    FABSpeedDialService.prototype.toggle = function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    };

    /**
     * Speed Dial 열기
     */
    FABSpeedDialService.prototype.open = function() {
        var self = this;
        self.isOpen = true;

        // 오버레이 표시
        if (self.overlay) {
            self.overlay.style.display = 'block';
            setTimeout(function() {
                self.overlay.classList.add('pm-fab-overlay-active');
            }, 10);
        }

        // 메인 FAB 아이콘 변경
        var iconPlus = document.querySelector('#pm-fab-main .pm-fab-icon-plus');
        var iconClose = document.querySelector('#pm-fab-main .pm-fab-icon-close');
        if (iconPlus && iconClose) {
            iconPlus.style.display = 'none';
            iconClose.style.display = 'block';
        }

        // 메인 FAB 회전
        if (self.mainFab) {
            self.mainFab.classList.add('pm-fab-open');
        }

        // 메뉴 아이템 Stagger 애니메이션
        self.menuItems.forEach(function(item, index) {
            var menuItem = document.getElementById('pm-fab-menu-' + item.id);
            if (menuItem) {
                setTimeout(function() {
                    menuItem.classList.add('pm-fab-menu-open');
                }, index * 50);  // 50ms 간격
            }
        });

        // 햅틱 피드백
        self.hapticFeedback('light');
    };

    /**
     * Speed Dial 닫기
     */
    FABSpeedDialService.prototype.close = function() {
        var self = this;
        self.isOpen = false;

        // 오버레이 숨김
        if (self.overlay) {
            self.overlay.classList.remove('pm-fab-overlay-active');
            setTimeout(function() {
                self.overlay.style.display = 'none';
            }, 300);
        }

        // 메인 FAB 아이콘 변경
        var iconPlus = document.querySelector('#pm-fab-main .pm-fab-icon-plus');
        var iconClose = document.querySelector('#pm-fab-main .pm-fab-icon-close');
        if (iconPlus && iconClose) {
            iconPlus.style.display = 'block';
            iconClose.style.display = 'none';
        }

        // 메인 FAB 회전 복귀
        if (self.mainFab) {
            self.mainFab.classList.remove('pm-fab-open');
        }

        // 메뉴 아이템 닫기
        self.menuItems.forEach(function(item) {
            var menuItem = document.getElementById('pm-fab-menu-' + item.id);
            if (menuItem) {
                menuItem.classList.remove('pm-fab-menu-open');
            }
        });
    };

    /**
     * 메뉴 클릭 핸들러
     * @param {string} action - 액션 타입
     */
    FABSpeedDialService.prototype.handleMenuClick = function(action) {
        console.log('[FAB Speed Dial] 메뉴 클릭:', action);

        switch (action) {
            case 'share':
                this.handleShare();
                break;
            case 'showFavorites':
                this.handleShowFavorites();
                break;
            case 'showRecent':
                this.handleShowRecent();
                break;
            case 'showSettings':
                this.handleShowSettings();
                break;
            default:
                console.warn('[FAB Speed Dial] 알 수 없는 액션:', action);
        }
    };

    /**
     * 공유하기
     */
    FABSpeedDialService.prototype.handleShare = function() {
        var url = window.location.href;
        var title = '전국 제휴 업체 지도';
        var text = '프레스코21과 함께하는 압화·플라워디자인 업체를 확인하세요';

        // Web Share API 지원 확인
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url
            }).then(function() {
                console.log('[FAB Speed Dial] 공유 성공');
            }).catch(function(error) {
                console.log('[FAB Speed Dial] 공유 취소:', error);
            });
        } else {
            // 폴백: 클립보드 복사
            var textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                alert('링크가 클립보드에 복사되었습니다.');
            } catch (error) {
                alert('공유 기능을 사용할 수 없습니다.');
            }

            document.body.removeChild(textarea);
        }
    };

    /**
     * 즐겨찾기 모아보기
     */
    FABSpeedDialService.prototype.handleShowFavorites = function() {
        // 즐겨찾기 필터 탭 클릭
        var favTab = document.querySelector('[data-filter-type="favorites"]');
        if (favTab) {
            favTab.click();

            // 필터 영역으로 스크롤
            var filterSection = document.querySelector('.pm-search-filter');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    /**
     * 최근 본 파트너
     */
    FABSpeedDialService.prototype.handleShowRecent = function() {
        // localStorage에서 최근 본 파트너 가져오기
        var recentPartners = [];
        try {
            var stored = localStorage.getItem('pm_recent_partners');
            if (stored) {
                recentPartners = JSON.parse(stored);
            }
        } catch (e) {
            console.error('[FAB Speed Dial] localStorage 오류:', e);
        }

        if (recentPartners.length === 0) {
            alert('최근 본 파트너가 없습니다.');
            return;
        }

        // 모달 표시 (간단한 버전)
        var modal = this.createRecentPartnersModal(recentPartners);
        document.body.appendChild(modal);
    };

    /**
     * 최근 본 파트너 모달 생성
     * @param {Array} partners - 파트너 목록
     * @returns {HTMLElement}
     */
    FABSpeedDialService.prototype.createRecentPartnersModal = function(partners) {
        var modal = document.createElement('div');
        modal.className = 'pm-modal pm-modal-active';
        modal.id = 'pm-recent-modal';

        var html = '<div class="pm-modal-backdrop"></div>' +
                   '<div class="pm-modal-content">' +
                   '<div class="pm-modal-header">' +
                   '<h2>최근 본 파트너</h2>' +
                   '<button class="pm-modal-close" aria-label="닫기">' +
                   '<i class="ph ph-x"></i>' +
                   '</button>' +
                   '</div>' +
                   '<div class="pm-modal-body">' +
                   '<div class="pm-recent-list">';

        partners.slice(0, 10).forEach(function(partner) {
            html += '<div class="pm-recent-item">' +
                   '<strong>' + partner.name + '</strong>' +
                   '<span>' + partner.address + '</span>' +
                   '</div>';
        });

        html += '</div>' +
                '</div>' +
                '</div>';

        modal.innerHTML = html;

        // 닫기 버튼 이벤트
        var closeBtn = modal.querySelector('.pm-modal-close');
        var backdrop = modal.querySelector('.pm-modal-backdrop');

        var closeModal = function() {
            modal.classList.remove('pm-modal-active');
            setTimeout(function() {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        return modal;
    };

    /**
     * 설정
     */
    FABSpeedDialService.prototype.handleShowSettings = function() {
        alert('설정 기능은 곧 추가될 예정입니다.');
    };

    /**
     * 햅틱 피드백
     * @param {string} type - 강도
     */
    FABSpeedDialService.prototype.hapticFeedback = function(type) {
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
            console.log('[FAB Speed Dial] Haptic not supported');
        }
    };

    // ========================================
    // 드래그 가능 FAB 서비스
    // ========================================

    /**
     * 드래그 가능 FAB 서비스
     * @param {Object} config - CONFIG 객체
     */
    function DraggableFABService(config) {
        this.config = config || {};
        this.fab = null;
        this.isDragging = false;
        this.isLongPress = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.longPressTimer = null;
        this.safetyMargin = {
            top: 100,
            bottom: 100,
            left: 20,
            right: 20
        };
    }

    /**
     * 드래그 가능 FAB 초기화
     */
    DraggableFABService.prototype.init = function() {
        var self = this;

        console.log('[Draggable FAB] 초기화 시작');

        // 모바일 감지
        if (window.innerWidth >= 768) {
            console.log('[Draggable FAB] 데스크톱 환경 - 비활성화');
            return;
        }

        // FAB 요소 찾기
        self.fab = document.getElementById('pm-fab-main');
        if (!self.fab) {
            console.warn('[Draggable FAB] FAB 요소를 찾을 수 없음');
            return;
        }

        // 저장된 위치 복원
        self.restorePosition();

        // 터치 이벤트 등록
        self.fab.addEventListener('touchstart', function(e) {
            self.onTouchStart(e);
        }, { passive: false });

        self.fab.addEventListener('touchmove', function(e) {
            self.onTouchMove(e);
        }, { passive: false });

        self.fab.addEventListener('touchend', function(e) {
            self.onTouchEnd(e);
        }, { passive: false });

        self.fab.addEventListener('touchcancel', function() {
            self.onTouchCancel();
        });

        console.log('[Draggable FAB] 초기화 완료');
    };

    /**
     * 터치 시작
     * @param {TouchEvent} e - 터치 이벤트
     */
    DraggableFABService.prototype.onTouchStart = function(e) {
        var self = this;
        var touch = e.touches[0];

        self.startX = touch.clientX;
        self.startY = touch.clientY;

        // FAB의 현재 위치
        var rect = self.fab.getBoundingClientRect();
        self.offsetX = rect.left;
        self.offsetY = rect.top;

        // Long Press 타이머 시작 (500ms)
        self.longPressTimer = setTimeout(function() {
            self.startDrag();
        }, 500);
    };

    /**
     * 드래그 시작
     */
    DraggableFABService.prototype.startDrag = function() {
        var self = this;

        self.isLongPress = true;
        self.fab.classList.add('pm-fab-dragging');

        // 햅틱 피드백
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        console.log('[Draggable FAB] 드래그 모드 활성화');
    };

    /**
     * 터치 이동
     * @param {TouchEvent} e - 터치 이벤트
     */
    DraggableFABService.prototype.onTouchMove = function(e) {
        var self = this;

        // Long Press 타이머 취소 (이동 시)
        if (!self.isLongPress) {
            var touch = e.touches[0];
            var deltaX = Math.abs(touch.clientX - self.startX);
            var deltaY = Math.abs(touch.clientY - self.startY);

            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(self.longPressTimer);
            }
            return;
        }

        // 드래그 모드
        e.preventDefault();
        self.isDragging = true;

        var touch = e.touches[0];
        var deltaX = touch.clientX - self.startX;
        var deltaY = touch.clientY - self.startY;

        self.currentX = self.offsetX + deltaX;
        self.currentY = self.offsetY + deltaY;

        // 안전 영역 제한
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var fabRect = self.fab.getBoundingClientRect();

        self.currentX = Math.max(self.safetyMargin.left, Math.min(windowWidth - fabRect.width - self.safetyMargin.right, self.currentX));
        self.currentY = Math.max(self.safetyMargin.top, Math.min(windowHeight - fabRect.height - self.safetyMargin.bottom, self.currentY));

        // FAB 위치 업데이트
        self.fab.style.left = self.currentX + 'px';
        self.fab.style.top = self.currentY + 'px';
        self.fab.style.right = 'auto';
        self.fab.style.bottom = 'auto';
    };

    /**
     * 터치 종료
     * @param {TouchEvent} e - 터치 이벤트
     */
    DraggableFABService.prototype.onTouchEnd = function(e) {
        var self = this;

        clearTimeout(self.longPressTimer);

        if (!self.isDragging) {
            self.isLongPress = false;
            return;
        }

        // 가장자리에 스냅
        self.snapToEdge();

        // 위치 저장
        self.savePosition();

        // 상태 초기화
        self.isDragging = false;
        self.isLongPress = false;
        self.fab.classList.remove('pm-fab-dragging');

        console.log('[Draggable FAB] 드래그 종료');
    };

    /**
     * 터치 취소
     */
    DraggableFABService.prototype.onTouchCancel = function() {
        var self = this;

        clearTimeout(self.longPressTimer);
        self.isDragging = false;
        self.isLongPress = false;
        self.fab.classList.remove('pm-fab-dragging');
    };

    /**
     * 가장자리에 스냅
     */
    DraggableFABService.prototype.snapToEdge = function() {
        var self = this;
        var windowWidth = window.innerWidth;
        var fabRect = self.fab.getBoundingClientRect();
        var fabCenter = fabRect.left + fabRect.width / 2;

        // 좌우 중 가까운 쪽으로 스냅
        if (fabCenter < windowWidth / 2) {
            // 왼쪽
            self.currentX = self.safetyMargin.left;
        } else {
            // 오른쪽
            self.currentX = windowWidth - fabRect.width - self.safetyMargin.right;
        }

        self.fab.style.left = self.currentX + 'px';
        self.fab.style.top = self.currentY + 'px';
        self.fab.style.transition = 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), top 300ms cubic-bezier(0.4, 0, 0.2, 1)';

        // 트랜지션 후 리셋
        setTimeout(function() {
            self.fab.style.transition = '';
        }, 300);
    };

    /**
     * 위치 저장
     */
    DraggableFABService.prototype.savePosition = function() {
        var self = this;

        try {
            var position = {
                x: self.currentX,
                y: self.currentY
            };
            localStorage.setItem('pm_fab_position', JSON.stringify(position));
            console.log('[Draggable FAB] 위치 저장:', position);
        } catch (e) {
            console.error('[Draggable FAB] 위치 저장 실패:', e);
        }
    };

    /**
     * 위치 복원
     */
    DraggableFABService.prototype.restorePosition = function() {
        var self = this;

        try {
            var stored = localStorage.getItem('pm_fab_position');
            if (stored) {
                var position = JSON.parse(stored);
                self.currentX = position.x;
                self.currentY = position.y;

                self.fab.style.left = self.currentX + 'px';
                self.fab.style.top = self.currentY + 'px';
                self.fab.style.right = 'auto';
                self.fab.style.bottom = 'auto';

                console.log('[Draggable FAB] 위치 복원:', position);
            }
        } catch (e) {
            console.error('[Draggable FAB] 위치 복원 실패:', e);
        }
    };

    // ========================================
    // 제스처 튜토리얼 서비스
    // ========================================

    /**
     * 제스처 튜토리얼 서비스
     * @param {Object} config - CONFIG 객체
     */
    function GestureTutorialService(config) {
        this.config = config || {};
        this.currentStep = 0;
        this.steps = [
            {
                title: '스와이프로 모달 닫기',
                description: '모달을 우측으로 스와이프하여 닫을 수 있습니다',
                icon: 'ph-swipe-right',
                animation: 'swipe-right'
            },
            {
                title: '핀치 줌',
                description: '두 손가락으로 지도를 확대/축소할 수 있습니다',
                icon: 'ph-arrows-out',
                animation: 'pinch-zoom'
            },
            {
                title: '더블탭 줌인',
                description: '지도를 더블탭하여 빠르게 줌인할 수 있습니다',
                icon: 'ph-hand-tap',
                animation: 'double-tap'
            },
            {
                title: 'Pull to Refresh',
                description: '아래로 당겨서 데이터를 새로고침할 수 있습니다',
                icon: 'ph-arrow-clockwise',
                animation: 'pull-refresh'
            }
        ];
    }

    /**
     * 튜토리얼 초기화
     */
    GestureTutorialService.prototype.init = function() {
        var self = this;

        console.log('[Gesture Tutorial] 초기화 시작');

        // 모바일 감지
        if (window.innerWidth >= 768) {
            console.log('[Gesture Tutorial] 데스크톱 환경 - 비활성화');
            return;
        }

        // 이미 본 경우 건너뛰기
        if (self.isCompleted()) {
            console.log('[Gesture Tutorial] 이미 완료됨 - 건너뛰기');
            return;
        }

        // HTML 생성
        self.createTutorialHTML();

        // 3초 후 자동 표시
        setTimeout(function() {
            self.show();
        }, 3000);

        console.log('[Gesture Tutorial] 초기화 완료');
    };

    /**
     * 튜토리얼 HTML 생성
     */
    GestureTutorialService.prototype.createTutorialHTML = function() {
        var container = document.getElementById('partnermap-container');
        if (!container) return;

        // 이미 존재하면 제거
        var existing = document.getElementById('pm-tutorial-modal');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }

        var html = '<div id="pm-tutorial-modal" class="pm-tutorial-modal" style="display:none;">' +
                   '<div class="pm-tutorial-content">' +
                   '<div class="pm-tutorial-step">' +
                   '<i class="ph pm-tutorial-icon"></i>' +
                   '<h3 class="pm-tutorial-title"></h3>' +
                   '<p class="pm-tutorial-description"></p>' +
                   '<div class="pm-tutorial-animation"></div>' +
                   '</div>' +
                   '<div class="pm-tutorial-controls">' +
                   '<label class="pm-tutorial-checkbox">' +
                   '<input type="checkbox" id="pm-tutorial-dont-show">' +
                   '<span>다시 보지 않기</span>' +
                   '</label>' +
                   '<button class="pm-tutorial-next">다음</button>' +
                   '</div>' +
                   '<div class="pm-tutorial-progress"></div>' +
                   '</div>' +
                   '</div>';

        container.insertAdjacentHTML('beforeend', html);

        // 진행 상황 점 생성
        var progressContainer = document.querySelector('.pm-tutorial-progress');
        if (progressContainer) {
            for (var i = 0; i < this.steps.length; i++) {
                var dot = document.createElement('span');
                dot.className = 'pm-tutorial-dot';
                if (i === 0) dot.classList.add('active');
                progressContainer.appendChild(dot);
            }
        }

        // 다음 버튼 이벤트
        var nextBtn = document.querySelector('.pm-tutorial-next');
        if (nextBtn) {
            var self = this;
            nextBtn.addEventListener('click', function() {
                self.nextStep();
            });
        }
    };

    /**
     * 튜토리얼 표시
     */
    GestureTutorialService.prototype.show = function() {
        var modal = document.getElementById('pm-tutorial-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('pm-tutorial-active');
        }, 10);

        this.showStep(0);
    };

    /**
     * 특정 단계 표시
     * @param {number} stepIndex - 단계 인덱스
     */
    GestureTutorialService.prototype.showStep = function(stepIndex) {
        var self = this;
        var step = self.steps[stepIndex];
        if (!step) return;

        // 콘텐츠 업데이트
        var icon = document.querySelector('.pm-tutorial-icon');
        var title = document.querySelector('.pm-tutorial-title');
        var description = document.querySelector('.pm-tutorial-description');
        var animation = document.querySelector('.pm-tutorial-animation');

        if (icon) {
            icon.className = 'ph ' + step.icon + ' pm-tutorial-icon';
        }

        if (title) {
            title.textContent = step.title;
        }

        if (description) {
            description.textContent = step.description;
        }

        if (animation) {
            animation.className = 'pm-tutorial-animation pm-tutorial-anim-' + step.animation;
        }

        // 진행 상황 점 업데이트
        var dots = document.querySelectorAll('.pm-tutorial-dot');
        dots.forEach(function(dot, index) {
            if (index === stepIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // 마지막 단계면 버튼 텍스트 변경
        var nextBtn = document.querySelector('.pm-tutorial-next');
        if (nextBtn) {
            if (stepIndex === self.steps.length - 1) {
                nextBtn.textContent = '완료';
            } else {
                nextBtn.textContent = '다음';
            }
        }
    };

    /**
     * 다음 단계
     */
    GestureTutorialService.prototype.nextStep = function() {
        this.currentStep++;

        if (this.currentStep >= this.steps.length) {
            this.complete();
        } else {
            this.showStep(this.currentStep);
        }
    };

    /**
     * 튜토리얼 완료
     */
    GestureTutorialService.prototype.complete = function() {
        var modal = document.getElementById('pm-tutorial-modal');
        if (!modal) return;

        // "다시 보지 않기" 체크 확인
        var dontShowCheckbox = document.getElementById('pm-tutorial-dont-show');
        if (dontShowCheckbox && dontShowCheckbox.checked) {
            this.markCompleted();
        }

        // 모달 닫기
        modal.classList.remove('pm-tutorial-active');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);

        console.log('[Gesture Tutorial] 튜토리얼 완료');
    };

    /**
     * 완료 상태 저장
     */
    GestureTutorialService.prototype.markCompleted = function() {
        try {
            localStorage.setItem('pm_tutorial_completed', 'true');
            console.log('[Gesture Tutorial] 완료 상태 저장');
        } catch (e) {
            console.error('[Gesture Tutorial] 완료 상태 저장 실패:', e);
        }
    };

    /**
     * 완료 여부 확인
     * @returns {boolean}
     */
    GestureTutorialService.prototype.isCompleted = function() {
        try {
            return localStorage.getItem('pm_tutorial_completed') === 'true';
        } catch (e) {
            return false;
        }
    };

    // ========================================
    // 지도 회전 서비스 (선택사항)
    // ========================================

    /**
     * 지도 회전 서비스
     * @param {Object} config - CONFIG 객체
     */
    function MapRotationService(config) {
        this.config = config || {};
        this.map = null;
        this.rotation = 0;
        this.isRotating = false;
        this.initialAngle = 0;
    }

    /**
     * 지도 회전 초기화
     * @param {Object} map - 네이버 지도 인스턴스
     */
    MapRotationService.prototype.init = function(map) {
        var self = this;

        if (!map) {
            console.warn('[Map Rotation] 지도 인스턴스 없음');
            return;
        }

        self.map = map;

        console.log('[Map Rotation] 초기화 시작');

        // 회전 버튼 생성
        self.createRotationButton();

        console.log('[Map Rotation] 초기화 완료');
    };

    /**
     * 회전 버튼 생성
     */
    MapRotationService.prototype.createRotationButton = function() {
        var self = this;

        var mapDiv = document.getElementById('pm-map');
        if (!mapDiv) return;

        var button = document.createElement('button');
        button.id = 'pm-map-rotation-reset';
        button.className = 'pm-map-rotation-btn';
        button.innerHTML = '<i class="ph ph-compass"></i><span>북쪽</span>';
        button.title = '지도를 북쪽으로 복구';
        button.style.display = 'none';

        button.addEventListener('click', function() {
            self.resetRotation();
        });

        mapDiv.appendChild(button);
    };

    /**
     * 회전 각도 설정
     * @param {number} angle - 각도 (0-360)
     */
    MapRotationService.prototype.setRotation = function(angle) {
        var self = this;

        // 각도 정규화 (0-360)
        angle = angle % 360;
        if (angle < 0) angle += 360;

        self.rotation = angle;

        // 지도 회전 (CSS transform)
        var mapPane = self.map.getPanes().overlayLayer;
        if (mapPane) {
            mapPane.style.transform = 'rotate(' + angle + 'deg)';
        }

        // 회전 버튼 표시/숨김
        var resetBtn = document.getElementById('pm-map-rotation-reset');
        if (resetBtn) {
            if (Math.abs(angle) > 5) {
                resetBtn.style.display = 'flex';
                resetBtn.querySelector('span').textContent = '북쪽 (' + Math.round(angle) + '°)';
            } else {
                resetBtn.style.display = 'none';
            }
        }

        console.log('[Map Rotation] 회전 각도:', angle);
    };

    /**
     * 회전 리셋
     */
    MapRotationService.prototype.resetRotation = function() {
        this.setRotation(0);
    };

    /**
     * 두 터치 포인트 사이의 각도 계산
     * @param {Touch} touch1 - 첫 번째 터치
     * @param {Touch} touch2 - 두 번째 터치
     * @returns {number} 각도 (라디안)
     */
    MapRotationService.prototype.getAngle = function(touch1, touch2) {
        var dx = touch2.clientX - touch1.clientX;
        var dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx);
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.FABSpeedDialService = FABSpeedDialService;
    window.DraggableFABService = DraggableFABService;
    window.GestureTutorialService = GestureTutorialService;
    window.MapRotationService = MapRotationService;

})(window);
