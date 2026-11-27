// become — 오프라인 지원용 서비스 워커
// 앱을 고친 뒤에는 CACHE 이름의 숫자를 올려야 아이폰에 새 버전이 반영돼요.
const CACHE = 'become-v19'; // index.html의 APP_VERSION과 같이 올림
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png', './splash-390x844.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // 화면(HTML)은 인터넷이 되면 새 버전, 안 되면 저장된 버전
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
