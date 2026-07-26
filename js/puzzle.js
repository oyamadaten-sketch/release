// 親指隠シと座牢のムスメ ─ パズル・エンジン v3（バグ修正＋メタ表現除去）
const PuzzleGame = (function() {
  'use strict';

  let state = {
    stageNum: 1, stage: null, pieces: [],
    gridW: 6, gridH: 5, cellSize: 50,
    gameState: 'locked',
    moveCount: 0, dragInfo: null, onClear: null
  };

  function $(id) { return document.getElementById(id); }
  function getDef(p) { return window.PUZZLE_PIECE_DEFS[p.type]; }
  // 重要：駒を id で常に最新状態から取得（クロージャの古い参照を使わない）
  function getCurrentPiece(pid) {
    return state.pieces.find(p => p.id === pid);
  }

  function buildOccupiedMap(pieces, excludeId) {
    const map = [];
    for (let y = 0; y < state.gridH; y++) map.push(new Array(state.gridW).fill(null));
    for (const p of pieces) {
      if (excludeId && p.id === excludeId) continue;
      const def = getDef(p);
      for (let dy = 0; dy < def.h; dy++) {
        for (let dx = 0; dx < def.w; dx++) {
          // shape あればマスクで判定、無ければ w×h 全部
          if (def.shape && !def.shape[dy][dx]) continue;
          if (p.y + dy < state.gridH && p.x + dx < state.gridW) {
            map[p.y + dy][p.x + dx] = p.id;
          }
        }
      }
    }
    return map;
  }

  function canMove(piece, dx, dy, occMap) {
    const def = getDef(piece);
    // ★piece.roleOverride があれば駒定義の role より優先（Stage23/24 の病父など）
    const effectiveRole = piece.roleOverride || def.role;
    if (effectiveRole === 'fixed') return false;  // ★固定駒（手形など）は絶対に移動不可
    const nx = piece.x + dx, ny = piece.y + dy;
    if (nx < 0 || nx + def.w > state.gridW) return false;
    if (ny < 0 || ny + def.h > state.gridH) return false;
    for (let py = 0; py < def.h; py++) {
      for (let px = 0; px < def.w; px++) {
        if (def.shape && !def.shape[py][px]) continue;  // shape=0のマスは判定スキップ
        if (occMap[ny + py][nx + px] !== null) return false;
      }
    }
    return true;
  }

  function calcCellSize() {
    const wrap = $('puz-board-wrap');
    if (!wrap) return 50;
    const availW = wrap.clientWidth - 40;
    const availH = wrap.clientHeight - 40;
    const sizeW = Math.floor(availW / state.gridW);
    const sizeH = Math.floor(availH / state.gridH);
    return Math.max(40, Math.min(sizeW, sizeH, 84));
  }

  function renderBoard() {
    const board = $('puz-board');
    if (!board) return;
    state.cellSize = calcCellSize();
    board.style.width = (state.gridW * state.cellSize) + 'px';
    board.style.height = (state.gridH * state.cellSize) + 'px';

    // 玄関：ゴール列直下にゴール幅と同じサイズで配置（パズル枠外）
    const genkan = $('puz-genkan');
    if (genkan && state.stage) {
      genkan.style.width  = (2 * state.cellSize) + 'px';
      genkan.style.height = (2 * state.cellSize) + 'px';
      // ゴールが中央なので、margin で水平位置をゴール列に揃える
      // ゴールの中央 = (goal.x + 1) * cellSize、盤面中央 = gridW * cellSize / 2
      const goalCenterX = (state.stage.goal.x + 1) * state.cellSize;
      const boardCenterX = state.gridW * state.cellSize / 2;
      const offsetX = goalCenterX - boardCenterX;
      genkan.style.marginLeft = (offsetX * 2) + 'px';  // flex中央寄せの調整
    }

    const goalEl = board.querySelector('.puz-goal');
    if (goalEl) {
      goalEl.style.left = (state.stage.goal.x * state.cellSize) + 'px';
      goalEl.style.top  = (state.stage.goal.y * state.cellSize) + 'px';
      goalEl.style.width  = (2 * state.cellSize) + 'px';
      goalEl.style.height = (2 * state.cellSize) + 'px';
    }

    // ★下枠(bl/br)の幅を goal.x 位置に応じて動的計算
    //   - 玄関開口部は「常に goal.x 列に 2cell 幅」（外へ通じる出口の視覚表現）
    //   - goal.y の位置に依らず、下枠には常に開口部が存在する（設計仕様）
    const frameBl = board.querySelector('.puz-frame-bl');
    const frameBr = board.querySelector('.puz-frame-br');
    if (frameBl && frameBr && state.stage) {
      const goal = state.stage.goal;
      const blW = goal.x * state.cellSize + 14;                           // 左枠：0〜goal.x 列
      const brW = (state.gridW - (goal.x + 2)) * state.cellSize + 14;     // 右枠：goal.x+2〜末端
      frameBl.style.width = blW + 'px';
      frameBr.style.width = brW + 'px';
    }

    // 座牢ラベル（娘の初期位置 = top-right）
    let zaroLabel = board.querySelector('.puz-zaro-label');
    if (!zaroLabel) {
      zaroLabel = document.createElement('div');
      zaroLabel.className = 'puz-zaro-label';
      zaroLabel.textContent = '座牢';
      board.appendChild(zaroLabel);
    }
    zaroLabel.style.left = (4 * state.cellSize) + 'px';
    zaroLabel.style.top  = '0px';
    zaroLabel.style.width  = (2 * state.cellSize) + 'px';
    zaroLabel.style.height = (2 * state.cellSize) + 'px';
    zaroLabel.style.fontSize = Math.floor(state.cellSize * 0.55) + 'px';

    // ★shape 駒のセルを生成する関数（親 el 直下に構築、listener は各セルに毎回アタッチ）
    //   cellSize が変わったら再生成する必要があるため、関数化して再利用可能に
    function buildShapeCells(el, def, pid) {
      // 既存セルを完全消去（再生成の場合）
      el.querySelectorAll('.puz-piece-cell').forEach(c => c.remove());
      const isOutside = (dx, dy) => {
        if (dy < 0 || dy >= def.h || dx < 0 || dx >= def.w) return true;
        return !def.shape[dy][dx];
      };
      const INSET = 2, B = 2, R = 4;
      for (let dy = 0; dy < def.h; dy++) {
        for (let dx = 0; dx < def.w; dx++) {
          if (!def.shape[dy][dx]) continue;
          const topOut    = isOutside(dx, dy - 1);
          const bottomOut = isOutside(dx, dy + 1);
          const leftOut   = isOutside(dx - 1, dy);
          const rightOut  = isOutside(dx + 1, dy);
          const cell = document.createElement('div');
          cell.className = 'puz-piece-cell';
          cell.style.position = 'absolute';
          const cellLeft = dx * state.cellSize + (leftOut ? INSET : 0);
          const cellTop  = dy * state.cellSize + (topOut  ? INSET : 0);
          const cellW = state.cellSize - (leftOut ? INSET : 0) - (rightOut  ? INSET : 0);
          const cellH = state.cellSize - (topOut  ? INSET : 0) - (bottomOut ? INSET : 0);
          cell.style.left   = cellLeft + 'px';
          cell.style.top    = cellTop  + 'px';
          cell.style.width  = cellW + 'px';
          cell.style.height = cellH + 'px';
          const grainOffX = -dx * state.cellSize;
          const grainOffY = -dy * state.cellSize;
          cell.style.background =
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 9px) ' + grainOffX + 'px ' + grainOffY + 'px,' +
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 14px) ' + grainOffX + 'px ' + grainOffY + 'px,' +
            def.bg;
          cell.style.borderTop    = topOut    ? (B + 'px solid rgba(0,0,0,0.35)') : '0';
          cell.style.borderBottom = bottomOut ? (B + 'px solid rgba(0,0,0,0.35)') : '0';
          cell.style.borderLeft   = leftOut   ? (B + 'px solid rgba(0,0,0,0.35)') : '0';
          cell.style.borderRight  = rightOut  ? (B + 'px solid rgba(0,0,0,0.35)') : '0';
          cell.style.borderTopLeftRadius     = (topOut && leftOut)     ? R + 'px' : '0';
          cell.style.borderTopRightRadius    = (topOut && rightOut)    ? R + 'px' : '0';
          cell.style.borderBottomLeftRadius  = (bottomOut && leftOut)  ? R + 'px' : '0';
          cell.style.borderBottomRightRadius = (bottomOut && rightOut) ? R + 'px' : '0';
          cell.style.boxSizing = 'border-box';
          cell.style.pointerEvents = 'auto';
          cell.addEventListener('pointerdown', (e) => onPointerDown(e, pid));
          cell.addEventListener('pointerup',   (e) => onPointerUp(e, pid));
          cell.addEventListener('pointercancel', () => { state.dragInfo = null; });
          el.appendChild(cell);
        }
      }
    }

    // ★孤児 DOM 掃除：state.pieces に存在しない .puz-piece を削除（再発防止）
    const validPids = new Set(state.pieces.map(p => p.id));
    board.querySelectorAll('.puz-piece').forEach(el => {
      const pid = el.dataset.pid;
      if (!pid || !validPids.has(pid)) el.remove();
    });

    state.pieces.forEach(p => {
      const def = getDef(p);
      let el = board.querySelector('[data-pid="' + p.id + '"]');
      const pid = p.id;
      if (!el) {
        el = document.createElement('div');
        el.className = 'puz-piece role-' + def.role + (def.shape ? ' shape-piece' : '') + (p.type === 'HANDPRINT' ? ' handprint-piece' : '') + (p.type === 'GMOTHER_SICK' ? ' gmother-sick-piece' : '') + (p.type === 'ALTAR' ? ' altar-piece' : '') + (p.type === 'FLAME' ? ' flame-piece' : '') + (p.roleOverride === 'fixed' ? ' piece-immobile' : '');
        el.dataset.pid = p.id;
        el.style.color = def.fg;
        if (def.shape) {
          el.style.pointerEvents = 'none';
          el.dataset.cellSize = String(state.cellSize);
          buildShapeCells(el, def, pid);
        } else {
          el.style.background = def.bg;
        }
        // LID 駒のみ縦書き3段タイトル、それ以外は通常ラベル
        if (p.type === 'LID') {
          const lt = document.createElement('div');
          lt.className = 'lid-title';
          lt.innerHTML =
            '<div class="lid-title-col">親指隠シと</div>' +
            '<div class="lid-title-col">座牢の</div>' +
            '<div class="lid-title-col accent">ムスメ</div>';
          el.appendChild(lt);
        } else {
          const label = document.createElement('span');
          label.className = 'puz-piece-label';
          label.textContent = (p.type === 'DAUGHTER' && state.gameState !== 'locked') ? 'ムスメ' : def.label;
          label.style.fontSize = def.size + 'px';
          // shape 駒の場合、ラベル位置を決定（labelPos 優先 → shape 重心）
          if (def.shape) {
            let cx, cy;
            if (Array.isArray(def.labelPos)) {
              // 駒定義側で指定された相対座標（マス単位、例：[1, 1.5] = 下段中央）
              cx = def.labelPos[0];
              cy = def.labelPos[1];
            } else {
              // shape の重心座標（マス単位）を計算
              let sumX = 0, sumY = 0, cnt = 0;
              for (let dy = 0; dy < def.h; dy++) {
                for (let dx = 0; dx < def.w; dx++) {
                  if (def.shape[dy][dx]) { sumX += dx + 0.5; sumY += dy + 0.5; cnt++; }
                }
              }
              cx = cnt > 0 ? sumX / cnt : def.w / 2;
              cy = cnt > 0 ? sumY / cnt : def.h / 2;
            }
            label.style.position = 'absolute';
            label.style.left = (cx * state.cellSize) + 'px';
            label.style.top  = (cy * state.cellSize) + 'px';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.zIndex = '2';
            label.style.pointerEvents = 'none';
          }
          el.appendChild(label);
        }
        // ★イベントには外側の pid（p.id）を使用（内側で再宣言すると TDZ 違反）
        el.addEventListener('pointerdown', (e) => onPointerDown(e, pid));
        el.addEventListener('pointerup', (e) => onPointerUp(e, pid));
        el.addEventListener('pointercancel', () => { state.dragInfo = null; });
        board.appendChild(el);
      } else {
        const label = el.querySelector('.puz-piece-label');
        if (label && p.type === 'DAUGHTER') {
          label.textContent = state.gameState === 'locked' ? '娘' : 'ムスメ';
        }
      }
      if (def.shape) {
        // ★cellSize が変化していたらセルを再生成（resize 時の描画残骸を防ぐ）
        const storedSize = el.dataset.cellSize ? parseFloat(el.dataset.cellSize) : 0;
        if (storedSize !== state.cellSize) {
          buildShapeCells(el, def, pid);
          el.dataset.cellSize = String(state.cellSize);
        }
        // shape 駒は「真グリッド全体」に親要素を合わせ、各セルが自前で外周インセットを持つ
        el.style.width  = (def.w * state.cellSize) + 'px';
        el.style.height = (def.h * state.cellSize) + 'px';
        el.style.left   = (p.x * state.cellSize) + 'px';
        el.style.top    = (p.y * state.cellSize) + 'px';
      } else {
        el.style.width  = (def.w * state.cellSize - 4) + 'px';
        el.style.height = (def.h * state.cellSize - 4) + 'px';
        el.style.left   = (p.x * state.cellSize + 2) + 'px';
        el.style.top    = (p.y * state.cellSize + 2) + 'px';
      }

      if (state.gameState === 'locked' && p.type !== 'LID') {
        el.classList.add('disabled');
      } else if (state.gameState === 'cleared' || state.gameState === 'gameover') {
        el.classList.add('disabled');
      } else {
        el.classList.remove('disabled');
      }

      // ★引火オーバーレイ描画：burnedCells の各マスに .burn-overlay を配置
      //   FLAME駒自身は元々炎なので追加しない
      renderBurnOverlays(el, p, def);
    });

    const ids = state.pieces.map(p => p.id);
    Array.from(board.querySelectorAll('.puz-piece')).forEach(el => {
      if (!ids.includes(el.dataset.pid) && !el.classList.contains('removing')) {
        el.classList.add('removing');
        setTimeout(() => el.remove(), 700);
      }
    });

    const cnt = $('puz-count');
    if (cnt) cnt.textContent = state.moveCount + ' 手';
  }

  function onPointerDown(e, pid) {
    if (state.gameState === 'cleared') return;
    const piece = getCurrentPiece(pid);
    if (!piece) return;
    if (state.gameState === 'locked' && piece.type !== 'LID') return;
    const def = getDef(piece);
    // ★piece.roleOverride 優先
    const effectiveRole = piece.roleOverride || def.role;
    if (effectiveRole === 'fixed') return;  // ★固定駒（手形など・病父など）はタップ・ドラッグ開始不可
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch(_) {}
    state.dragInfo = { x: e.clientX, y: e.clientY, pid: pid, pointerId: e.pointerId };
  }

  function onPointerUp(e, pid) {
    if (!state.dragInfo || state.dragInfo.pid !== pid) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(_) {}
    const dx = e.clientX - state.dragInfo.x;
    const dy = e.clientY - state.dragInfo.y;
    state.dragInfo = null;
    // ★必ず最新の駒を取得
    const piece = getCurrentPiece(pid);
    if (!piece) return;

    if (piece.type === 'LID' && state.gameState === 'locked') {
      const el = $('puz-board').querySelector('[data-pid="' + piece.id + '"]');
      if (el) el.classList.add('lid-removing');
      setTimeout(() => {
        state.pieces = state.pieces.filter(p => p.id !== piece.id);
        state.gameState = 'playing';
        $('puz-hint').textContent = '娘を中央下へ';
        renderBoard();
      }, 700);
      return;
    }

    if (state.gameState !== 'playing') return;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      handleTap(piece);
      return;
    }

    let mvx = 0, mvy = 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      mvx = dx > 0 ? 1 : -1;
    } else {
      mvy = dy > 0 ? 1 : -1;
    }
    const occ = buildOccupiedMap(state.pieces, piece.id);
    if (canMove(piece, mvx, mvy, occ)) {
      executeMove(piece, mvx, mvy);
    } else {
      shake();
    }
  }

  function handleTap(piece) {
    const occ = buildOccupiedMap(state.pieces, piece.id);
    const dirs = [{dx:0,dy:1},{dx:0,dy:-1},{dx:-1,dy:0},{dx:1,dy:0}];
    const valid = dirs.filter(d => canMove(piece, d.dx, d.dy, occ));
    if (valid.length === 1) {
      executeMove(piece, valid[0].dx, valid[0].dy);
    } else if (valid.length === 0) {
      shake();
    } else {
      flash('ドラッグで方向を指定');
    }
  }

  function executeMove(piece, dx, dy) {
    state.pieces = state.pieces.map(p => p.id === piece.id ? { ...p, x: p.x + dx, y: p.y + dy } : p);
    state.moveCount++;
    // ★Stage 24 火事ギミック：20手ごとに引火＋燃え広がり
    if (state.moveCount > 0 && state.moveCount % 20 === 0) {
      processFireTick();
    }
    renderBoard();
    checkWin();
    // ★娘の全マス引火でゲームオーバー判定
    checkGameOver();
  }

  // 引火オーバーレイ描画：ピース el の burnedCells 各マスに .burn-overlay を配置
  //   - solid 駒：el 内に .burn-overlay 子要素を絶対配置
  //   - shape 駒：既存 .puz-piece-cell に data-key 属性を付与し、対応セルに .burning class を付ける
  //   - FLAME は自身が炎なので何もしない
  function renderBurnOverlays(el, p, def) {
    if (!p.burnedCells || p.burnedCells.length === 0) {
      // 引火なし → 既存オーバーレイ削除
      el.querySelectorAll(':scope > .burn-overlay').forEach(o => o.remove());
      el.querySelectorAll(':scope > .puz-piece-cell.burning').forEach(c => c.classList.remove('burning'));
      return;
    }
    if (p.type === 'FLAME') return;  // 炎自身は元々炎

    if (def.shape) {
      // shape 駒：セル要素に dataset.key 付いていなければ付与、burning class 切替
      const cells = el.querySelectorAll(':scope > .puz-piece-cell');
      // 各セルに座標データを付与（既存なら上書き）
      const cellByKey = {};
      let i = 0;
      for (let dy = 0; dy < def.h; dy++) {
        for (let dx = 0; dx < def.w; dx++) {
          if (def.shape && !def.shape[dy][dx]) continue;
          const cell = cells[i++];
          if (cell) {
            const key = dx + ',' + dy;
            cell.dataset.key = key;
            cellByKey[key] = cell;
          }
        }
      }
      // burning class 切替
      cells.forEach(c => c.classList.remove('burning'));
      for (const key of p.burnedCells) {
        if (cellByKey[key]) cellByKey[key].classList.add('burning');
      }
    } else {
      // solid 駒：既存オーバーレイ削除→再作成（burnedCells のみ）
      el.querySelectorAll(':scope > .burn-overlay').forEach(o => o.remove());
      for (const key of p.burnedCells) {
        const [dx, dy] = key.split(',').map(Number);
        const ov = document.createElement('div');
        ov.className = 'burn-overlay';
        ov.style.position = 'absolute';
        ov.style.left = (dx * state.cellSize) + 'px';
        ov.style.top  = (dy * state.cellSize) + 'px';
        ov.style.width  = state.cellSize + 'px';
        ov.style.height = state.cellSize + 'px';
        ov.style.pointerEvents = 'none';
        el.appendChild(ov);
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 火事ギミック（Stage 24 専用、FLAME 駒がなければ何もしない）
  // ══════════════════════════════════════════════════════

  // 駒の全有効マス（"dx,dy" 文字列配列、shape あれば 1 のマスのみ）
  function getPieceCells(p) {
    const def = getDef(p);
    const cells = [];
    for (let dy = 0; dy < def.h; dy++) {
      for (let dx = 0; dx < def.w; dx++) {
        if (def.shape && !def.shape[dy][dx]) continue;
        cells.push(dx + ',' + dy);
      }
    }
    return cells;
  }

  // 駒が全マス引火済みか
  function isFullyBurned(p) {
    const all = getPieceCells(p);
    const burned = p.burnedCells || [];
    return all.every(c => burned.indexOf(c) >= 0);
  }

  // 駒の一つの未引火マスをランダムに引火させる（該当駒 obj を返却）
  function igniteRandomCell(p) {
    const all = getPieceCells(p);
    const burned = p.burnedCells || [];
    const remaining = all.filter(c => burned.indexOf(c) < 0);
    if (remaining.length === 0) return p;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    p.burnedCells = burned.concat([pick]);
    return p;
  }

  // 駒に面接（上下左右）する他ピース一覧（FLAME自身除外、重複除去）
  function getAdjacentPieces(piece) {
    const def = getDef(piece);
    const adjIds = new Set();
    const occ = buildOccupiedMap(state.pieces, null);
    for (let dy = 0; dy < def.h; dy++) {
      for (let dx = 0; dx < def.w; dx++) {
        if (def.shape && !def.shape[dy][dx]) continue;
        const cx = piece.x + dx, cy = piece.y + dy;
        const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= state.gridW || ny < 0 || ny >= state.gridH) continue;
          const nid = occ[ny][nx];
          if (nid && nid !== piece.id) adjIds.add(nid);
        }
      }
    }
    return Array.from(adjIds).map(id => state.pieces.find(p => p.id === id)).filter(Boolean);
  }

  // 20手ごとに呼ばれる：
  //   Phase 1：既に引火した各ピースは1マス内部拡散
  //   Phase 2：全火源（FLAMEマス + 引火中キャラの燃焼マス）から隣接ピースへ引火
  //   ★tick開始時点の snapshot を火源として使う ─ Phase 1の内部拡散マスは同tick内では火源に含めない
  //   ★引火セルは「火源に接した特定マス」を選ぶ（ターゲット全体からランダムではない）
  //     複数の火源に接する場合は、その候補マスからランダムで1マスだけ引火
  function processFireTick() {
    // ★snapshot：tick開始時点の burnedCells を保存
    const snapshot = state.pieces.map(p => ({
      id: p.id,
      burnedCells: (p.burnedCells || []).slice()
    }));

    // ★Phase 1：既に引火しているピース内で燃え広がる（ランダム1マス）
    for (const p of state.pieces) {
      if (p.burnedCells && p.burnedCells.length > 0 && !isFullyBurned(p)) {
        igniteRandomCell(p);
      }
    }

    // ★Phase 2：火源から隣接ピースの特定マスへ引火
    //   igniteCandidates: pieceId => Set of cellKey（火源に隣接する未引火マスの候補）
    const igniteCandidates = {};  // { pieceId: Set<cellKey> }
    const occ = buildOccupiedMap(state.pieces, null);

    for (const src of snapshot) {
      const sourceP = state.pieces.find(pp => pp.id === src.id);
      if (!sourceP) continue;

      // 火源マスの決定
      let sourceCells = [];
      if (sourceP.type === 'FLAME') {
        sourceCells = getPieceCells(sourceP);  // FLAMEは全マスが火源
      } else if (src.burnedCells.length > 0) {
        sourceCells = src.burnedCells;  // 引火中キャラはsnapshot時点の燃焼マス
      } else {
        continue;
      }

      // 各火源マスの4方向隣接をチェック → ターゲットピースの「その隣接マス」を候補に追加
      for (const key of sourceCells) {
        const [dx, dy] = key.split(',').map(Number);
        const fx = sourceP.x + dx, fy = sourceP.y + dy;
        const neighbors = [[fx-1, fy], [fx+1, fy], [fx, fy-1], [fx, fy+1]];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= state.gridW || ny < 0 || ny >= state.gridH) continue;
          const nid = occ[ny][nx];
          if (!nid || nid === sourceP.id) continue;
          const target = state.pieces.find(p => p.id === nid);
          if (!target || target.type === 'FLAME') continue;  // FLAME自身は対象外
          if (isFullyBurned(target)) continue;

          // ★ターゲット側の該当マス（nx, ny を target 相対座標に変換）
          const targetCellKey = (nx - target.x) + ',' + (ny - target.y);
          // 既に引火中のマスならスキップ（snapshot時点で既に燃えていたなら候補外）
          const targetSnap = snapshot.find(s => s.id === nid);
          if (targetSnap && targetSnap.burnedCells.indexOf(targetCellKey) >= 0) continue;

          if (!igniteCandidates[nid]) igniteCandidates[nid] = new Set();
          igniteCandidates[nid].add(targetCellKey);
        }
      }
    }

    // 各ターゲットピースの候補マスからランダムで1マスだけ引火（隣接マス限定）
    for (const pid in igniteCandidates) {
      const p = state.pieces.find(pp => pp.id === pid);
      if (!p || isFullyBurned(p)) continue;
      const cellKeys = Array.from(igniteCandidates[pid]);
      // 既に引火中のマスは除外（Phase 1で追加されたマスも含めて）
      const remaining = cellKeys.filter(k => !p.burnedCells || p.burnedCells.indexOf(k) < 0);
      if (remaining.length === 0) continue;
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      if (!p.burnedCells) p.burnedCells = [];
      p.burnedCells.push(pick);
    }
  }

  // ゲームオーバー判定：娘の全マス引火
  function checkGameOver() {
    if (state.gameState === 'cleared' || state.gameState === 'gameover') return;
    const daughter = state.pieces.find(p => p.type === 'DAUGHTER');
    if (!daughter) return;
    if (isFullyBurned(daughter)) {
      state.gameState = 'gameover';
      setTimeout(showGameOver, 400);
    }
  }

  function checkWin() {
    const d = state.pieces.find(p => p.type === 'DAUGHTER');
    if (!d) return;
    if (d.x === state.stage.goal.x && d.y === state.stage.goal.y) {
      state.gameState = 'cleared';
      // ★クリア手数を記録（最少手数を保持、章選択画面表示用）
      if (window.SaveEngine && typeof window.SaveEngine.saveStageScore === 'function') {
        window.SaveEngine.saveStageScore(state.stageNum, state.moveCount);
      }
      setTimeout(showClear, 600);
    }
  }

  function showClearOverlay() {
    const overlay = $('puz-clear');
    // ★扉レイヤーは .fadeout（#000背景）のまま保持。remove すると背景が transparent に戻り
    //   一瞬パズル盤面が透けて見えるため、次画面遷移時（btn-puz-next クリック時）にまとめてリセット。
    if (overlay) {
      // タイトル（ステージごとに段階変化、未定義なら序盤標準）
      const titleEl = overlay.querySelector('.puz-clear-title');
      if (titleEl) {
        titleEl.textContent = state.stage.clearTitle || '─ そっと、外へ ─';
      }
      // 本文：ADVと同じ改行ロジック（行頭禁則・コピュラ保護）を適用
      let text = state.stage.clearText;
      if (window.TextEngine && typeof TextEngine.paginate === 'function') {
        const pages = TextEngine.paginate(text);
        text = pages[0] || text;
      }
      $('puz-clear-text').textContent = text;
      // 手数表記（ステージごとに段階変化）
      const unit = state.stage.countUnit || '手で外を望めり';
      $('puz-clear-count').textContent = '── ' + state.moveCount + ' ' + unit + ' ──';
      overlay.classList.add('visible');
    }
  }

  // クリア演出：娘吸い込み → 横開きガラス戸が開く → 白光 → 暗転 → クリアオーバーレイ
  function showClear() {
    const board = $('puz-board');
    const layer = $('puz-door-layer');
    const doorL = $('puz-door-left');
    const doorR = $('puz-door-right');
    const light = $('puz-door-light');

    // 演出要素が無い場合は即時オーバーレイ表示（フォールバック）
    if (!layer || !doorL || !doorR || !light || !board || !state.stage) {
      showClearOverlay();
      return;
    }

    // 1. 娘ピースを「玄関へ吸い込まれる」アニメで消す
    const daughterEl = board.querySelector('[data-pid="daughter"]');
    if (daughterEl) daughterEl.classList.add('sucked-in');

    setTimeout(() => {
      // 2. 扉のサイズと位置を「画面全体」に拡張（パズル画面全体を覆う）
      const layerW = layer.offsetWidth;
      const layerH = layer.offsetHeight;
      const halfW = layerW / 2;

      doorL.style.left   = '0px';
      doorL.style.top    = '0px';
      doorL.style.width  = halfW + 'px';
      doorL.style.height = layerH + 'px';

      doorR.style.left   = halfW + 'px';
      doorR.style.top    = '0px';
      doorR.style.width  = halfW + 'px';
      doorR.style.height = layerH + 'px';

      light.style.left   = '0px';
      light.style.top    = '0px';
      light.style.width  = layerW + 'px';
      light.style.height = layerH + 'px';

      // 3. 扉レイヤー表示（フェードイン＋スケール拡大、約0.5秒）
      layer.classList.add('visible');

      // 4. スライド開始（500ms後、フェードインが落ち着いてから）
      setTimeout(() => layer.classList.add('opening'), 600);

      // 5. 白光放射（スライドほぼ完了の1.2秒後）
      setTimeout(() => layer.classList.add('flash'), 1700);

      // 6. 暗転（500ms後）
      setTimeout(() => layer.classList.add('fadeout'), 2200);

      // 7. クリアオーバーレイ（500ms後）
      setTimeout(() => showClearOverlay(), 2800);
    }, 400);
  }

  // ゲームオーバー演出：扉がバンッと閉まり、暗転、ダイアログ表示
  function showGameOver() {
    const board = $('puz-board');
    const layer = $('puz-door-layer');
    const doorL = $('puz-door-left');
    const doorR = $('puz-door-right');
    const overlay = $('puz-gameover');

    // フォールバック：演出要素が無ければ即オーバーレイ表示
    if (!layer || !doorL || !doorR || !board || !overlay) {
      if (overlay) overlay.classList.add('visible');
      return;
    }

    // 1. 扉のサイズ・位置を「画面全体」に拡張し、外側から手前へ（閉じる位置）に配置
    const layerW = layer.offsetWidth;
    const layerH = layer.offsetHeight;
    const halfW = layerW / 2;

    // 開始位置：両扉とも画面外（左扉は左外、右扉は右外）
    doorL.style.left   = '-' + halfW + 'px';
    doorL.style.top    = '0px';
    doorL.style.width  = halfW + 'px';
    doorL.style.height = layerH + 'px';

    doorR.style.left   = layerW + 'px';
    doorR.style.top    = '0px';
    doorR.style.width  = halfW + 'px';
    doorR.style.height = layerH + 'px';

    // 2. 扉レイヤー表示（背景 transparent、扉のみ画面外にある状態）
    layer.classList.add('visible');
    layer.classList.add('slamming');  // slam 用の class（CSS 側で transition を高速化）

    // 3. 扉スライドイン（100ms 後、両扉が中央へ勢いよく衝突）
    setTimeout(() => {
      doorL.style.left = '0px';
      doorR.style.left = halfW + 'px';
    }, 100);

    // 4. 衝突時ショック：盤面をシェイク＋暗転（500ms 後）
    setTimeout(() => {
      if (board) {
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 200);
      }
      layer.classList.add('fadeout');  // 暗転
    }, 500);

    // 5. ダイアログ表示（900ms 後）
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 900);
  }

  // ゲームオーバー UI 側のリセット（リトライ or タイトルへ戻る時）
  function resetGameOverUI() {
    const layer = $('puz-door-layer');
    const overlay = $('puz-gameover');
    if (layer) layer.classList.remove('visible', 'opening', 'flash', 'fadeout', 'slamming');
    if (overlay) overlay.classList.remove('visible');
  }

  // クリアオーバーレイ閉じ＋次へ時に演出をリセット
  function resetDoorAnimation() {
    const layer = $('puz-door-layer');
    if (!layer) return;
    layer.classList.remove('visible', 'opening', 'flash', 'fadeout');
  }

  function shake() {
    const board = $('puz-board');
    if (!board) return;
    board.classList.add('shake');
    setTimeout(() => board.classList.remove('shake'), 200);
  }

  function flash(msg) {
    const el = $('puz-hint');
    if (!el) return;
    const old = el.textContent;
    el.textContent = msg;
    el.classList.add('flash');
    setTimeout(() => { el.textContent = old; el.classList.remove('flash'); }, 1500);
  }

  function start(stageNum, opts) {
    state.stageNum = stageNum;
    state.stage = window.PUZZLE_STAGES[stageNum];
    if (!state.stage) {
      if (opts && opts.onClear) opts.onClear();
      return;
    }
    state.gridW = state.stage.grid.w;
    state.gridH = state.stage.grid.h;
    // ★burnedCells は "dx,dy" 文字列の配列（Stage 24 火事ギミック用）
    state.pieces = state.stage.pieces.map(p => ({ ...p, burnedCells: [] }));
    state.gameState = 'locked';
    state.moveCount = 0;
    state.dragInfo = null;
    state.onClear = (opts && opts.onClear) ? opts.onClear : null;

    // ★駒配置sanity check：範囲外・衝突を検出して console.error（開発中の設計ミス即発見用）
    (function sanityCheck() {
      const grid = [];
      for (let y=0; y<state.gridH; y++) grid.push(new Array(state.gridW).fill(null));
      let errCount = 0;
      for (const p of state.pieces) {
        const d = window.PUZZLE_PIECE_DEFS[p.type];
        if (!d) { console.error('[PuzzleGame] Stage'+stageNum+' MISSING DEF for type='+p.type+' (id='+p.id+')'); errCount++; continue; }
        for (let dy=0; dy<d.h; dy++) for (let dx=0; dx<d.w; dx++) {
          // ★shape 駒は shape[dy][dx]=0 のマスをスキップ（穴に他駒が入るのを許容）
          if (d.shape && !d.shape[dy][dx]) continue;
          const x = p.x+dx, y = p.y+dy;
          if (x >= state.gridW || y >= state.gridH || x < 0 || y < 0) {
            console.error('[PuzzleGame] Stage'+stageNum+' OUT OF BOUNDS: '+p.id+' ('+p.type+' '+d.w+'x'+d.h+') at ('+x+','+y+')'); errCount++;
          } else if (grid[y][x]) {
            console.error('[PuzzleGame] Stage'+stageNum+' COLLIDE: '+p.id+' vs '+grid[y][x]+' at ('+x+','+y+')'); errCount++;
          } else {
            grid[y][x] = p.id;
          }
        }
      }
      if (errCount > 0) {
        const hint = document.getElementById('puz-hint');
        if (hint) hint.textContent = '[STAGE'+stageNum+' 設計エラー '+errCount+'件 コンソール参照]';
      }
    })();

    // ★btn-puz-next クリックハンドラを毎回上書きし、cb をクロージャで束縛
    //   （state.onClear 経由だと参照タイミング問題が起きるので直接束縛する）
    const cbClear = state.onClear;
    const btnNext = $('btn-puz-next');
    if (btnNext) {
      btnNext.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        console.log('[PuzzleGame] btn-puz-next fired (stage=' + stageNum + ', cb=' + (typeof cbClear) + ')');
        const ov = $('puz-clear');
        if (ov) ov.classList.remove('visible');
        resetDoorAnimation();
        const pz = $('puzzle-screen');
        if (pz) pz.classList.remove('active');
        if (typeof cbClear === 'function') {
          try { cbClear(); } catch (e) { console.error('[PuzzleGame] cb error:', e); }
        } else if (window.showTitleScreenExt) {
          window.showTitleScreenExt();
        }
      };
    }
    // DEV用：擬似クリア発動 ─ 娘を目標地点に瞬間移動 → 通常の扉演出＆リザルト画面へ
    //   （リザルトも含めてスキップしていた旧仕様を修正：v20260712av〜）
    const btnDevSkip = $('btn-puz-dev-skip');
    if (btnDevSkip) {
      btnDevSkip.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        if (state.gameState === 'cleared' || state.gameState === 'gameover') return;
        console.log('[PuzzleGame][DEV] skip → simulate clear (stage=' + stageNum + ')');
        // 娘を目標地点へワープ（吸い込まれ演出が自然に見えるように）
        //   ─ 他ピースと衝突しても DEV 用なのでOK。renderBoard は showClear 側でしない。
        const daughter = state.pieces.find(function(p){ return p.type === 'DAUGHTER'; });
        if (daughter && state.stage) {
          state.pieces = state.pieces.map(function(p){
            return p.id === daughter.id
              ? Object.assign({}, p, { x: state.stage.goal.x, y: state.stage.goal.y })
              : p;
          });
          renderBoard();
        }
        state.gameState = 'cleared';
        // showClear() が扉演出→白光→暗転→リザルトオーバーレイまで通常通り再生する
        setTimeout(showClear, 300);
      };
    }

    // ★ゲームオーバーUIボタン：リトライ（同ステージ再スタート）／物語ノ始マリヘ（タイトル戻る）
    const btnRetry = $('btn-puz-retry');
    if (btnRetry) {
      btnRetry.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        console.log('[PuzzleGame] retry fired (stage=' + stageNum + ')');
        resetGameOverUI();
        start(stageNum, { onClear: cbClear });
      };
    }
    const btnBackTitle = $('btn-puz-title-back');
    if (btnBackTitle) {
      btnBackTitle.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        console.log('[PuzzleGame] back to title fired (stage=' + stageNum + ')');
        resetGameOverUI();
        const pz = $('puzzle-screen');
        if (pz) pz.classList.remove('active');
        if (window.showTitleScreenExt) window.showTitleScreenExt();
      };
    }

    $('puz-stage-label').textContent = state.stage.label;
    $('puz-stage-sub').textContent = state.stage.sub;
    $('puz-hint').textContent = state.stage.startHint || '';
    $('puz-count').textContent = '0 手';

    const clear = $('puz-clear');
    if (clear) clear.classList.remove('visible');
    // 扉演出をリセット
    const layer = $('puz-door-layer');
    if (layer) layer.classList.remove('visible', 'opening', 'flash', 'fadeout', 'slamming');
    // ★ゲームオーバーUIもリセット
    const gameover = $('puz-gameover');
    if (gameover) gameover.classList.remove('visible');
    // イントロオーバーレイは廃止（即座に盤面表示）
    const intro = $('puz-intro');
    if (intro) intro.classList.remove('visible');

    const board = $('puz-board');
    if (board) {
      Array.from(board.querySelectorAll('.puz-piece')).forEach(el => el.remove());
    }
    setTimeout(renderBoard, 50);
  }

  function reset() {
    console.log('[PuzzleGame] reset() called, stageNum=' + state.stageNum + ', hasStage=' + !!state.stage + ', gameState=' + state.gameState);
    if (!state.stage) {
      console.warn('[PuzzleGame] reset() aborted: state.stage is null');
      return;
    }
    // ドラッグ中の状態を強制クリア（reset中に古いドラッグ情報が残らないよう）
    state.dragInfo = null;
    // 盤面DOMを念のため全消去（start内でもやるが二重の防御）
    const board = $('puz-board');
    if (board) {
      Array.from(board.querySelectorAll('.puz-piece')).forEach(el => el.remove());
    }
    // クリア/扉オーバーレイも念のためリセット
    const clear = $('puz-clear');
    if (clear) clear.classList.remove('visible');
    resetDoorAnimation();
    // start() で state を再構築
    start(state.stageNum, { onClear: state.onClear });
    console.log('[PuzzleGame] reset() done: pieces=' + state.pieces.length + ', gameState=' + state.gameState);
  }

  // ★中断セーブから復帰：保存された駒配置・手数を復元
  function startFromSave(savedState, opts) {
    console.log('[PuzzleGame] startFromSave stage=' + savedState.stageNum);
    state.stageNum = savedState.stageNum;
    state.stage = window.PUZZLE_STAGES[savedState.stageNum];
    if (!state.stage) {
      if (opts && opts.onClear) opts.onClear();
      return;
    }
    state.gridW = state.stage.grid.w;
    state.gridH = state.stage.grid.h;
    // ★復元：ステージ定義から静的属性 (roleOverride など) を取得し、
    //   セーブされた動的属性 (x,y,burnedCells) で上書き
    //   ─ これにより Stage 23/24 の病父 roleOverride: 'fixed' や
    //     Stage 24 の火事状態 burnedCells も正しく復元される
    state.pieces = savedState.pieces.map(sp => {
      const origP = state.stage.pieces.find(p => p.id === sp.id) || {};
      return Object.assign(
        {},
        origP,                                 // roleOverride 等の静的属性
        sp,                                    // セーブされた x/y/type/id で上書き
        { burnedCells: (sp.burnedCells || []).slice() }  // 引火状態を明示的に復元
      );
    });
    state.gameState = savedState.gameState || 'playing';
    state.moveCount = savedState.moveCount || 0;
    state.dragInfo = null;
    state.onClear = (opts && opts.onClear) ? opts.onClear : null;

    // btn-puz-next / btn-puz-dev-skip のonclick再登録（start()と同じ処理）
    const cbClear = state.onClear;
    const btnNext = $('btn-puz-next');
    if (btnNext) {
      btnNext.onclick = function(ev) {
        if (ev) ev.stopPropagation();
        const ov = $('puz-clear');
        if (ov) ov.classList.remove('visible');
        resetDoorAnimation();

        const pz = $('puzzle-screen');
        if (pz) pz.classList.remove('active');
        if (typeof cbClear === 'function') { try { cbClear(); } catch(e) { console.error(e); } }
      };
    }

    $('puz-stage-label').textContent = state.stage.label;
    $('puz-stage-sub').textContent = (state.stage.sub || '') + ' (続きから)';
    $('puz-hint').textContent = '中断した続きから';
    $('puz-count').textContent = state.moveCount + ' 手';

    const clear = $('puz-clear');
    if (clear) clear.classList.remove('visible');
    const layer = $('puz-door-layer');
    if (layer) layer.classList.remove('visible', 'opening', 'flash', 'fadeout');

    const board = $('puz-board');
    if (board) Array.from(board.querySelectorAll('.puz-piece')).forEach(el => el.remove());
    setTimeout(renderBoard, 50);
  }

  return {
    start, reset, startFromSave,
    boot() {
      console.warn('[PuzzleGame] BOOT ENTERED v3-delegation'); // ← 必ず出るはず（見えたら最新版が動作中）
      window.addEventListener('resize', () => {
        if (state.stage && state.gameState !== 'cleared') renderBoard();
      });
      const btnBack = $('btn-puz-back');
      if (btnBack) btnBack.onclick = () => {
        if (confirm('中断してタイトルへ戻りますか？（進行状況はセーブされます）')) {
          if (state.stage && window.SaveEngine) {
            const puzzleState = {
              stageNum: state.stageNum,
              // ★駒の動的状態を保存：位置(x,y) と 引火状態(burnedCells)
              //   ─ roleOverride 等の静的属性は startFromSave 側でステージ定義から復元
              pieces: state.pieces.map(p => ({
                id: p.id,
                type: p.type,
                x: p.x,
                y: p.y,
                burnedCells: (p.burnedCells || []).slice()   // ★Stage 24 火事状態の保存
              })),
              moveCount: state.moveCount,
              gameState: state.gameState
            };
            window.SaveEngine.savePuzzleState(puzzleState);
          }
          if (window.showTitleScreenExt) window.showTitleScreenExt();
        }
      };
      const btnReset = $('btn-puz-reset');
      if (btnReset) {
        console.log('[PuzzleGame] boot: reset ボタンハンドラ登録（単一ソース設計）');
        // 「単一ソース設計」：
        //   - reset 発火経路は document click capture delegation ひとつだけ
        //   - 直接 onclick / element addEventListener は登録しない（多重発火の原因）
        //   - delegation は overlay 遮蔽下でも発火するため defense-in-depth も兼ねる
        //   - 500ms dedup で ダブルクリック連打の防止
        const doReset = () => {
          const isDev = document.body.classList.contains('dev-mode');
          if (isDev || confirm('盤面を初期状態に戻しますか？')) {
            reset();
          } else {
            console.log('[PuzzleGame] reset cancelled by user');
          }
        };
        let _lastResetFire = 0;
        document.addEventListener('click', function(ev) {
          const t = ev.target;
          if (!t) return;
          const hit = (t.id === 'btn-puz-reset') || (t.closest && t.closest('#btn-puz-reset'));
          if (!hit) return;
          ev.stopPropagation();
          ev.preventDefault();
          const now = Date.now();
          if (now - _lastResetFire < 500) {
            console.log('[PuzzleGame] reset dedup: 500ms 以内の連打をスキップ');
            return;
          }
          _lastResetFire = now;
          console.log('[PuzzleGame] reset button clicked (isDev=' + document.body.classList.contains('dev-mode') + ')');
          doReset();
        }, true);
      } else {
        console.error('[PuzzleGame] boot: btn-puz-reset 要素が見つからない！');
      }
      // 診断用：pointerdown で reset ボタン領域の遮蔽検出
      document.addEventListener('pointerdown', function(ev) {
        var pz = document.getElementById('puzzle-screen');
        if (!pz || !pz.classList.contains('active')) return;
        var btn = document.getElementById('btn-puz-reset');
        if (!btn) return;
        var r = btn.getBoundingClientRect();
        var inRect = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        if (inRect) {
          var t = ev.target;
          console.warn('[DIAG] pointerdown at reset rect. target=', t.tagName, t.id || '(none)');
          if (t !== btn && !(t.closest && t.closest('#btn-puz-reset'))) {
            console.error('[DIAG] 遮蔽検出! reset ボタン領域に別要素:', t);
          }
        }
      }, true);
      console.warn('[PuzzleGame] BOOT COMPLETE v3-delegation');
    }
  };
})();

// ★重要：const 宣言は window に自動登録されないため明示的に global 公開する（main.js が window.PuzzleGame をチェック）
window.PuzzleGame = PuzzleGame;
