# アセット設計書 v1
親指隠シと座牢のムスメ／リアル木工パズル化用アセット一覧

## 1. 設計思想

本作のパズルパートは「**亰都伝統木工パズル**」というコンセプトを掲げており、
プレイヤーが本物の木箱を開け、本物の木製の駒（コマ）を動かしている感覚を目指す。

### 二段階アプローチ
- **第一段階（即実装可能）**：CSSグラデーション＋ノイズで擬似木目を表現
- **第二段階（高品質化）**：AI生成した本物質感の木目テクスチャ素材を使用

第二段階用に、本設計書ではプロンプトを定義済みとして残しておく。
画像生成プロンプトと違って **タイル可能なテクスチャ素材** が必要。

## 2. 必須アセット一覧

### A. 木目テクスチャ（最重要）
パズル駒、木箱、UI 全体に使う基礎テクスチャ。

| ID | 用途 | サイズ | 仕様 |
|---|---|---|---|
| TEX-WOOD-01 | 木箱の蓋・側面（濃い色） | 1024×1024 | タイル可能・色相#4a3728 |
| TEX-WOOD-02 | パズル駒（標準・中間色） | 512×512 | タイル可能・色相#bcaaa4 |
| TEX-WOOD-03 | パズル駒（濃色・大駒用） | 512×512 | タイル可能・色相#8d6e63 |
| TEX-WOOD-04 | パズル駒（明色・娘駒用） | 512×512 | タイル可能・色相#eecfa1 |
| TEX-WOOD-05 | 盤面（焦げ茶色） | 1024×1024 | タイル可能・色相#2e1f15 |

### B. 木箱パーツ
タイトル画面の「木箱の蓋を開く」演出用。

| ID | 用途 | サイズ | 仕様 |
|---|---|---|---|
| BOX-LID | 木箱の蓋（正面） | 800×1000 | 透過PNG・木目＋金具角 |
| BOX-BODY | 木箱の本体（内側がみえる） | 800×1000 | 透過PNG・木目内側 |
| BOX-HINGE | 蝶番 | 100×200 | 透過PNG・古びた銅 |
| BOX-CLASP | 留め金 | 200×200 | 透過PNG・古びた銅 |
| BOX-CORNER | 角金具 | 80×80 | 透過PNG・古びた銅 |

### C. 金具・装飾
| ID | 用途 |
|---|---|
| METAL-LOCK | 和式南京錠（パズル開始演出用） |
| METAL-KEY | 鍵 |
| KAGOME-LATTICE | 籠目格子（座牢の格子戸） |
| WASHI-PAPER | 和紙テクスチャ（UI背景用） |
| INK-BRUSH | 筆跡（タイトル装飾用） |

### D. UI素材
| ID | 用途 |
|---|---|
| UI-FRAME-WASHI | 和紙風UIフレーム |
| UI-BUTTON-WOOD | 木製ボタン |
| UI-SCROLL | 巻物（設定画面背景用） |

## 3. AI画像生成プロンプト（テクスチャ用）

### TEX-WOOD-01：木箱の蓋・側面（濃い色）
```
seamless tileable wood texture, traditional Japanese cypress wood (hinoki),
dark aged finish, deep brown #4a3728, natural wood grain pattern,
fine vertical grain lines, slight wear and patina from age,
no shadows, no lighting, flat orthographic view,
1024x1024 square, perfectly tileable on all four edges,
high resolution, photorealistic wood material, no text, no logos
```

### TEX-WOOD-02：パズル駒（標準）
```
seamless tileable wood texture, traditional Japanese pine wood,
medium tone, warm brown #bcaaa4, smooth surface,
horizontal subtle grain, mild aging marks,
flat lighting for tile use, 512x512 square, perfectly tileable,
photorealistic, no text, no patterns
```

### TEX-WOOD-03：パズル駒（濃色・大駒用）
```
seamless tileable wood texture, traditional Japanese walnut wood,
dark brown #8d6e63, prominent grain pattern, slight knots,
aged with hand-rubbed finish, flat lighting,
512x512 square, perfectly tileable, photorealistic
```

### TEX-WOOD-04：パズル駒（明色・娘駒用）
```
seamless tileable wood texture, traditional Japanese paulownia wood (kiri),
light cream tone #eecfa1, very fine grain, smooth finish,
slightly aged, soft warm tone, flat lighting,
512x512 square, perfectly tileable, photorealistic
```

### TEX-WOOD-05：盤面（焦げ茶色）
```
seamless tileable wood texture, very dark aged Japanese cedar wood,
almost black-brown #2e1f15, deeply weathered, with subtle char marks,
faint grain visible through dark surface, flat lighting,
1024x1024 square, perfectly tileable, photorealistic
```

### BOX-LID：木箱の蓋
```
top-down view of antique Japanese wooden puzzle box lid,
dark cypress wood with deep grain, aged patina,
rectangular shape with reinforced metal corner brackets (oxidized copper, blackish-green),
central area for emblem (leave blank for text overlay),
no background, transparent PNG, 800x1000 vertical,
photorealistic, no text, soft top lighting
```

### KAGOME-LATTICE：籠目格子
```
seamless tileable wooden lattice pattern, kagome (hexagonal weave),
dark Japanese cedar wood color #3a2618,
high contrast pattern, traditional Japanese craftsmanship,
flat orthographic view, 512x512 square, perfectly tileable,
photorealistic wood lattice, no background
```

## 4. アセット保管場所（リリース後）

```
release/assets/textures/
  ├── wood/
  │   ├── TEX-WOOD-01.webp
  │   ├── TEX-WOOD-02.webp
  │   └── ...
  ├── box/
  │   ├── BOX-LID.png
  │   └── ...
  └── ui/
      └── ...
```

## 5. 実装上の指針

### Phase 1（現在）：CSS擬似木目
- `repeating-linear-gradient` で木目線を再現
- `radial-gradient` で陰影
- 暫定的な質感としては許容範囲

### Phase 2：実アセット使用
- 上記のテクスチャ画像を CSS の `background-image` で各駒に適用
- 駒のタイプ別に異なるテクスチャを使用（娘＝桐／父＝胡桃／番頭＝杉 など）
- 駒の縁には金具テクスチャを overlay

## 6. 優先順位

| 優先度 | アセット | 理由 |
|---|---|---|
| ★1 | TEX-WOOD-01〜05 | パズル全体の質感を決定 |
| ★1 | BOX-LID, BOX-BODY | タイトル画面の最重要アセット |
| ★2 | METAL-LOCK, KAGOME-LATTICE | 演出強化 |
| ★3 | UI-FRAME-WASHI, INK-BRUSH | あれば嬉しい |

## 7. 制作の進め方

1. **Phase 1（即時）**：CSSのみで暫定実装。Phase 2のアセット生成中もプレイ可能
2. **Phase 2-A**：上記のテクスチャプロンプトでAI生成し、品質確認
3. **Phase 2-B**：HTMLの該当箇所を実アセット参照に切り替え
4. **Phase 2-C**：駒別の質感差分を反映

このドキュメントを参照しながら、フェーズC（本実装）時に Phase 2 へ移行する。
