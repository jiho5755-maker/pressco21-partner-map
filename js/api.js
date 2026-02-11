/**
 * 파트너맵 v3 - API 래퍼
 * 책임: Google Sheets API 통신, 캐싱, 데이터 변환
 * v2 검증된 로직 재사용 (메이크샵은 렌더링 플랫폼만 사용)
 */

(function(window) {
    'use strict';

    /**
     * API 클라이언트
     * @param {Object} config - CONFIG 객체
     */
    function PartnerAPI(config) {
        this.config = config;
    }

    // ========================================
    // 캐시 관리 (v2 getCache/setCache 재사용)
    // ========================================

    /**
     * 캐시에서 데이터 가져오기
     * @returns {Array|null} 파트너 데이터 배열 또는 null
     */
    PartnerAPI.prototype.getCache = function() {
        try {
            var cached = localStorage.getItem(this.config.cacheKey);
            if (!cached) {
                return null;
            }

            var parsedData = JSON.parse(cached);

            // 버전 확인
            if (parsedData.version !== this.config.cacheVersion) {
                console.log('[Cache] 버전 불일치, 캐시 무효화');
                this.clearCache();
                return null;
            }

            // 만료 확인
            var now = Date.now();
            if (now - parsedData.timestamp > this.config.cacheDuration) {
                console.log('[Cache] 만료됨, 캐시 무효화');
                this.clearCache();
                return null;
            }

            // 빈 배열 확인 (v2 로직)
            if (!parsedData.data || parsedData.data.length === 0) {
                console.log('[Cache] 빈 배열, 캐시 무시');
                return null;
            }

            console.log('[Cache] 캐시 히트 (' + parsedData.data.length + '개 파트너)');
            return parsedData.data;

        } catch (error) {
            console.error('[Cache] 캐시 읽기 오류:', error);
            return null;
        }
    };

    /**
     * 캐시에 데이터 저장 (v2 setCache 재사용)
     * @param {Array} partners - 파트너 데이터 배열
     * @returns {boolean} 저장 성공 여부
     */
    PartnerAPI.prototype.setCache = function(partners) {
        try {
            var cacheData = {
                version: this.config.cacheVersion,
                timestamp: Date.now(),
                data: partners
            };

            localStorage.setItem(this.config.cacheKey, JSON.stringify(cacheData));
            console.log('[Cache] 캐시 저장 완료 (' + partners.length + '개 파트너)');
            return true;

        } catch (error) {
            console.error('[Cache] 캐시 저장 오류:', error);
            return false;
        }
    };

    /**
     * 캐시 삭제
     */
    PartnerAPI.prototype.clearCache = function() {
        try {
            localStorage.removeItem(this.config.cacheKey);
            console.log('[Cache] 캐시 삭제 완료');
        } catch (error) {
            console.error('[Cache] 캐시 삭제 오류:', error);
        }
    };

    // ========================================
    // Google Sheets API (v2 loadPartnerData 재사용)
    // ========================================

    /**
     * Google Sheets에서 파트너 데이터 로드
     * v2 main.js loadPartnerData() 함수 재사용 (508-561줄)
     * @param {boolean} forceRefresh - 강제 새로고침 여부
     * @returns {Promise<Array>} 파트너 데이터 배열
     */
    PartnerAPI.prototype.loadPartnerData = function(forceRefresh) {
        var self = this;

        // 캐시 확인 (강제 새로고침이 아닌 경우)
        if (!forceRefresh) {
            var cached = self.getCache();
            if (cached && cached.length > 0) {
                return Promise.resolve(cached);
            }
        }

        console.log('[API] 파트너 데이터 로드 시작');

        // 테스트 데이터 모드 (개발용)
        if (self.config.useTestData) {
            console.log('[API] 테스트 데이터 모드 활성화');
            return fetch(self.config.testDataPath)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('테스트 데이터 로드 실패: ' + response.status);
                    }
                    return response.json();
                })
                .then(function(rawPartners) {
                    console.log('[API] 테스트 데이터 로드 완료:', rawPartners.length + '개');
                    return self.processPartnerData(rawPartners);
                })
                .catch(function(error) {
                    console.error('[API] 테스트 데이터 로드 오류:', error);
                    return [];
                });
        }

        // 운영 모드: Google Sheets API
        return fetch(self.config.googleSheetApiUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Google Sheets API 호출 실패: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                console.log('[API] 응답 수신:', data);

                // API 응답 구조 확인 (v2와 동일: data.partners 사용)
                var rawPartners = data.partners || data;

                console.log('[API] rawPartners:', rawPartners);

                if (!Array.isArray(rawPartners)) {
                    console.error('[API] 잘못된 데이터 형식:', data);
                    return [];
                }

                console.log('[API] 파트너 수:', rawPartners.length);

                // 데이터 가공 위임
                return self.processPartnerData(rawPartners);
            })
            .catch(function(error) {
                console.error('[API] 데이터 로드 실패:', error);
                return [];
            });
    };

    /**
     * 파트너 데이터 가공 (공통 로직)
     * @param {Array} rawPartners - 원본 파트너 데이터
     * @returns {Array} 가공된 파트너 데이터
     */
    PartnerAPI.prototype.processPartnerData = function(rawPartners) {
        var self = this;

        if (!Array.isArray(rawPartners)) {
            console.error('[API] 잘못된 데이터 형식:', rawPartners);
            return [];
        }

        // 데이터 가공 (v2 로직 재사용)
        var partners = rawPartners
            .filter(function(p) {
                return p.lat && p.lng;
            })
            .map(function(p) {
                return {
                    id: p.id,
                    name: p.name,
                    category: p.category ? p.category.split(',').map(function(c) {
                        return c.trim();
                    }) : [],
                    address: p.address,
                    latitude: parseFloat(p.lat),  // ⭐ CRITICAL: lat → latitude
                    longitude: parseFloat(p.lng),  // ⭐ CRITICAL: lng → longitude
                    phone: p.phone,
                    email: p.email,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    logoUrl: p.logoUrl,
                    association: p.association || '',
                    partnerType: p.partnerType
                        ? (typeof p.partnerType === 'string'
                            ? p.partnerType.split(',').map(function(t) {
                                return t.trim();
                            })
                            : p.partnerType)
                        : []
                };
            });

        console.log('[API] 가공 완료 (' + partners.length + '개 파트너)');

        // 캐시 저장
        self.setCache(partners);

        return partners;
    };

    /**
     * 단일 파트너 조회
     * @param {string} partnerId - 파트너 ID
     * @returns {Promise<Object|null>} 파트너 데이터 또는 null
     */
    PartnerAPI.prototype.getPartner = function(partnerId) {
        var self = this;

        return self.loadPartnerData(false)
            .then(function(partners) {
                var partner = partners.find(function(p) {
                    return String(p.id) === String(partnerId);
                });

                return partner || null;
            });
    };

    // ========================================
    // 전역 등록
    // ========================================

    window.PartnerAPI = PartnerAPI;

})(window);
