/* 〈以粥養生〉後測 — 題目與診斷設定
 * 這個檔案「沒有答案」：正確答案只放在 Apps Script（Code.gs 的 POST_KEY），
 * 老師登入後，老師頁才會從後端拿到答案來分析。
 * 改題目的選項順序時，記得同步改 Code.gs 的 POST_KEY。
 */
window.POSTTEST = {
  item: "porridge-posttest",
  title: "〈以粥養生〉讀完了，你懂多少？（後測）",
  subtitle: "學完之後的理解檢查",

  layers: [
    { id: 1, name: "直接擷取", short: "擷取", goal: "分清楚爸爸、阿媽、媽媽各自的吃粥方式" },
    { id: 2, name: "直接推論", short: "推論", goal: "推出人物這樣做的原因與心意" },
    { id: 3, name: "詮釋整合", short: "詮釋", goal: "看懂段落在文章裡的作用" },
    { id: 4, name: "比較評估", short: "評估", goal: "看出作者下結論的態度" }
  ],

  structure: [
    { part: "起", paras: "第1～2段", focus: "感官破題：個人的味覺療癒", point: "用動作與感官建立「粥＝療癒」的第一印象" },
    { part: "承", paras: "第3～5段", focus: "家族記憶：爸爸的稀飯 vs. 阿媽的糜", point: "透過「吃法」帶出地域文化差異" },
    { part: "轉", paras: "第6～8段", focus: "父母的共識與荷蘭丈夫的改變", point: "從分歧走向交集，再跨越國界" },
    { part: "合", paras: "第9～11段", focus: "華人共同的養生觀（《禮記》、陸游）", point: "從家庭記憶延伸到千年流傳的文化" }
  ],

  tags: {
    person:      { label: "人物混淆",     feature: "會把不同人物的飲食習慣或經歷混在一起", game: "雙圓圈（第一話）" },
    sweetsalty:  { label: "甜鹹混淆",     feature: "會把甜的米糕糜和阿媽的鹹糜混在一起", game: "雙圓圈（第一話）" },
    event:       { label: "事件混淆",     feature: "會把別的段落、別的事件套到題目上", game: "回課文找句子" },
    literal:     { label: "停在字面",     feature: "只看到表面的做法，沒有推到人物的心意或原因", game: "人物串連圖（第二話）" },
    unsupported: { label: "無根據推論",   feature: "會選課文沒有寫到、甚至和課文相反的說法", game: "回課文找句子" },
    purpose:     { label: "誤解段落作用", feature: "沒有看出段落把家裡的經驗連到華人的文化", game: "兩種結尾比較（第五話）" },
    overgeneral: { label: "以偏概全",     feature: "容易把一個人的例子推成「一定」", game: "作者的提問（第四話）" },
    authority:   { label: "訴諸權威",     feature: "認為古人或名人說的就一定對", game: "作者的提問（第四話）" },
    outside:     { label: "用課外看法",   feature: "用自己的看法作答，而不是依據課文", game: "回課文找句子" }
  },

  // 正確答案不放在這裡（answer 一律是 null）
  questions: [
    { id: 1, part: "承", layer: 1, para: "第3段", ability: "擷取：爸爸老家早晨的稀飯",
      stem: "根據第三段，爸爸在蘇北老家，早晨的稀飯搭配什麼？",
      options: [
        { t: "筍絲蚵仔瘦肉，煮成一鍋鹹糜", tag: "person" },
        { t: "桂圓糯米，盛碗後淋少許米酒", tag: "person" },
        { t: "各色醃菜，再來一盤饅頭、蒸包", tag: null },
        { t: "雞精或肉鬆，拌進清粥裡", tag: "event" }
      ], answer: null },
    { id: 2, part: "承", layer: 1, para: "第4段", ability: "擷取：米糕糜是甜的點心（甜鹹之分）",
      stem: "課文中的「米糕糜」是哪一種吃法？",
      options: [
        { t: "阿媽的拿手菜，暑天中午當午膳", tag: "sweetsalty" },
        { t: "甜的糜，當下午的點心或消夜", tag: null },
        { t: "爸爸老家早晚都喝的白稀飯", tag: "person" },
        { t: "小孩生病時，爸媽餵的清粥", tag: "event" }
      ], answer: null },
    { id: 3, part: "承", layer: 1, para: "第5段", ability: "擷取：阿媽鹹糜的特色",
      stem: "「米粒不熬太久，故粒粒分明，軟而不爛」說的是哪一種粥？",
      options: [
        { t: "爸爸用在來米煮的稀飯", tag: "person" },
        { t: "媽媽淋上米酒的米糕糜", tag: "sweetsalty" },
        { t: "丈夫在荷蘭學會的稀飯", tag: "event" },
        { t: "阿媽有廈門之風的鹹糜", tag: null }
      ], answer: null },
    { id: 4, part: "承", layer: 1, para: "第4～5段", ability: "擷取：阿媽和媽媽的共同點",
      stem: "下列哪一項是「阿媽和媽媽都」有的特點？",
      options: [
        { t: "都愛食糜，甜的鹹的都喜歡", tag: null },
        { t: "都把廈門風味的鹹糜當拿手菜", tag: "person" },
        { t: "都習慣早晚喝稀飯配饅頭", tag: "person" },
        { t: "都只在生病時才喝清粥", tag: "event" }
      ], answer: null },
    { id: 5, part: "轉", layer: 2, para: "第6段", ability: "推論：爸媽對粥看法不同的原因",
      stem: "爸爸始終不愛吃阿媽的鹹糜，課文認為主要的原因是什麼？",
      options: [
        { t: "鹹糜加了太多料，爸爸吃不習慣", tag: "literal" },
        { t: "爸爸覺得鹹糜不好消化、不能養生", tag: "unsupported" },
        { t: "兩人生長環境不同，對粥各有想法", tag: null },
        { t: "阿媽的鹹糜米粒太硬，難以下嚥", tag: "unsupported" }
      ], answer: null },
    { id: 6, part: "轉", layer: 2, para: "第8段", ability: "推論：作者教丈夫熬粥的原因",
      stem: "作者剛到荷蘭不久就教丈夫熬粥，主要是為了什麼？",
      options: [
        { t: "讓丈夫相信中式的養生之道", tag: "unsupported" },
        { t: "讓丈夫學會阿媽拿手的鹹糜", tag: "person" },
        { t: "早晚都能像爸爸一樣喝稀飯", tag: "person" },
        { t: "預防生病時沒有體力起床煮粥", tag: null }
      ], answer: null },
    { id: 7, part: "轉", layer: 2, para: "第8段", ability: "推論：丈夫願意學煮粥的心意",
      stem: "「他原不知粥為何物，更死硬派地不信中式養生之道……如今也學會煮稀飯了」，最能看出丈夫的什麼？",
      options: [
        { t: "被作者說服，開始相信粥能養生", tag: "unsupported" },
        { t: "不一定相信養生，卻願意為妻子學", tag: null },
        { t: "覺得煮稀飯很簡單，順手就學會", tag: "literal" },
        { t: "喜歡上中式料理，每天都吃稀飯", tag: "outside" }
      ], answer: null },
    { id: 8, part: "合", layer: 3, para: "第9段", ability: "詮釋：第九段開頭的作用",
      stem: "第九段開頭說「相信粥可以養生的，當然不只我的父母而已」，這句話在文中有什麼作用？",
      options: [
        { t: "把家裡的經驗連到華人的文化", tag: null },
        { t: "說明父母的想法其實並不正確", tag: "purpose" },
        { t: "證明吃粥一定能讓人健康長壽", tag: "overgeneral" },
        { t: "介紹作者家鄉特別的飲食習慣", tag: "purpose" }
      ], answer: null },
    { id: 9, part: "合", layer: 4, para: "第11段", ability: "評估：作者用問句保留判斷",
      stem: "作者寫陸游活了八十五歲，最後卻問「但不知這跟他嗜食粥糜有沒有關係呢？」。哪一個說法最符合作者的態度？",
      options: [
        { t: "陸游長壽，可見吃粥能延年益壽", tag: "overgeneral" },
        { t: "陸游是大詩人，他的方法一定對", tag: "authority" },
        { t: "只有一個例子，不急著下結論", tag: null },
        { t: "作者認為吃粥對身體沒有幫助", tag: "outside" }
      ], answer: null }
  ],

  // 開放題（必填，沒有選項）
  open: {
    id: 10,
    stem: "作者從自己生病想喝粥寫起，最後寫到《禮記》和陸游。你認為這一碗粥，對作者和對華人來說，各代表什麼？",
    choices: [],
    required: true,
    prompt: "請各引用課文中的一句話，支持你的看法。",
    hint: "對作者來說，這碗粥代表……，因為課文說「……」；對華人來說……"
  },
  openNames: ["0｜未答或離題", "1｜只寫自己的經驗或感受", "2｜說出意義，沒有課文證據", "3｜說出意義，也有課文證據", "4｜有證據，並連結個人到群體"],

  // 開放題初判用的關鍵詞（只是初判，老師可以改）
  openKeywords: {
    evidence: ["「", "療癒食物", "肉鬆拌稀飯", "肉鬆", "身體有恙", "渴食", "吹涼", "一口一口", "寶貝孩子", "未雨綢繆", "丈夫", "不只我的父母", "數不清", "華人都深信", "深信", "粥食有益健康", "禮記", "月令", "仲秋之月", "養衰老", "只將食粥致神仙", "食粥", "陸游", "八十五", "人瑞", "夏、商、周", "夏商周", "以粥養老", "延年益壽"],
    selfMean: ["療癒", "安慰", "回憶", "記憶", "照顧", "被照顧", "親情", "愛", "家", "想念", "懷念", "溫暖", "安心", "依靠", "父母", "爸媽"],
    groupMean: ["華人", "文化", "傳統", "代代", "流傳", "古人", "大家", "很多人", "共同", "觀念", "信仰", "歷史", "養生", "千年", "中國人"],
    personal: ["我也", "我家", "我小時候", "我生病", "我媽", "我爸", "我阿嬤", "我外婆", "我奶奶", "我喜歡", "我覺得好吃", "好吃", "想吃"]
  }
};

/* 後測開放題的系統初判（0～4，只是初判，老師可以改） */
window.POSTTEST.classifyOpen = function(raw, toTrad){
  const s = toTrad(String(raw || "").replace(/\s/g, ""));
  if(s.length < 4) return { level:0, reason: s ? "字數太少，無法判定" : "未作答" };
  const K = window.POSTTEST.openKeywords, has = list => [...new Set(list.filter(w => s.includes(w)))];
  const ev = has(K.evidence), sm = has(K.selfMean), gm = has(K.groupMean), ps = has(K.personal);
  const evidence = s.includes("「") || ev.filter(w => w !== "「").length >= 2;
  const meaning = sm.length + gm.length > 0;
  if(evidence && sm.length && gm.length) return { level:4, reason:`有課文證據（${ev.filter(w => w !== "「").slice(0,2).join("、") || "引號"}），也同時說到作者（${sm.slice(0,2).join("、")}）和華人（${gm.slice(0,2).join("、")}）` };
  if(evidence && meaning) return { level:3, reason:`說出意義（${sm.concat(gm).slice(0,2).join("、")}），也有課文證據（${ev.filter(w => w !== "「").slice(0,2).join("、") || "引號"}）` };
  if(meaning) return { level:2, reason:`說出意義（${sm.concat(gm).slice(0,2).join("、")}），但沒有引用課文` };
  if(ps.length) return { level:1, reason:`只寫到自己的經驗或感受（${ps.slice(0,2).join("、")}）` };
  return { level:1, reason:"有寫，但還沒說出這碗粥代表什麼" };
};
