// 画像遅延ロード v1
(function(global) {
  'use strict';
  const cache = new Map(); // url -> Promise<HTMLImageElement>

  function loadImage(url) {
    if (cache.has(url)) return cache.get(url);
    const p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('failed: ' + url));
      img.src = url;
    });
    cache.set(url, p);
    return p;
  }

  function preloadChapter(chapter) {
    if (!chapter || !chapter.taps) return Promise.resolve([]);
    const promises = chapter.taps
      .filter(t => t.img)
      .map(t => loadImage(t.img).catch(e => { console.warn(e); return null; }));
    return Promise.all(promises);
  }

  // 段階的プリロード戦略
  // 1) 起動時：導入(ch00)＋第零章(ch01)のみ
  // 2) 章選択：選択章＋次章をバックグラウンド先読み
  function preloadOnBoot(scenarios) {
    const initial = scenarios.slice(0, 2);
    return Promise.all(initial.map(preloadChapter));
  }
  function preloadForChapter(scenarios, idx) {
    const targets = [];
    if (scenarios[idx]) targets.push(preloadChapter(scenarios[idx]));
    if (scenarios[idx+1]) targets.push(preloadChapter(scenarios[idx+1]));
    return Promise.all(targets);
  }

  global.ImageLoader = { loadImage, preloadChapter, preloadOnBoot, preloadForChapter };
})(window);
