// セーブ機能 v2（localStorage）
// 【拡張】ADV進行状態＋パズル中断状態を統合して保存可能に
//   data = {
//     chapterIdx, tapIdx, pageIdx,       // ADV進行位置
//     puzzleState: {                      // パズル中断中の場合のみ存在
//       stageNum: N,
//       pieces: [{id, x, y}, ...],
//       moveCount: N,
//       gameState: 'locked'|'playing'
//     }
//   }
(function(global) {
  'use strict';
  const KEY = 'oyayubikakushi_save_v2';
  const OLD_KEY = 'oyayubikakushi_save_v1';  // 旧版互換
  const SCORES_KEY = 'oyayubikakushi_scores_v1';  // ★ステージ別最少手数記録（章選択画面表示用）

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { console.warn('Save failed:', e); return false; }
  }
  function load() {
    try {
      let raw = localStorage.getItem(KEY);
      if (!raw) raw = localStorage.getItem(OLD_KEY);  // v1互換
      return raw ? JSON.parse(raw) : null;
    } catch (e) { console.warn('Load failed:', e); return null; }
  }
  function clear() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(OLD_KEY);
      return true;
    } catch (e) { return false; }
  }
  function exists() { return load() !== null; }

  // ★パズル中断状態だけをマージして保存
  function savePuzzleState(puzzleState) {
    const cur = load() || {};
    cur.puzzleState = puzzleState;
    return save(cur);
  }
  // ★パズル中断状態だけをクリア（クリア成功時など）
  function clearPuzzleState() {
    const cur = load();
    if (cur && cur.puzzleState) {
      delete cur.puzzleState;
      return save(cur);
    }
    return true;
  }
  // ★パズル中断中か判定
  function hasPuzzleInProgress() {
    const s = load();
    return !!(s && s.puzzleState && s.puzzleState.stageNum);
  }

  // ★ステージ別最少手数記録（章選択画面で「最少 N 手」表示用）
  //   { stageNum: bestMoveCount, ... } の形で localStorage に永続化
  function loadStageScores() {
    try {
      const raw = localStorage.getItem(SCORES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { console.warn('loadStageScores failed:', e); return {}; }
  }
  function saveStageScore(stageNum, moveCount) {
    try {
      const cur = loadStageScores();
      const key = String(stageNum);
      // 最少手数を保持（既存より少ない場合のみ更新）
      if (!(key in cur) || moveCount < cur[key]) {
        cur[key] = moveCount;
        localStorage.setItem(SCORES_KEY, JSON.stringify(cur));
        return true;
      }
      return false;
    } catch (e) { console.warn('saveStageScore failed:', e); return false; }
  }
  function clearStageScores() {
    try { localStorage.removeItem(SCORES_KEY); return true; }
    catch (e) { return false; }
  }

  global.SaveEngine = {
    save, load, clear, exists, savePuzzleState, clearPuzzleState, hasPuzzleInProgress,
    saveStageScore, loadStageScores, clearStageScores
  };
})(window);
