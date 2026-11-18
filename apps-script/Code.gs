/**
 * 〈以粥養生〉前測＋後測 — 後端（Google Apps Script）
 * 前測、後測共用同一張試算表；後測答案放在另一個檔案 PostKey.gs（老師私下拿到，不放 GitHub）。
 * 部署：部署 → 新增部署作業 → 類型「網頁應用程式」
 *       執行身分：我　／　具有存取權的使用者：所有人
 * 改了程式之後：部署 → 管理部署作業 → 編輯（鉛筆）→ 版本選「新版本」→ 部署（網址不變）
 */
// ★ 請把下一行的 change-me 改成老師自己的密碼（保留引號）
const TEACHER_PASSWORD = 'change-me';

const SHEET_DATA = '資料（程式用）';
const SHEET_LOG = '作答紀錄（老師看）';
const MAX_ATTEMPTS = 20;
const DATA_HEADERS = ['key', '班級', '座號', '姓名', '項目', '最高分', '作答次數', '最後作答', 'attemptsJSON', 'rubricJSON', '更新時間'];
const LOG_HEADERS = ['完成時間', '班級', '座號', '姓名', '項目', '用時(秒)', '得分(滿分8)',
  '第1題', '第2題', '第3題', '第4題', '第5題', '第6題', '第7題', '第8題',
  '第9題選項', '第9題文字', '選擇題閱讀層級', '診斷類型', '開放題系統初判', '開放題教師判定', '疑似亂答', 'attemptId'];

// ===== 後測設定（答案只在後端）=====
const POST_ITEM = 'porridge-posttest';
const SHEET_POSTLOG = '後測紀錄（老師看）';
// 後測答案不放在這裡（這個檔案在 GitHub 上是公開的）。
// 答案在老師另外拿到的 PostKey.gs：在 Apps Script 按「＋ → 指令碼」新增一個檔案貼上即可。
function postKey_() { return typeof POST_ANSWERS !== 'undefined' ? POST_ANSWERS : []; }
const POST_LAYER = [1, 1, 1, 1, 2, 2, 2, 3, 4];
const POST_LEVEL_NAMES = ['第0層｜起步', '第1層｜能擷取', '第2層｜能推論', '第3層｜能詮釋整合', '第4層｜能比較評估'];
const POST_OPEN_NAMES = ['0 未答或離題', '1 只寫自己的經驗或感受', '2 說出意義，沒有課文證據', '3 說出意義，也有課文證據', '4 有證據，並連結個人到群體'];
const POSTLOG_HEADERS = ['完成時間', '班級', '座號', '姓名', '項目', '用時(秒)', '得分(滿分9)',
  '第1題', '第2題', '第3題', '第4題', '第5題', '第6題', '第7題', '第8題', '第9題',
  '第10題文字', '閱讀層級', '開放題系統初判', '開放題教師判定', '疑似亂答', 'attemptId'];
const POSTLOG_TEACHER_COL = 20;
function postGrade_(ans) {
  const correct = postKey_().map(function (k, i) { return ans[i] === k; });
  const score = correct.filter(function (x) { return x; }).length;
  let level = 0;
  for (let L = 1; L <= 4; L++) {
    const idx = []; POST_LAYER.forEach(function (l, i) { if (l === L) idx.push(i); });
    const c = idx.filter(function (i) { return correct[i]; }).length;
    if (c >= Math.ceil(idx.length * 0.6)) level++; else break;
  }
  return { score: score, level: level, correct: correct };
}

function doGet() {
  return out({ ok: true, msg: '〈以粥養生〉前測＋後測後端運作中。這是後端網址，請把它貼到 config.js 的 sheetApi。', posttestKey: postKey_().length === 9 });
}

function doPost(e) {
  let req = {};
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return out({ ok: false, error: '資料格式錯誤' });
  }
  try {
    switch (req.action) {
      case 'ping': return out({ ok: true });
      case 'list': return out(listAction_(req));
      case 'save': return out(withLock_(function () { return saveAction_(req); }));
      case 'clearClass': return out(withLock_(function () { return clearAction_(req); }));
      case 'setRubric': return out(withLock_(function () { return rubricAction_(req); }));
      default: return out({ ok: false, error: '未知的動作：' + req.action });
    }
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------- 工具 ---------- */
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function pwOk_(p) {
  return TEACHER_PASSWORD !== 'change-me' && typeof p === 'string' && p.length > 0 && p === TEACHER_PASSWORD;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function str_(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 200); }
function normSeat_(s) { const n = parseInt(String(s).replace(/[^\d]/g, ''), 10); return isNaN(n) ? str_(s, 10) : String(n); }
function keyOf_(cls, seat) { return str_(cls, 30) + '|' + normSeat_(seat); }
function twTime_(iso) {
  try { return Utilities.formatDate(new Date(iso), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss'); } catch (e) { return iso; }
}
function parseJSON_(s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }

function sheet_(name, headers, textCols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f3e9da');
    sh.setFrozenRows(1);
    (textCols || []).forEach(function (c) { sh.getRange(1, c, sh.getMaxRows(), 1).setNumberFormat('@'); });
  }
  return sh;
}
function dataSheet_() { return sheet_(SHEET_DATA, DATA_HEADERS, [1, 2, 3, 4, 5, 8, 9, 10, 11]); }
function logSheet_() { return sheet_(SHEET_LOG, LOG_HEADERS, [1, 2, 3, 4, 5, 23]); }

function readData_() {
  const sh = dataSheet_();
  const last = sh.getLastRow();
  if (last < 2) return { sh: sh, rows: [] };
  const vals = sh.getRange(2, 1, last - 1, DATA_HEADERS.length).getValues();
  const rows = vals.map(function (r, i) {
    return {
      row: i + 2, key: String(r[0]), cls: String(r[1]), seat: String(r[2]), name: String(r[3]), item: String(r[4]),
      best: Number(r[5]) || 0, count: Number(r[6]) || 0, last: String(r[7]),
      attempts: parseJSON_(r[8], []), rubric: parseJSON_(r[9], null), updated: String(r[10])
    };
  });
  return { sh: sh, rows: rows };
}

/* ---------- list ---------- */
function listAction_(req) {
  const authed = pwOk_(req.password);
  const d = readData_();
  const rows = d.rows.filter(function (r) { return !req.item || r.item === req.item; });
  if (authed) {
    const keys = {}; keys[POST_ITEM] = postKey_();
    return {
      ok: true, authed: true, keys: keys,
      rows: rows.map(function (r) {
        return { cls: r.cls, seat: r.seat, name: r.name, item: r.item, best: r.best, count: r.count, last: r.last, attempts: r.attempts, rubric: r.rubric };
      })
    };
  }
  // 未登入：只給「完成名單」需要的欄位，不給分數與作答內容
  return {
    ok: true, authed: false, pwError: !!req.password,
    rows: rows.map(function (r) { return { cls: r.cls, seat: r.seat, name: r.name, item: r.item, done: r.count > 0 }; })
  };
}

/* ---------- save ---------- */
function saveAction_(req) {
  const st = req.student || {};
  const a = req.attempt || {};
  const item = str_(req.item, 60);
  if (!st.cls || !st.seat || !st.name || !item) return { ok: false, error: '缺少班級、座號、姓名或項目' };
  if (!a.id || !Array.isArray(a.ans)) return { ok: false, error: '缺少作答內容' };

  const attempt = {
    id: str_(a.id, 60), t: str_(a.t, 40), start: str_(a.start, 40),
    dur: Math.max(0, Math.round(Number(a.dur) || 0)),
    score: Math.max(0, Math.min(100, Number(a.score) || 0)),  // 後測會在下面由後端重算
    ans: a.ans.slice(0, 20).map(function (x) { const n = Number(x); return isNaN(n) ? -1 : n; }),
    openChoice: str_(a.openChoice, 2), openOther: str_(a.openOther, 100), openText: str_(a.openText, 1000)
  };
  const sum = req.summary || {};
  const isPost = item === POST_ITEM;
  let pg = null;
  if (isPost) { pg = postGrade_(attempt.ans); attempt.score = pg.score; }
  const key = keyOf_(st.cls, st.seat);
  const cls = str_(st.cls, 30), seat = normSeat_(st.seat), name = str_(st.name, 30);
  const now = new Date().toISOString();

  const d = readData_();
  let rec = null;
  d.rows.forEach(function (r) { if (r.key === key && r.item === item) rec = r; });

  let attempts = rec ? rec.attempts.slice() : [];
  const isNew = !attempts.some(function (x) { return x.id === attempt.id; });
  if (isNew) attempts.push(attempt);
  attempts.sort(function (x, y) { return String(x.t).localeCompare(String(y.t)); });
  // 依 id 去重
  const seen = {};
  attempts = attempts.filter(function (x) { if (seen[x.id]) return false; seen[x.id] = 1; return true; });
  // 保留最近 20 次，但永遠保留第一次（診斷用）
  if (attempts.length > MAX_ATTEMPTS) attempts = [attempts[0]].concat(attempts.slice(attempts.length - MAX_ATTEMPTS + 1));

  const best = attempts.reduce(function (m, x) { return Math.max(m, Number(x.score) || 0); }, 0);
  const lastT = attempts.length ? attempts[attempts.length - 1].t : '';
  const rowVals = [key, cls, seat, name, item, best, attempts.length, lastT, JSON.stringify(attempts), rec && rec.rubric ? JSON.stringify(rec.rubric) : '', now];

  if (rec) d.sh.getRange(rec.row, 1, 1, rowVals.length).setValues([rowVals]);
  else d.sh.appendRow(rowVals);

  if (isNew && isPost) {
    const marks = attempt.ans.slice(0, 9).map(function (x, i) { return x >= 0 && x <= 3 ? 'ABCD'.charAt(x) + (pg.correct[i] ? ' ✓' : ' ✗') : '（未答）'; });
    while (marks.length < 9) marks.push('（未答）');
    sheet_(SHEET_POSTLOG, POSTLOG_HEADERS, [1, 2, 3, 4, 5, 22]).appendRow([
      twTime_(attempt.t), cls, seat, name, item, attempt.dur, attempt.score
    ].concat(marks).concat([
      attempt.openText, POST_LEVEL_NAMES[pg.level], str_(sum.openAuto, 40), '', sum.suspect ? '是（請確認）' : '', attempt.id
    ]));
  } else if (isNew) {
    const letters = attempt.ans.slice(0, 8).map(function (x) { return x >= 0 && x <= 3 ? 'ABCD'.charAt(x) : '（未答）'; });
    while (letters.length < 8) letters.push('（未答）');
    logSheet_().appendRow([
      twTime_(attempt.t), cls, seat, name, item, attempt.dur, attempt.score
    ].concat(letters).concat([
      attempt.openChoice + (attempt.openOther ? '：' + attempt.openOther : ''), attempt.openText,
      str_(sum.level, 40), str_(sum.type, 60), str_(sum.openAuto, 40), '', sum.suspect ? '是（請確認）' : '', attempt.id
    ]));
  }
  return { ok: true, saved: isNew, best: best, count: attempts.length };
}

/* ---------- clearClass ---------- */
function clearAction_(req) {
  if (!pwOk_(req.password)) return { ok: false, error: '密碼錯誤（若仍是 change-me，請先到 Code.gs 第 8 行改密碼）' };
  const cls = str_(req.cls, 30);
  if (!cls) return { ok: false, error: '請指定班級' };
  const item = str_(req.item, 60);
  let removed = 0;
  [[dataSheet_(), 1, 4], [logSheet_(), 1, 4], [sheet_(SHEET_POSTLOG, POSTLOG_HEADERS, [1, 2, 3, 4, 5, 22]), 1, 4]].forEach(function (cfg) {
    const sh = cfg[0];
    const last = sh.getLastRow();
    if (last < 2) return;
    const vals = sh.getRange(2, 1, last - 1, 5).getValues();
    for (let i = vals.length - 1; i >= 0; i--) {
      if (String(vals[i][1]) === cls && (!item || String(vals[i][4]) === item)) { sh.deleteRow(i + 2); if (sh.getName() === SHEET_DATA) removed++; }
    }
  });
  return { ok: true, removed: removed };
}

/* ---------- setRubric（老師改開放題層次） ---------- */
function rubricAction_(req) {
  if (!pwOk_(req.password)) return { ok: false, error: '密碼錯誤' };
  const key = keyOf_(req.cls, req.seat);
  const item = str_(req.item, 60);
  const lv = req.level === '' || req.level == null ? null : Number(req.level);
  const rubric = lv == null ? null : { level: lv, note: str_(req.note, 300), at: new Date().toISOString() };
  const d = readData_();
  let rec = null;
  d.rows.forEach(function (r) { if (r.key === key && r.item === item) rec = r; });
  if (!rec) return { ok: false, error: '找不到這位學生的資料' };
  d.sh.getRange(rec.row, 10).setValue(rubric ? JSON.stringify(rubric) : '');

  const isPost = item === POST_ITEM;
  const labels = isPost ? POST_OPEN_NAMES : { 0: '無法判定', 1: '第一層 內容辨認', 2: '第二層 感受連結', 3: '第三層 文本詮釋' };
  const sh = isPost ? sheet_(SHEET_POSTLOG, POSTLOG_HEADERS, [1, 2, 3, 4, 5, 22]) : logSheet_();
  const tcol = isPost ? POSTLOG_TEACHER_COL : 21;
  const last = sh.getLastRow();
  if (last >= 2) {
    const vals = sh.getRange(2, 1, last - 1, 5).getValues();
    for (let i = 0; i < vals.length; i++) {
      if (String(vals[i][1]) === rec.cls && String(vals[i][2]) === rec.seat && String(vals[i][4]) === item) {
        sh.getRange(i + 2, tcol).setValue(rubric ? labels[lv] + (rubric.note ? '（' + rubric.note + '）' : '') : '');
      }
    }
  }
  return { ok: true, rubric: rubric };
}
