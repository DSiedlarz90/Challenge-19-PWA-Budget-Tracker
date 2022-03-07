//global veriables
const APP_PREFIX = "PWABudgetTracker-";
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//files to cache for offline use
const FILES_TO_CACHE = [
    "./index.html",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
];

// sends files to cache
self.addEventListener('install', function(i) {
    i.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Installing cache : " + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
}); 

//deletes old cached files
self.addEventListener('activate', function(i) {
    i.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('Deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

//provides new cache data or else it uses old cache data.
self.addEventListener('fetch', function(i) {
    console.log('fetch request : ' + i.request.url)
    i.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('Responding with stored cache : ' + i.request.url)
                return request
            } else {
                console.log('File is not stored, fetching cache : ' + i.request.url)
                return fetch(i.request)
            }
        })
    )
}); 