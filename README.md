# 親指隠シと座牢のムスメ ─ release v1.0

インディーゲーム本番向けの構造化版。**フェーズA完了**。

## ディレクトリ構成

```
release/
├── index.html                    エントリーポイント
├── css/main.css                  メインスタイル
├── js/
│   ├── main.js                   メインロジック
│   └── engine/
│       ├── text.js               改行・ページ送り
│       ├── save.js               セーブ機能
│       └── loader.js             画像遅延ロード
├── data/
│   ├── scenarios_all.js          全165タップ統合（.webp参照）
│   └── scenarios/                章別JSON 26ファイル
└── assets/
    ├── images/                   165×2形式（.webp主／.png原盤）
    │   ├── chapter_00_intro/ ... chapter_finale/
    │   └── logo/developer_logo.png
    └── audio/{bgm,se}/           （未配置）
```

## 動作

`index.html` をブラウザで開く（`file://` でも動作可）。

## フェーズA：構造化（✅ 完了）

| 項目 | 状況 | 内容 |
|---|---|---|
| A-1 ディレクトリ分割 | ✅ | 役割別8ファイル |
| A-2 シナリオJSON外部化 | ✅ | 章別26ファイル＋統合1本 |
| A-3 画像WebP変換 | ✅ | **776MB → 40MB（94.8%削減・19倍縮小）** |
| A-4 遅延ロード機構 | ✅ | 起動時:2章のみ／章選択時:該当+次章先読み |
| A-5 デバッグ要素整理 | ✅ | 本ビルドに含まない |

## フェーズB：コア機能（残）

- B-1 セーブ機能（骨組み済／UI強化が残）
- B-2 i18n（ja/en）
- B-3 設定画面（フォントサイズ・音量・色覚モード）
- B-4 エラーハンドリング強化

## フェーズC 以降

- パズル本実装、BGM/SE、Electron/Capacitor 化

## 画像形式の運用

- **配布用**：`.webp`（40MB）= JSが参照
- **原盤**：`.png`（776MB）= 編集・再加工用に保持

PNGが不要になれば `find assets/images -name '*.png' -delete` で削除可能（大幅な容量削減）。

## スマホ仮プレイ（GitHub Pages 公開）

このリポジトリは静的ファイルのみ（サーバー不要）なので、GitHub Pages にそのまま公開可能。
`.gitignore` で PNG（779MB）を除外し、WebP（40MB）だけを Push する構成にしてある。

### 公開手順（GitHub Desktop）

1. **GitHub 側でリポジトリ作成**
   - github.com にログイン → 右上「＋」→「New repository」
   - Repository name：例 `oyayubikakushi-play`（好きな名前でOK）
   - **Public** を選択（Private だと Pages 有料）
   - README・.gitignore は追加せず「Create repository」

2. **GitHub Desktop でこのフォルダを Add**
   - GitHub Desktop 起動 → File → Add local repository
   - この `release/` フォルダを選択
   - 「Not a Git repository」と出たら **Create a repository** リンクを押す
   - Name / description はデフォルトのまま「Create repository」
   - Publish repository → 手順1で作った GitHub リポジトリを選択

3. **GitHub Pages を有効化**
   - github.com のリポジトリページ → Settings → Pages
   - Source：`Deploy from a branch`
   - Branch：`main` / `/ (root)` → Save
   - 1〜2分後、上部に URL が表示される
     `https://<ユーザー名>.github.io/<リポジトリ名>/`

4. **スマホでアクセス**
   - スマホのブラウザで上記 URL を開く
   - iOS Safari / Android Chrome で動作確認済み構造

### 更新方法

コードを修正したら、GitHub Desktop で：
- 変更ファイルを Commit（コミットメッセージ入力）→ Push
- 数十秒〜1分で Pages に反映

### 注意点

- **HTTPS 必須**：localStorage / モダン API は HTTPS 環境で確実に動くため、GitHub Pages（HTTPS）推奨
- **キャッシュ**：更新後スマホが古い版を掴む場合は、ブラウザ再読込 or シークレット/プライベート・モードで開き直し
- **Pages 反映遅延**：初回公開は数分かかることあり
- **.png 除外確認**：Push 前に GitHub Desktop の Changes タブで `*.png` が含まれていないことを確認（4桁MB になっていたら .gitignore が効いていない）

