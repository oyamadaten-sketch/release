# クリア演出 ─ 横開きガラス戸 生成プロンプト
## DOOR-L / DOOR-R（左右対称、左片のみ生成して右はJS反転）

---

## 1. ファイル仕様

| 項目 | 値 |
|---|---|
| ファイル名 | `door_left.webp` |
| 配置先 | `release/assets/images/effects/door_left.webp` |
| サイズ | **768×1024px（縦長3:4）** |
| 形式 | WebP (quality 90)、**透過必須** |
| 用途 | パズルクリア演出。盤面のゴール開口に重ねて左右2枚で1組の扉を表示 |
| ライセンス | 自プロジェクト専用 |

---

## 2. 生成プロンプト（日本語＋英語併記、v3.4影絵規格準拠）

### 日本語プロンプト（5000字以内）

```
【画材】影絵切り絵スタイル v3.4 規格準拠。背景透過 PNG。
夜更けの銀青色の月光が照らす、明治初期の京都町家の玄関。
その横開きガラス戸の左片（一枚）だけを正面から見たクローズアップ。

【主役】
横開きガラス戸の左半分、計1枚。完全な左右対称形を想定した
うちの左片のみ（右半分は描かない）。

【構造】
・上下に4本の横桟（よこさん）が走る。
・縦方向に組子（くみこ）が走り、ガラス面を5×5の格子に区切る。
・下端には上り框（あがりかまち＝木製の段差）を3px厚で示唆。
・戸の左端（画面の左端）には引き手の溝（彫り込み）を縦長に配置。
・戸の左端には縦長の戸框（とがまち、木製の縁）が約8%幅で走る。
・戸の右端（画面中央寄り）は鋭く直線で切る（右片との接合面）。
・装飾は最小限。家紋・人物・親指・文字・装飾モチーフは一切描かない。

【色彩・質感】
・木部（戸框・横桟・組子）：深い焦茶 #3a2618、影絵らしくのっぺりした塗り。
　木目は描かず、輪郭の濃淡のみで質感を表現。
・ガラス部分：半透明の銀青色 #a0b8d0 を 60% 不透明度で塗り、
　月光が透けるイメージ。曇りガラスのため遠景は描かない。
・鋲・引き手の金具：くすんだ金色 #b89976、控えめな点で表現。
・戸の最外周は黒に近い焦茶 #2a1812 で 2px の細い縁取り。

【構図】
・縦長矩形（3:4 = 768×1024）。
・戸の輪郭が画面いっぱいに広がる構図。上下に若干（10%）の余白。
・正面からの平行投影。透視遠近・斜め視点は不要。
・上端には欄間（らんま）の影が画面外に少しはみ出す程度に暗示。

【背景】
・完全に透明（PNG transparency）。後ろの盤面が見える前提。
・周囲に余計な装飾・影・グラデーション一切なし。

【非表示】
・人物、影、文字、家紋、植物、装飾、親指のシンボル、月そのもの。
・木目、節、傷、汚れ、経年劣化。
・透視・斜め視点、影の落下、奥行きの強調。

【スタイル参照】
v3.4 規格（影絵切り絵、銀青の月光、シルエット化、装飾の極小化）。
既存165枚と一貫したトーンを保つ。

【出力】
PNG 透過、768×1024、左片1枚のみ。
```

### English Prompt（English-speaking生成AI向け）

```
[MEDIUM] Silhouette papercut style, v3.4 specification, transparent PNG.
A Kyoto townhouse front door from the early Meiji era (1868–1880s),
illuminated by silver-blue moonlight at midnight.
Close-up frontal view of the LEFT HALF of a horizontally-sliding glass door,
viewed from inside the house.

[SUBJECT]
The left panel only of a two-panel sliding glass door (yoko-biraki glass-do).
The right panel is NOT depicted; the right edge of this panel is cut sharply
where it would meet the right panel.

[STRUCTURE]
- Four horizontal wooden rails (yoko-san) running across.
- Vertical mullions (kumiko) dividing the glass area into a 5x5 grid.
- A 3px thick horizontal beam at the bottom representing the agarikamachi
  (entrance step beam).
- A vertical recessed groove at the left edge for the pull handle.
- A vertical wooden frame (togamachi) running along the left edge,
  approximately 8% of the panel width.
- The right edge of the panel is cut sharply (this is where the two panels meet).
- Minimal decoration: NO family crests, figures, thumbs, text, or motifs.

[COLOR & TEXTURE]
- Wood parts (frames, rails, mullions): deep burnt umber #3a2618.
  Flat silhouette-like fill. NO wood grain; express texture only via outline shading.
- Glass area: semi-transparent silver-blue #a0b8d0 at 60% opacity,
  suggesting moonlight passing through frosted glass. No distant scenery visible.
- Metal fittings (handle, nails): muted bronze #b89976, used very sparingly.
- Outer edge of door: very dark brown #2a1812, 2px outline.

[COMPOSITION]
- Vertical rectangle 3:4 (768x1024).
- Door fills almost the entire frame, with ~10% margin top and bottom.
- Frontal parallel projection. NO perspective, NO oblique angle.
- Top edge: faint hint of an overhead transom (ranma) extending slightly off-frame.

[BACKGROUND]
- Completely transparent (PNG alpha). Designed to overlay a puzzle board.
- NO surrounding decoration, NO drop shadow, NO gradient.

[DO NOT DEPICT]
- People, shadows of people, text, family crests, plants, decorations,
  thumb symbols, the moon itself.
- Wood grain, knots, scratches, dirt, weathering.
- Perspective, oblique view, cast shadows, depth emphasis.

[STYLE REFERENCE]
v3.4 specification (silhouette papercut, silver-blue moonlight, simplification,
minimal decoration). Maintain consistent tone with the existing 165 images.

[OUTPUT]
Transparent PNG, 768x1024, left panel only.
```

---

## 3. 演出シーケンス（実装側で使用）

```
0.0s  娘がゴール(2,3)到達 → gameState='cleared'
0.4s  娘ピースが下方向に0.4秒でスライドダウン＋フェードアウト
      （玄関の開口部に吸い込まれるイメージ）
0.8s  扉2枚（door_left + door_left_反転）が表示開始
      初期位置：盤面のゴール開口部にぴったりはまる
1.0s  扉が左右にスライドアニメ開始（1.2秒）
      左片: transform: translateX(-100%)
      右片: transform: translateX(+100%)
2.2s  扉が完全に開く
      開口の中央から白光が射し込む（白い円形グラデが拡大、0.5秒）
2.7s  画面全体が白光に包まれる → 暗転（0.5秒）
3.2s  クリアオーバーレイ表示
      タイトル「─ 脱出成功 ─」
      手数表示「── ●●手で脱出 ──」
      独白「そっと、一歩。\nされど、この一歩は──まだ家の影の中であった。」
      ボタン「物語ヲ続ケル ▷」
```

総尺：**約3.2秒**

---

## 4. 実装メモ

### HTML追加（クリアオーバーレイの上層）
```html
<div class="puz-door-layer" id="puz-door-layer">
  <img class="puz-door puz-door-left" src="assets/images/effects/door_left.webp">
  <img class="puz-door puz-door-right" src="assets/images/effects/door_left.webp">
  <div class="puz-door-light"></div>
</div>
```

### CSS要点
```css
.puz-door-right { transform: scaleX(-1); }  /* 左片を反転して右片に */
.puz-door-layer.opening .puz-door-left  { transform: translateX(-100%); }
.puz-door-layer.opening .puz-door-right { transform: translateX(100%) scaleX(-1); }
.puz-door-light { background: radial-gradient(circle, #fff 0%, transparent 70%); }
```

### JS（puzzle.js の showClear を拡張）
```js
function showClear() {
  // 1. 娘吸い込み
  daughterEl.classList.add('sucked-in');
  setTimeout(() => {
    // 2. 扉表示
    doorLayer.classList.add('visible');
    setTimeout(() => {
      // 3. 扉スライド開始
      doorLayer.classList.add('opening');
      setTimeout(() => {
        // 4. 白光
        doorLayer.classList.add('flash');
        setTimeout(() => {
          // 5. クリアオーバーレイ
          $('puz-clear').classList.add('visible');
        }, 700);
      }, 1200);
    }, 200);
  }, 400);
}
```

---

## 5. プレビュー用に画像生成しない場合の繋ぎ

画像未配置でも演出が壊れないように、`door_left.webp` が無い場合は
**CSS生成の簡易扉**（純粋な木枠＋ガラス）でフォールバック描画する。
これでイラスト生成を待たずに演出フローを実装・試遊できる。

---

## 6. 次のアクション

1. **画像生成依頼**：上記プロンプトで `door_left.webp` を1枚生成
2. **演出CSSとJS実装**：フォールバック含めて先行で動かす
3. **画像配置**：生成画像を `release/assets/images/effects/door_left.webp` に配置
4. **試遊**：尺・スライド速度・白光強度を微調整
