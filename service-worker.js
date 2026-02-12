/**
 * 파트너맵 v3 - Service Worker
 * 책임: 캐싱 전략, 오프라인 지원, 백그라운드 동기화
 * 메이크샵 D4 호환: var 사용, ES5 문법
 */

var CACHE_VERSION = 'partnermap-v3.0.0';
var STATIC_CACHE = CACHE_VERSION + '-static';
var DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';
var IMAGE_CACHE = CACHE_VERSION + '-images';

// 정적 자산 목록
var STATIC_ASSETS = [
    '/',
    '/v3-enhancement/makeshop-html.html',
    '/v3-enhancement/makeshop-css-variables.css',
    '/v3-enhancement/makeshop-css-core.css',
    '/v3-enhancement/makeshop-css-touch.css',
    '/v3-enhancement/makeshop-js-part1.js',
    '/v3-enhancement/makeshop-js-part2a.js',
    '/v3-enhancement/makeshop-js-part2b1.js',
    '/v3-enhancement/makeshop-js-part2b2.js',
    '/v3-enhancement/makeshop-js-touch.js',
    '/v3-enhancement/makeshop-js-analytics.js',
    '/v3-enhancement/makeshop-js-pwa.js',
    '/offline.html'
];

// CDN 자산 (선택적 캐싱)
var CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css',
    'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/fill/style.css',
    'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0'
];

// ========================================
// Install 이벤트
// ========================================

self.addEventListener('install', function(event) {
    console.log('[SW] Install 이벤트:', CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(cache) {
                console.log('[SW] 정적 자산 캐싱 시작');

                // 정적 자산 캐싱
                return cache.addAll(STATIC_ASSETS)
                    .then(function() {
                        console.log('[SW] 정적 자산 캐싱 완료');

                        // CDN 자산 캐싱 (실패해도 설치는 진행)
                        return Promise.all(
                            CDN_ASSETS.map(function(url) {
                                return fetch(url)
                                    .then(function(response) {
                                        if (response.ok) {
                                            return cache.put(url, response);
                                        }
                                    })
                                    .catch(function(error) {
                                        console.warn('[SW] CDN 자산 캐싱 실패:', url, error);
                                    });
                            })
                        );
                    });
            })
            .then(function() {
                console.log('[SW] 캐싱 완료, skipWaiting 실행');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('[SW] Install 실패:', error);
            })
    );
});

// ========================================
// Activate 이벤트
// ========================================

self.addEventListener('activate', function(event) {
    console.log('[SW] Activate 이벤트:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                // 이전 버전 캐시 삭제
                return Promise.all(
                    cacheNames
                        .filter(function(cacheName) {
                            return cacheName.startsWith('partnermap-') &&
                                   cacheName !== STATIC_CACHE &&
                                   cacheName !== DYNAMIC_CACHE &&
                                   cacheName !== IMAGE_CACHE;
                        })
                        .map(function(cacheName) {
                            console.log('[SW] 이전 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(function() {
                console.log('[SW] 캐시 정리 완료, clients.claim 실행');
                return self.clients.claim();
            })
    );
});

// ========================================
// Fetch 이벤트 - 캐싱 전략
// ========================================

self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // 1. API 요청 - Network First (신선한 데이터 우선)
    if (url.href.includes('script.google.com') || url.href.includes('googletagmanager.com')) {
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    // 응답 복제 후 캐시 저장
                    var clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then(function(cache) {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(function() {
                    // 네트워크 실패 시 캐시에서 반환
                    return caches.match(event.request)
                        .then(function(response) {
                            if (response) {
                                console.log('[SW] API 캐시 사용:', url.href);
                                return response;
                            }

                            // 캐시도 없으면 오프라인 페이지
                            if (event.request.mode === 'navigate') {
                                return caches.match('/offline.html');
                            }
                        });
                })
        );
        return;
    }

    // 2. 네이버 지도 SDK - Network First
    if (url.href.includes('naver.com') && url.href.includes('maps')) {
        event.respondWith(
            fetch(event.request)
                .catch(function() {
                    // 오프라인 시 기본 응답
                    return new Response(
                        'console.log("[SW] 네이버 지도 SDK 오프라인");',
                        { headers: { 'Content-Type': 'application/javascript' } }
                    );
                })
        );
        return;
    }

    // 3. 이미지 요청 - Cache First (성능 최적화)
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(IMAGE_CACHE)
                .then(function(cache) {
                    return cache.match(event.request)
                        .then(function(response) {
                            if (response) {
                                return response;
                            }

                            // 캐시 미스 - 네트워크 요청 후 캐싱
                            return fetch(event.request)
                                .then(function(networkResponse) {
                                    cache.put(event.request, networkResponse.clone());
                                    return networkResponse;
                                })
                                .catch(function() {
                                    // 이미지 로드 실패 시 기본 이미지 (선택 사항)
                                    return new Response('', { status: 404 });
                                });
                        });
                })
        );
        return;
    }

    // 4. 정적 자산 - Cache First (HTML, CSS, JS)
    if (event.request.url.includes('makeshop-') ||
        event.request.url.includes('phosphor-icons') ||
        event.request.url.includes('fuse.js')) {

        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }

                    // 캐시 미스 - 네트워크 요청
                    return fetch(event.request)
                        .then(function(networkResponse) {
                            // 동적 캐시에 저장
                            if (networkResponse.ok) {
                                var clonedResponse = networkResponse.clone();
                                caches.open(DYNAMIC_CACHE).then(function(cache) {
                                    cache.put(event.request, clonedResponse);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(function() {
                            // 네비게이션 요청이면 오프라인 페이지
                            if (event.request.mode === 'navigate') {
                                return caches.match('/offline.html');
                            }
                        });
                })
        );
        return;
    }

    // 5. 기타 모든 요청 - Network First
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // 성공적인 응답만 캐싱
                if (response.ok) {
                    var clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then(function(cache) {
                        cache.put(event.request, clonedResponse);
                    });
                }
                return response;
            })
            .catch(function() {
                // 네트워크 실패 시 캐시 확인
                return caches.match(event.request)
                    .then(function(response) {
                        if (response) {
                            return response;
                        }

                        // HTML 네비게이션이면 오프라인 페이지
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }

                        // 그 외는 빈 응답
                        return new Response('', { status: 404 });
                    });
            })
    );
});

// ========================================
// Message 이벤트 (클라이언트와 통신)
// ========================================

self.addEventListener('message', function(event) {
    console.log('[SW] Message 수신:', event.data);

    // 캐시 강제 업데이트
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // 캐시 삭제
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// ========================================
// Background Sync (향후 확장)
// ========================================

// 백그라운드 동기화 (Chrome/Edge만 지원)
self.addEventListener('sync', function(event) {
    console.log('[SW] Sync 이벤트:', event.tag);

    if (event.tag === 'sync-partners') {
        event.waitUntil(
            // 백그라운드에서 파트너 데이터 동기화
            fetch('/api/partners')
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    console.log('[SW] 백그라운드 동기화 완료');
                })
                .catch(function(error) {
                    console.error('[SW] 백그라운드 동기화 실패:', error);
                })
        );
    }
});

console.log('[SW] Service Worker 로드 완료:', CACHE_VERSION);
