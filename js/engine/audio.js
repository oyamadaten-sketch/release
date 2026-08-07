// ─ 音声エンジン v1.0 ─
//   - BGM: ループ再生、フェードイン/アウト、クロスフェード
//   - SE: 単発再生、ピース音のランダム選択（SE-01/02/03）
//   - 音量：BGM/SE それぞれ 0-100、ミュートトグル、localStorage保存
//   - ブラウザの autoplay policy 対応（初回ユーザー操作まで待機）
//
(function(global) {
  'use strict';

  const BGM_BASE = 'assets/audio/bgm/';
  const SE_BASE  = 'assets/audio/se/';

  // 音量スロット（0.0-1.0、内部保持）
  const STORAGE_KEY = 'oyayubikakushi_audio_v1';
  const DEFAULT_BGM_VOL = 0.5;   // BGM は控えめ
  const DEFAULT_SE_VOL  = 0.7;
  const FADE_MS_DEFAULT = 800;

  const state = {
    bgmVol: DEFAULT_BGM_VOL,
    seVol:  DEFAULT_SE_VOL,
    muted: false,
    userGestureReceived: false,
    currentBgmId: null,          // 現在再生中の BGM ID (例: 'BGM-02')
    currentBgm: null,            // HTMLAudioElement
    pendingBgmId: null,          // gesture 待ちの BGM
    bgmElements: {},             // preloaded audio elements
    seElements: {},              // preloaded audio elements
    fadingOut: null,             // フェードアウト中の audio
  };

  // ─ localStorage ロード ─
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (typeof saved.bgmVol === 'number') state.bgmVol = saved.bgmVol;
    if (typeof saved.seVol  === 'number') state.seVol  = saved.seVol;
    if (typeof saved.muted  === 'boolean') state.muted = saved.muted;
  } catch(e) { console.warn('[audio] load settings failed:', e); }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        bgmVol: state.bgmVol, seVol: state.seVol, muted: state.muted
      }));
    } catch(e) { console.warn('[audio] save settings failed:', e); }
  }

  // ─ プリロード ─
  function preloadBgm(id) {
    if (state.bgmElements[id]) return state.bgmElements[id];
    const a = new Audio(BGM_BASE + id + '.mp3');
    a.preload = 'auto';
    a.loop = true;
    a.volume = 0;
    state.bgmElements[id] = a;
    return a;
  }

  function preloadSe(id) {
    if (state.seElements[id]) return state.seElements[id];
    const a = new Audio(SE_BASE + id + '.mp3');
    a.preload = 'auto';
    a.volume = state.muted ? 0 : state.seVol;
    state.seElements[id] = a;
    return a;
  }

  // 起動時プリロード（BGM 7 + SE 7）
  function preloadAll() {
    for (let i = 1; i <= 7; i++) preloadBgm('BGM-' + String(i).padStart(2, '0'));
    for (let i = 1; i <= 7; i++) preloadSe('SE-'  + String(i).padStart(2, '0'));
  }

  // ─ フェード ─
  function fadeVolume(audio, fromVol, toVol, durationMs, onDone) {
    if (!audio) { if (onDone) onDone(); return; }
    const startTime = performance.now();
    const step = () => {
      if (!audio) return;
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / durationMs);
      audio.volume = fromVol + (toVol - fromVol) * t;
      if (t < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    requestAnimationFrame(step);
  }

  // ─ BGM 再生 ─
  function playBgm(id, opts) {
    opts = opts || {};
    const fadeMs = typeof opts.fadeMs === 'number' ? opts.fadeMs : FADE_MS_DEFAULT;

    if (state.currentBgmId === id && state.currentBgm && !state.currentBgm.paused) {
      // 既に同じBGMが再生中
      return;
    }

    // まだユーザー操作前 → 待機
    if (!state.userGestureReceived) {
      state.pendingBgmId = id;
      return;
    }

    // 現在の BGM をフェードアウト
    if (state.currentBgm && !state.currentBgm.paused) {
      const oldAudio = state.currentBgm;
      const oldVol = oldAudio.volume;
      fadeVolume(oldAudio, oldVol, 0, fadeMs, () => {
        try { oldAudio.pause(); oldAudio.currentTime = 0; } catch(e) {}
      });
    }

    const next = preloadBgm(id);
    state.currentBgmId = id;
    state.currentBgm = next;
    next.volume = 0;
    const targetVol = state.muted ? 0 : state.bgmVol;
    next.play().then(() => {
      fadeVolume(next, 0, targetVol, fadeMs);
    }).catch(e => {
      console.warn('[audio] BGM play failed:', id, e);
    });
  }

  function stopBgm(opts) {
    opts = opts || {};
    const fadeMs = typeof opts.fadeMs === 'number' ? opts.fadeMs : FADE_MS_DEFAULT;
    if (!state.currentBgm) return;
    const cur = state.currentBgm;
    const oldVol = cur.volume;
    fadeVolume(cur, oldVol, 0, fadeMs, () => {
      try { cur.pause(); cur.currentTime = 0; } catch(e) {}
    });
    state.currentBgm = null;
    state.currentBgmId = null;
  }

  // ─ SE 再生 ─
  function playSe(id) {
    if (!state.userGestureReceived) return;  // gesture前は無音
    if (state.muted) return;
    // 同時再生可能：cloneNode で別インスタンス
    const src = preloadSe(id);
    if (!src) return;
    const inst = src.cloneNode();
    inst.volume = state.seVol;
    inst.play().catch(e => { /* 静かに無視 */ });
  }

  // ピース音（SE-01/02/03 からランダム）
  function playPieceSe() {
    const idx = 1 + Math.floor(Math.random() * 3);
    playSe('SE-' + String(idx).padStart(2, '0'));
  }

  // ─ 音量設定 ─
  function setBgmVolume(v) {
    state.bgmVol = Math.max(0, Math.min(1, v));
    if (state.currentBgm && !state.muted) {
      state.currentBgm.volume = state.bgmVol;
    }
    saveSettings();
  }

  function setSeVolume(v) {
    state.seVol = Math.max(0, Math.min(1, v));
    saveSettings();
  }

  function setMuted(m) {
    state.muted = !!m;
    if (state.currentBgm) {
      state.currentBgm.volume = state.muted ? 0 : state.bgmVol;
    }
    saveSettings();
  }

  function toggleMute() {
    setMuted(!state.muted);
    return state.muted;
  }

  // ─ ユーザー操作の受付（autoplay policy 対応） ─
  function receiveUserGesture() {
    if (state.userGestureReceived) return;
    state.userGestureReceived = true;
    console.log('[audio] user gesture received');
    // 待機中の BGM があれば再生
    if (state.pendingBgmId) {
      const id = state.pendingBgmId;
      state.pendingBgmId = null;
      playBgm(id);
    }
  }

  // ドキュメント全体のクリック/タッチ/キーで gesture を受信（1回だけ）
  function bindGestureListeners() {
    const handler = () => {
      receiveUserGesture();
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler, {once:false});
    document.addEventListener('touchstart', handler, {once:false});
    document.addEventListener('keydown', handler, {once:false});
  }

  // ─ 全ボタンクリック時に SE-07 を自動再生（capture フェーズ） ─
  function bindButtonSe() {
    document.addEventListener('click', (ev) => {
      const btn = ev.target && ev.target.closest && ev.target.closest('button');
      if (!btn) return;
      // 駒スライダー等の音量スライダー系や、音量パネル自身のトグルは除外
      if (btn.classList && (btn.classList.contains('lang-opt') || btn.classList.contains('audio-icon-btn'))) {
        playSe('SE-07');
        return;
      }
      // 駒ピース（.puz-piece）はSE-01/02/03担当なので除外
      if (btn.classList && btn.classList.contains('puz-piece')) return;
      // それ以外の全ボタン
      playSe('SE-07');
    }, true);
  }

  // ─ 初期化 ─
  function init() {
    preloadAll();
    bindGestureListeners();
    bindButtonSe();
    console.log('[audio] initialized. BGM vol=' + state.bgmVol + ' SE vol=' + state.seVol + ' muted=' + state.muted);
  }

  // 公開API（built-in Audio と衝突しないよう GameAudio のみを公開）
  global.GameAudio = {
    init, playBgm, stopBgm, playSe, playPieceSe,
    setBgmVolume, setSeVolume, setMuted, toggleMute,
    get bgmVol() { return state.bgmVol; },
    get seVol() { return state.seVol; },
    get muted() { return state.muted; },
    get currentBgmId() { return state.currentBgmId; }
  };
})(window);
