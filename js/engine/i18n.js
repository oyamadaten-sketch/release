// ─ ローカライズエンジン v1.0 ─
//   - 起動時に data/i18n/{locale}.json を fetch → window.I18N に格納
//   - ロケール切替時は再fetch → data-i18n 属性のDOMを一括更新
//   - {変数} 埋め込みも軽量対応: t('select.footerTemplate', {chapters: 24, taps: 165})
//   - 未翻訳キーはフォールバック (ja → en)
//
// 使い方:
//   1. HTML要素に data-i18n="titleMenu.gameStart" を付与
//   2. I18n.init('ja') で初期化 → 該当DOMのtextContentが自動置換
//   3. コード中の動的文字列は I18n.t('puzzle.moveCount') で取得
//
// 対応ロケール（将来）:
//   ja (日本語 完全対応)
//   en (英語 draft)
//   zh-CN / ko など追加時: data/i18n/zh-CN.json を追加してドロップダウン登録
//
(function(global) {
  'use strict';

  const STORAGE_KEY = 'oyayubikakushi_locale';
  const DEFAULT_LOCALE = 'ja';
  const FALLBACK_LOCALE = 'ja';
  const SUPPORTED = ['ja', 'en'];

  const state = {
    current: DEFAULT_LOCALE,
    data: {},        // 現在ロケールのフラット辞書
    fallback: {},    // フォールバック辞書
    loaded: false
  };

  // ネストしたJSONをドット区切りキーでフラット化: {a:{b:'x'}} → {'a.b':'x'}
  function flatten(obj, prefix, out) {
    out = out || {};
    for (const k of Object.keys(obj)) {
      if (k.startsWith('_')) continue;  // _meta 等はスキップ
      const val = obj[k];
      const key = prefix ? prefix + '.' + k : k;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flatten(val, key, out);
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  // {変数} 埋め込み
  function interpolate(str, vars) {
    if (!vars || typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, function(_, k) {
      return vars.hasOwnProperty(k) ? vars[k] : '{' + k + '}';
    });
  }

  // t('key.path', {vars}) で翻訳取得
  function t(key, vars) {
    let v = state.data[key];
    if (v === undefined) v = state.fallback[key];
    if (v === undefined) {
      console.warn('[i18n] missing key:', key);
      return '⟨' + key + '⟩';  // 未翻訳の可視化
    }
    return interpolate(v, vars);
  }

  // data-i18n 属性のDOMを一括更新
  function applyToDOM(root) {
    root = root || document;
    const nodes = root.querySelectorAll('[data-i18n]');
    for (const el of nodes) {
      const key = el.dataset.i18n;
      if (!key) continue;
      const text = t(key);
      // input.placeholder / img.alt など属性別置換
      if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search')) {
        el.placeholder = text;
      } else if (el.tagName === 'IMG') {
        el.alt = text;
      } else {
        el.textContent = text;
      }
    }
  }

  // ロケールJSONを fetch
  async function loadLocale(locale) {
    const url = 'data/i18n/' + locale + '.json';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('i18n fetch failed: ' + locale);
    const json = await resp.json();
    return flatten(json);
  }

  // 初期化：デフォルトlocaleを読込 + fallbackを別途保持
  async function init(preferredLocale) {
    const saved = localStorage.getItem(STORAGE_KEY);
    let locale = preferredLocale || saved || DEFAULT_LOCALE;
    if (!SUPPORTED.includes(locale)) locale = DEFAULT_LOCALE;

    try {
      state.data = await loadLocale(locale);
      state.current = locale;
      if (locale !== FALLBACK_LOCALE) {
        try {
          state.fallback = await loadLocale(FALLBACK_LOCALE);
        } catch (e) {
          console.warn('[i18n] fallback load failed:', e);
        }
      } else {
        state.fallback = state.data;
      }
      state.loaded = true;
      applyToDOM();
      console.log('[i18n] loaded locale:', locale);
    } catch (e) {
      console.error('[i18n] init failed:', e);
    }
  }

  // ロケール切替
  async function setLocale(locale) {
    if (!SUPPORTED.includes(locale)) {
      console.warn('[i18n] unsupported locale:', locale);
      return;
    }
    localStorage.setItem(STORAGE_KEY, locale);
    state.data = await loadLocale(locale);
    state.current = locale;
    applyToDOM();
  }

  global.I18n = {
    init, setLocale, t, applyToDOM,
    get current() { return state.current; },
    get supported() { return SUPPORTED.slice(); },
    get loaded() { return state.loaded; }
  };
})(window);
