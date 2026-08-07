// 親指隠シと座牢のムスメ ─ メインロジック v1.3
'use strict';

// ★章番号ズレ解消（v20260712az〜）：scenarios_all.js のタイトル(idx 1='第一章'〜idx 24='第二十四章')と完全一致
//   旧：idx 1 が '第零章' で始まっており、実際の物語 idx とラベルが1ずれていた
const CHAPTER_META = {
  0:{label:'導入',sub:'古き家と古き呪'}, 1:{label:'第一章',sub:'月の昏き夜の踏み出し'},
  2:{label:'第二章',sub:'座牢の朝'}, 3:{label:'第三章',sub:'廊下の声と書斎の対峙'},
  4:{label:'第四章',sub:'商人の影'}, 5:{label:'第五章',sub:'測る眼'},
  6:{label:'第六章',sub:'会釈と祭壇の影'}, 7:{label:'第七章',sub:'障子越しの問い'},
  8:{label:'第八章',sub:'共謀の夜'}, 9:{label:'第九章',sub:'庭の骸と祭壇の影'},
  10:{label:'第十章',sub:'座敷の怒号と蔵の影'}, 11:{label:'第十一章',sub:'燈下の影'},
  12:{label:'第十二章',sub:'蔵の文字と兄の油'}, 13:{label:'第十三章',sub:'手形の符号'},
  14:{label:'第十四章',sub:'障子越しの視線'}, 15:{label:'第十五章',sub:'煙管の音'},
  16:{label:'第十六章',sub:'贈り物'}, 17:{label:'第十七章',sub:'梁の影'},
  18:{label:'第十八章',sub:'紅き廊下と祭壇の前'}, 19:{label:'第十九章',sub:'病床'},
  20:{label:'第二十章',sub:'嫁入りと囁き'}, 21:{label:'第二十一章',sub:'祖母の手'},
  22:{label:'第二十二章',sub:'葬列と発作'}, 23:{label:'第二十三章',sub:'詰問と告白'},
  24:{label:'第二十四章',sub:'業火と門越え'}, 25:{label:'終幕',sub:'円環'}
};
// ★英訳版章メタ（言語切替対応）
const CHAPTER_META_EN = {
  0:{label:'Prologue',sub:'The Old House and the Ancient Curse'},
  1:{label:'Chapter I',sub:'A Step into the Moonless Night'},
  2:{label:'Chapter II',sub:'Morning in the Cell'},
  3:{label:'Chapter III',sub:"Voices in the Hall, the Study's Confrontation"},
  4:{label:'Chapter IV',sub:"The Merchant's Shadow"},
  5:{label:'Chapter V',sub:'Measuring Eyes'},
  6:{label:'Chapter VI',sub:"A Bow and the Altar's Shadow"},
  7:{label:'Chapter VII',sub:'A Question Through the Shoji'},
  8:{label:'Chapter VIII',sub:'The Night of Conspiracy'},
  9:{label:'Chapter IX',sub:"The Corpse in the Garden, the Altar's Shadow"},
  10:{label:'Chapter X',sub:"The Parlor's Roar, the Storehouse's Shadow"},
  11:{label:'Chapter XI',sub:'Shadow Beneath the Lamp'},
  12:{label:'Chapter XII',sub:"Letters in the Storehouse, the Brother's Oil"},
  13:{label:'Chapter XIII',sub:'The Sign of the Handprint'},
  14:{label:'Chapter XIV',sub:'A Gaze Through the Shoji'},
  15:{label:'Chapter XV',sub:'The Sound of the Kiseru'},
  16:{label:'Chapter XVI',sub:'The Gift'},
  17:{label:'Chapter XVII',sub:'Shadow on the Beam'},
  18:{label:'Chapter XVIII',sub:'The Crimson Hall, Before the Altar'},
  19:{label:'Chapter XIX',sub:'Sickbed'},
  20:{label:'Chapter XX',sub:'Marriage and Whispers'},
  21:{label:'Chapter XXI',sub:"Grandmother's Hand"},
  22:{label:'Chapter XXII',sub:'The Funeral Procession and the Seizure'},
  23:{label:'Chapter XXIII',sub:'Interrogation and Confession'},
  24:{label:'Chapter XXIV',sub:'Hellfire and the Gate Beyond'},
  25:{label:'Epilogue',sub:'The Circle'}
};
// ★現在言語に応じた章メタを取得
function getChapterMeta(idx) {
  const isEn = document.body && document.body.classList.contains('lang-en');
  const src = isEn ? CHAPTER_META_EN : CHAPTER_META;
  return src[idx];
}

let chapterIdx = 0, tapIdx = 0, pageIdx = 0;
let pages = [];
let activeLayer = 'a';
let currentImgUrl = '';
let mode = 'normal';

function $(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

function bootLogo() {
  const bar = $('logo-bar'), status = $('logo-status');
  let ready = false;
  const initial = SCENARIOS_V8.slice(0, 2);
  const urls = [];
  initial.forEach(ch => ch.taps.forEach(t => { if (t.img) urls.push(t.img); }));
  const total = urls.length;
  if (total === 0) { bar.style.width='100%'; ready=true; status.textContent='SYSTEM READY.  TAP TO START.'; return; }
  let loaded = 0;
  function done() {
    loaded++;
    const pct = Math.round(loaded / total * 100);
    bar.style.width = pct + '%';
    if (loaded >= total) {
      setTimeout(() => { ready = true; status.textContent = 'SYSTEM READY.  TAP TO START.'; }, 300);
    } else { status.textContent = 'LOADING...  ' + pct + '%'; }
  }
  urls.forEach(u => ImageLoader.loadImage(u).then(done).catch(done));
  setTimeout(() => { if (!ready) { ready=true; bar.style.width='100%'; status.textContent='SYSTEM READY.  TAP TO START.'; }}, 8000);
  // ★ロゴ画面全体のクリックで進む（ただし設定ボタンは除外）
  $('logo-screen').onclick = (ev) => {
    if (ev.target && ev.target.closest('.logo-settings')) return;  // 設定ボタン領域は無視
    if (ready) startIntroAdv();
  };

  // ★セグメント式言語トグル（日本語 | English、現在言語がハイライト）
  const langBtnJa = $('btn-lang-ja');
  const langBtnEn = $('btn-lang-en');
  function updateLangUI() {
    const cur = (window.I18n && I18n.current) || 'ja';
    if (langBtnJa) langBtnJa.classList.toggle('active', cur === 'ja');
    if (langBtnEn) langBtnEn.classList.toggle('active', cur === 'en');
  }
  updateLangUI();
  async function switchLang(target, ev) {
    if (ev) ev.stopPropagation();
    if (!window.I18n) return;
    if (I18n.current === target) return;  // 同じ言語なら何もしない
    await I18n.setLocale(target);
    updateLangUI();
    if (typeof buildHowToPieceTable === 'function') buildHowToPieceTable();
    // ★言語切替時に章選択リストを再生成（章名の英/日切替反映）
    if (typeof buildSelectList === 'function') buildSelectList();
    // ★シナリオ画面が表示中なら現在ページを再描画（英/日切替反映）
    if (document.getElementById('scenario-screen') &&
        document.getElementById('scenario-screen').classList.contains('active') &&
        typeof renderTap === 'function') {
      try { renderTap(); } catch(e) { console.warn('[lang] renderTap error:', e); }
    }
    console.log('[lang] switched to:', target);
  }
  if (langBtnJa) langBtnJa.onclick = (ev) => switchLang('ja', ev);
  if (langBtnEn) langBtnEn.onclick = (ev) => switchLang('en', ev);

  // ★音量設定パネル（🔊 アイコンで開閉、BGM/SE スライダー+ミュート）
  const btnAudio = $('btn-audio-settings');
  const audioPanel = $('audio-panel');
  const sliderBgm = $('slider-bgm');
  const sliderSe  = $('slider-se');
  const bgmVal    = $('slider-bgm-val');
  const seVal     = $('slider-se-val');
  const chkMute   = $('chk-mute');
  const audioIcon = $('audio-icon');
  function updateAudioIcon() {
    if (!audioIcon) return;
    if (!window.GameAudio) return;
    audioIcon.textContent = GameAudio.muted ? '🔇' : '🔊';
  }
  if (window.GameAudio) {
    if (sliderBgm) sliderBgm.value = Math.round(GameAudio.bgmVol * 100);
    if (sliderSe)  sliderSe.value  = Math.round(GameAudio.seVol * 100);
    if (bgmVal)    bgmVal.textContent = sliderBgm ? sliderBgm.value : '50';
    if (seVal)     seVal.textContent  = sliderSe  ? sliderSe.value  : '70';
    if (chkMute)   chkMute.checked = GameAudio.muted;
    updateAudioIcon();
  }
  if (btnAudio && audioPanel) {
    btnAudio.onclick = (ev) => {
      ev.stopPropagation();
      audioPanel.classList.toggle('open');
    };
    // パネル外クリックで閉じる
    document.addEventListener('click', (ev) => {
      if (!audioPanel.classList.contains('open')) return;
      if (audioPanel.contains(ev.target) || btnAudio.contains(ev.target)) return;
      audioPanel.classList.remove('open');
    });
  }
  if (sliderBgm) sliderBgm.oninput = () => {
    if (bgmVal) bgmVal.textContent = sliderBgm.value;
    if (window.GameAudio) GameAudio.setBgmVolume(parseInt(sliderBgm.value, 10) / 100);
  };
  if (sliderSe) sliderSe.oninput = () => {
    if (seVal) seVal.textContent = sliderSe.value;
    if (window.GameAudio) GameAudio.setSeVolume(parseInt(sliderSe.value, 10) / 100);
  };
  if (chkMute) chkMute.onchange = () => {
    if (window.GameAudio) GameAudio.setMuted(chkMute.checked);
    updateAudioIcon();
  };

  // ★ロゴ画面のBGM開始（BGM-01 = 導入ADVで使うが、まずタイトル画面BGM-05を鳴らす）
  //   ロゴ画面はロゴだけの静的画面なので、BGM-05（タイトル画面）を先行再生してもOK
  //   → 実際にはユーザーが画面をタップ→startIntroAdv でBGM-01に切替、が流れる
  if (window.GameAudio) {
    // ロゴ画面到達時点で自動再生を試みる（ジェスチャー待ちなら受信後に再生）
    GameAudio.playBgm('BGM-05');
  }
}

function startIntroAdv() {
  mode = 'intro';
  chapterIdx = 0; tapIdx = 0; pageIdx = 0;
  currentImgUrl = '';
  if (window.GameAudio) GameAudio.playBgm('BGM-01');  // 導入ADV BGM
  $('img-layer-a').innerHTML = ''; $('img-layer-a').classList.remove('visible');
  $('img-layer-b').innerHTML = ''; $('img-layer-b').classList.remove('visible');
  activeLayer = 'a';
  $('btn-sc-back').textContent = (window.I18n && I18n.loaded) ? I18n.t('buttons.skipIntro') : '▶ 導入を飛ばす';
  // intro時は右側の章スキップボタンは非表示（同じ機能なので重複解消）
  const skipBtn = $('btn-sc-skip');
  if (skipBtn) skipBtn.style.visibility = 'hidden';
  showScreen('scenario-screen');
  renderTap();
}

// ★章に応じた ADV BGM を選択
function selectAdvBgm(chIdx) {
  // 章25（終幕）はエンディングBGM、それ以外は導入BGMを流用
  if (chIdx === 25) return 'BGM-06';
  return 'BGM-01';
}
// ★ステージに応じたパズルBGM
function selectPuzzleBgm(stageNum) {
  if (stageNum === 24) return 'BGM-04';       // 最終ステージ 業火
  if (stageNum === 13 || stageNum === 22) return 'BGM-03';  // 手形 or 祭壇
  return 'BGM-02';                            // 通常パズル
}
function showTitleScreen() {
  mode = 'normal';
  if (typeof hardClearImageLayers === 'function') hardClearImageLayers();
  showScreen('title-screen');
  if (window.GameAudio) GameAudio.playBgm('BGM-05');  // タイトル画面BGM
  const lid = $('lid'); const body = $('box-body');
  if (lid) lid.classList.remove('opened');
  if (body) body.classList.remove('visible');
  $('btn-continue').style.display = SaveEngine.exists() ? 'inline-block' : 'none';
}

function bootTitle() {
  function openLidThen(cb) {
    const lid = $('lid'); const body = $('box-body');
    if (body) body.classList.add('visible');
    lid.classList.add('opened');
    // 蓋の開き演出のみで即遷移（wood-box-bodyの「物語の始まり」演出は廃止）
    setTimeout(cb, 800);
  }
  $('btn-start').onclick = () => openLidThen(() => {
    SaveEngine.clear();
    chapterIdx = 1; tapIdx = 0; pageIdx = 0;
    // ゲーム開始：第零章ADVから開始（章末で第1パズル発火 → 第1章ADVへ）
    showChapterTitle(1, () => startScenario(1, 0, 0));
  });
  $('btn-continue').onclick = () => openLidThen(() => {
    const s = SaveEngine.load();
    if (!s) { showScreen('select-screen'); return; }
    // ★中断セーブがあればパズル画面から復帰
    if (s.puzzleState && s.puzzleState.stageNum) {
      console.log('[btn-continue] パズル中断状態から復帰 stage=' + s.puzzleState.stageNum);
      chapterIdx = s.chapterIdx || 1;
      hardClearImageLayers();
      showScreen('puzzle-screen');
      const savedChapterIdx = chapterIdx;
      PuzzleGame.startFromSave(s.puzzleState, {
        onClear: function() {
          console.log('[continue] Stage ' + s.puzzleState.stageNum + ' cleared');
          SaveEngine.clearPuzzleState();  // クリアしたので中断セーブ消去
          hardClearImageLayers();
          const nextIdx = savedChapterIdx + 1;
          if (nextIdx < SCENARIOS_V8.length) {
            chapterIdx = nextIdx; tapIdx = 0; pageIdx = 0; currentImgUrl = '';
            chapterTransitionInProgress = true;
            showChapterTitle(nextIdx, () => {
              chapterTransitionInProgress = false;
              if (mode === 'normal') SaveEngine.save({chapterIdx, tapIdx, pageIdx});
              showScreen('scenario-screen');
              renderTap();
            });
            setTimeout(() => { if (chapterTransitionInProgress) chapterTransitionInProgress = false; }, 3700);
          } else {
            SaveEngine.clear();
            showScreen('ending-screen');
          }
        }
      });
      return;
    }
    // ADV状態から復帰
    chapterIdx = s.chapterIdx || 1; tapIdx = s.tapIdx || 0; pageIdx = s.pageIdx || 0;
    startScenario(chapterIdx, tapIdx, pageIdx);
  });
  $('btn-select').onclick = () => openLidThen(() => showScreen('select-screen'));
  // ★遊び方 / How to Play 画面へ
  $('btn-howto').onclick = () => { buildHowToPieceTable(); showScreen('howto-screen'); };
  $('btn-howto-back').onclick = () => showTitleScreen();

  // DEV: パズル直接起動ボタン群（body.dev-mode でのみ表示される）
  document.querySelectorAll('#dev-puzzle-launcher button[data-stage]').forEach(function(btn) {
    btn.onclick = function(ev) {
      if (ev) ev.stopPropagation();
      const n = parseInt(btn.dataset.stage, 10);
      if (!isNaN(n)) devStartPuzzle(n);
    };
  });
  // DEV: 発火直前ADV(章)にジャンプするボタン群
  document.querySelectorAll('#dev-puzzle-launcher button[data-jumpch]').forEach(function(btn) {
    btn.onclick = function(ev) {
      if (ev) ev.stopPropagation();
      const idx = parseInt(btn.dataset.jumpch, 10);
      if (!isNaN(idx)) devJumpToChapter(idx);
    };
  });
}

// ★「遊戯方法 / How to Play」画面のピース一覧テーブルを生成
// 単言語表示：日本語版 = 日本語ラベルのみ、英語版 = 英語ラベルのみ
function buildHowToPieceTable() {
  const table = document.getElementById('howto-piece-table');
  if (!table) return;
  const isEn = document.body.classList.contains('lang-en');
  // 画像も言語で切替
  const img = document.getElementById('howto-board-img');
  if (img) img.src = 'assets/images/tutorial/board_' + (isEn ? 'en' : 'ja') + '.webp';
  const headLabel = isEn ? 'Piece' : '駒';
  const headMeaning = isEn ? 'Meaning' : '意味';

  // 全登場ピース（重複除去済）
  const PIECES = [
    {ja:'蓋',       en:'Lid',     meaningJa:'遊戯開始を告げる駒。<br>まず外さねば道は拓けぬ。', meaningEn:'The piece that heralds the start of play.<br>It must first be removed to open the way.', special:true},
    {ja:'娘',       en:'Girl',    meaningJa:'主人公。<br>玄関まで導かねばならぬ。', meaningEn:'The protagonist.<br>She must be led to the Threshold.', special:true},
    {ja:'父',       en:'Dad',     meaningJa:'娘の父。',                              meaningEn:'The girl’s father.'},
    {ja:'母',       en:'Mom',     meaningJa:'娘の母。',                              meaningEn:'The girl’s mother.'},
    {ja:'祖父',     en:'Papa',    meaningJa:'娘の祖父。',                            meaningEn:'The girl’s grandfather.'},
    {ja:'祖母',     en:'Nana',    meaningJa:'娘の祖母。',                            meaningEn:'The girl’s grandmother.'},
    {ja:'叔父',     en:'Uncle',   meaningJa:'娘の叔父。',                            meaningEn:'The girl’s uncle.'},
    {ja:'叔母',     en:'Aunt',    meaningJa:'娘の叔母。',                            meaningEn:'The girl’s aunt.'},
    {ja:'弟',       en:'Bro',     meaningJa:'娘の弟。',                              meaningEn:'The girl’s younger brother.'},
    {ja:'妹',       en:'Sis',     meaningJa:'娘の妹。',                              meaningEn:'The girl’s younger sister.'},
    {ja:'兄',       en:'Bro E.',  meaningJa:'家の風習を守りし兄。',                  meaningEn:'The elder brother who upholds the family customs.'},
    {ja:'番頭',     en:'Clerk',   meaningJa:'商家の統括役。',                        meaningEn:'The head clerk of the merchant house.'},
    {ja:'手代',     en:'Junior',  meaningJa:'番頭の下で働く若手。',                  meaningEn:'The junior clerk under the head clerk.'},
    {ja:'女中／下女', en:'Maid',    meaningJa:'住み込みの女中／下女。',                meaningEn:'The live-in housemaid.'},
    {ja:'書生',     en:'Pupil',   meaningJa:'住み込みで学ぶ書生。',                  meaningEn:'The live-in student.'},
    {ja:'丁稚',     en:'Boy',     meaningJa:'見習いの若者。',                        meaningEn:'The apprentice boy.'},
    {ja:'客人',     en:'Guest',   meaningJa:'商家を訪ねし客人。',                    meaningEn:'A guest visiting the merchant house.'},
    {ja:'医者',     en:'Doc',     meaningJa:'往診に訪れし医者。',                    meaningEn:'The visiting physician.'},
    {ja:'助手',     en:'Nurse',   meaningJa:'医者の助手。',                          meaningEn:'The physician’s assistant.'},
    {ja:'猫',       en:'Cat',     meaningJa:'家に住まう猫。',                        meaningEn:'The family cat.'},
    {ja:'犬',       en:'Dog',     meaningJa:'家に住まう犬。',                        meaningEn:'The family dog.'},
    {ja:'子犬',     en:'Pup',     meaningJa:'家に住まう子犬。',                      meaningEn:'The family puppy.'},
    {ja:'手形',     en:'Print',   meaningJa:'血の手形。動かぬ駒。',                  meaningEn:'A bloody handprint. A piece that cannot move.', special:true},
    {ja:'祭壇',     en:'Altar',   meaningJa:'祭壇。動かぬ駒。',                      meaningEn:'The altar. A piece that cannot move.', special:true},
    {ja:'炎',       en:'Fire',    meaningJa:'火事の炎。動くと燃え広がる。',          meaningEn:'The flame of a fire. Spreads with each move.', special:true},
  ];
  // テーブル全体を再構築（thead + tbody）
  table.innerHTML =
    '<thead><tr>' +
      '<th class="col-label-head">' + headLabel + '</th>' +
      '<th class="col-meaning-head">' + headMeaning + '</th>' +
    '</tr></thead>' +
    '<tbody id="howto-piece-tbody"></tbody>';
  const tbody = document.getElementById('howto-piece-tbody');
  PIECES.forEach(p => {
    const tr = document.createElement('tr');
    if (p.special) tr.className = 'piece-special';
    const label = isEn ? p.en : p.ja;
    const meaning = isEn ? p.meaningEn : p.meaningJa;
    tr.innerHTML =
      '<td class="col-label">' + label + '</td>' +
      '<td class="col-meaning">' + meaning + '</td>';
    tbody.appendChild(tr);
  });
}
window.buildHowToPieceTable = buildHowToPieceTable;

function buildSelectList() {
  const list = $('chapter-list');
  list.innerHTML = '';
  // ★ステージ別最少手数記録を読み込み（章対応するステージのクリア手数を章カードに表示）
  const scores = (window.SaveEngine && SaveEngine.loadStageScores) ? SaveEngine.loadStageScores() : {};
  const triggerMap = window.PUZZLE_TRIGGER_MAP || {};
  const hasI18n = window.I18n && I18n.loaded;
  const t = (key, vars) => hasI18n ? I18n.t(key, vars) : null;
  SCENARIOS_V8.forEach((ch, idx) => {
    const meta = getChapterMeta(idx) || {label: ch.title, sub: ''};
    // 章idx → 対応するパズルステージ番号（chapterTrigger マップから逆引き）
    const stageNum = triggerMap[idx];
    const bestScore = (stageNum && scores[String(stageNum)]) || null;
    const bestText = bestScore
      ? (t('select.bestMovesTemplate', {n: bestScore}) || ('── 最少 ' + bestScore + ' 手 ──'))
      : '';
    const scoreHtml = bestScore ? '<div class="score">' + bestText + '</div>' : '';
    const tapText = t('select.tapCountTemplate', {n: ch.taps.length}) || (ch.taps.length + 'タップ');
    const btn = document.createElement('button');
    btn.className = 'ch-card' + (bestScore ? ' cleared' : '');
    btn.innerHTML = '<div class="label">'+meta.label+'</div>' +
                    '<div class="sub">'+meta.sub+'</div>' +
                    '<div class="meta">'+tapText+'</div>' +
                    scoreHtml;
    btn.onclick = () => showChapterTitle(idx, () => startScenario(idx, 0, 0));
    list.appendChild(btn);
  });
  const chapters = SCENARIOS_V8.length;
  const taps = SCENARIOS_V8.reduce((s,c)=>s+c.taps.length,0);
  $('select-footer').textContent = t('select.footerTemplate', {chapters, taps}) || ('全 '+chapters+' 章 ／ 全 '+taps+' タップ');
  $('btn-select-back').onclick = () => showTitleScreen();
}

function showChapterTitle(idx, onComplete) {
  console.log('[showChapterTitle] START idx=' + idx);
  const meta = getChapterMeta(idx);
  if (!meta) { console.log('[showChapterTitle] meta なし → onComplete即実行'); if (onComplete) onComplete(); return; }
  hardClearImageLayers();
  // ★章タイトル表示と同時に該当章のADV BGMへクロスフェード
  //   （例：リザルト画面のBGM-07 → BGM-01。既存BGMなら再生継続）
  if (window.GameAudio) {
    const nextBgm = selectAdvBgm(idx);
    if (GameAudio.currentBgmId !== nextBgm) GameAudio.playBgm(nextBgm);
  }
  $('cto-label').textContent = meta.label;
  $('cto-sub').textContent = meta.sub;
  const overlay = $('chapter-title-overlay');
  overlay.classList.remove('active');
  void overlay.offsetWidth;
  overlay.classList.add('active');
  setTimeout(() => {
    console.log('[showChapterTitle] setTimeout発火 idx=' + idx + ' → onComplete呼び出し');
    overlay.classList.remove('active');
    try { if (onComplete) onComplete(); } catch(e) { console.error('[showChapterTitle] onComplete エラー:', e); }
  }, 3600);
}

function setImage(url) {
  if (url === currentImgUrl) return;
  const nextLayer = activeLayer === 'a' ? 'b' : 'a';
  const cur = $('img-layer-' + activeLayer);
  const nxt = $('img-layer-' + nextLayer);
  if (url) {
    nxt.innerHTML = '<img src="' + url + '" alt="" onerror="this.parentNode.innerHTML=\'<div class=nopict>[ 画像未配置: ' + url + ' ]</div>\'">';
  } else {
    nxt.innerHTML = '<div class="nopict">[ 画像IDなし ]</div>';
  }
  nxt.classList.add('visible');
  cur.classList.remove('visible');
  activeLayer = nextLayer;
  currentImgUrl = url;
}

function startScenario(idx, tap, page) {
  tap = tap || 0; page = page || 0;
  mode = 'normal';
  chapterIdx = idx; tapIdx = tap; pageIdx = page;
  if (window.GameAudio) GameAudio.playBgm(selectAdvBgm(idx));  // 章に応じたADV BGM
  ImageLoader.preloadForChapter(SCENARIOS_V8, idx);
  $('btn-sc-back').textContent = (window.I18n && I18n.loaded) ? I18n.t('buttons.backToChapters') : '← 章選択';
  // 通常モード時は右側の章スキップボタンを再表示
  const skipBtn = $('btn-sc-skip');
  if (skipBtn) skipBtn.style.visibility = '';
  showScreen('scenario-screen');
  currentImgUrl = '';
  $('img-layer-a').innerHTML = ''; $('img-layer-a').classList.remove('visible');
  $('img-layer-b').innerHTML = ''; $('img-layer-b').classList.remove('visible');
  activeLayer = 'a';
  renderTap();
}

// カウンタ表記：意味明快な「タップ番号のみ」表示に簡素化
// （以前は「3/4 · 2/2」で意味不明との指摘があったため、ページ番号は削除）
function renderCnt() {
  const ch = SCENARIOS_V8[chapterIdx];
  const cnt = $('sc-cnt');
  if (!cnt) return;
  cnt.innerHTML = '<span class="seg">' + (tapIdx+1) + '/' + ch.taps.length + '</span>';
  // DEV情報は画面ではなく Console のみに（没入阻害しないため）
  if (document.body.classList.contains('dev-mode')) {
    const info = devNextPuzzleInfo();
    if (info) console.log('[DEV] 現在 ch=' + chapterIdx + ' tap=' + (tapIdx+1) + '/' + ch.taps.length + ' | 次パズル発火 ch=' + info.chapterIdx + ' → S' + info.stageNum + '（あと' + info.remaining + '章）');
  }
}
function renderTap() {
  const ch = SCENARIOS_V8[chapterIdx];
  const tap = ch.taps[tapIdx];
  const isEn = document.body.classList.contains('lang-en');
  // ★言語別 pages を優先：英語版があれば pages_en、無ければ日本語 pages にフォールバック
  const enPages = Array.isArray(tap.pages_en) && tap.pages_en.length > 0 ? tap.pages_en : null;
  const jaPages = Array.isArray(tap.pages) && tap.pages.length > 0 ? tap.pages : null;
  const chosen = (isEn && enPages) ? enPages : (jaPages || null);
  if (chosen) {
    pages = chosen.slice();
  } else {
    // 従来通り自動改行（フォールバック）
    const text = (isEn && tap.text_en) ? tap.text_en : tap.text;
    pages = TextEngine.paginate(text);
  }
  if (pageIdx >= pages.length) pageIdx = 0;
  // 章タイトル表示はカット済（章冒頭のフルスクリーン表示で代替）
  const chLabel = $('sc-ch-label');
  if (chLabel) chLabel.textContent = '';
  renderCnt();
  $('sc-body').textContent = pages[pageIdx];
  setImage(tap.img || '');
  if (mode === 'normal') SaveEngine.save({chapterIdx, tapIdx, pageIdx});
}

// 章末に到達したときの次遷移（スキップボタンからも呼ばれる）
// 章タイトル表示中のスキップ連打防止フラグ
let chapterTransitionInProgress = false;

function jumpChapterEnd() {
  if (chapterTransitionInProgress) { console.log('[jumpChapterEnd] 章遷移中のためスキップ'); return; }
  const tm = window.PUZZLE_TRIGGER_MAP || {};
  const puzzleNum = tm[chapterIdx];
  console.log('[jumpChapterEnd] chapterIdx=' + chapterIdx + ' mode=' + mode + ' TRIGGER_MAP keys=[' + Object.keys(tm).join(',') + '] hit=' + puzzleNum);
  if (mode === 'intro') { showTitleScreen(); return; }
  if (puzzleNum) { console.log('  → startPuzzle(' + puzzleNum + ')'); startPuzzle(puzzleNum); return; }
  if (chapterIdx < SCENARIOS_V8.length - 1) {
    const nextIdx = chapterIdx + 1;
    console.log('  → 次章 idx=' + nextIdx + ' (chapterIdx即更新)');
    // ★ chapterIdx を即座に更新（従来は3.6s後に更新していたため、その間の連打で不整合発生）
    chapterIdx = nextIdx; tapIdx = 0; pageIdx = 0; currentImgUrl = '';
    chapterTransitionInProgress = true;
    ImageLoader.preloadForChapter(SCENARIOS_V8, nextIdx);
    showChapterTitle(nextIdx, () => {
      chapterTransitionInProgress = false;
      renderTap();
    });
    // safeguard: 3.7s後にflagが残っていたら強制解除（例外や描画不具合でロックしないため）
    setTimeout(() => { if (chapterTransitionInProgress) { console.warn('[safeguard] flag強制解除'); chapterTransitionInProgress = false; } }, 3700);
  } else {
    SaveEngine.clear();
    showScreen('ending-screen');
  }
}

// DEV：次のパズル発火位置までの残り章数を計算
function devNextPuzzleInfo() {
  const tm = window.PUZZLE_TRIGGER_MAP || {};
  const keys = Object.keys(tm).map(Number).sort((a,b)=>a-b);
  const nextKey = keys.find(k => k >= chapterIdx);
  if (nextKey === undefined) return null;
  return { chapterIdx: nextKey, stageNum: tm[nextKey], remaining: nextKey - chapterIdx };
}

function nextTap() {
  const ch = SCENARIOS_V8[chapterIdx];
  if (pageIdx < pages.length - 1) {
    const ta = $('sc-textarea');
    ta.classList.add('fading');
    setTimeout(() => {
      pageIdx++;
      $('sc-body').textContent = pages[pageIdx];
      renderCnt();
      ta.classList.remove('fading');
      if (mode === 'normal') SaveEngine.save({chapterIdx, tapIdx, pageIdx});
    }, 250);
  } else if (tapIdx < ch.taps.length - 1) {
    const ta = $('sc-textarea');
    ta.classList.add('fading');
    setTimeout(() => { tapIdx++; pageIdx = 0; renderTap(); ta.classList.remove('fading'); }, 250);
  } else {
    console.log('[nextTap] 章末到達 ch=' + chapterIdx + ' → jumpChapterEnd()');
    jumpChapterEnd();
  }
}

function prevTap() {
  if (pageIdx > 0) { pageIdx--; renderTap(); }
  else if (tapIdx > 0) { tapIdx--; pageIdx = 0; renderTap(); }
}

// DEV: 任意のパズルステージを直接起動（クリア/中断でタイトルに戻る）
function devStartPuzzle(stageNum) {
  console.log('[DEV] devStartPuzzle(' + stageNum + ')');
  hardClearImageLayers();
  showScreen('puzzle-screen');
  PuzzleGame.start(stageNum, {
    onClear: function() {
      console.log('[DEV] Stage ' + stageNum + ' cleared -> return to title');
      hardClearImageLayers();
      showTitleScreen();
    }
  });
}

// DEV: 指定パズル発火位置の章に直接ジャンプ（章冒頭からADVを進めるのに使う）
function devJumpToChapter(chapterTriggerIdx) {
  console.log('[DEV] devJumpToChapter(' + chapterTriggerIdx + ')');
  chapterIdx = chapterTriggerIdx; tapIdx = 0; pageIdx = 0;
  SaveEngine.save({chapterIdx, tapIdx, pageIdx});
  hardClearImageLayers();
  showChapterTitle(chapterTriggerIdx, () => startScenario(chapterTriggerIdx, 0, 0));
}

function startPuzzle(puzzleNum, nextChapterIdx) {
  console.log('[startPuzzle] puzzleNum=' + puzzleNum + ' nextChapterIdx=' + nextChapterIdx + ' 現chapterIdx=' + chapterIdx);
  // パズル発火時に背景を強制クリア（前画面の画像が残らないように）
  hardClearImageLayers();
  showScreen('puzzle-screen');
  if (window.GameAudio) GameAudio.playBgm(selectPuzzleBgm(puzzleNum));  // ステージ別パズルBGM
  const savedChapterIdx = chapterIdx;  // ★closureに固定（クリア時にchapterIdxが変わっても安全）
  PuzzleGame.start(puzzleNum, {
    onClear: function() {
      console.log('[startPuzzle onClear] puzzleNum=' + puzzleNum + ' savedChapterIdx=' + savedChapterIdx + ' nextChapterIdx=' + nextChapterIdx);
      hardClearImageLayers();
      const nextIdx = (typeof nextChapterIdx === 'number') ? nextChapterIdx : (savedChapterIdx + 1);
      console.log('[startPuzzle onClear] → 次章 idx=' + nextIdx);
      if (nextIdx < SCENARIOS_V8.length) {
        // ★chapterIdx を即座に更新（連打で不整合を起こさない）
        chapterIdx = nextIdx; tapIdx = 0; pageIdx = 0; currentImgUrl = '';
        chapterTransitionInProgress = true;
        try { ImageLoader.preloadForChapter(SCENARIOS_V8, nextIdx); } catch(e) { console.warn('[onClear] preload error:', e); }
        const doTransition = () => {
          console.log('[onClear] doTransition 実行 chapterIdx=' + chapterIdx);
          chapterTransitionInProgress = false;
          if (mode === 'normal') SaveEngine.save({chapterIdx, tapIdx, pageIdx});
          showScreen('scenario-screen');
          renderTap();
        };
        showChapterTitle(nextIdx, doTransition);
        // safeguard：3.7s後にまだ遷移してなければ強制実行
        setTimeout(() => {
          if (chapterTransitionInProgress) {
            console.warn('[onClear safeguard] 3.7s経過してもフラグtrue → 強制遷移');
            doTransition();
          }
        }, 3700);
      } else {
        SaveEngine.clear();
        showScreen('ending-screen');
      }
    }
  });
}

// 画像レイヤーを完全強制リセット（インラインopacity含む）
function hardClearImageLayers() {
  const layA = $('img-layer-a'), layB = $('img-layer-b');
  if (layA) {
    layA.innerHTML = '';
    layA.classList.remove('visible');
    layA.style.opacity = '0';
    layA.style.transition = 'none';
  }
  if (layB) {
    layB.innerHTML = '';
    layB.classList.remove('visible');
    layB.style.opacity = '0';
    layB.style.transition = 'none';
  }
  currentImgUrl = '';
  activeLayer = 'a';
  // 次フレームで transition を戻す
  requestAnimationFrame(() => {
    if (layA) { layA.style.transition = ''; layA.style.opacity = ''; }
    if (layB) { layB.style.transition = ''; layB.style.opacity = ''; }
  });
}

window.showTitleScreenExt = function() { showTitleScreen(); };

function bootScenario() {
  $('btn-sc-back').onclick = () => {
    if (mode === 'intro') showTitleScreen();
    else showScreen('select-screen');
  };
  $('btn-prev').onclick = (e) => { e.stopPropagation(); prevTap(); };
  $('btn-next').onclick = (e) => { e.stopPropagation(); nextTap(); };

  // 章スキップ：ADV最後まで飛ばして章末処理（パズル or 次章 or エンディング）を発火
  const skipBtn = $('btn-sc-skip');
  if (skipBtn) {
    skipBtn.onclick = (e) => {
      e.stopPropagation();
      console.log('[btn-sc-skip] clicked chapterIdx=' + chapterIdx + ' flag=' + chapterTransitionInProgress);
      jumpChapterEnd();
    };
  }
  // DEV「▶発火」：現在章から次のパズル発火位置を検索し、その章に飛んで即startPuzzle
  const devFireBtn = $('btn-sc-devfire');
  if (devFireBtn) {
    devFireBtn.onclick = (e) => {
      e.stopPropagation();
      const tm = window.PUZZLE_TRIGGER_MAP || {};
      const keys = Object.keys(tm).map(Number).sort((a,b)=>a-b);
      const targetKey = keys.find(k => k >= chapterIdx);
      console.log('[DEV▶発火] 現chapterIdx=' + chapterIdx + ' → 発火位置ch=' + targetKey + ' → S' + tm[targetKey]);
      if (targetKey === undefined) { console.warn('[DEV▶発火] 次パズル発火位置なし'); return; }
      chapterIdx = targetKey; tapIdx = 0; pageIdx = 0;
      chapterTransitionInProgress = false;
      startPuzzle(tm[targetKey]);
    };
  }

  $('scenario-screen').addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    nextTap();
  });
}

function bootEnding() {
  $('btn-ending-back').onclick = () => { chapterIdx=0; tapIdx=0; pageIdx=0; showTitleScreen(); };
}

document.addEventListener('keydown', (e) => {
  if ($('scenario-screen').classList.contains('active')) {
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextTap(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevTap(); }
    else if (e.key === 'Escape') { if (mode === 'intro') showTitleScreen(); else showScreen('select-screen'); }
  }
});

window.addEventListener('error', (e) => {
  const b = $('err-banner');
  if (b) { b.style.display='block'; b.textContent='[JS ERROR] ' + e.message + ' @ ' + (e.filename||'') + ':' + (e.lineno||'?'); }
});

window.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('dev-mode');
  if (typeof SCENARIOS_V8 === 'undefined') {
    document.body.innerHTML = '<div style="color:#fff;padding:20px;">ERROR: scenario data not loaded</div>';
    return;
  }
  // ローカライズを初回に読み込み（失敗しても続行、フォールバックで日本語表示）
  if (window.I18n) {
    try { await I18n.init(); } catch (e) { console.warn('[i18n] init failed, using HTML defaults:', e); }
  }
  // ★音声エンジン初期化（プリロード＋ジェスチャー待機）
  if (window.GameAudio) { try { GameAudio.init(); } catch(e) { console.warn('[audio] init failed:', e); } }
  bootLogo();
  bootTitle();
  buildSelectList();
  bootScenario();
  bootEnding();
  if (window.PuzzleGame) PuzzleGame.boot();
  console.log('Boot v1.5 OK (中断セーブ対応, i18n=' + (window.I18n ? I18n.current : 'off') + ')');
  console.log('[BOOT] PUZZLE_TRIGGER_MAP =', JSON.stringify(window.PUZZLE_TRIGGER_MAP));
});
