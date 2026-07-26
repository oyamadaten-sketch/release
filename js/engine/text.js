// 親指隠シと座牢のムスメ ─ テキスト改行エンジン v4（意味優先方式）
// 【方針】機械的に幅を埋めるのではなく、意味の切れ目で改行する。
//   1. 明示的な \n を尊重（作者が意図した改行を破壊しない）
//   2. 句点「。」「！」「？」や2文字ダッシュ「――」「──」の直後で強制改行
//   3. 各セグメントが hardMax(23) を超えたときのみ、句読点/助詞で内部分割
// これにより、短くても意味の切れ目で改行する「人間的な改行」を実現する。
(function(global) {
  'use strict';
  const BREAKS_HARD = ['。', '！', '？'];
  const BREAKS_SOFT = ['、', '」', '）'];
  const BAD_LEAD    = ['。', '、', '」', '）', '！', '？'];
  const STRONG_PARTICLES = ['の', 'を', 'に', 'は', 'が', 'と', 'も', 'へ', 'て', 'ば'];
  const WEAK_PARTICLES   = ['で', 'だ'];
  const NO_LEAD_HEAD = ['あ','い','う','え','お','ん','っ','ゃ','ゅ','ょ','。','、','」','）','！','？'];

  function isCopulaCut(s, j) {
    if (j <= 0 || j >= s.length) return false;
    const c = s[j-1], n = s[j];
    if (c === 'で' && (n === 'あ' || n === 'い')) return true;
    if (c === 'だ' && (n === 'ろ' || n === 'っ')) return true;
    if (c === 'て' && (n === 'い' || n === 'し')) return true;
    return false;
  }
  function isBadLead(s, j) {
    if (j >= s.length) return false;
    return NO_LEAD_HEAD.includes(s[j]);
  }

  // 意味単位分割：句点・ダッシュで区切る
  function splitBySentence(text) {
    const parts = [];
    let buf = '';
    let i = 0;
    while (i < text.length) {
      const c = text[i];
      if (i + 1 < text.length) {
        const pair = c + text[i+1];
        if (pair === '――' || pair === '──') {
          buf += pair;
          i += 2;
          while (i < text.length && /[」）]/.test(text[i])) { buf += text[i]; i++; }
          parts.push(buf);
          buf = '';
          continue;
        }
      }
      buf += c;
      if (BREAKS_HARD.includes(c)) {
        while (i + 1 < text.length && /[」）]/.test(text[i+1])) {
          i++;
          buf += text[i];
        }
        parts.push(buf);
        buf = '';
      }
      i++;
    }
    if (buf) parts.push(buf);
    return parts;
  }

  // 長すぎるセグメントを内部分割（従来の貪欲フィル）
  function fillLines(text, idealMax, hardMax) {
    const clean = text;
    if (!clean) return [];
    const lines = [];
    let pos = 0;
    while (pos < clean.length) {
      const remain = clean.length - pos;
      if (remain <= hardMax) {
        lines.push(clean.substring(pos));
        break;
      }
      const searchEnd = pos + hardMax;
      let cut = -1;
      for (let j = searchEnd; j > pos + idealMax - 5; j--) {
        if (BREAKS_SOFT.includes(clean[j-1])) { cut = j; break; }
      }
      if (cut < 0) {
        for (let j = searchEnd; j > pos + idealMax - 7; j--) {
          if (j > 0 && j <= clean.length && STRONG_PARTICLES.includes(clean[j-1])
              && !isCopulaCut(clean, j) && !isBadLead(clean, j)) { cut = j; break; }
        }
      }
      if (cut < 0) {
        for (let j = searchEnd; j > pos + idealMax - 7; j--) {
          if (j > 0 && j <= clean.length && WEAK_PARTICLES.includes(clean[j-1])
              && !isCopulaCut(clean, j) && !isBadLead(clean, j)) { cut = j; break; }
        }
      }
      if (cut < 0) {
        cut = pos + idealMax;
        let t = 0;
        while (t < 4 && cut > pos && (isCopulaCut(clean, cut) || isBadLead(clean, cut))) { cut--; t++; }
        if (cut <= pos) cut = pos + idealMax;
      }
      lines.push(clean.substring(pos, cut));
      pos = cut;
    }
    return lines;
  }

  function splitIntoLines(text, idealMax, hardMax) {
    idealMax = idealMax || 20; hardMax = hardMax || 23;
    if (!text) return [];
    const raw = String(text);
    const result = [];
    const paragraphs = raw.split(/[\r\n]+/);
    for (const para of paragraphs) {
      if (!para) continue;
      const segments = splitBySentence(para);
      for (const seg of segments) {
        if (!seg) continue;
        if (seg.length <= hardMax) {
          result.push(seg);
        } else {
          const subLines = fillLines(seg, idealMax, hardMax);
          result.push(...subLines);
        }
      }
    }
    const fixed = [];
    for (const ln of result) {
      if (fixed.length > 0 && ln.length > 0 && BAD_LEAD.includes(ln[0])) {
        const prev = fixed[fixed.length - 1];
        if (prev.length + ln.length <= hardMax + 2) {
          fixed[fixed.length - 1] = prev + ln;
          continue;
        }
      }
      fixed.push(ln);
    }
    return fixed;
  }

  function paginate(text, linesPerPage, charsPerLine) {
    linesPerPage = linesPerPage || 4; charsPerLine = charsPerLine || 20;
    if (!text) return [''];
    const lines = splitIntoLines(text, charsPerLine, 23);
    if (lines.length === 0) return [''];
    const pages = [];
    const MIN = Math.max(2, linesPerPage - 1);
    const MAX = linesPerPage;
    const isSentenceEnd = (line) => /[。！？」）]$/.test(line) || /――$|──$/.test(line);
    let i = 0;
    while (i < lines.length) {
      if (lines.length - i <= MAX) {
        pages.push(lines.slice(i).join('\n'));
        break;
      }
      let cut = i + MAX;
      if (isSentenceEnd(lines[cut - 1])) {
        pages.push(lines.slice(i, cut).join('\n'));
        i = cut;
        continue;
      }
      let found = -1;
      for (let j = cut - 1; j >= i + MIN; j--) {
        if (isSentenceEnd(lines[j - 1])) { found = j; break; }
      }
      if (found > 0) {
        pages.push(lines.slice(i, found).join('\n'));
        i = found;
      } else {
        pages.push(lines.slice(i, cut).join('\n'));
        i = cut;
      }
    }
    return pages.length > 0 ? pages : [''];
  }

  global.TextEngine = { splitIntoLines, paginate };
})(window);
