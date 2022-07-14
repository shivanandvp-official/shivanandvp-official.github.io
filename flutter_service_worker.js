'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "e59c0b1b426ccc4d2b654723a9979724",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/NOTICES": "e788a3ea6d6d6715fbfb953a7b69bba4",
"assets/AssetManifest.json": "7813ba866bc7a1893a99e5159c7cc9ce",
"assets/FontManifest.json": "da2ba35862fa025aaa3aa8fb7402bb4b",
"assets/fonts/Montserrat-BlackItalic.otf": "806d62750d51eb3755d6f6cb2252d9a0",
"assets/fonts/Montserrat-ExtraBold.otf": "e95c3e50b817267a19373c710c24b477",
"assets/fonts/Montserrat-LightItalic.otf": "09ae73f8f8bd4f249f88955bed3380dc",
"assets/fonts/Montserrat-MediumItalic.otf": "62ab81f7de79295335c4a066bb6f532a",
"assets/fonts/Montserrat-Thin.otf": "ebf8a9d2c876385d41115e528adbcebe",
"assets/fonts/Montserrat-Black.otf": "43c64560a44013d24487bedfe405dfc1",
"assets/fonts/Montserrat-Light.otf": "0011a833b1c1d0b5a6b2a65770f7253f",
"assets/fonts/Montserrat-ExtraLightItalic.otf": "23f5bf88a98969617b5e0f3bee48a836",
"assets/fonts/Montserrat-Italic.otf": "dcdf9692c79813fff228ec265e9967b7",
"assets/fonts/Montserrat-BoldItalic.otf": "1be458769d02d85f1bc37991cdf5739e",
"assets/fonts/Montserrat-Bold.otf": "a9d07119f15faf5eee4a615c9f1cb6b4",
"assets/fonts/Montserrat-ThinItalic.otf": "0dc11157966e17d4b1dbf54eabebacaf",
"assets/fonts/Montserrat-SemiBold.otf": "28dbe0bdaa4b108a991f096402b45744",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/fonts/Montserrat-ExtraLight.otf": "ffb4c7efad63409d7d0c5ebbfb78fce9",
"assets/fonts/Montserrat-ExtraBoldItalic.otf": "21a725af79d88f1b6ce419bd7570a1d0",
"assets/fonts/Montserrat-Medium.otf": "d92e75dbd0c0a3c76fa6c9d6cbd3782a",
"assets/fonts/Montserrat-SemiBoldItalic.otf": "e3966d9b09012402e4de65b93c510ccd",
"assets/fonts/Montserrat-Regular.otf": "728cf466b176012fcf2de8a74fe82e92",
"version.json": "3312d61e95c861b9a9f8862c468a7c5f",
"flutter.js": "3688efe0a39e59781b4f95efbd6b5b62",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"index.html": "2d1a2cb0a3b26c05878fbe0cbdc61e41",
"/": "2d1a2cb0a3b26c05878fbe0cbdc61e41",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"main.dart.js": "f358921a61953306578dc10d1a9a56a0"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
