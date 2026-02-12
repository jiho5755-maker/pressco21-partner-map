/*
================================================
  메이크샵 D4 배포 - JS Part 2/3
================================================
  포함: map.js + filters.js
  크기: 약 38KB
================================================
*/
/**
 * 파트너맵 v3 - 지도 시스템
 * 책임: 네이버 지도 SDK, 마커 관리, 클러스터링 (O(n) 그리드 기반)
 * 메이크샵 호환: 템플릿 리터럴 이스케이프 적용
 */

(function(window) {
    'use strict';

    /**
     * 지도 서비스
     * @param {Object} config - CONFIG 객체
     */
    function MapService(config) {
        this.config = config;
        this.map = null;
        this.markers = [];  // { partner, marker } 배열
        this.clusterMarkers = [];  // 클러스터 마커 배열
        this.referencePoint = null;  // 기준점 (GPS 등)
        this.referencePointMarker = null;  // 기준점 마커 (지도 클릭 또는 GPS)
        this.isDragging = false;  // 드래그 상태 추적
    }

    // ========================================
    // SDK 로드
    // ========================================

    /**
     * 네이버 지도 SDK 로드 확인 (HTML에서 이미 로드됨)
     * @returns {Promise<void>}
     */
    MapService.prototype.loadSDK = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            // SDK가 이미 로드된 경우
            if (window.naver && window.naver.maps) {
                console.log('[Map] 네이버 지도 SDK 로드 확인');
                resolve();
                return;
            }

            // SDK 로드 대기 (최대 5초)
            console.log('[Map] 네이버 지도 SDK 로드 대기 중...');
            var checkCount = 0;
            var checkInterval = setInterval(function() {
                checkCount++;
                if (window.naver && window.naver.maps) {
                    clearInterval(checkInterval);
                    console.log('[Map] 네이버 지도 SDK 로드 완료');
                    resolve();
                } else if (checkCount > 50) {
                    clearInterval(checkInterval);
                    console.error('[Map] 네이버 지도 SDK 로드 타임아웃');
                    reject(new Error('네이버 지도 SDK 로드 실패: HTML 탭에 SDK 스크립트가 누락되었습니다.'));
                }
            }, 100);
        });
    };

    // ========================================
    // 지도 초기화
    // ========================================

    /**
     * 지도 초기화
     * @param {string} containerId - 지도 컨테이너 DOM ID
     * @returns {Object} 네이버 지도 인스턴스
     */
    MapService.prototype.init = function(containerId) {
        var self = this;

        if (!window.naver || !window.naver.maps) {
            throw new Error('네이버 지도 SDK가 로드되지 않았습니다.');
        }

        var mapOptions = {
            center: new naver.maps.LatLng(
                self.config.defaultCenter.lat,
                self.config.defaultCenter.lng
            ),
            zoom: self.config.defaultZoom,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            },
            mapTypeControl: true
        };

        self.map = new naver.maps.Map(containerId, mapOptions);

        // 드래그 이벤트 리스너
        naver.maps.Event.addListener(self.map, 'dragstart', function() {
            self.isDragging = true;
        });

        naver.maps.Event.addListener(self.map, 'dragend', function() {
            setTimeout(function() {
                self.isDragging = false;
            }, 100);
        });

        // 지도 클릭 이벤트 (기준점 설정)
        naver.maps.Event.addListener(self.map, 'click', function(e) {
            if (self.isDragging) return;

            if (e && e.coord) {
                var lat = e.coord._lat || e.coord.y;
                var lng = e.coord._lng || e.coord.x;

                if (lat && lng) {
                    self.setReferencePointWithMarker(lat, lng);

                    // FilterService에 기준점 전달
                    if (window.FilterService) {
                        window.FilterService.setReferencePoint(lat, lng);

                        // 거리순 정렬로 자동 변경
                        var sortSelect = document.getElementById('pm-sort-select');
                        if (sortSelect) {
                            sortSelect.value = 'distance';
                            window.FilterService.applyFilters();
                        }
                    }

                    if (window.UIService) {
                        window.UIService.showToast('기준점이 설정되었습니다.', 'success');
                    }
                }
            }
        });

        // 줌/idle 이벤트 (마커 가시성 업데이트)
        naver.maps.Event.addListener(self.map, 'idle', function() {
            self.updateMarkerVisibility();
        });

        console.log('[Map] 지도 초기화 완료');
        return self.map;
    };

    // ========================================
    // 마커 생성
    // ========================================

    /**
     * 마커 생성 (기존 마커 제거 후 생성)
     * @param {Array} partners - 파트너 데이터 배열
     */
    MapService.prototype.createMarkers = function(partners) {
        var self = this;

        // 기존 마커 제거
        self.clearMarkers();

        partners.forEach(function(partner) {
            // 좌표 검증
            if (!partner.latitude || !partner.longitude) {
                console.warn('[Map] 좌표 누락:', partner.name);
                return;
            }

            var position = new naver.maps.LatLng(partner.latitude, partner.longitude);

            var marker = new naver.maps.Marker({
                position: position,
                map: null,  // 초기에는 숨김
                icon: {
                    content: self.createMarkerIcon(partner),
                    anchor: new naver.maps.Point(20, 20)
                }
            });

            // 클릭 이벤트
            naver.maps.Event.addListener(marker, 'click', function() {
                if (window.UIService && window.UIService.showPartnerDetail) {
                    window.UIService.showPartnerDetail(partner);
                }
            });

            self.markers.push({
                partner: partner,
                marker: marker
            });
        });

        console.log('[Map] 마커 생성 완료 (' + partners.length + '개)');

        // 가시성 업데이트
        self.updateMarkerVisibility();
    };

    /**
     * 마커 아이콘 HTML 생성
     * @param {Object} partner - 파트너 데이터
     * @returns {string} HTML 문자열
     */
    MapService.prototype.createMarkerIcon = function(partner) {
        var self = this;

        // 색상 결정: 파트너 유형 > 카테고리 > 기본
        var color = self.config.getPartnerTypeColor(partner.partnerType);

        // 꽃 아이콘 SVG
        var flowerIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="margin-right: 6px;">' +
            '<path d="M12 2C12 2 10.5 6 10.5 8.5C10.5 9.88 11.12 11 12 11C12.88 11 13.5 9.88 13.5 8.5C13.5 6 12 2 12 2Z"/>' +
            '<path d="M16.24 7.76C16.24 7.76 15 11.5 16 13C16.5 13.75 17.5 14 18.5 13.5C19.5 13 20 12 19.5 10.5C19 9 16.24 7.76 16.24 7.76Z"/>' +
            '<path d="M7.76 7.76C7.76 7.76 5 9 4.5 10.5C4 12 4.5 13 5.5 13.5C6.5 14 7.5 13.75 8 13C9 11.5 7.76 7.76 7.76 7.76Z"/>' +
            '<path d="M12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12Z"/>' +
            '<path d="M8.5 16.5C8.5 16.5 6.5 19 7 20.5C7.5 22 9 22 10 21C11 20 10.5 18 9.5 17C8.5 16 8.5 16.5 8.5 16.5Z"/>' +
            '<path d="M15.5 16.5C15.5 16.5 17.5 19 17 20.5C16.5 22 15 22 14 21C13 20 13.5 18 14.5 17C15.5 16 15.5 16.5 15.5 16.5Z"/>' +
            '</svg>';

        // XSS 방지: escapeHtml 사용
        var escapedName = window.escapeHtml ? window.escapeHtml(partner.name) : partner.name;

        // HTML 반환 (문자열 연결 사용 - 메이크샵 호환)
        return '<div style="' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 4px;' +
            'background: white;' +
            'padding: 10px 16px;' +
            'border-radius: 9999px;' +
            'box-shadow: 0 8px 32px rgba(0,0,0,0.12);' +
            'border: 2px solid ' + color + ';' +
            'font-family: -apple-system, BlinkMacSystemFont, sans-serif;' +
            'font-size: 14px;' +
            'font-weight: 600;' +
            'color: ' + color + ';' +
            'white-space: nowrap;' +
            'transition: all 0.3s ease;' +
            'cursor: pointer;' +
            '" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 12px 40px rgba(0,0,0,0.2)\';" ' +
            'onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 8px 32px rgba(0,0,0,0.12)\';">' +
            flowerIcon +
            escapedName +
            '</div>';
    };

    /**
     * 클러스터 마커 아이콘 HTML 생성
     * @param {number} count - 클러스터 내 파트너 수
     * @returns {string} HTML 문자열
     */
    MapService.prototype.createClusterIcon = function(count) {
        return '<div style="' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'width: 50px;' +
            'height: 50px;' +
            'background: linear-gradient(135deg, #7D9675 0%, #5A6F52 100%);' +
            'border-radius: 50%;' +
            'box-shadow: 0 8px 24px rgba(0,0,0,0.2);' +
            'font-family: -apple-system, BlinkMacSystemFont, sans-serif;' +
            'font-size: 16px;' +
            'font-weight: 700;' +
            'color: white;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
            '" onmouseover="this.style.transform=\'scale(1.1)\';" ' +
            'onmouseout="this.style.transform=\'scale(1)\';">' +
            count +
            '</div>';
    };

    // ========================================
    // 마커 가시성 & 클러스터링
    // ========================================

    /**
     * 줌/뷰포트에 따른 마커 가시성 업데이트
     */
    MapService.prototype.updateMarkerVisibility = function() {
        var self = this;

        if (!self.map) return;

        var bounds = self.map.getBounds();
        if (!bounds) return;

        var zoom = self.map.getZoom();

        // 기존 클러스터 마커 제거
        self.clusterMarkers.forEach(function(marker) {
            marker.setMap(null);
        });
        self.clusterMarkers = [];

        if (zoom <= self.config.clusterZoom) {
            // === 클러스터 모드 ===
            var visibleItems = [];

            self.markers.forEach(function(item) {
                // 개별 마커 숨김
                item.marker.setMap(null);

                // Viewport 내 마커만 수집
                if (bounds.hasLatLng(item.marker.getPosition())) {
                    visibleItems.push(item);
                }
            });

            // 그리드 기반 클러스터링 (O(n))
            var clusters = self.computeGridClusters(visibleItems, zoom);

            clusters.forEach(function(cluster) {
                if (cluster.length === 1) {
                    // 단일 마커는 그대로 표시
                    cluster[0].marker.setMap(self.map);
                } else {
                    // 클러스터 마커 생성
                    self.createClusterMarker(cluster);
                }
            });

        } else {
            // === 일반 모드: 개별 마커 표시 ===
            self.markers.forEach(function(item) {
                var inBounds = bounds.hasLatLng(item.marker.getPosition());

                if (inBounds && !item.marker.getMap()) {
                    item.marker.setMap(self.map);
                } else if (!inBounds && item.marker.getMap()) {
                    item.marker.setMap(null);
                }
            });
        }
    };

    /**
     * 그리드 기반 클러스터링 (O(n) 성능)
     * @param {Array} items - 마커 아이템 배열
     * @param {number} zoom - 현재 줌 레벨
     * @returns {Array} 클러스터 배열
     */
    MapService.prototype.computeGridClusters = function(items, zoom) {
        var self = this;

        // 줌 레벨에 따른 그리드 크기 (도 단위)
        var gridSize = Math.pow(2, 12 - zoom) * 0.01;

        var grid = {};

        items.forEach(function(item) {
            var lat = item.partner.latitude;
            var lng = item.partner.longitude;

            // 그리드 키 생성
            var gridX = Math.floor(lng / gridSize);
            var gridY = Math.floor(lat / gridSize);
            var key = gridX + '_' + gridY;

            if (!grid[key]) {
                grid[key] = [];
            }

            grid[key].push(item);
        });

        // 그리드를 배열로 변환
        var clusters = Object.values(grid);

        // 최소 클러스터 크기 필터링
        return clusters.filter(function(cluster) {
            return cluster.length >= self.config.clusterMinSize || cluster.length === 1;
        });
    };

    /**
     * 클러스터 마커 생성
     * @param {Array} cluster - 클러스터 아이템 배열
     */
    MapService.prototype.createClusterMarker = function(cluster) {
        var self = this;

        // 클러스터 중심 계산 (평균)
        var avgLat = 0;
        var avgLng = 0;

        cluster.forEach(function(item) {
            avgLat += item.partner.latitude;
            avgLng += item.partner.longitude;
        });

        avgLat /= cluster.length;
        avgLng /= cluster.length;

        var position = new naver.maps.LatLng(avgLat, avgLng);

        var marker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: self.createClusterIcon(cluster.length),
                anchor: new naver.maps.Point(25, 25)
            },
            zIndex: 100
        });

        // 클릭 시 줌인
        naver.maps.Event.addListener(marker, 'click', function() {
            self.map.setCenter(position);
            self.map.setZoom(self.map.getZoom() + 2);
        });

        self.clusterMarkers.push(marker);
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 모든 마커 제거
     */
    MapService.prototype.clearMarkers = function() {
        var self = this;

        self.markers.forEach(function(item) {
            item.marker.setMap(null);
        });
        self.markers = [];

        self.clusterMarkers.forEach(function(marker) {
            marker.setMap(null);
        });
        self.clusterMarkers = [];
    };

    /**
     * 지도 초기화 (중심/줌 리셋)
     */
    MapService.prototype.reset = function() {
        var self = this;

        if (!self.map) return;

        self.map.setCenter(new naver.maps.LatLng(
            self.config.defaultCenter.lat,
            self.config.defaultCenter.lng
        ));
        self.map.setZoom(self.config.defaultZoom);
    };

    /**
     * 특정 파트너로 지도 이동
     * @param {Object} partner - 파트너 데이터
     */
    MapService.prototype.moveTo = function(partner) {
        var self = this;

        if (!self.map || !partner.latitude || !partner.longitude) return;

        var position = new naver.maps.LatLng(partner.latitude, partner.longitude);
        self.map.setCenter(position);
        self.map.setZoom(15);  // 상세 줌 레벨
    };

    /**
     * 기준점 설정 (GPS 등)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    MapService.prototype.setReferencePoint = function(lat, lng) {
        var self = this;

        self.referencePoint = { lat: lat, lng: lng };

        if (!self.map) return;

        // 기준점 마커 표시 (선택 사항)
        var position = new naver.maps.LatLng(lat, lng);
        self.map.setCenter(position);
        self.map.setZoom(self.config.gpsZoomLevel);
    };

    /**
     * 기준점 설정 및 마커 표시 (지도 클릭용)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    MapService.prototype.setReferencePointWithMarker = function(lat, lng) {
        var self = this;

        // 기존 마커 제거
        if (self.referencePointMarker) {
            self.referencePointMarker.setMap(null);
        }

        self.referencePoint = { lat: lat, lng: lng };

        if (!self.map) return;

        var position = new naver.maps.LatLng(lat, lng);

        // 기준점 마커 생성
        self.referencePointMarker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: '<div style="width:40px;height:40px;line-height:40px;' +
                         'text-align:center;font-size:28px;color:#C9A961;' +
                         'animation:pulse 1.5s infinite;">' +
                         '<i class="ph-fill ph-map-pin"></i></div>',
                anchor: new naver.maps.Point(20, 40)
            },
            zIndex: 1000
        });

        self.map.setCenter(position);

        // 초기화 버튼 표시
        var clearBtn = document.getElementById('pm-clear-reference-btn');
        if (clearBtn) {
            clearBtn.style.display = 'block';
        }
    };

    /**
     * 기준점 및 마커 초기화
     */
    MapService.prototype.clearReferencePoint = function() {
        var self = this;

        if (self.referencePointMarker) {
            self.referencePointMarker.setMap(null);
            self.referencePointMarker = null;
        }

        self.referencePoint = null;

        if (window.FilterService) {
            window.FilterService.setReferencePoint(null, null);
        }
    };

    /**
     * Haversine 거리 계산 (킬로미터)
     * @param {number} lat1 - 위도1
     * @param {number} lng1 - 경도1
     * @param {number} lat2 - 위도2
     * @param {number} lng2 - 경도2
     * @returns {number} 거리 (km)
     */
    MapService.prototype.calculateDistance = function(lat1, lng1, lat2, lng2) {
        var R = 6371;  // 지구 반지름 (km)

        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.MapService = MapService;

})(window);

// ========================================

/**
 * 파트너맵 v3 - 필터링 시스템
 * 책임: 4중 필터, 활성 배지, URL 동기화
 */

(function(window) {
    'use strict';

    /**
     * 필터 서비스
     * @param {Object} config - CONFIG 객체
     */
    function FilterService(config) {
        this.config = config;
        this.partners = [];
        this.filteredPartners = [];
        this.currentFilters = {
            category: 'all',
            region: 'all',
            association: 'all',
            partnerType: 'all',
            favorites: false,
            search: ''
        };
        this.referencePoint = null;  // GPS 기준점
    }

    // ========================================
    // 초기화
    // ========================================

    /**
     * 필터 초기화
     * @param {Array} partners - 파트너 데이터 배열
     */
    FilterService.prototype.init = function(partners) {
        var self = this;

        self.partners = partners;
        self.filteredPartners = partners;

        // 필터 버튼 생성
        self.generateFilterButtons();

        // 이벤트 리스너 설정
        self.setupEventListeners();

        // URL 파라미터 로드
        self.loadUrlParams();

        console.log('[Filter] 필터 초기화 완료');
    };

    /**
     * 필터 버튼 생성
     */
    FilterService.prototype.generateFilterButtons = function() {
        var self = this;

        // 카테고리 추출
        var categories = self.extractUniqueValues('category');
        self.renderFilterGroup('category', categories);

        // 지역 추출
        var regions = self.extractRegions();
        self.renderFilterGroup('region', regions);

        // 협회 추출
        var associations = self.extractUniqueValues('association', true);
        self.renderFilterGroup('association', associations);

        // 파트너 유형 추출
        var partnerTypes = self.extractUniqueValues('partnerType');
        self.renderFilterGroup('partnerType', partnerTypes);
    };

    /**
     * 고유 값 추출
     * @param {string} field - 필드명
     * @param {boolean} splitComma - 쉼표로 분리 여부
     * @returns {Array} 고유 값 배열
     */
    FilterService.prototype.extractUniqueValues = function(field, splitComma) {
        var self = this;
        var values = new Set();

        self.partners.forEach(function(partner) {
            var value = partner[field];

            if (!value) return;

            if (splitComma && typeof value === 'string') {
                value.split(',').forEach(function(v) {
                    var trimmed = v.trim();
                    if (trimmed) values.add(trimmed);
                });
            } else if (Array.isArray(value)) {
                value.forEach(function(v) {
                    if (v) values.add(v);
                });
            } else {
                values.add(value);
            }
        });

        return Array.from(values).sort();
    };

    /**
     * 지역 추출 (주소에서 시/도 추출)
     * @returns {Array} 지역 배열
     */
    FilterService.prototype.extractRegions = function() {
        var self = this;
        var regions = new Set();

        self.partners.forEach(function(partner) {
            var region = self.extractRegionFromAddress(partner.address);
            if (region) regions.add(region);
        });

        return Array.from(regions).sort();
    };

    /**
     * 주소에서 시/도 추출
     * @param {string} address - 주소
     * @returns {string} 시/도
     */
    FilterService.prototype.extractRegionFromAddress = function(address) {
        if (!address) return null;

        var match = address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
        return match ? match[1] : '기타';
    };

    /**
     * 필터 그룹 렌더링
     * @param {string} type - 필터 타입
     * @param {Array} values - 필터 값 배열
     */
    FilterService.prototype.renderFilterGroup = function(type, values) {
        var container = document.getElementById('pm-filter-' + type);
        if (!container) return;

        var html = '<button class="filter-btn active" data-filter-type="' + type + '" data-filter-value="all">전체</button>';

        values.forEach(function(value) {
            html += '<button class="filter-btn" data-filter-type="' + type + '" data-filter-value="' + value + '">' +
                    window.escapeHtml(value) +
                    '</button>';
        });

        container.innerHTML = html;
    };

    /**
     * 이벤트 리스너 설정
     */
    FilterService.prototype.setupEventListeners = function() {
        var self = this;

        // 필터 탭 전환
        var tabs = document.querySelectorAll('.pm-filter-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var filterType = this.getAttribute('data-filter-type');

                // 탭 활성화
                tabs.forEach(function(t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // 필터 그룹 표시
                var groups = document.querySelectorAll('.pm-filter-group');
                groups.forEach(function(g) { g.classList.remove('active'); });

                var targetGroup = document.getElementById('pm-filter-' + filterType);
                if (targetGroup) {
                    targetGroup.classList.add('active');
                }
            });
        });

        // 필터 버튼 클릭
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-btn')) {
                var filterType = e.target.getAttribute('data-filter-type');
                var filterValue = e.target.getAttribute('data-filter-value');

                // 같은 그룹 내 활성화 토글
                var parent = e.target.parentElement;
                var siblings = parent.querySelectorAll('.filter-btn');
                siblings.forEach(function(btn) { btn.classList.remove('active'); });
                e.target.classList.add('active');

                // 필터 적용
                self.setFilter(filterType, filterValue);
            }
        });

        // 활성 필터 배지 제거
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('pm-badge-remove')) {
                var filterType = e.target.getAttribute('data-filter-type');
                self.setFilter(filterType, 'all');
            }
        });

        // 정렬 변경
        var sortSelect = document.getElementById('pm-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                self.sortPartners(this.value);
                self.applyFilters();
            });
        }
    };

    // ========================================
    // 필터 적용
    // ========================================

    /**
     * 필터 설정
     * @param {string} type - 필터 타입
     * @param {string} value - 필터 값
     */
    FilterService.prototype.setFilter = function(type, value) {
        var self = this;

        if (type === 'favorites') {
            self.currentFilters.favorites = (value === 'true' || value === true);
        } else {
            self.currentFilters[type] = value;
        }

        // 필터 적용
        self.applyFilters();

        // URL 동기화
        self.updateUrlParams();

        // 활성 필터 배지 업데이트
        self.updateActiveFilterBadges();
    };

    /**
     * 검색 설정
     * @param {string} query - 검색어
     */
    FilterService.prototype.setSearch = function(query) {
        var self = this;

        self.currentFilters.search = query;
        self.applyFilters();
    };

    /**
     * 필터 적용
     */
    FilterService.prototype.applyFilters = function() {
        var self = this;

        self.filteredPartners = self.partners.filter(function(partner) {
            // 카테고리
            if (self.currentFilters.category !== 'all') {
                var categories = Array.isArray(partner.category) ? partner.category : [partner.category];
                if (!categories.includes(self.currentFilters.category)) {
                    return false;
                }
            }

            // 지역
            if (self.currentFilters.region !== 'all') {
                var region = self.extractRegionFromAddress(partner.address);
                if (region !== self.currentFilters.region) {
                    return false;
                }
            }

            // 협회
            if (self.currentFilters.association !== 'all') {
                var associations = partner.association
                    ? partner.association.split(',').map(function(a) { return a.trim(); })
                    : [];
                if (!associations.includes(self.currentFilters.association)) {
                    return false;
                }
            }

            // 파트너 유형
            if (self.currentFilters.partnerType !== 'all') {
                if (!partner.partnerType || !partner.partnerType.includes(self.currentFilters.partnerType)) {
                    return false;
                }
            }

            // 즐겨찾기
            if (self.currentFilters.favorites) {
                var favorites = JSON.parse(localStorage.getItem(self.config.favoritesKey) || '[]');
                if (!favorites.includes(partner.id)) {
                    return false;
                }
            }

            // 검색
            if (self.currentFilters.search) {
                var query = self.currentFilters.search.toLowerCase();
                var nameMatch = partner.name.toLowerCase().includes(query);
                var addressMatch = partner.address.toLowerCase().includes(query);
                if (!nameMatch && !addressMatch) {
                    return false;
                }
            }

            return true;
        });

        // 정렬 적용
        var sortType = document.getElementById('pm-sort-select');
        if (sortType) {
            self.sortPartners(sortType.value);
        }

        // 지도 및 리스트 업데이트
        if (window.MapService && window.MapService.createMarkers) {
            window.MapService.createMarkers(self.filteredPartners);
        }

        if (window.UIService && window.UIService.renderPartnerList) {
            window.UIService.renderPartnerList(self.filteredPartners);
        }

        // 결과 카운트 업데이트
        var resultCountElement = document.getElementById('pm-result-count-text');
        if (resultCountElement) {
            resultCountElement.textContent = '전체 ' + self.filteredPartners.length + '개 업체';
        }

        console.log('[Filter] 필터 적용 완료 (' + self.filteredPartners.length + '개 결과)');
    };

    // ========================================
    // 정렬
    // ========================================

    /**
     * 파트너 정렬
     * @param {string} sortType - 정렬 타입 ('name', 'distance', 'recent')
     */
    FilterService.prototype.sortPartners = function(sortType) {
        var self = this;

        switch (sortType) {
            case 'name':
                self.filteredPartners.sort(function(a, b) {
                    return a.name.localeCompare(b.name, 'ko');
                });
                break;

            case 'distance':
                if (self.referencePoint) {
                    // 거리 계산 및 파트너 객체에 추가
                    self.filteredPartners.forEach(function(partner) {
                        partner.distance = self.calculateDistance(
                            self.referencePoint.lat,
                            self.referencePoint.lng,
                            partner.latitude,
                            partner.longitude
                        );
                    });

                    // 정렬
                    self.filteredPartners.sort(function(a, b) {
                        return a.distance - b.distance;
                    });
                } else {
                    // 기준점이 없으면 안내 메시지
                    if (window.UIService) {
                        window.UIService.showToast(
                            '지도를 클릭하거나 GPS 버튼을 눌러 기준점을 설정하세요.',
                            'info'
                        );
                    }
                }
                break;

            case 'recent':
                // ID가 최근 추가순이라고 가정
                self.filteredPartners.sort(function(a, b) {
                    return b.id - a.id;
                });
                break;
        }
    };

    /**
     * Haversine 거리 계산 (킬로미터)
     */
    FilterService.prototype.calculateDistance = function(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    /**
     * 기준점 설정 (GPS)
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     */
    FilterService.prototype.setReferencePoint = function(lat, lng) {
        var self = this;
        self.referencePoint = { lat: lat, lng: lng };
    };

    // ========================================
    // 활성 필터 배지
    // ========================================

    /**
     * 활성 필터 배지 업데이트
     */
    FilterService.prototype.updateActiveFilterBadges = function() {
        var self = this;
        var container = document.getElementById('pm-active-filters');
        if (!container) return;

        var badges = [];

        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];

            if (value !== 'all' && value !== '' && value !== false) {
                var label = self.getFilterLabel(type, value);
                badges.push({
                    type: type,
                    value: value,
                    label: label
                });
            }
        });

        if (badges.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        var html = badges.map(function(badge) {
            return '<span class="pm-active-badge">' +
                   window.escapeHtml(badge.label) +
                   '<button class="pm-badge-remove" data-filter-type="' + badge.type + '" aria-label="제거">×</button>' +
                   '</span>';
        }).join('');

        container.innerHTML = html;
        container.style.display = 'flex';
    };

    /**
     * 필터 레이블 가져오기
     * @param {string} type - 필터 타입
     * @param {string} value - 필터 값
     * @returns {string} 레이블
     */
    FilterService.prototype.getFilterLabel = function(type, value) {
        var labels = {
            category: '카테고리: ',
            region: '지역: ',
            association: '협회: ',
            partnerType: '유형: ',
            favorites: '즐겨찾기',
            search: '검색: '
        };

        if (type === 'favorites') {
            return labels[type];
        }

        return labels[type] + value;
    };

    // ========================================
    // URL 동기화
    // ========================================

    /**
     * URL 파라미터 업데이트
     */
    FilterService.prototype.updateUrlParams = function() {
        var self = this;

        var params = new URLSearchParams();

        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];
            if (value !== 'all' && value !== '' && value !== false) {
                params.set(type, value);
            }
        });

        var newUrl = window.location.pathname;
        if (params.toString()) {
            newUrl += '?' + params.toString();
        }

        window.history.replaceState({}, '', newUrl);
    };

    /**
     * URL 파라미터 로드
     */
    FilterService.prototype.loadUrlParams = function() {
        var self = this;

        var params = new URLSearchParams(window.location.search);

        params.forEach(function(value, key) {
            if (self.currentFilters.hasOwnProperty(key)) {
                self.currentFilters[key] = value === 'true' ? true : value;
            }
        });

        // UI 동기화
        Object.keys(self.currentFilters).forEach(function(type) {
            var value = self.currentFilters[type];
            if (value !== 'all' && value !== '' && value !== false) {
                var btn = document.querySelector('.filter-btn[data-filter-type="' + type + '"][data-filter-value="' + value + '"]');
                if (btn) {
                    var siblings = btn.parentElement.querySelectorAll('.filter-btn');
                    siblings.forEach(function(s) { s.classList.remove('active'); });
                    btn.classList.add('active');
                }
            }
        });
    };

    // ========================================
    // 유틸리티
    // ========================================

    /**
     * 필터 초기화
     */
    FilterService.prototype.resetFilters = function() {
        var self = this;

        self.currentFilters = {
            category: 'all',
            region: 'all',
            association: 'all',
            partnerType: 'all',
            favorites: false,
            search: ''
        };

        // UI 리셋
        var allBtns = document.querySelectorAll('.filter-btn');
        allBtns.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter-value') === 'all') {
                btn.classList.add('active');
            }
        });

        self.applyFilters();
        self.updateUrlParams();
        self.updateActiveFilterBadges();
    };

    /**
     * 필터된 파트너 가져오기
     * @returns {Array} 필터된 파트너 배열
     */
    FilterService.prototype.getFilteredPartners = function() {
        return this.filteredPartners;
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.FilterService = FilterService;

})(window);
