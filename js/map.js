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
     * 네이버 지도 SDK 동적 로드
     * @returns {Promise<void>}
     */
    MapService.prototype.loadSDK = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            // 이미 로드된 경우
            if (window.naver && window.naver.maps) {
                console.log('[Map] 네이버 지도 SDK 이미 로드됨');
                resolve();
                return;
            }

            console.log('[Map] 네이버 지도 SDK 로드 시작');

            var script = document.createElement('script');
            script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=' +
                         self.config.naverMapNcpKeyId +
                         '&t=' + Date.now();
            script.async = true;

            script.onload = function() {
                console.log('[Map] 네이버 지도 SDK 로드 완료');
                resolve();
            };

            script.onerror = function() {
                console.error('[Map] 네이버 지도 SDK 로드 실패');
                reject(new Error('네이버 지도 SDK 로드 실패'));
            };

            document.head.appendChild(script);
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

        // 📍 마커 생성
        self.referencePointMarker = new naver.maps.Marker({
            position: position,
            map: self.map,
            icon: {
                content: '<div style="width:40px;height:40px;line-height:40px;' +
                         'text-align:center;font-size:28px;' +
                         'animation:pulse 1.5s infinite;">📍</div>',
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
