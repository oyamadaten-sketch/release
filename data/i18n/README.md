# i18n（ローカライズ）フォルダ

このフォルダは UI テキストのローカライズを扱います。

## ファイル構成

- `ja.json` — 日本語（既定・完全）
- `en.json` — 英語（draft、要ネイティブレビュー）
- `README.md` — このファイル

将来追加予定：`zh-CN.json` / `ko.json` など。

## スコープ

**対象**：ボタン、メニュー、HUD、システムメッセージ、クレジット等の**UI 短文**

**対象外**（別ファイル管理）：
- 物語本文（`data/scenarios_all.js`、章別 `data/scenarios/*.json`）
- キャラクター駒名（`data/puzzles.js` の `label` フィールド、現状日本語固定）
- ステージタイトル（`data/puzzles.js` の `label`、章タイトルに追従）

## キーの命名規約

ドット区切りでネスト、camelCase：
```
titleMenu.gameStart
buttons.back
puzzle.moveCount
select.footerTemplate  ← {chapters} や {taps} など変数を含む
```

## 変数埋め込み

`{変数名}` の形式で値を差し込み：
```json
{
  "footerTemplate": "全 {chapters} 章 ／ 全 {taps} タップ"
}
```

コード側：
```js
I18n.t('select.footerTemplate', { chapters: 24, taps: 165 })
```

## 使い方（開発者向け）

### 1. HTML: 属性で自動翻訳

```html
<button data-i18n="titleMenu.gameStart">ゲーム開始</button>
```

初期化時に textContent が自動で置換されます。

### 2. JS: 動的テキスト

```js
$('puz-count').textContent = I18n.t('puzzle.moveCount');
$('hint').textContent = I18n.t('select.footerTemplate', {
  chapters: SCENARIOS_V8.length,
  taps: SCENARIOS_V8.reduce((s,c)=>s+c.taps.length, 0)
});
```

### 3. ロケール切替

```js
await I18n.setLocale('en');   // 英語へ
await I18n.setLocale('ja');   // 日本語へ戻す
```

現在のロケールは `localStorage['oyayubikakushi_locale']` に保存されます。

## 段階的移行プラン

現状、UI テキストの多くは HTML/JS にハードコードされています。優先度：

**Phase 1（現在）**：i18n 基盤の整備
- ✅ ja.json / en.json 骨組み作成
- ✅ i18n.js ローダー実装
- ✅ 命名規約とREADME策定

**Phase 2**：静的HTMLテキストの移行
- `index.html` の `<button>` / `<div>` に `data-i18n` 属性追加
- 初期化時に自動置換

**Phase 3**：動的JSテキストの移行
- `main.js` のハードコード文字列を `I18n.t()` 呼び出しに置換
- console.log 等の開発用ログは対象外

**Phase 4**：英語コピーのブラッシュアップ
- `en.json` の draft を英語ネイティブがレビュー
- 物語本文の英訳スキームの検討（章別ファイル en/ch01.json など）

**Phase 5**：追加ロケール
- 中国語簡体、韓国語、その他必要に応じて

## 英訳の方針メモ

- **ゲーム名**：`Thumb-Hiding and the Daughter of the Cell` — 「親指隠シ」の民俗習俗（葬列時に親指を握りしめる呪い）と座牢の両方を含意
- **座牢**：`The Cell` — 単に「独房」ではなく物語上の特別な意味を持つため定訳化
- **明治初期**：`Early Meiji Era` — 年号は歴史用語として保持
- **手代 / 下女 / 番頭 等の商家役職**：将来ネイティブレビュー時に文化ノート付きで訳注検討

## 物語本文のローカライズ（Phase 4以降）

現状 `scenarios_all.js` は日本語固定。多言語対応時は以下いずれか：

**案A**：ロケール別配列
```
window.SCENARIOS_V8_ja = [...]
window.SCENARIOS_V8_en = [...]
```

**案B**：章別 JSON でロケール切替
```
data/scenarios/ja/ch01.json
data/scenarios/en/ch01.json
```

案 B の方が段階的翻訳・部分デプロイに向くので推奨。
