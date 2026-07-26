// 親指隠シと座牢のムスメ ─ パズル盤面データ v3
// メタ表現排除：娘の視点に「蓋」「木工パズル」等は存在しない


// ★★ 新規駒定義ルール（Cowork自動追加時の必守事項）★★
//   1. 文字色は必ず読める暗色を選ぶ（背景が明るいなら fg 暗く、背景が暗いなら白でも可）
//      ─ 例外は LID / DAUGHTER / CAT / DOG のみ（歴史的に白系文字）
//      ─ 家族駒（父/母/祖父/祖母/叔父/叔母/兄/弟/妹/番頭/女中/書生/丁稚 等）は
//        原則「明るい bg + 暗い fg (#3e2723 or #263238 系)」で統一
//   2. shape駒（非矩形）の場合、shape:[[...]] / labelPos:[x,y] を必ず指定
//   3. 木目テクスチャは puzzle.js 側の cell rendering で自動付与される（CSSクラス経由）

const PUZZLE_PIECE_DEFS = {
  // ロック駒（左上、最初にタップで外す）── Ver15の LOGO に相当、ゲーム題字を載せる
  LID:      { w: 2, h: 2, label: '親指隠シと座牢のムスメ', role: 'starter', bg: '#5c3a21', fg: '#eecfa1', size: 9 },
  // 手形：動かない固定駒（1×1）── 血まみれの手形マーク、他駒の動線を塞ぐ
  //   role: 'fixed' で canMove()/onPointerDown() が拒否
  //   視覚：CSS .role-fixed.handprint で SVG 手形 + 深紅背景
  HANDPRINT:{ w: 1, h: 1, label: '手形', role: 'fixed',   bg: '#4a0e0e', fg: '#ffcccc', size: 11 },
  // 動けなくなった祖母：Stage 21 専用の固定駒（1×1）── 病に伏し、次章で亡くなる
  //   role: 'fixed' で HANDPRINT と同じく動けない
  //   視覚：祖母基調色（灰青）＋右下隅に黒い滲み（病を表す）、CSS .gmother-sick-piece で描画
  GMOTHER_SICK:{ w: 1, h: 1, label: '祖母', role: 'fixed', bg: '#cfd8dc', fg: '#263238', size: 11 },
  // 祭壇：Stage 22 専用の固定駒（2×1横）── 祖母の葬儀で家中央に据えられる
  //   role: 'fixed' で HANDPRINT / GMOTHER_SICK と同じく動けない
  //   視覚：暗い漆黒の木肌 + 中央位牌 + 両脇の蝋燭 + 香炉、CSS .altar-piece で SVG 描画
  ALTAR:    { w: 2, h: 1, label: '祭壇', role: 'fixed', bg: '#1a0f08', fg: '#f5deb3', size: 10 },
  // 炎：Stage 24 専用（1×1）── 最終ステージ「館の火事」で家を焼き尽くす焔
  //   role: 'block' で移動可能。10手ごとに隣接ピースをランダム引火（puzzle.js processFireTick で処理）
  //   視覚：多層 radial gradient（黄→橙→赤→焦）+ SVG 炎シルエット + flicker アニメーション、CSS .flame-piece で描画
  FLAME:    { w: 1, h: 1, label: '炎', role: 'block', bg: '#dc143c', fg: '#ffffff', size: 12 },
  // 娘（ゴール駒）
  DAUGHTER: { w: 2, h: 2, label: '娘',   role: 'target',  bg: '#fff3e0', fg: '#3e2723', size: 26 },
  // 父母（縦長1×2、ベージュ）
  FATHER:   { w: 1, h: 2, label: '父',   role: 'block',   bg: '#d7ccc8', fg: '#3e2723', size: 18 },
  MOTHER:   { w: 1, h: 2, label: '母',   role: 'block',   bg: '#d7ccc8', fg: '#3e2723', size: 18 },
  // 母：1×1縮小（第弐夜〜 力の縮小）
  MOTHER_S: { w: 1, h: 1, label: '母',   role: 'pawn',    bg: '#d7ccc8', fg: '#3e2723', size: 11 },
  // 母：横長2×1（Stage11〜 燈下の影で母が横に伸びる ─ 家中央下段の広がり）
  MOTHER_H: { w: 2, h: 1, label: '母',   role: 'block',   bg: '#d7ccc8', fg: '#3e2723', size: 14 },
  MOTHER_JB:{ w: 2, h: 2, shape: [[1,1],[0,1]], labelPos: [1, 0.5], label: '母', role: 'block', bg: '#d7ccc8', fg: '#3e2723', size: 15 },  // L字3マス：上段横2＋下段右1（Stage23〜 母が父の枕元へ寄り添う）
  MOTHER_L: { w: 3, h: 1, label: '母', role: 'block', bg: '#d7ccc8', fg: '#3e2723', size: 14 },  // 母 横長 3×1（Stage24〜 母が家中を横一列に守るように）
  // 祖父母（横長2×1、灰青）
  GFATHER:  { w: 2, h: 1, label: '祖父', role: 'block',   bg: '#cfd8dc', fg: '#37474f', size: 14 },
  GMOTHER:  { w: 2, h: 1, label: '祖母', role: 'block',   bg: '#cfd8dc', fg: '#37474f', size: 14 },
  // 叔父母（横長2×1、桃色）
  UNCLE:    { w: 2, h: 1, label: '叔父', role: 'block',   bg: '#ffccbc', fg: '#3e2723', size: 14 },
  AUNT:     { w: 2, h: 1, label: '叔母', role: 'block',   bg: '#ffccbc', fg: '#3e2723', size: 14 },
  // 番頭（横長2×1、薄茶）
  CLERK:    { w: 2, h: 1, label: '番頭', role: 'block',   bg: '#bcaaa4', fg: '#3e2723', size: 14 },
  // 使用人（1×1）
  MAID:     { w: 1, h: 1, label: '女中', role: 'pawn',    bg: '#dce775', fg: '#33691e', size: 11 },
  // 女中：縦長1×2（第肆夜〜 女中の存在感が縦に伸びる）
  MAID_L:   { w: 1, h: 2, label: '女中', role: 'block',   bg: '#c0ca33', fg: '#33691e', size: 12 },
  // 祖母：縮小1×1（第肆夜〜 力を失う）
  GMOTHER_S:{ w: 1, h: 1, label: '祖母', role: 'pawn',    bg: '#cfd8dc', fg: '#37474f', size: 11 },
  PRODIGAL: { w: 1, h: 1, label: '兄',   role: 'pawn',    bg: '#ce93d8', fg: '#4a148c', size: 12 },
  STUDENT:  { w: 1, h: 1, label: '書生', role: 'pawn',    bg: '#f5f5f5', fg: '#212121', size: 11 },
  APPRENTICE:{ w:1, h: 1, label: '丁稚', role: 'pawn',    bg: '#e0e0e0', fg: '#424242', size: 11 },
  // 弟妹（1×1）
  SISTER:   { w: 1, h: 1, label: '妹',   role: 'pawn',    bg: '#ffab91', fg: '#3e2723', size: 12 },
  // 妹：縦長1×2（Stage13〜 妹の存在感が縦に伸びる）
  SISTER_L: { w: 1, h: 2, label: '妹',   role: 'block',   bg: '#ffab91', fg: '#3e2723', size: 14 },
  SISTER_H: { w: 2, h: 1, label: '妹',   role: 'block',   bg: '#ffab91', fg: '#3e2723', size: 14 },  // 妹 横2マス（Stage15〜 姉妹並座）
  BROTHER:  { w: 1, h: 1, label: '弟',   role: 'pawn',    bg: '#90caf9', fg: '#0d47a1', size: 12 },
  BROTHER_H:{ w: 2, h: 1, label: '弟',   role: 'block',   bg: '#90caf9', fg: '#0d47a1', size: 14 },  // 弟 横2マス（Stage19〜 姉妹（妹）と並座して外を望む）
  BROTHER_V:{ w: 1, h: 2, label: '弟',   role: 'block',   bg: '#90caf9', fg: '#0d47a1', size: 14 },  // 弟 縦2マス（Stage21〜 祖母の枕元で立ち尽くす）
  // 動物（1×1、濃茶）
  CAT:      { w: 1, h: 1, label: '猫',   role: 'pawn',    bg: '#795548', fg: '#efebe9', size: 12 },
  DOG:      { w: 1, h: 1, label: '犬',   role: 'pawn',    bg: '#795548', fg: '#efebe9', size: 12 },
  PUPPY:    { w: 1, h: 1, label: '子犬', role: 'pawn',    bg: '#a0704d', fg: '#efebe9', size: 11 },  // 子犬 ─ 犬系統だが明るい焦茶（Stage19〜想定）
  // === 拡張駒（Stage 2 以降で登場）===
  // 父：縦長1×3（家督の重み）
  FATHER_L: { w: 1, h: 3, label: '父',   role: 'block',   bg: '#bcaaa4', fg: '#3e2723', size: 18 },
  // 父：T字（縦3＋中段左突き出し／4マス）Stage11〜 燈下で影が広がり中央の圧が横にも及ぶ
  //   shape: [[0,1],[1,1],[0,1]] = 上下は右のみ / 中段両方
  //   labelPos: 中段中央（十字の中心）
  FATHER_T: { w: 2, h: 3, shape: [[0,1],[1,1],[0,1]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },
  // 父：T字左向き（縦3左＋中段右／4マス）Stage13〜 家督が左に傾き中段が右へ広がる
  //   shape: [[1,0],[1,1],[1,0]] = 上下は左のみ / 中段両方
  //   labelPos: 中段中央（十字の中心）
  FATHER_TL: { w: 2, h: 3, shape: [[1,0],[1,1],[1,0]], labelPos: [0.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },
  // 父：L字（縦3＋右下1／4マス）Stage12〜 蔵に潜む父の影
  //   shape: [[1,0],[1,0],[1,1]] = 縦3列左+最下段右
  //   labelPos: 中央（縦の中心）
  FATHER_JL: { w: 2, h: 3, shape: [[1,0],[1,0],[1,1]], labelPos: [0.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },
  FATHER_JR: { w: 2, h: 3, shape: [[0,1],[0,1],[1,1]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // FATHER_JL の左右反転（右尾根＋下段2マス）
  // 父：L字大（縦2左＋下段横3／4マス）Stage13〜 父が下段に大きく広がる
  //   shape: [[1,0,0],[1,1,1]] = 上段左のみ / 下段全部
  //   labelPos: 下段中央
  FATHER_LW: { w: 3, h: 2, shape: [[1,0,0],[1,1,1]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },
  FATHER_L5: { w: 3, h: 2, shape: [[0,1,1],[1,1,1]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // 5マス：右上2マス＋下段3マス（Stage 13再再更新）
  FATHER_TW: { w: 3, h: 2, shape: [[1,1,1],[0,1,0]], labelPos: [1.5, 0.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // T字トップワイド 4マス：上段横3＋中央下1（Stage15〜）
  FATHER_Z:  { w: 3, h: 2, shape: [[0,1,1],[1,1,0]], labelPos: [1.5, 1.0], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // Z字 4マス：上段右2＋下段左2（Stage16〜 家督の階段状の圧）
  FATHER_TB: { w: 3, h: 2, shape: [[0,1,0],[1,1,1]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // T字ボトムワイド 4マス：中央上1＋下段横3（Stage17〜 FATHER_TW上下反転）
  FATHER_L3: { w: 2, h: 2, shape: [[1,1],[1,0]], labelPos: [1, 0.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 15 },  // L字3マス：上段横2＋下段左1（Stage17_3〜 家督の力が縮む）
  FATHER_Z5: { w: 3, h: 3, shape: [[0,1,1],[0,1,0],[1,1,0]], labelPos: [1.5, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // Z字/ジグザグ 5マス w=3 h=3：血筋が斜めに落ちる（Stage18〜）
  FATHER_LT: { w: 3, h: 2, shape: [[1,1,1],[1,0,0]], labelPos: [1.5, 0.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // L字トップワイド 4マス：上段横3＋下段左1（Stage19〜 家督の重心が上段へ）
  FATHER_U:  { w: 3, h: 2, shape: [[1,1,1],[1,0,1]], labelPos: [1.5, 0.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // U字/アーチ 5マス：上段横3＋左右下1（Stage20〜 家督が娘・女中を左右から挟む）
  FATHER_H4: { w: 4, h: 1, label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 18 },  // 横長4×1：家督が家中横一列に伸びる（Stage21〜 祖母危篤の一列陣）
  FATHER_LL: { w: 2, h: 2, label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 20 },  // 大駒2×2 solid：家督の圧が塊となる（Stage22〜 葬儀の後、父の存在感が結晶化）
  FATHER_L3B:{ w: 2, h: 2, shape: [[1,0],[1,1]], labelPos: [1, 1.5], label: '父', role: 'block', bg: '#bcaaa4', fg: '#3e2723', size: 15 },  // L字3マス：上段左1＋下段横2（Stage23〜 家督の重みが下段に沈む）
  // 番頭：横長3×1（下層を塞ぐ監視）
  CLERK_L:  { w: 3, h: 1, label: '番頭', role: 'block',   bg: '#a1887f', fg: '#3e2723', size: 14 },
  // 番頭：大駒2×2（第参夜〜 監視の力が増大）
  CLERK_LL: { w: 2, h: 2, label: '番頭', role: 'block',   bg: '#a1887f', fg: '#3e2723', size: 16 },
  // 番頭：超大駒3×2（第参夜〜 監視の眼が家中に、下層を塞ぐ）
  CLERK_LLL:{ w: 3, h: 2, label: '番頭', role: 'block',   bg: '#8d6e63', fg: '#3e2723', size: 18 },
  // 番頭：逆L字（Γ型 / 縦2＋横1突き出し / 3マス）第肆夜〜 歪みながら力を得た監視
  //   shape: [[0,1],[1,1]] → 右上のみ / 下段両方
  CLERK_JL: { w: 2, h: 2, shape: [[0,1],[1,1]], labelPos: [1, 1.5], label: '番頭', role: 'block', bg: '#a1887f', fg: '#3e2723', size: 15 },
  // 番頭：L字（上段左のみ＋下段両方）Stage12〜 監視の眼が左下に伸長
  //   shape: [[1,0],[1,1]] = 上段左のみ / 下段両方
  //   labelPos: 下段中央
  CLERK_JR: { w: 2, h: 2, shape: [[1,0],[1,1]], labelPos: [1, 1.5], label: '番頭', role: 'block', bg: '#a1887f', fg: '#3e2723', size: 15 },
  CLERK_JB: { w: 2, h: 2, shape: [[1,1],[0,1]], labelPos: [1, 0.5], label: '番頭', role: 'block', bg: '#a1887f', fg: '#3e2723', size: 15 },  // 番頭 逆L字（穴=左下、AUNT_JBと同形）
  CLERK_JT: { w: 2, h: 2, shape: [[1,1],[1,0]], labelPos: [1, 0.5], label: '番頭', role: 'block', bg: '#a1887f', fg: '#3e2723', size: 15 },  // 番頭 L字3マス：上段横2＋下段左1（Stage24〜 家業の腕が最後に伸長）
  CLERK_V:  { w: 1, h: 3, label: '番頭', role: 'block',   bg: '#a1887f', fg: '#3e2723', size: 12 },  // 番頭 縦長1×3（Stage18〜 監視の柱）
  // 叔母：縮小1×1（番頭_横長3×1の隣に押し込まれた）
  AUNT_S:   { w: 1, h: 1, label: '叔母', role: 'pawn',    bg: '#ffccbc', fg: '#3e2723', size: 12 },
  // 叔父：縮小1×1（父の縦長化で家族の圧が偏り、叔父の存在感が減じた）
  UNCLE_S:  { w: 1, h: 1, label: '叔父', role: 'pawn',    bg: '#ffccbc', fg: '#3e2723', size: 11 },
  UNCLE_JR: { w: 2, h: 2, shape: [[1,0],[1,1]], labelPos: [1, 1.5], label: '叔父', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },  // 叔父 L字（穴=右上、Stage16〜）
  // 客人：商人来訪時に登場（1×1、薄青で外部者を表現）
  MERCHANT: { w: 1, h: 1, label: '客人', role: 'pawn',    bg: '#c5cae9', fg: '#1a237e', size: 11 },
  // 客人：縦長1×2（Stage4〜 じっと座る商人）
  MERCHANT_L: { w: 1, h: 2, label: '客人', role: 'block',   bg: '#9fa8da', fg: '#1a237e', size: 13 },
  // 祖父：縦長1×2（Stage5〜 客人観察下で身構える家長）
  GFATHER_L:  { w: 1, h: 2, label: '祖父', role: 'block',   bg: '#b0bec5', fg: '#263238', size: 14 },
  // 祖母：大駒2×2（Stage5〜 家中央で存在感増）
  GMOTHER_L:  { w: 2, h: 2, label: '祖母', role: 'block',   bg: '#b0bec5', fg: '#263238', size: 14 },
  // 書生：縦長1×2（Stage5〜 客人観察下で身構える）
  STUDENT_L:  { w: 1, h: 2, label: '書生', role: 'block',   bg: '#bdbdbd', fg: '#212121', size: 12 },
  // 客人：さらに縦長1×3（Stage5〜 長く座り続ける）
  MERCHANT_LL:{ w: 1, h: 3, label: '客人', role: 'block',   bg: '#7986cb', fg: '#ffffff', size: 13 },
  MERCHANT_H: { w: 2, h: 1, label: '客人', role: 'block',   bg: '#c5cae9', fg: '#1a237e', size: 14 },  // 客人 横長 2×1（Stage24〜 弔いの後の客人が横並び）
  // 女中：縦長1×3（Stage5〜 客人の眼のもと、中央に長く座り続ける）
  MAID_LL:   { w: 1, h: 3, label: '女中', role: 'block',   bg: '#afb42b', fg: '#33691e', size: 14 },
  MAID_JT:   { w: 2, h: 2, shape: [[0,1],[1,1]], labelPos: [1, 1.5], label: '女中', role: 'block', bg: '#c0ca33', fg: '#33691e', size: 15 },  // L字3マス：上段右1＋下段横2（Stage23〜 女中が右下角に沈む）
  // 祖父：大駒2×2（Stage5案:未使用 ─ 家督の重み最大化）
  GFATHER_LL:{ w: 2, h: 2, label: '祖父', role: 'block',   bg: '#b0bec5', fg: '#263238', size: 18 },
  // 祖父：L字3マス（Stage5〜 客人の眼下、家督が歪みながら圧を広げる）
  //   shape: [[1,1],[1,0]] = 上段両方 / 下段左のみ
  //   labelPos: 上段中央（横2マス幅の中心）
  GFATHER_JL:{ w: 2, h: 2, shape: [[1,1],[1,0]], labelPos: [1, 0.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },
  // 祖父：L字（Γ反転／下段両方＋上段左のみ）Stage10〜 家督が下段に沈む
  //   shape: [[1,0],[1,1]] = 上段左のみ / 下段両方
  //   labelPos: 下段中央
  GFATHER_JR:{ w: 2, h: 2, shape: [[1,0],[1,1]], labelPos: [1, 1.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },
  GFATHER_U: { w: 3, h: 2, shape: [[1,1,1],[1,0,1]], labelPos: [1.5, 0.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },  // 祖父 U字/アーチ 5マス（上段横3＋左右の柱、中央下は穴。Stage17〜）
  GFATHER_LT:{ w: 3, h: 2, shape: [[1,1,1],[1,0,0]], labelPos: [1.5, 0.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },  // L字トップワイド 4マス：上段横3＋下段左1（Stage18〜 家督の圧が上段に）
  GFATHER_LU:{ w: 2, h: 3, shape: [[1,1],[1,0],[1,0]], labelPos: [0.5, 1.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },  // L字縦・上部フック 4マス（Stage18_2〜 家督の頭部が右に、柱が左下へ）
  GFATHER_LR:{ w: 3, h: 2, shape: [[0,0,1],[1,1,1]], labelPos: [1.5, 1.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },  // L字下段横3＋右上1 4マス（Stage19〜 家督の重心が下段に、右肩が立つ）
  GFATHER_NU:{ w: 3, h: 2, shape: [[1,0,1],[1,1,1]], labelPos: [1.5, 1.5], label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 15 },  // 逆U/n字/アーチ下向き 5マス：上段左右＋下段横3（Stage20〜 家督が娘の目標地点を包囲、中央上に穴）
  GFATHER_V4:{ w: 1, h: 4, label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 14 },  // 縦長 1×4（Stage23〜 家督の柱が家中の縦軸に据わる）
  GFATHER_H4:{ w: 4, h: 1, label: '祖父', role: 'block', bg: '#b0bec5', fg: '#263238', size: 18 },  // 横長4×1：家督が家中横一列に横たわる（Stage21〜 祖母危篤の一列陣）
  // 叔母：大駒2×2（Stage5〜 母代わりの存在感が家中央下に広がる）
  AUNT_LL:   { w: 2, h: 2, label: '叔母', role: 'block',   bg: '#ff8a65', fg: '#3e2723', size: 18 },
  // 叔母：L字（下段両方＋上段左のみ）Stage10〜 母代わりが下段左に沈む
  //   shape: [[1,0],[1,1]] = 上段左のみ / 下段両方
  //   labelPos: 下段中央
  AUNT_JR:   { w: 2, h: 2, shape: [[1,0],[1,1]], labelPos: [1, 1.5], label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },
  // 叔母：Γ字（上段両方＋下段左のみ）Stage11〜 母代わりの叔母が上段に広がる
  //   shape: [[1,1],[1,0]] = 上段両方 / 下段左のみ
  //   labelPos: 上段中央
  AUNT_JL:   { w: 2, h: 2, shape: [[1,1],[1,0]], labelPos: [1, 0.5], label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },
  // 叔母：逆Γ字（上段両方＋下段右のみ）Stage12〜 母代わりが右下に集束
  //   shape: [[1,1],[0,1]] = 上段両方 / 下段右のみ
  //   labelPos: 上段中央
  AUNT_JB:   { w: 2, h: 2, shape: [[1,1],[0,1]], labelPos: [1, 0.5], label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },
  // 叔母：L字左上欠け（上段右のみ＋下段両方）Stage13〜 母代わりが右上から下段に沈む
  //   shape: [[0,1],[1,1]] = 上段右のみ / 下段両方
  //   labelPos: 下段中央
  AUNT_JT:   { w: 2, h: 2, shape: [[0,1],[1,1]], labelPos: [1, 1.5], label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },
  AUNT_JR3:  { w: 2, h: 3, shape: [[0,1],[0,1],[1,1]], labelPos: [1.5, 1.5], label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 15 },  // 叔母 J字大 4マス（縦2＋下段2、Stage19〜 母代わりの叔母が柱状に伸びて下段へ）
  AUNT_V4:   { w: 1, h: 4, label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 14 },  // 叔母 縦長 1×4（Stage20〜 母代わりが家中の右柱として長く座す）
  AUNT_V3:   { w: 1, h: 3, label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 13 },  // 叔母 縦長 1×3（Stage20_2〜 右柱がやや縮み、下段に丁稚が入る）
  AUNT_L:    { w: 3, h: 1, label: '叔母', role: 'block', bg: '#ffccbc', fg: '#3e2723', size: 14 },  // 叔母 横長 3×1（Stage23〜 母代わりが家中横一列に張る）
  // 番頭：Γ字大（Stage5〜 監視が家中に張り巡らされる 5マス／妹が右上の空きに入る）
  //   shape: [[0,1],[1,1],[1,1]] = 右上のみ / 下段2行両方
  //   labelPos: [1, 2] = 中段中央（横2マス幅の中心）
  CLERK_JLL: { w: 2, h: 3, shape: [[0,1],[1,1],[1,1]], labelPos: [1, 2], label: '番頭', role: 'block', bg: '#8d6e63', fg: '#3e2723', size: 18 },
  // 兄：横長2×1（Stage6〜 祭壇の影で兄が力を得て伸長）
  PRODIGAL_L:{ w: 2, h: 1, label: '兄',   role: 'block',   bg: '#ce93d8', fg: '#4a148c', size: 14 },
  // 兄：縦長1×2（Stage8〜 共謀の夜で縦の圧が増す）
  PRODIGAL_V:{ w: 1, h: 2, label: '兄',   role: 'block',   bg: '#ce93d8', fg: '#4a148c', size: 14 },
  PRODIGAL_LL:{ w: 1, h: 3, label: '兄',   role: 'block',   bg: '#ce93d8', fg: '#4a148c', size: 13 },  // 兄 縦長1×3（Stage23〜 兄の影が家中に長く伸びる）
  // 書生：横長2×1（Stage7〜 障子越しの問いを受けて書生が2マス幅で存在感を放つ）
  //   ★新規駒定義ルール適用：明るい白系bg + 暗い黒系fg
  STUDENT_H: { w: 2, h: 1, label: '書生', role: 'block', bg: '#f5f5f5', fg: '#212121', size: 14 },
  STUDENT_JL:{ w: 2, h: 2, shape: [[1,1],[1,0]], labelPos: [1, 0.5], label: '書生', role: 'block', bg: '#f5f5f5', fg: '#212121', size: 15 },  // 書生 L字3マス：上段横2＋下段左1（Stage23〜 書生が縁側に膝をつく）
  STUDENT_JT:{ w: 2, h: 2, shape: [[0,1],[1,1]], labelPos: [1, 1.5], label: '書生', role: 'block', bg: '#f5f5f5', fg: '#212121', size: 15 },  // 書生 L字3マス：上段右1＋下段横2（Stage24〜 書生が座牢を救わんと走り出す）
  // 下女：女中見習い（1×1、明るい黄色）── 女中の下で働く若い奉公人、家中で最も立場が低い
  //   独自色：淡い黄色 bg + 暗いアンバー fg（若さ・従属を表現）
  SERVANT:   { w: 1, h: 1, label: '下女', role: 'pawn',    bg: '#fff59d', fg: '#f57f17', size: 11 },
  // 下女：縦長1×2（将来拡張用 ─ 見習いから成長し女中と並ぶ形態）
  SERVANT_L: { w: 1, h: 2, label: '下女', role: 'block',   bg: '#ffee58', fg: '#f57f17', size: 12 },
  // 手代：番頭補佐（1×1、明るいティール）── 番頭の下で実務を担う中間管理職、江戸～明治の商家役職
  //   独自色：淡いティール bg + 暗いティール fg（番頭系ブラウンとは異なる系統で「補佐」を示す）
  ASSISTANT: { w: 1, h: 1, label: '手代', role: 'pawn',    bg: '#80cbc4', fg: '#004d40', size: 11 },
  // 手代：横長2×1（将来拡張用 ─ 補佐が力を得て番頭に近づく形態）
  ASSISTANT_H:{ w: 2, h: 1, label: '手代', role: 'block',   bg: '#4db6ac', fg: '#004d40', size: 13 },
  // 医者：老医師（1×1、深い紺色）── 御抱の老医師、Meiji初期の紺の羽織姿
  //   独自色：深い紺 bg + 淡青 fg（威厳・伝統・医の落ち着き）
  DOCTOR:   { w: 1, h: 1, label: '医者', role: 'pawn',    bg: '#1f3a5f', fg: '#e3f2fd', size: 11 },
  // 医者の助手（1×1、明るい紺）── 医者に随行する若き弟子
  //   医者と同系統だが明度を上げて従属関係を表現
  DOCTOR_A: { w: 1, h: 1, label: '助手', role: 'pawn',    bg: '#4a6b91', fg: '#e3f2fd', size: 11 }
};

const PUZZLE_STAGES = {
  1: {
    chapterTrigger: 1,  // 第一章 (idx=1) 完了時に発火
    // ─ 序盤群（1〜3面）：「ひととき外へ」── 若い娘の好奇心、家族はまだ大切
    label: '月の昏き夜の踏み出し',
    sub: '夜更けの座牢',
    startHint: '最初の駒を外し、娘を中央下へ',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: 'そっと、一歩。\nされど、この一歩は──まだ家の影の中であった。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',      type: 'LID',      x: 0, y: 0 },
      { id: 'father',   type: 'FATHER',   x: 2, y: 0 },
      { id: 'mother',   type: 'MOTHER',   x: 3, y: 0 },
      { id: 'daughter', type: 'DAUGHTER', x: 4, y: 0 },
      { id: 'gfather',  type: 'GFATHER',  x: 0, y: 2 },
      { id: 'maid',     type: 'MAID',     x: 2, y: 2 },
      { id: 'prodigal', type: 'PRODIGAL', x: 3, y: 2 },
      { id: 'gmother',  type: 'GMOTHER',  x: 4, y: 2 },
      { id: 'uncle',    type: 'UNCLE',    x: 0, y: 3 },
      { id: 'clerk',    type: 'CLERK',    x: 2, y: 3 },
      { id: 'aunt',     type: 'AUNT',     x: 4, y: 3 },
      { id: 'cat',      type: 'CAT',      x: 0, y: 4 },
      { id: 'sister',   type: 'SISTER',   x: 1, y: 4 },
      { id: 'brother',  type: 'BROTHER',  x: 2, y: 4 },
      { id: 'dog',      type: 'DOG',      x: 3, y: 4 },
      { id: 'apprentice', type: 'APPRENTICE', x: 4, y: 4 },
      { id: 'student',  type: 'STUDENT',  x: 5, y: 4 }
    ]
  },
  // ─ Stage 2：第3章(idx 4) ADV完了時に発火 ─ 商人去りし宵、書生が中央に現れる
  2: {
    chapterTrigger: 2,
    label: '座牢の朝',
    sub: '商人去りし宵',
    startHint: '父は縦長に厚く居る。書生をうまく避けよ',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: 'あの目に見据えられて、足が止まる。\nそれでも、夜は続いていく。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',      type: 'LID',      x: 0, y: 0 },
      { id: 'father_l', type: 'FATHER_L', x: 2, y: 0 },  // 父：縦長1×3（家督重責）
      { id: 'mother_s', type: 'MOTHER_S', x: 3, y: 0 },  // ★母：縮小1×1（力の縮小）
      { id: 'brother',  type: 'BROTHER',  x: 3, y: 1 },  // ★弟が(3,1)へ
      { id: 'daughter', type: 'DAUGHTER', x: 4, y: 0 },
      { id: 'gfather',  type: 'GFATHER',  x: 0, y: 2 },
      { id: 'maid',     type: 'MAID',     x: 3, y: 2 },  // 女中が中央(3,2)
      { id: 'gmother',  type: 'GMOTHER',  x: 4, y: 2 },
      { id: 'uncle',    type: 'UNCLE',    x: 0, y: 3 },  // ★叔父は通常2×1のまま
      { id: 'clerk',    type: 'CLERK',    x: 2, y: 3 },
      { id: 'aunt',     type: 'AUNT',     x: 4, y: 3 },
      { id: 'cat',      type: 'CAT',      x: 0, y: 4 },
      { id: 'prodigal', type: 'PRODIGAL', x: 1, y: 4 },  // ★放蕩息子が(1,4)
      { id: 'dog',      type: 'DOG',      x: 2, y: 4 },  // ★番犬が(2,4)
      { id: 'student',  type: 'STUDENT',  x: 3, y: 4 },  // ★書生が(3,4)
      { id: 'sister',   type: 'SISTER',   x: 4, y: 4 },
      { id: 'apprentice', type: 'APPRENTICE', x: 5, y: 4 }
    ]
  },
  // ─ Stage 3：第5章(idx 6) ADV完了時に発火 ─ 監視の眼、番頭が3×1で下を塞ぐ
  3: {
    chapterTrigger: 3,
    label: '廊下の声と書斎の対峙',
    sub: '監視の眼の中',
    startHint: '番頭は横長三列。下層が塞がれている',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '監視の眼は、夜にも息づく。\nそれでも、外の風は遠くから運ばれてくる。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',        type: 'LID',        x: 0, y: 0 },
      { id: 'father_l',   type: 'FATHER_L',   x: 2, y: 0 },
      { id: 'mother_s',   type: 'MOTHER_S',   x: 3, y: 0 },
      { id: 'apprentice', type: 'APPRENTICE', x: 3, y: 1 },
      { id: 'daughter',   type: 'DAUGHTER',   x: 4, y: 0 },
      { id: 'gfather',    type: 'GFATHER',    x: 0, y: 2 },
      { id: 'clerk_l',    type: 'CLERK_L',    x: 3, y: 2 },   // ★番頭 CLERK_L 横長3×1 (3,2)-(5,2)
      { id: 'gmother',    type: 'GMOTHER',    x: 0, y: 3 },
      { id: 'dog',        type: 'DOG',        x: 2, y: 3 },   // 番犬(2,3)
      { id: 'maid',       type: 'MAID',       x: 3, y: 3 },   // 女中(3,3)
      { id: 'prodigal',   type: 'PRODIGAL',   x: 4, y: 3 },   // 放蕩(4,3)
      { id: 'brother',    type: 'BROTHER',    x: 5, y: 3 },   // 弟(5,3)
      { id: 'uncle',      type: 'UNCLE',      x: 0, y: 4 },
      { id: 'student',    type: 'STUDENT',    x: 2, y: 4 },   // 書生(2,4)
      { id: 'aunt',       type: 'AUNT',       x: 3, y: 4 },   // 叔母2×1 (3,4)-(4,4)
      { id: 'sister',     type: 'SISTER',     x: 5, y: 4 }    // 妹(5,4)
      // 退場：猫CAT のみ
    ]
  },
  // ─ Stage 4：第七章(idx 8) ADV完了時に発火 ─ 中盤入り、盤面を 6×6 に拡張
  //   表現段階：「ひととき外へ」→「戸を抜けて」に切り替わる中盤第一夜
  4: {
    chapterTrigger: 4,
    // ─ Stage 4：第3章末「商人の影」 ── 客人縦長で登場・番頭一時緩和・兄退場
    label: '商人の影',
    sub: '商人の影',
    startHint: '客人が縦に座り込む。番頭は応対に走り監視が緩んだ',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: 'そっと、一歩。\nされど、座敷には新しき影が長く伸びていた。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',        type: 'LID',        x: 0, y: 0 },
      { id: 'father_l',   type: 'FATHER_L',   x: 2, y: 0 },
      { id: 'mother_s',   type: 'MOTHER_S',   x: 3, y: 0 },
      { id: 'brother',    type: 'BROTHER',    x: 3, y: 1 },
      { id: 'daughter',   type: 'DAUGHTER',   x: 4, y: 0 },
      { id: 'gfather',    type: 'GFATHER',    x: 0, y: 2 },
      { id: 'maid_l',     type: 'MAID_L',     x: 3, y: 2 },
      { id: 'prodigal',   type: 'PRODIGAL',   x: 4, y: 2 },
      { id: 'apprentice', type: 'APPRENTICE', x: 5, y: 2 },
      { id: 'gmother_s',  type: 'GMOTHER_S',  x: 0, y: 3 },
      { id: 'student',    type: 'STUDENT',    x: 1, y: 3 },
      { id: 'dog',        type: 'DOG',        x: 2, y: 3 },
      { id: 'sister',     type: 'SISTER',     x: 4, y: 3 },   // 妹 (4,3) ← CLERK_JL の shape[0][0]=0 空マスに入る
      { id: 'clerk_jl',   type: 'CLERK_JL',   x: 4, y: 3 },   // ★番頭 逆L字 (5,3)(4,4)(5,4)
      { id: 'uncle',      type: 'UNCLE',      x: 0, y: 4 },
      { id: 'aunt',       type: 'AUNT',       x: 2, y: 4 }
    ]
  
  },
  // ─ Stage 5：第五夜「測る眼」（ユーザー Excel 設計 v1_2 準拠、6×5 30マス）
  //   Stage 4 継承 + 祖父のL字化：
  //     祖父 2×1 → L字3マス（GFATHER_JL: 上段両方＋下段左） ─ 家督が客人の眼下で歪みながら圧を広げる
  //     叔父は祖父L字の右下の凹み(1,3)に押し込まれる
  //   父1×3/女中1×2/番頭Γ字/母1×1/弟1×1/娘2×2/叔母2×1 は Stage 4 継承
  5: {
    chapterTrigger: 5,
    label: '測る眼',
    sub: '測る眼',
    startHint: '客人の眼が家中を測る。祖父の家督が歪みながら広がった',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '客人の眼が、家中を測る。\nそっと、外へ ── 眼の届かぬ場所へ。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',        type: 'LID',         x: 0, y: 0 },
      { id: 'father_l',   type: 'FATHER_L',    x: 2, y: 0 },   // 1×3 縦（父：Stage4継承）
      { id: 'mother_s',   type: 'MOTHER_S',    x: 3, y: 0 },   // 1×1
      { id: 'daughter',   type: 'DAUGHTER',    x: 4, y: 0 },   // 2×2 固定
      { id: 'brother',    type: 'BROTHER',     x: 3, y: 1 },   // 1×1
      { id: 'gfather_jl', type: 'GFATHER_JL',  x: 0, y: 2 },   // ★祖父 L字 (0,2)(1,2)(0,3) ─ 家督の歪み
      { id: 'uncle_s',    type: 'UNCLE_S',     x: 1, y: 3 },   // 1×1 (祖父L字の凹みに入る)
      { id: 'maid_l',     type: 'MAID_L',      x: 3, y: 2 },   // 1×2 縦（女中：Stage4継承）
      { id: 'prodigal',   type: 'PRODIGAL',    x: 4, y: 2 },   // 1×1
      { id: 'apprentice', type: 'APPRENTICE',  x: 5, y: 2 },   // 1×1
      { id: 'gmother_s',  type: 'GMOTHER_S',   x: 2, y: 3 },   // 1×1
      { id: 'sister',     type: 'SISTER',      x: 4, y: 3 },   // 1×1 (番頭Γ字の凹みに入る)
      { id: 'clerk_jl',   type: 'CLERK_JL',    x: 4, y: 3 },   // 番頭 Γ字 (5,3)(4,4)(5,4) ─ Stage4継承
      { id: 'aunt',       type: 'AUNT',        x: 0, y: 4 },
      { id: 'student',    type: 'STUDENT',     x: 2, y: 4 },
      { id: 'dog',        type: 'DOG',         x: 3, y: 4 }
    ]
  },
  // ─ Stage 6：第六夜「会釈と祭壇の影」（Excel設計 v1_2 準拠、6×5 30マス）
  //   Stage 5 継承 + 2つの変化：
  //     兄 1×1 → 2×1横（PRODIGAL_L）─ 祭壇の影で兄が力を得て伸長
  //     番頭 Γ字3マス → 2×1横（CLERK）─ 会釈の裏で監視形態が変わる
  //   祖父L字 / 父1×3 / 女中1×2 / 叔母2×1 / 母1×1 / 弟1×1 / 娘2×2 は継承
  //   猫 復活（(5,2) 1×1）
  6: {
    chapterTrigger: 6,
    label: '会釈と祭壇の影',
    sub: '会釈と祭壇の影',
    startHint: '兄が伸びた影を見せる。番頭は会釈の裏で佇む',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '会釈の裏に、祭壇の影が揺れる。\nそっと、外へ ── 影の届かぬ処へ。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',        type: 'LID',         x: 0, y: 0 },
      { id: 'father_l',   type: 'FATHER_L',    x: 2, y: 0 },
      { id: 'mother_s',   type: 'MOTHER_S',    x: 3, y: 0 },
      { id: 'daughter',   type: 'DAUGHTER',    x: 4, y: 0 },
      { id: 'brother',    type: 'BROTHER',     x: 3, y: 1 },
      { id: 'gfather_jl', type: 'GFATHER_JL',  x: 0, y: 2 },
      { id: 'prodigal_l', type: 'PRODIGAL_L',  x: 3, y: 2 },
      { id: 'cat',        type: 'CAT',         x: 5, y: 2 },
      { id: 'gmother_s',  type: 'GMOTHER_S',   x: 1, y: 3 },
      { id: 'maid_l',     type: 'MAID_L',      x: 2, y: 3 },
      { id: 'uncle_s',    type: 'UNCLE_S',     x: 3, y: 3 },
      { id: 'clerk',      type: 'CLERK',       x: 4, y: 3 },
      { id: 'aunt',       type: 'AUNT',        x: 0, y: 4 },
      { id: 'sister',     type: 'SISTER',      x: 3, y: 4 },
      { id: 'student',    type: 'STUDENT',     x: 4, y: 4 },
      { id: 'dog',        type: 'DOG',         x: 5, y: 4 }
    ]
  },
  // ─ Stage 7：第七夜「障子越しの問い」（Excel設計 v1_2 準拠、6×5 30マス）
  //   Stage 6 継承 + 3つの変化：
  //     番頭 2×1横 → 3×1横（CLERK_L）─ 障子越しの問いで監視の網が横に広がる
  //     書生 1×1 → 2×1横（STUDENT_H）─ 障子越しの問いで書生が存在感を放つ
  //     兄 2×1横 → 1×1（PRODIGAL）─ 祭壇の影から離れて元に戻る
  //   祖父L字 / 父1×3 / 女中1×2 / 叔母2×1 / 母 / 弟(→今回不在) / 娘2×2 は継承
  //   ※ 弟(BROTHER) は Stage 7 では不在。妹が(3,1)に移動
  7: {
    chapterTrigger: 7,
    label: '障子越しの問い',
    sub: '障子越しの問い',
    startHint: '障子越しの問いが家中に広がる。番頭は横に長く、書生は左右に伸びる',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '障子の向こうから問いが差し込む。\nそっと、外へ ── 問いの届かぬ処へ。',
    goal: { x: 2, y: 3 },
    grid: { w: 6, h: 5 },
    pieces: [
      { id: 'lid',        type: 'LID',         x: 0, y: 0 },
      { id: 'father_l',   type: 'FATHER_L',    x: 2, y: 0 },
      { id: 'mother_s',   type: 'MOTHER_S',    x: 3, y: 0 },
      { id: 'daughter',   type: 'DAUGHTER',    x: 4, y: 0 },
      { id: 'sister',     type: 'SISTER',      x: 3, y: 1 },
      { id: 'gfather_jl', type: 'GFATHER_JL',  x: 0, y: 2 },
      { id: 'cat',        type: 'CAT',         x: 3, y: 2 },
      { id: 'brother',    type: 'BROTHER',     x: 4, y: 2 },   // ★変更：丁稚→弟
      { id: 'uncle_s',    type: 'UNCLE_S',     x: 5, y: 2 },
      { id: 'maid_l',     type: 'MAID_L',      x: 1, y: 3 },
      { id: 'dog',        type: 'DOG',         x: 2, y: 3 },
      { id: 'clerk_l',    type: 'CLERK_L',     x: 3, y: 3 },
      { id: 'prodigal',   type: 'PRODIGAL',    x: 0, y: 4 },
      { id: 'student_h',  type: 'STUDENT_H',   x: 2, y: 4 },
      { id: 'aunt',       type: 'AUNT',        x: 4, y: 4 }
    ]
  },
  // ─ Stage 8：第八夜「共謀の夜」（Excel設計 v1.4 準拠、6×6 36マス ★初拡張★）
  //   Stage 7 継承 + 大幅変化：
  //     兄 1×1 → 1×2縦（PRODIGAL_V）─ 共謀の夜で縦の圧が増す（新規）
  //     盤面 6×5 → 6×6 に初拡張（下段1行増加）
  //     女中2駒（1×2縦のMAID_L + 1×1のMAID）─ 女中と下女的な二重
  //     丁稚2駒 / 客人2駒 ─ 共謀に多くの人手が絡む
  //   祖父L字 / 父1×3 / 番頭3×1 / 書生2×1横 / 叔母2×1 / 娘2×2 は継承
  8: {
    chapterTrigger: 8,
    label: '共謀の夜',
    sub: '共謀の夜',
    startHint: '兄が縦に伸び、女中と客人が二人ずつ。共謀の影が家中に広がる',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '共謀の夜。\nそっと、外へ ── 影の隙間をぬって。',
    goal: { x: 2, y: 4 },
    grid: { w: 6, h: 6 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'father_l',     type: 'FATHER_L',     x: 2, y: 0 },   // 1×3 縦
      { id: 'mother_s',     type: 'MOTHER_S',     x: 3, y: 0 },
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 3, y: 1 },   // ★兄 1×2 縦（新規）
      { id: 'gfather_jl',   type: 'GFATHER_JL',   x: 0, y: 2 },   // L字3マス
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 4, y: 2 },   // 丁稚(1)
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 5, y: 2 },
      { id: 'maid_l',       type: 'MAID_L',       x: 1, y: 3 },   // 女中(1) 1×2縦
      { id: 'dog',          type: 'DOG',          x: 2, y: 3 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 3, y: 3 },   // 番頭 3×1
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 4 },   // ★祖母 初登場
      { id: 'cat',          type: 'CAT',          x: 2, y: 4 },   // 猫（位置移動）
      { id: 'servant',      type: 'SERVANT',      x: 3, y: 4 },   // ★下女 1×1（初登場）
      { id: 'aunt',         type: 'AUNT',         x: 4, y: 4 },   // 叔母 2×1
      { id: 'sister',       type: 'SISTER',       x: 0, y: 5 },
      { id: 'brother',      type: 'BROTHER',      x: 1, y: 5 },
      { id: 'student_h',    type: 'STUDENT_H',    x: 2, y: 5 },   // 書生 2×1横
      { id: 'merchant_2',   type: 'MERCHANT',     x: 4, y: 5 },   // 客人(2)
      { id: 'assistant',    type: 'ASSISTANT',    x: 5, y: 5 }    // ★手代 1×1（初登場）
    ]
  },
  // ─ Stage 9：第九夜「庭の骸と祭壇の影」（Excel設計 v1.4 準拠、6×6 36マス）
  //   Stage 8 継承 + 変化：
  //     母 1×1 → 1×2縦（MOTHER）─ 母の存在感が復活
  //     祖父 L字（GFATHER_JL）が下段中央へ、穴(4,5)に客人が入る
  //     兄 1×2縦 継続（PRODIGAL_V）、書生 2×1横 継続、番頭 3×1 継続
  //     女中 1×2縦 復活、下女(5,2)・手代(2,3) 引き続き登場
  //     客人 2駒（(2,4) と (4,5)=祖父L字の穴）
  9: {
    chapterTrigger: 9,
    label: '庭の骸と祭壇の影',
    sub: '庭の骸と祭壇の影',
    startHint: '庭の骸が家中の駒を並べ替える。祖父はL字で下段中央を占め、客人がその隙間に入る',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '庭の骸、祭壇の影。\nそっと、外へ ── 骸の届かぬ処へ。',
    goal: { x: 2, y: 4 },
    grid: { w: 6, h: 6 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'father_l',     type: 'FATHER_L',     x: 2, y: 0 },   // 父 1×3
      { id: 'mother',       type: 'MOTHER',       x: 3, y: 0 },   // ★母 1×2 縦（成長）
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },   // 娘 2×2
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 2 },   // 兄 1×2 縦
      { id: 'dog',          type: 'DOG',          x: 1, y: 2 },
      { id: 'sister',       type: 'SISTER',       x: 3, y: 2 },
      { id: 'apprentice',   type: 'APPRENTICE',   x: 4, y: 2 },
      { id: 'servant',      type: 'SERVANT',      x: 5, y: 2 },   // ★下女
      { id: 'brother',      type: 'BROTHER',      x: 1, y: 3 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 3 },   // ★手代
      { id: 'clerk_l',      type: 'CLERK_L',      x: 3, y: 3 },   // 番頭 3×1
      { id: 'student_h',    type: 'STUDENT_H',    x: 0, y: 4 },   // 書生 2×1横
      { id: 'merchant_1',   type: 'MERCHANT',     x: 2, y: 4 },   // 客人(1)
      { id: 'gfather_jl',   type: 'GFATHER_JL',   x: 3, y: 4 },   // 祖父 L字（穴=(4,5)）
      { id: 'maid_l',       type: 'MAID_L',       x: 5, y: 4 },   // 女中 1×2 縦
      { id: 'aunt',         type: 'AUNT',         x: 0, y: 5 },   // 叔母 2×1
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 2, y: 5 },
      { id: 'merchant_2',   type: 'MERCHANT',     x: 4, y: 5 }    // 客人(2)（祖父L字の穴に入る）
    ]
  },
  // ─ Stage 10：第十夜「座敷の怒号と蔵の影」（Excel設計 v1.5 準拠、6×6 36マス）
  //   Stage 9 継承 + 大きな変化：
  //     祖父 L字向き反転（GFATHER_JR shape=[[1,0],[1,1]]）─ 家督が下段に沈む
  //     叔母 L字化（AUNT_JR、新形状）─ 母代わりが下段左に沈む
  //     祖母 復活（GMOTHER_S、祖父L字の穴に入る）
  //     書生 2×1横→1×1縮小 ─ 怒号を受けて存在感低下
  //     客人 1駒に減少（(5,5)）
  //     兄 1×2縦継続（叔母L字の穴(1,4)を埋める）
  //     母1×2縦 / 父1×3 / 番頭3×1 / 女中1×2縦 は継承
  10: {
    chapterTrigger: 10,
    label: '座敷の怒号と蔵の影',
    sub: '座敷の怒号と蔵の影',
    startHint: '怒号が座敷を裂く。祖父も叔母もL字で沈み、家族が再編される',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '怒号の刃、蔵の影。\nそっと、外へ ── 影が音を吸う処へ。',
    goal: { x: 2, y: 4 },
    grid: { w: 6, h: 6 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'mother',       type: 'MOTHER',       x: 2, y: 0 },
      { id: 'father_l',     type: 'FATHER_L',     x: 3, y: 0 },
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 0, y: 2 },
      { id: 'dog',          type: 'DOG',          x: 1, y: 2 },
      { id: 'sister',       type: 'SISTER',       x: 2, y: 2 },
      { id: 'apprentice',   type: 'APPRENTICE',   x: 4, y: 2 },
      { id: 'servant',      type: 'SERVANT',      x: 5, y: 2 },
      { id: 'student',      type: 'STUDENT',      x: 0, y: 3 },
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 3 },
      { id: 'brother',      type: 'BROTHER',      x: 2, y: 3 },
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 3, y: 3 },
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 4, y: 3 },
      { id: 'maid_l',       type: 'MAID_L',       x: 5, y: 3 },
      { id: 'aunt_jr',      type: 'AUNT_JR',      x: 0, y: 4 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 4 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 2, y: 5 },
      { id: 'merchant',     type: 'MERCHANT',     x: 5, y: 5 }
    ]
  },
  // ─ Stage 11：第十一夜「燈下の影」（Excel設計 v1.6 準拠、6×6 36マス）
  //   Stage 10 継承 + 新形状3種初登場：
  //     父 T字（FATHER_T）─ 燈下で影が広がり、中段が横に飛び出す（4マス）
  //     叔母 Γ字（AUNT_JL）─ 母代わりが上段両方＋下段左に広がる（3マス）
  //     母 2×1横（MOTHER_H）─ 母が横方向に伸長
  //   祖父L字（GFATHER_JR継承）／兄縦1×2／女中縦1×2／番頭3×1 は継承
  //   下女・手代 引き続き登場
  11: {
    chapterTrigger: 11,
    label: '燈下の影',
    sub: '燈下の影',
    startHint: '父が十字形に伸び、叔母が上段を占める。燈下の影が家中を覆う',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '燈下の影が揺れる。\nそっと、外へ ── 影の外へ。',
    goal: { x: 2, y: 4 },
    grid: { w: 6, h: 6 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 0 },   // 手代
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 3, y: 0 },   // 兄 1×2 縦
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'maid_l',       type: 'MAID_L',       x: 2, y: 1 },   // 女中 1×2 縦
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 0, y: 2 },
      { id: 'servant',      type: 'SERVANT',      x: 1, y: 2 },   // 下女
      { id: 'apprentice',   type: 'APPRENTICE',   x: 3, y: 2 },
      { id: 'father_t',     type: 'FATHER_T',     x: 3, y: 2 },   // ★父 T字（穴は (3,2)=丁稚 と (3,4)=祖父）
      { id: 'dog',          type: 'DOG',          x: 5, y: 2 },
      { id: 'aunt_jl',      type: 'AUNT_JL',      x: 0, y: 3 },   // ★叔母 Γ字（穴=(1,4)=書生）
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 2, y: 3 },   // 祖父 L字（穴=(3,3)は父T字が占める）
      { id: 'brother',      type: 'BROTHER',      x: 5, y: 3 },
      { id: 'student',      type: 'STUDENT',      x: 1, y: 4 },
      { id: 'sister',       type: 'SISTER',       x: 5, y: 4 },
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 5 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 1, y: 5 },   // 番頭 3×1 横
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 5 }    // ★母 2×1 横
    ]
  },
  // ─ Stage 12：第十二夜「蔵の文字と兄の油」（Excel設計 v1.6 準拠、6×6 36マス）
  //   Stage 11 継承 + 新形状3種初登場：
  //     父 L字4マス（FATHER_JL）─ 蔵の陰で父の影がL字に折れる
  //     叔母 逆Γ字3マス（AUNT_JB）─ 母代わりが右下に集束
  //     番頭 L字3マス（CLERK_JR）─ 監視が左下に伸長
  //   祖父L字（GFATHER_JR継承）／兄縦1×2／女中縦1×2／書生2×1横／母2×1横 は継承
  12: {
    chapterTrigger: 12,
    label: '蔵の文字と兄の油',
    sub: '蔵の文字と兄の油',
    startHint: '蔵の文字が家族を歪ませる。父・叔母・番頭がそれぞれ形を変える',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '蔵の文字、兄の油。\nそっと、外へ ── 文字の届かぬ処へ。',
    goal: { x: 2, y: 4 },
    grid: { w: 6, h: 6 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'maid_l',       type: 'MAID_L',       x: 2, y: 0 },   // 女中 1×2 縦
      { id: 'father_jl',    type: 'FATHER_JL',    x: 3, y: 0 },   // ★父 L字 4マス
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'student_h',    type: 'STUDENT_H',    x: 0, y: 2 },   // 書生 2×1 横
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 2, y: 2 },   // 祖父 L字（穴=(3,2)=父の腕）
      { id: 'dog',          type: 'DOG',          x: 5, y: 2 },
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 3 },   // 兄 1×2 縦
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 1, y: 3 },
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 3 },   // 母 2×1 横
      { id: 'aunt_jb',      type: 'AUNT_JB',      x: 1, y: 4 },   // ★叔母 逆Γ字（穴=(1,5)=手代）
      { id: 'clerk_jr',     type: 'CLERK_JR',     x: 3, y: 4 },   // ★番頭 L字（穴=(4,4)=妹）
      { id: 'sister',       type: 'SISTER',       x: 4, y: 4 },
      { id: 'brother',      type: 'BROTHER',      x: 5, y: 4 },
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 5 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 1, y: 5 },
      { id: 'apprentice',   type: 'APPRENTICE',   x: 5, y: 5 }
    ]
  },
  // ─ Stage 13：第十三夜「手形の符号」（Excel設計 v1.8 準拠、6×7 42マス）
  //   ★手形2駒初登場（HANDPRINT × 2、動かない固定駒）
  //   父 L字大（FATHER_LW shape=[[1,0,0],[1,1,1]] w=3,h=2 / 4マス）─ 父が下段に大きく広がる
  //   丁稚3駒 / 手形2駒 / 下女2駒 ─ 家中に散在
  //   祖父L字(GFATHER_JR) / 叔母L字(AUNT_JT) / 女中1×2 / 書生1×2 / 兄1×2 / 母2×1横 / 番頭3×1 は継承
  //   goal y=4（ゴールが下段より1つ上、叔母L字＋父L字大の間を突破する必要）
  13: {
    chapterTrigger: 13,
    label: '手形の符号',
    sub: '手形の符号',
    startHint: '手形は動かない。父はJ字、番頭は逆L字（左下穴）、叔母はL字（右上穴）',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '手形の符号、蔵の奥。\nそっと、外へ ── 符号の届かぬ処へ。',
    goal: { x: 2, y: 5 },  // 絶対ルール準拠：娘は盤面最下段中央（grid.h-2）
    grid: { w: 6, h: 7 },
    pieces: [
      // Row 0-1
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 2, y: 0 },   // 丁稚(1)
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 0 },   // 女中 1×2 縦
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 2, y: 1 },   // 祖父 L字（穴=(3,1)=女中）
      // Row 2
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2 縦
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 1, y: 2 },
      { id: 'servant_1',    type: 'SERVANT',      x: 4, y: 2 },   // 下女(1) ─ 父の穴(4,2)
      { id: 'father_jr',    type: 'FATHER_JR',    x: 4, y: 2 },   // ★父 J字4マス（穴=(4,2)(4,3)）
      // Row 3
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 3 },   // 兄 1×2 縦
      { id: 'handprint',    type: 'HANDPRINT',    x: 2, y: 3 },   // ★手形 固定駒
      { id: 'brother',      type: 'BROTHER',      x: 3, y: 3 },   // 弟
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 4, y: 3 },   // 丁稚(2) ─ 父の穴(4,3)
      // Row 4
      { id: 'aunt_jr',      type: 'AUNT_JR',      x: 0, y: 4 },   // ★叔母 L字 shape[[1,0],[1,1]]（穴=(1,4)=兄）
      { id: 'dog',          type: 'DOG',          x: 2, y: 4 },
      { id: 'sister',       type: 'SISTER',       x: 3, y: 4 },   // 妹
      // Row 5
      { id: 'clerk_jb',     type: 'CLERK_JB',     x: 2, y: 5 },   // ★番頭 逆L字 shape[[1,1],[0,1]]（穴=(2,6)=丁稚(3)）
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 5 },   // 母 2×1 横
      // Row 6
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 6 },   // 下女(2)
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 2, y: 6 },   // 丁稚(3) ─ 番頭の穴(2,6)
      { id: 'assistant',    type: 'ASSISTANT',    x: 4, y: 6 },   // 手代
      { id: 'servant_3',    type: 'SERVANT',      x: 5, y: 6 }    // 下女(3)
    ]
  },
  // ─ Stage 14：第十四夜「障子越しの視線」（Excel設計 v1.8 準拠、6×7 42マス）
  //   Stage 13 の元設計（手形なし・客人2駒あり）─ 手形バリエーションの対比として
  //   父 T字左向き / 兄1×2縦 / 女中1×2縦 / 書生1×2縦 / 母2×1横 / 番頭3×1 / 妹1×2縦 は継承
  14: {
    chapterTrigger: 14,
    label: '障子越しの視線',
    sub: '障子越しの視線',
    startHint: '障子越しの視線を感じる。客人が2人、家中に散る',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '障子越しの視線が、体を貫く。\nそっと、外へ ── 視線の届かぬ処へ。',
    goal: { x: 2, y: 5 },
    grid: { w: 6, h: 7 },
    pieces: [
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'servant_1',    type: 'SERVANT',      x: 2, y: 0 },
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 0 },
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 2, y: 1 },
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },
      { id: 'uncle_s',      type: 'UNCLE_S',      x: 1, y: 2 },
      { id: 'father_tl',    type: 'FATHER_TL',    x: 4, y: 2 },
      { id: 'brother',      type: 'BROTHER',      x: 5, y: 2 },
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 3 },
      { id: 'merchant_1',   type: 'MERCHANT',     x: 2, y: 3 },
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 3, y: 3 },
      { id: 'dog',          type: 'DOG',          x: 0, y: 4 },
      { id: 'aunt_jt',      type: 'AUNT_JT',      x: 1, y: 4 },
      { id: 'merchant_2',   type: 'MERCHANT',     x: 3, y: 4 },
      { id: 'sister_l',     type: 'SISTER_L',     x: 5, y: 4 },
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 0, y: 5 },
      { id: 'mother_h',     type: 'MOTHER_H',     x: 3, y: 5 },
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 6 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 2, y: 6 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 5, y: 6 }
    ]
  },
  // ─ Stage 15：第拾伍夜「煙管の音」（Excel v1.8 準拠、6×7 42マス）
  //   父 T字トップワイド (FATHER_TW shape [[1,1,1],[0,1,0]]) ─ 家督の圧が横に広がり中央に垂れる
  //   妹 横2マス (SISTER_H) ─ 姉妹並座の視覚化
  //   叔父 2×1横 (UNCLE) ─ 家中で強気に張り出す
  //   客人 × 2 (MERCHANT) ─ 商人の眼が複数箇所から
  15: {
    chapterTrigger: 15,
    label: '煙管の音',
    sub: '煙管の音',
    startHint: '父T字上段広がり、妹は姉妹並座、叔父は横並び、客人が2箇所',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '煙管の音、蔵の奥。\nそっと、外へ ── 音の届かぬ処へ。',
    goal: { x: 2, y: 5 },  // 絶対ルール準拠：娘は盤面最下段中央（grid.h-2）
    grid: { w: 6, h: 7 },
    pieces: [
      // Row 0-1
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'servant_1',    type: 'SERVANT',      x: 2, y: 0 },   // 下女(1)
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 0 },   // 女中 1×2 縦
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'gfather_jr',   type: 'GFATHER_JR',   x: 2, y: 1 },   // 祖父 L字（穴=(3,1)=女中）
      // Row 2
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2 縦
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 2 },   // 下女(2)
      { id: 'sister_h',     type: 'SISTER_H',     x: 4, y: 2 },   // ★妹 横2マス
      // Row 3
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 3 },   // 兄 1×2 縦
      { id: 'uncle',        type: 'UNCLE',        x: 2, y: 3 },   // 叔父 横2マス
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 3 },   // 母 横2マス
      // Row 4
      { id: 'dog',          type: 'DOG',          x: 0, y: 4 },
      { id: 'aunt_jt',      type: 'AUNT_JT',      x: 1, y: 4 },   // 叔母 L字（穴=(1,4)=兄）
      { id: 'father_tw',    type: 'FATHER_TW',    x: 3, y: 4 },   // ★父 T字トップワイド 4マス（穴=(3,5)=客人,(5,5)=弟）
      // Row 5
      { id: 'apprentice',   type: 'APPRENTICE',   x: 0, y: 5 },   // 丁稚
      { id: 'merchant_1',   type: 'MERCHANT',     x: 3, y: 5 },   // 客人(1) ─ 父の穴(3,5)
      { id: 'brother',      type: 'BROTHER',      x: 5, y: 5 },   // 弟 ─ 父の穴(5,5)
      // Row 6
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 1, y: 6 },   // 番頭 3×1 横
      { id: 'merchant_2',   type: 'MERCHANT',     x: 4, y: 6 },   // 客人(2)
      { id: 'assistant',    type: 'ASSISTANT',    x: 5, y: 6 }    // 手代
    ]
  },
  // ─ Stage 16：第拾陸夜「贈り物」（Excel v1.8 準拠、6×7 42マス）
  //   父 Z字 (FATHER_Z shape [[0,1,1],[1,1,0]]) ─ 家督の圧が階段状に折れ
  //   叔父 L字 (UNCLE_JR shape [[1,0],[1,1]]) ─ 縁者の影が娘の右に居座る
  //   犬 上段(3,0) ─ 玄関先で贈り物を嗅ぎ回る犬
  //   祖父 L字 (GFATHER_JL shape [[1,1],[1,0]]) ─ 家督が上段に張り出す
  16: {
    chapterTrigger: 16,
    label: '贈り物',
    sub: '贈り物',
    startHint: '父はZ字、叔父はL字、犬が上段。祖父の圧が中央から',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '贈り物、蔵の奥。\nそっと、外へ ── 贈り主の届かぬ処へ。',
    goal: { x: 2, y: 5 },  // 絶対ルール準拠：娘は盤面最下段中央（grid.h-2）
    grid: { w: 6, h: 7 },
    pieces: [
      // Row 0-1
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'servant_1',    type: 'SERVANT',      x: 2, y: 0 },   // 下女(1)
      { id: 'dog',          type: 'DOG',          x: 3, y: 0 },   // 犬 上段配置
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 1 },   // 手代
      { id: 'uncle_jr',     type: 'UNCLE_JR',     x: 3, y: 1 },   // ★叔父 L字（穴=(4,1)=娘）
      // Row 2
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 2 },   // 兄 1×2 縦
      { id: 'gfather_jl',   type: 'GFATHER_JL',   x: 1, y: 2 },   // 祖父 L字（穴=(2,3)=客人）
      { id: 'apprentice',   type: 'APPRENTICE',   x: 5, y: 2 },   // 丁稚
      // Row 3
      { id: 'merchant',     type: 'MERCHANT',     x: 2, y: 3 },   // 客人 ─ 祖父の穴
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 3 },   // 女中 1×2 縦
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 3 },   // 母 横2マス
      // Row 4
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 4 },   // 書生 1×2 縦
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 4 },   // 下女(2)
      { id: 'aunt_jt',      type: 'AUNT_JT',      x: 1, y: 4 },   // 叔母 L字（穴=(1,4)=下女(2)）
      // Row 4-5: 父 Z字
      { id: 'father_z',     type: 'FATHER_Z',     x: 3, y: 4 },   // ★父 Z字 shape [[0,1,1],[1,1,0]] （穴=(3,4)=女中,(5,5)=弟）
      // Row 5
      { id: 'brother',      type: 'BROTHER',      x: 5, y: 5 },   // 弟 ─ 父Z字の右下穴
      // Row 6
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'clerk_l',      type: 'CLERK_L',      x: 1, y: 6 },   // 番頭 3×1 横
      { id: 'sister_h',     type: 'SISTER_H',     x: 4, y: 6 }    // 妹 横2マス
    ]
  },
  // ─ Stage 17：第拾漆夜「梁の影」（Excel v1.8 準拠、6×7 42マス）
  //   祖父 U字/アーチ (GFATHER_U shape [[1,1,1],[1,0,1]]) ─ 5マス：家督が梁のように広がり、女中が中央下で受ける
  //   父 T字ボトムワイド (FATHER_TB shape [[0,1,0],[1,1,1]]) ─ 4マス：上に一本、下に横広、父の梁が家中を貫く
  //   叔母 L字 (AUNT_JL shape [[1,1],[1,0]]) ─ 3マス：右上寄せ
  //   犬 上段(3,0), 客人 (3,1) ─ 玄関先の贈り物客と番犬
  17: {
    chapterTrigger: 17,
    label: '梁の影',
    sub: '梁の影',
    startHint: '祖父U字5マス、父T字ボトムワイド、女中と丁稚が縦横に散る',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '梁の影、蔵の奥。\nそっと、外へ ── 梁の届かぬ処へ。',
    goal: { x: 2, y: 5 },
    grid: { w: 6, h: 7 },
    pieces: [
      // Row 0-1
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 2, y: 0 },   // 丁稚(1)
      { id: 'dog',          type: 'DOG',          x: 3, y: 0 },   // 犬
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 1 },   // 手代
      { id: 'servant_1',    type: 'SERVANT',      x: 3, y: 1 },   // 下女(1) ★客人→下女
      // Row 2-3
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 2 },   // 兄 1×2 縦
      { id: 'gfather_u',    type: 'GFATHER_U',    x: 1, y: 2 },   // 祖父 U字5マス（穴=(2,3)=女中）
      { id: 'mother_h',     type: 'MOTHER_H',     x: 4, y: 2 },   // 母 2×1 横
      { id: 'maid_l',       type: 'MAID_L',       x: 2, y: 3 },   // 女中 1×2 縦
      { id: 'father_l3',    type: 'FATHER_L3',    x: 4, y: 3 },   // ★父 L字3マス shape [[1,1],[1,0]]（穴=(5,4)=丁稚(2)）
      // Row 4
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 4 },   // 書生 1×2 縦
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 4 },   // 下女(2)
      { id: 'brother',      type: 'BROTHER',      x: 3, y: 4 },   // 弟 ★位置変更 (5,3)→(3,4)
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 5, y: 4 },   // 丁稚(2) ─ 父L字の穴
      // Row 5
      { id: 'aunt_jl',      type: 'AUNT_JL',      x: 1, y: 5 },   // 叔母 L字（穴=(2,6)=丁稚(3)）
      { id: 'sister_h',     type: 'SISTER_H',     x: 3, y: 5 },   // 妹 横2マス
      { id: 'clerk_jl',     type: 'CLERK_JL',     x: 4, y: 5 },   // 番頭 L字（穴=(4,5)=妹の右セル）
      // Row 6
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 2, y: 6 },   // 丁稚(3)
      { id: 'servant_3',    type: 'SERVANT',      x: 3, y: 6 }    // 下女(3) ★新位置
    ]
  },
  // ─ Stage 18：第拾捌夜「紅き廊下と祭壇の前」（Excel v1.8 準拠、6×7 42マス、山場ステージ）
  //   祖父 L字トップワイド (GFATHER_LT shape [[1,1,1],[1,0,0]]) ─ 4マス：家督の圧が上段に広がる
  //   父 Z字/ジグザグ (FATHER_Z5 shape [[0,1,1],[0,1,0],[1,1,0]]) ─ 5マス w=3 h=3：血筋が斜めに落ちる
  //   番頭 縦長 (CLERK_V) ─ 1×3：監視の柱が右端に立つ
  //   叔母 L字 (AUNT_JT shape [[0,1],[1,1]]) ─ 3マス
  18: {
    chapterTrigger: 18,
    label: '紅き廊下と祭壇の前',
    sub: '紅き廊下と祭壇の前',
    startHint: '祖父L字上段、父Z字斜め、番頭は縦長の柱、叔母は右上のL字',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '紅き廊下と祭壇の前、蔵の奥。\nそっと、外へ ── 祭壇の届かぬ処へ。',
    goal: { x: 2, y: 5 },  // 絶対ルール準拠
    grid: { w: 6, h: 7 },
    pieces: [
      // Row 0-1
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 0 },   // 手代
      { id: 'brother',      type: 'BROTHER',      x: 3, y: 0 },   // 弟 ★上段配置
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'merchant_1',   type: 'MERCHANT',     x: 2, y: 1 },   // 客人(1)
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 3, y: 1 },   // 丁稚(1)
      // Row 2
      { id: 'servant_1',    type: 'SERVANT',      x: 0, y: 2 },   // 下女(1)
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 1, y: 2 },   // 丁稚(2)
      { id: 'gfather_lu',   type: 'GFATHER_LU',   x: 2, y: 2 },   // ★祖父 L字縦上部フック 4マス（穴=(3,3)=女中,(3,4)=女中）
      { id: 'dog',          type: 'DOG',          x: 4, y: 2 },   // 犬 ★中央配置
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 5, y: 2 },   // 兄 1×2 縦
      // Row 3-5
      { id: 'aunt_jb',      type: 'AUNT_JB',      x: 0, y: 3 },   // 叔母 L字（穴=(0,4)=書生）
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 3 },   // 女中 1×2 縦
      { id: 'father_jr',    type: 'FATHER_JR',    x: 3, y: 3 },   // 父 J字4マス（穴=(3,3)=女中,(3,4)=女中）
      // Row 4
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 4 },   // 書生 1×2 縦
      { id: 'clerk_v',      type: 'CLERK_V',      x: 5, y: 4 },   // 番頭 縦長 1×3
      // Row 5
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 5 },   // 下女(2)
      { id: 'merchant_2',   type: 'MERCHANT',     x: 2, y: 5 },   // 客人(2)
      // Row 6
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 6 },
      { id: 'mother_h',     type: 'MOTHER_H',     x: 1, y: 6 },   // 母 2×1 横
      { id: 'sister_h',     type: 'SISTER_H',     x: 3, y: 6 }    // 妹 2×1 横
    ]
  },
  // ─ Stage 19：第十九章「病床」 ── 6×8 最終盤面拡張・子犬初登場（v20260712z: Stage19_2 反映）
  //   祖母が起き上がれず、娘が枕元へ赴く。家中は静けさの中に慟哭を秘めた病床の景色。
  //   新駒：BROTHER_H (弟横2)、AUNT_JR3 (叔母J字大4マス)、FATHER_LT (父L字上段3+下段左1)、GFATHER_LR (祖父L字下段3+右上1)
  //   PUPPY (子犬) 初登場：犬の隣＋娘の隣に寄り添う 2駒配置
  //   Stage19_2 の変更点：(3,0) 丁稚→子犬 / (4,4) 女中→丁稚 / 女中は 1×3縦→1×2縦 に縮小
  19: {
    chapterTrigger: 19,
    label: '病床',
    sub: '病床',
    startHint: '子犬が犬と娘の間に二匹、叔母は柱状に、父と祖父はL字で家中を圧す',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '祖母の枕元、静けさの中。\nそっと、外へ ── 祭壇の灯も揺らぐ夜へ。',
    goal: { x: 2, y: 6 },  // 絶対ルール：goal.y = grid.h - 2 = 6
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 犬 / 子犬(1) / 娘 / 子犬(2) / 下女）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'dog',          type: 'DOG',          x: 2, y: 0 },   // 犬
      { id: 'puppy_1',      type: 'PUPPY',        x: 3, y: 0 },   // ★子犬(1) ─ 娘の隣
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'puppy_2',      type: 'PUPPY',        x: 2, y: 1 },   // ★子犬(2) ─ 犬の下
      { id: 'servant_1',    type: 'SERVANT',      x: 3, y: 1 },   // 下女(1)
      // Row 2-4（書生縦 / 叔母J字大 / 丁稚×3 / 番頭横3 / 下女×2 / 父L字）
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2縦
      { id: 'aunt_jr3',     type: 'AUNT_JR3',     x: 0, y: 2 },   // ★叔母 J字大4マス（穴=(0,2),(0,3)=書生）
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 2, y: 2 },   // 丁稚(1)
      { id: 'clerk_l',      type: 'CLERK_L',      x: 3, y: 2 },   // 番頭 3×1横
      { id: 'servant_2',    type: 'SERVANT',      x: 2, y: 3 },   // 下女(2)
      { id: 'father_lt',    type: 'FATHER_LT',    x: 3, y: 3 },   // ★父 L字トップワイド4マス
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 2, y: 4 },   // 丁稚(2)
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 4, y: 4 },   // 丁稚(3) ★女中→丁稚
      { id: 'servant_3',    type: 'SERVANT',      x: 5, y: 4 },   // 下女(3)
      // Row 5-6（兄縦 / 弟横 / 手代 / 女中1×2縦 / 客人 / 妹横 / 客人 / 祖父L字）
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 5 },   // 兄 1×2縦
      { id: 'brother_h',    type: 'BROTHER_H',    x: 1, y: 5 },   // ★弟 2×1横
      { id: 'assistant',    type: 'ASSISTANT',    x: 3, y: 5 },   // 手代
      { id: 'maid_l',       type: 'MAID_L',       x: 4, y: 5 },   // 女中 1×2縦（Stage19_2で縮小）
      { id: 'merchant_1',   type: 'MERCHANT',     x: 5, y: 5 },   // 客人(1)
      { id: 'sister_h',     type: 'SISTER_H',     x: 1, y: 6 },   // 妹 2×1横
      { id: 'merchant_2',   type: 'MERCHANT',     x: 3, y: 6 },   // 客人(2)
      { id: 'gfather_lr',   type: 'GFATHER_LR',   x: 3, y: 6 },   // ★祖父 L字下段3+右上1（穴=(3,6),(4,6)=客人(2)＆女中(4,6)）
      // Row 7（祖母 / 母横）
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 7 },
      { id: 'mother_h',     type: 'MOTHER_H',     x: 1, y: 7 }    // 母 2×1横
    ]
  },
  // ─ Stage 20：第二十章「嫁入りと囁き」 ── 6×8、23駒
  //   嫁入りの行列を高窓から見つめる娘。腹違いの兄が祭壇の前で囁く 「親指を、隠せ」。
  //   新駒：AUNT_V4 (叔母縦4)、FATHER_U (父U字5マス)、GFATHER_NU (祖父逆U字/n字5マス)
  //   子犬 2駒継続、娘の下段中央への通り道を家督の U/N 字が挟撃する構図。
  20: {
    chapterTrigger: 20,
    label: '嫁入りと囁き',
    sub: '嫁入りと囁き',
    startHint: '兄が縦、叔母が縦長4、父はU字で家中を挟み、祖父は下段でアーチを組む',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '塀の外を渡る白無垢の行列。\nそっと、外へ ── 親指を、隠して。',
    goal: { x: 2, y: 6 },  // 絶対ルール：goal.y = grid.h - 2 = 6
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 弟横2 / 娘 / 妹横2）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'brother_h',    type: 'BROTHER_H',    x: 2, y: 0 },   // 弟 2×1横
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'sister_h',     type: 'SISTER_H',     x: 2, y: 1 },   // 妹 2×1横
      // Row 2-3（書生縦 / 兄縦 / 番頭横3 / 叔母縦4 / 下女 / 母横）
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2縦
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 2 },   // 兄 1×2縦
      { id: 'clerk_l',      type: 'CLERK_L',      x: 2, y: 2 },   // 番頭 3×1横
      { id: 'aunt_v3',      type: 'AUNT_V3',      x: 5, y: 2 },   // ★叔母 1×3縦（(5,2)-(5,4)）Stage20_2で縮小
      { id: 'servant_1',    type: 'SERVANT',      x: 2, y: 3 },   // 下女(1)
      { id: 'mother_h',     type: 'MOTHER_H',     x: 3, y: 3 },   // 母 2×1横
      // Row 4-5（子犬×2 / 犬 / 父U字 / 丁稚 / 女中縦）
      { id: 'puppy_1',      type: 'PUPPY',        x: 0, y: 4 },   // ★子犬(1)
      { id: 'dog',          type: 'DOG',          x: 1, y: 4 },   // 犬
      { id: 'father_u',     type: 'FATHER_U',     x: 2, y: 4 },   // ★父 U字5マス（穴=(3,5)=女中）
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 0, y: 5 },   // 丁稚(1)
      { id: 'puppy_2',      type: 'PUPPY',        x: 1, y: 5 },   // ★子犬(2)
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 5 },   // 女中 1×2縦（(3,5)-(3,6)）
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 5, y: 5 },   // ★丁稚(3) Stage20_2で新規：叔母縦4→縦3縮小の埋め
      // Row 6-7（下女 / 丁稚 / 祖父n字 / 客人 / 祖母 / 客人 / 手代）
      { id: 'servant_2',    type: 'SERVANT',      x: 0, y: 6 },   // 下女(2)
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 1, y: 6 },   // 丁稚(2)
      { id: 'gfather_nu',   type: 'GFATHER_NU',   x: 2, y: 6 },   // ★祖父 n字5マス（穴=(3,6)=女中）
      { id: 'merchant_1',   type: 'MERCHANT',     x: 5, y: 6 },   // 客人(1)
      { id: 'gmother_s',    type: 'GMOTHER_S',    x: 0, y: 7 },
      { id: 'merchant_2',   type: 'MERCHANT',     x: 1, y: 7 },   // 客人(2)
      { id: 'assistant',    type: 'ASSISTANT',    x: 5, y: 7 }    // 手代
    ]
  },
  // ─ Stage 21：第廿壱夜「祖母の手」 ── 6×8、26駒
  //   祖母の枕元に家族が集い、静かに息を引き取る。GMOTHER_SICK 初登場（左下(0,7)）。
  //   父・祖父が横一列4マスで家中に伸び、家族全員が枕元へ結集する構図。
  //   新駒：BROTHER_V (弟縦2)、FATHER_H4 (父横4)、GFATHER_H4 (祖父横4)
  //   子犬 2駒配置継続：(4,6)(5,7) 犬に寄り添う
  21: {
    chapterTrigger: 21,
    label: '祖母の手',
    sub: '祖母の手',
    startHint: '祖母(病)は動かない。父・祖父は横一列4マスで家中を塞ぐ',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '祖母の手が、ゆっくりと解けてゆく。\nそっと、外へ ── 「たま」の名を胸に。',
    goal: { x: 2, y: 6 },  // 絶対ルール：goal.y = grid.h - 2 = 6
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 妹縦 / 弟縦 / 娘）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'sister_l',     type: 'SISTER_L',     x: 2, y: 0 },   // 妹 1×2縦
      { id: 'brother_v',    type: 'BROTHER_V',    x: 3, y: 0 },   // ★弟 1×2縦
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      // Row 2-3（書生縦 / 番頭横3 / 丁稚 / 下女 / 客人 / 父横4）
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2縦
      { id: 'clerk_l',      type: 'CLERK_L',      x: 1, y: 2 },   // 番頭 3×1横
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 4, y: 2 },   // 丁稚(1)
      { id: 'servant_1',    type: 'SERVANT',      x: 5, y: 2 },   // 下女(1)
      { id: 'merchant_1',   type: 'MERCHANT',     x: 1, y: 3 },   // 客人(1)
      { id: 'father_h4',    type: 'FATHER_H4',    x: 2, y: 3 },   // ★父 4×1横（(2,3)-(5,3)）
      // Row 4（祖父横4 / 丁稚 / 叔母縦3）
      { id: 'gfather_h4',   type: 'GFATHER_H4',   x: 0, y: 4 },   // ★祖父 4×1横（(0,4)-(3,4)）
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 4, y: 4 },   // 丁稚(2)
      { id: 'aunt_v3',      type: 'AUNT_V3',      x: 5, y: 4 },   // 叔母 1×3縦（(5,4)-(5,6)）
      // Row 5-6（下女 / 兄縦 / 母縦 / 女中縦 / 下女 / 丁稚 / 子犬）
      { id: 'servant_2',    type: 'SERVANT',      x: 0, y: 5 },   // 下女(2)
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 1, y: 5 },   // 兄 1×2縦
      { id: 'mother',       type: 'MOTHER',       x: 2, y: 5 },   // 母 1×2縦（(2,5)-(2,6)）
      { id: 'maid_l',       type: 'MAID_L',       x: 3, y: 5 },   // 女中 1×2縦
      { id: 'servant_3',    type: 'SERVANT',      x: 4, y: 5 },   // 下女(3)
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 0, y: 6 },   // 丁稚(3)
      { id: 'puppy_1',      type: 'PUPPY',        x: 4, y: 6 },   // ★子犬(1)
      // Row 7（祖母(病) / 丁稚 / 手代 / 客人 / 犬 / 子犬）
      { id: 'gmother_sick', type: 'GMOTHER_SICK', x: 0, y: 7 },   // ★動けなくなった祖母（固定駒）
      { id: 'apprentice_4', type: 'APPRENTICE',   x: 1, y: 7 },   // 丁稚(4)
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 7 },   // 手代
      { id: 'merchant_2',   type: 'MERCHANT',     x: 3, y: 7 },   // 客人(2)
      { id: 'dog',          type: 'DOG',          x: 4, y: 7 },   // 犬
      { id: 'puppy_2',      type: 'PUPPY',        x: 5, y: 7 }    // ★子犬(2)
    ]
  },
  // ─ Stage 22：第廿弐夜「葬列と発作」 ── 6×8、25駒
  //   祖母の葬儀の朝。黒衣の客が並び、坊主の経が響き、霊柩が門を出てゆく。
  //   夜更け、父が発作を起こし母が老医師を呼びに走る。
  //   ★祭壇 (ALTAR) 初登場 (2,4)-(3,4)、家中央に据えられた 2×1 の固定駒
  //   ★客人 6駒 (2,5)-(3,7) は全て個別 MERCHANT 1×1 として登録（Stage 22 特例：隣接しても結合しない）
  //   新規駒定義なし、既存駒のみで構成
  22: {
    chapterTrigger: 22,
    label: '葬列と発作',
    sub: '葬列と発作',
    startHint: '祭壇は動かない。弔問の客6人が祭壇を囲み、父が右下でJ字を組む',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '霊柩の車が、門を出てゆく。\nそっと、外へ ── 経の響きの届かぬ処へ。',
    goal: { x: 2, y: 6 },  // 絶対ルール：goal.y = grid.h - 2 = 6
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 弟横 / 娘 / 妹横）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'brother_h',    type: 'BROTHER_H',    x: 2, y: 0 },   // 弟 2×1横
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'sister_h',     type: 'SISTER_H',     x: 2, y: 1 },   // 妹 2×1横
      // Row 2-4（書生縦 / 叔母縦3 / 下女 / 番頭横3 / 母横 / 丁稚 / 下女 / 丁稚 / 祭壇 / 下女 / 丁稚）
      { id: 'student_l',    type: 'STUDENT_L',    x: 0, y: 2 },   // 書生 1×2縦
      { id: 'aunt_v3',      type: 'AUNT_V3',      x: 1, y: 2 },   // 叔母 1×3縦（(1,2)-(1,4)）
      { id: 'servant_1',    type: 'SERVANT',      x: 2, y: 2 },   // 下女(1)
      { id: 'clerk_l',      type: 'CLERK_L',      x: 3, y: 2 },   // 番頭 3×1横
      { id: 'mother_h',     type: 'MOTHER_H',     x: 2, y: 3 },   // 母 2×1横
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 4, y: 3 },   // 丁稚(1)
      { id: 'servant_2',    type: 'SERVANT',      x: 5, y: 3 },   // 下女(2)
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 0, y: 4 },   // 丁稚(2)
      { id: 'altar',        type: 'ALTAR',        x: 2, y: 4 },   // ★祭壇 2×1横（固定駒）
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 4, y: 4 },   // 兄 1×2縦（(4,4)-(4,5)）★Stage22_2で上昇
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 5, y: 4 },   // 丁稚(3)
      // Row 5-7（祖父LU / 女中縦 / 客人×6（個別）/ 下女(3) / 父2×2大駒）
      { id: 'gfather_lu',   type: 'GFATHER_LU',   x: 0, y: 5 },   // 祖父 L字縦・上部フック 4マス（穴=(1,6)(1,7)=女中）
      { id: 'maid_l',       type: 'MAID_L',       x: 1, y: 6 },   // 女中 1×2縦（(1,6)-(1,7)）
      { id: 'merchant_1',   type: 'MERCHANT',     x: 2, y: 5 },   // ★客人(1) 個別1×1
      { id: 'merchant_2',   type: 'MERCHANT',     x: 3, y: 5 },   // ★客人(2)
      { id: 'merchant_3',   type: 'MERCHANT',     x: 2, y: 6 },   // ★客人(3)
      { id: 'merchant_4',   type: 'MERCHANT',     x: 3, y: 6 },   // ★客人(4)
      { id: 'merchant_5',   type: 'MERCHANT',     x: 2, y: 7 },   // ★客人(5)
      { id: 'merchant_6',   type: 'MERCHANT',     x: 3, y: 7 },   // ★客人(6)
      { id: 'servant_3',    type: 'SERVANT',      x: 5, y: 5 },   // 下女(3) ★Stage22_2で(4,4)→(5,5)
      { id: 'father_ll',    type: 'FATHER_LL',    x: 4, y: 6 }    // ★父 2×2 solid（(4,6)-(5,7)）Stage22_2で J字→大駒
    ]
  },
  // ─ Stage 23：第廿参夜「詰問と告白」 ── 6×8、23駒
  //   老医師「これは、もう、起き上がられぬ」父人事不省。四十九日を経て叔母が書生を詰問し、
  //   書生が座牢の障子越しに呪術の真相を告白。母が娘の出生の真実を叔母に打ち明ける。
  //   ★医者(DOCTOR)・助手(DOCTOR_A) 初登場：下段中央 (2,7)(3,7)
  //   新規駒 7種：STUDENT_JL、PRODIGAL_LL、AUNT_L、GFATHER_V4、MOTHER_JB、FATHER_L3B、MAID_JT
  //   ★父ピースは roleOverride:'fixed' で動かせない（病で人事不省、Stage 24 も同様）
  23: {
    chapterTrigger: 23,
    label: '詰問と告白',
    sub: '詰問と告白',
    startHint: '医者は下段中央で父を診る。祖父が縦4の柱、母がL字で父の枕元、書生・兄も伸長',
    clearTitle: '─ そっと、外へ ─',
    countUnit: '手で外を望めり',
    clearText: '呪術の真相が、障子越しに告げられる。\nそっと、外へ ── まことの母の名を胸に。',
    goal: { x: 2, y: 6 },  // 絶対ルール
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 丁稚 / 下女 / 娘 / 書生L字3 / 娘継続）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 2, y: 0 },   // 丁稚(1)
      { id: 'servant_1',    type: 'SERVANT',      x: 3, y: 0 },   // 下女(1)
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      { id: 'student_jl',   type: 'STUDENT_JL',   x: 2, y: 1 },   // ★書生 L字3マス（(2,1)(3,1)(2,2)）
      // Row 2-4（兄縦3 / 番頭縦3 / 叔母横3 / 手代 / 客人 / 祖父縦4 / 子犬 / 客人 / 下女 / 犬）
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 0, y: 2 },   // ★丁稚(2) Stage23_2で兄1×3→兄1×2+丁稚に分割
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 3 },   // ★兄 1×2縦（(0,3)-(0,4)）
      { id: 'clerk_v',      type: 'CLERK_V',      x: 1, y: 2 },   // 番頭 1×3縦（(1,2)-(1,4)）
      { id: 'aunt_l',       type: 'AUNT_L',       x: 3, y: 2 },   // ★叔母 3×1横（(3,2)-(5,2)）
      { id: 'assistant',    type: 'ASSISTANT',    x: 2, y: 3 },   // 手代
      { id: 'merchant_1',   type: 'MERCHANT',     x: 3, y: 3 },   // 客人(1)
      { id: 'gfather_v4',   type: 'GFATHER_V4',   x: 4, y: 3 },   // ★祖父 1×4縦（(4,3)-(4,6)）
      { id: 'puppy_1',      type: 'PUPPY',        x: 5, y: 3 },   // 子犬(1)
      { id: 'merchant_2',   type: 'MERCHANT',     x: 2, y: 4 },   // 客人(2)
      { id: 'servant_2',    type: 'SERVANT',      x: 3, y: 4 },   // 下女(2)
      { id: 'dog',          type: 'DOG',          x: 5, y: 4 },   // 犬
      // Row 5-7（妹横2 / 母L字3 / 子犬 / 父L字3下 / 弟横2 / 女中L字3 / 医者 / 助手）
      { id: 'sister_h',     type: 'SISTER_H',     x: 0, y: 5 },   // 妹 2×1横（(0,5)(1,5)）
      { id: 'mother_jb',    type: 'MOTHER_JB',    x: 2, y: 5 },   // ★母 L字3マス（(2,5)(3,5)(3,6)）
      { id: 'puppy_2',      type: 'PUPPY',        x: 5, y: 5 },   // 子犬(2)
      { id: 'father_l3b',   type: 'FATHER_L3B',   x: 0, y: 6, roleOverride: 'fixed' },   // ★父 L字3マス下（(0,6)(0,7)(1,7)）★病で人事不省、動かせない
      { id: 'brother_h',    type: 'BROTHER_H',    x: 1, y: 6 },   // 弟 2×1横（(1,6)(2,6)）
      { id: 'maid_l',       type: 'MAID_L',       x: 5, y: 6 },   // ★女中 1×2縦（(5,6)(5,7)）Stage23_2で L字3→1×2に縮小
      { id: 'servant_3',    type: 'SERVANT',      x: 4, y: 7 },   // ★下女(3) Stage23_2で 女中の代わりに配置
      { id: 'doctor',       type: 'DOCTOR',       x: 2, y: 7 },   // ★医者
      { id: 'doctor_a',     type: 'DOCTOR_A',     x: 3, y: 7 }    // ★助手
    ]
  },
  // ─ Stage 24：第廿肆夜「業火と門越え」 ── 6×8、25駒（最終ステージ）
  //   兄が祭壇の蝋燭を倒し、油に引火。屋敷は業火に包まれる。書生が座牢の錠を断ち切り、
  //   娘の手を強く引く。親指を隠さず、両手を夜空に差し出し、門の敷居を踏み越える。
  //   ★炎 (FLAME) 初登場 (1,2)：20手ごとに隣接ピースを引火、既引火ピースは内部で燃え広がる
  //   ★娘の全マス引火でゲームオーバー（脱出失敗、再ビ試ミル/物語ノ始マリヘ）
  //   父 (0,6) は roleOverride:'fixed' 継続（病で人事不省、動かせず炎に呑まれる）
  //   新規駒 4種：STUDENT_JT、CLERK_JT、MERCHANT_H、MOTHER_L
  24: {
    chapterTrigger: 24,
    label: '業火と門越え',
    sub: '業火と門越え',
    startHint: '炎が20手ごとに広がる。娘が全マス燃える前に、下段中央へ辿り着け',
    clearTitle: '─ 門ヲ越エル ─',
    countUnit: '手で外へ辿リ着ケリ',
    clearText: '門の敷居を、ついに踏み越えた。\n火の粉が夜空に舞い、両の親指はもう、隠さぬ。',
    goal: { x: 2, y: 6 },  // 絶対ルール：goal.y = grid.h - 2 = 6
    grid: { w: 6, h: 8 },
    pieces: [
      // Row 0-1（LID / 丁稚 / 書生J字（右上+下段2）/ 娘）
      { id: 'lid',          type: 'LID',          x: 0, y: 0 },
      { id: 'apprentice_1', type: 'APPRENTICE',   x: 2, y: 0 },   // 丁稚(1)
      { id: 'student_jt',   type: 'STUDENT_JT',   x: 2, y: 0 },   // ★書生 J字3マス（(3,0)(2,1)(3,1)、穴=(2,0)=丁稚）
      { id: 'daughter',     type: 'DAUGHTER',     x: 4, y: 0 },
      // Row 2-3（兄縦 / 炎 / 番頭J字 / 下女 / 丁稚 / 下女 / 叔母横3）
      { id: 'prodigal_v',   type: 'PRODIGAL_V',   x: 0, y: 2 },   // 兄 1×2縦（(0,2)-(0,3)）
      { id: 'flame_1',      type: 'FLAME',        x: 1, y: 2 },   // ★炎(1) 1×1 移動可
      { id: 'clerk_jt',     type: 'CLERK_JT',     x: 2, y: 2 },   // ★番頭 J字3マス（(2,2)(3,2)(2,3)、穴=(3,3)=叔母）
      { id: 'servant_1',    type: 'SERVANT',      x: 4, y: 2 },   // 下女(1)
      { id: 'aunt_jt',      type: 'AUNT_JT',      x: 4, y: 2 },   // ★叔母 J字4マス（(5,2)(4,3)(5,3)、穴=(4,2)=下女(1)）Stage24-2で AUNT_L → AUNT_JT に変更
      { id: 'servant_2',    type: 'SERVANT',      x: 1, y: 3 },   // 下女(2)
      { id: 'apprentice_2', type: 'APPRENTICE',   x: 3, y: 3 },   // ★丁稚(2) Stage24-2で (5,2)→(3,3) 移動
      // Row 4-5（妹縦 / 弟縦 / 客人横2 / 下女 / 子犬 / 母横3 / 犬）
      { id: 'sister_l',     type: 'SISTER_L',     x: 0, y: 4 },   // 妹 1×2縦（(0,4)-(0,5)）
      { id: 'brother_v',    type: 'BROTHER_V',    x: 1, y: 4 },   // 弟 1×2縦（(1,4)-(1,5)）
      { id: 'merchant_h',   type: 'MERCHANT_H',   x: 2, y: 4 },   // ★客人 2×1横（(2,4)(3,4)）
      { id: 'servant_3',    type: 'SERVANT',      x: 4, y: 4 },   // 下女(3)
      { id: 'puppy_1',      type: 'PUPPY',        x: 5, y: 4 },   // 子犬(1)
      { id: 'mother_l',     type: 'MOTHER_L',     x: 2, y: 5 },   // ★母 3×1横（(2,5)-(4,5)）
      { id: 'dog',          type: 'DOG',          x: 5, y: 5 },   // 犬
      // Row 6-7（父縦(病)/ 助手 / 医者 / 祖父2×2 / 女中縦 / 子犬 / 丁稚）
      { id: 'father',       type: 'FATHER',       x: 0, y: 6, roleOverride: 'fixed' },  // ★父 1×2縦 動けない（病継続、Stage23_2から継承）
      { id: 'assistant',    type: 'ASSISTANT',    x: 1, y: 6 },   // 手代
      { id: 'gfather_ll',   type: 'GFATHER_LL',   x: 2, y: 6 },   // 祖父 2×2 solid（(2,6)-(3,7)）
      { id: 'maid_l',       type: 'MAID_L',       x: 4, y: 6 },   // 女中 1×2縦（(4,6)-(4,7)）
      { id: 'puppy_2',      type: 'PUPPY',        x: 5, y: 6 },   // 子犬(2)
      { id: 'doctor',       type: 'DOCTOR',       x: 1, y: 7 },   // 医者
      { id: 'apprentice_3', type: 'APPRENTICE',   x: 5, y: 7 }    // 丁稚(3)
    ]
  }
};

// 章末発火マップを自動生成（各 stage.chapterTrigger が章 idx）
const PUZZLE_TRIGGER_MAP = {};
Object.entries(PUZZLE_STAGES).forEach(([num, st]) => {
  if (typeof st.chapterTrigger === 'number') {
    PUZZLE_TRIGGER_MAP[st.chapterTrigger] = parseInt(num, 10);
  }
});

window.PUZZLE_PIECE_DEFS = PUZZLE_PIECE_DEFS;
window.PUZZLE_STAGES = PUZZLE_STAGES;
window.PUZZLE_TRIGGER_MAP = PUZZLE_TRIGGER_MAP;
