/* 手繪色鉛筆插畫（程式繪製）
 * 每一筆都有輕微抖動、重描兩次、色鉛筆顆粒，模仿手繪生活小誌的插畫。
 * 用法：Art.bowl("plain"|"salty"|"sweet")、Art.teapot()、Art.portrait("dad"|"mom"|"ama")、Art.stillLife() …
 */
(function(){
  const A = {};
  let s = 11;
  const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const J = a => (R() - .5) * 2 * a;
  let uid = 0;
  const nid = p => "a" + p + (++uid);
  const f = n => n.toFixed(1);

  A.C = {
    ink: "#5b4d40", grey: "#8d857b", brown: "#7b5a3c", dark: "#3d2f25", brick: "#b5523b",
    sage: "#8a9a7b", sageDark: "#5f7055", yellow: "#e2bf62", cream: "#f3ead6", rice: "#efe6d2",
    skin: "#e9c9a8", blush: "#d98b78", longan: "#6e3f2a", wood: "#b08a63"
  };
  const C = A.C;

  /* ---------- 基本筆觸 ---------- */
  function smooth(pts){
    if(pts.length < 2) return "";
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for(let i = 1; i < pts.length - 1; i++){
      const mx = (pts[i][0] + pts[i+1][0]) / 2, my = (pts[i][1] + pts[i+1][1]) / 2;
      d += ` Q${f(pts[i][0])},${f(pts[i][1])} ${f(mx)},${f(my)}`;
    }
    const l = pts[pts.length-1];
    return d + ` L${f(l[0])},${f(l[1])}`;
  }
  // 一筆（可重描）
  A.stroke = (pts, o = {}) => {
    const times = o.times || 1, out = [];
    for(let k = 0; k < times; k++){
      const jit = (o.j == null ? .7 : o.j) * (k ? 1.4 : 1);
      const q = pts.map(p => [p[0] + J(jit), p[1] + J(jit)]);
      out.push(`<path d="${smooth(q)}" fill="none" stroke="${o.c || C.ink}" stroke-width="${f((o.w || 1.3) * (k ? .75 : 1))}" stroke-linecap="round" stroke-linejoin="round" opacity="${o.op == null ? .92 : o.op}"/>`);
    }
    return out.join("");
  };
  A.line = (x1, y1, x2, y2, o = {}) => {
    const n = Math.max(2, Math.round(Math.hypot(x2-x1, y2-y1) / 12)), pts = [];
    for(let i = 0; i <= n; i++){ const t = i / n; pts.push([x1 + (x2-x1)*t, y1 + (y2-y1)*t]); }
    return A.stroke(pts, o);
  };
  // 橢圓（起點隨機、略為超出，像手畫沒對齊）
  A.ell = (cx, cy, rx, ry, o = {}) => {
    const n = Math.max(18, Math.round((rx + ry) / 3)), a0 = R() * 6.283, over = o.over == null ? .35 : o.over, pts = [];
    for(let i = 0; i <= n; i++){
      const a = a0 + (6.283 + over) * i / n, k = 1 + J(.025);
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return A.stroke(pts, Object.assign({ times: 2 }, o));
  };
  A.arc = (cx, cy, rx, ry, a1, a2, o = {}) => {
    const n = Math.max(8, Math.round(Math.abs(a2 - a1) * (rx + ry) / 8)), pts = [];
    for(let i = 0; i <= n; i++){ const a = a1 + (a2 - a1) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return A.stroke(pts, o);
  };
  A.curve = (pts, o = {}) => A.stroke(pts, o);

  /* ---------- 塗色（蠟筆來回塗） ---------- */
  const ellD = (cx, cy, rx, ry) => `M${f(cx-rx)},${f(cy)} a${f(rx)},${f(ry)} 0 1,0 ${f(2*rx)},0 a${f(rx)},${f(ry)} 0 1,0 ${f(-2*rx)},0Z`;
  A.ellD = ellD;
  // clipD：塗色範圍（SVG path）；box：[x,y,w,h]
  A.scribble = (clipD, box, o = {}) => {
    const id = nid("c"), gap = o.gap || 3.2, ang = (o.ang == null ? -35 : o.ang) * Math.PI / 180;
    const [x, y, w, h] = box, cx = x + w/2, cy = y + h/2, L = Math.hypot(w, h) / 2 + 6;
    const ca = Math.cos(ang), sa = Math.sin(ang), pts = [];
    let side = 1;
    for(let t = -L; t <= L; t += gap){
      const px = cx - sa * t, py = cy + ca * t;
      pts.push([px + ca * L * side + J(3), py + sa * L * side + J(3)]);
      side = -side;
    }
    const d = pts.map((p,i) => (i ? "L" : "M") + f(p[0]) + "," + f(p[1])).join(" ");
    return `<clipPath id="${id}"><path d="${clipD}"/></clipPath><g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${o.c || C.yellow}" stroke-width="${o.w || 1.6}" stroke-linejoin="round" opacity="${o.op == null ? .55 : o.op}"/></g>`;
  };
  // 小顆粒（米粒、碎屑）
  A.grains = (cx, cy, rx, ry, n, o = {}) => {
    let out = "";
    for(let i = 0; i < n; i++){
      const a = R() * 6.283, r = Math.sqrt(R());
      const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      const len = (o.len || 2.6) * (.7 + R() * .6), t = R() * 3.14;
      out += A.line(x - Math.cos(t) * len, y - Math.sin(t) * len * .6, x + Math.cos(t) * len, y + Math.sin(t) * len * .6, { c: o.c || C.grey, w: o.w || 1.1, j: .3, op: o.op || .8 });
    }
    return out;
  };
  A.steam = (x, y, h, o = {}) => {
    const pts = []; const n = 7;
    for(let i = 0; i <= n; i++) pts.push([x + Math.sin(i / n * 6.283 + (o.ph || 0)) * 3.5, y - h * i / n]);
    return A.stroke(pts, { c: C.grey, w: 1, op: .65, j: .4 });
  };

  /* ---------- 共用 SVG 外框（色鉛筆顆粒濾鏡） ---------- */
  A.svg = (w, h, body, o = {}) =>
    `<svg class="art ${o.cls || ""}" viewBox="0 0 ${w} ${h}" ${o.size === false ? "" : `width="${o.width || w}"`} role="img" aria-label="${o.label || ""}" xmlns="http://www.w3.org/2000/svg"><g filter="url(#pencil)">${body}</g></svg>`;

  A.defs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 1.75" result="g"/>
      <feComposite in="SourceGraphic" in2="g" operator="in" result="t"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="w"/>
      <feDisplacementMap in="t" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs></svg>`;

  /* ---------- 陶碗與粥 ---------- */
  // kind: plain 爸爸的稀飯 / salty 阿媽的鹹糜 / sweet 米糕糜
  A.bowl = (kind, o = {}) => {
    A.seedFor(kind + "bowl");
    const W = 180, H = 150, cx = 90, rimY = 62, rx = 70, ry = 17;
    const band = { plain: C.sageDark, salty: C.brick, sweet: C.brown }[kind];
    let b = "";
    // 碗身塗色
    const bodyD = `M${cx-rx},${rimY} Q${cx-rx+4},${rimY+62} ${cx-26},${rimY+68} L${cx+26},${rimY+68} Q${cx+rx-4},${rimY+62} ${cx+rx},${rimY}Z`;
    b += A.scribble(bodyD, [cx-rx, rimY, 2*rx, 70], { c: kind === "plain" ? "#c9d2bd" : kind === "salty" ? "#e7b9a6" : "#dcc39a", gap: 3.4, op: .6 });
    // 碗上的花紋帶
    b += A.arc(cx, rimY + 14, rx - 4, ry + 4, .25, 2.9, { c: band, w: 2.2, times: 2 });
    for(let i = 0; i < 7; i++){ const a = .5 + i * .35, x = cx + Math.cos(a) * (rx - 10), y = rimY + 22 + Math.sin(a) * (ry + 8); b += A.ell(x, y, 3, 2.2, { c: band, w: 1.3, times: 1 }); }
    // 碗身輪廓、圈足
    b += A.curve([[cx-rx, rimY], [cx-rx+3, rimY+30], [cx-rx+18, rimY+56], [cx-28, rimY+68]], { w: 1.5, times: 2 });
    b += A.curve([[cx+rx, rimY], [cx+rx-3, rimY+30], [cx+rx-18, rimY+56], [cx+28, rimY+68]], { w: 1.5, times: 2 });
    b += A.arc(cx, rimY + 69, 28, 6, 0, 3.14, { w: 1.4, times: 2 });
    b += A.line(cx-28, rimY+68, cx-26, rimY+75, { w: 1.3 }) + A.line(cx+28, rimY+68, cx+26, rimY+75, { w: 1.3 });
    b += A.arc(cx, rimY + 74, 26, 5, .1, 3.04, { w: 1.3 });
    // 粥面
    const inD = ellD(cx, rimY, rx - 5, ry - 3);
    if(kind === "plain"){
      b += A.scribble(inD, [cx-rx, rimY-ry, 2*rx, 2*ry], { c: "#e6dcc2", gap: 2.6, op: .75, ang: 10 });
      b += A.grains(cx, rimY, rx - 16, ry - 7, 26, { c: "#b9ad97", len: 2.4 });
    } else if(kind === "salty"){
      b += A.scribble(inD, [cx-rx, rimY-ry, 2*rx, 2*ry], { c: "#d9c39c", gap: 2.6, op: .75, ang: 10 });
      b += A.grains(cx, rimY, rx - 14, ry - 6, 30, { c: "#a99b82", len: 2.2 });
      for(let i = 0; i < 9; i++){ const x = cx - 44 + R() * 88, y = rimY - 7 + R() * 13, t = J(.8); b += A.line(x, y, x + Math.cos(t) * 11, y + Math.sin(t) * 3, { c: "#d8b04a", w: 2.4, j: .3 }); } // 筍絲
      for(let i = 0; i < 5; i++){ const x = cx - 38 + i * 19 + J(5), y = rimY - 2 + J(4); b += A.scribble(ellD(x, y, 6.5, 4), [x-7, y-5, 14, 10], { c: "#8f8577", gap: 1.6, op: .8 }) + A.ell(x, y, 6.5, 4, { c: "#5e564c", w: 1.1, times: 1 }); } // 蚵仔
      for(let i = 0; i < 8; i++){ const x = cx - 50 + R() * 100, y = rimY - 8 + R() * 15; b += A.line(x, y, x + 2.5, y + 1, { c: "#6f8f4f", w: 2.6, j: .2 }); } // 芹菜末
      for(let i = 0; i < 4; i++){ const x = cx - 30 + R() * 60, y = rimY - 5 + R() * 10; b += A.line(x, y, x + 8, y + 2, { c: "#9a5a3c", w: 2.2, j: .3 }); } // 肉絲
    } else {
      b += A.scribble(inD, [cx-rx, rimY-ry, 2*rx, 2*ry], { c: "#9a6a4c", gap: 2.4, op: .7, ang: 10 });
      b += A.grains(cx, rimY, rx - 14, ry - 6, 26, { c: "#f0e4cf", len: 2.4, w: 1.4 });
      for(let i = 0; i < 6; i++){ const x = cx - 42 + i * 16 + J(4), y = rimY - 3 + J(5); b += A.scribble(ellD(x, y, 4.5, 3.4), [x-5, y-4, 10, 8], { c: C.longan, gap: 1.3, op: .9 }) + A.ell(x, y, 4.5, 3.4, { c: "#4a2a1c", w: 1, times: 1 }); } // 桂圓
    }
    // 碗口
    b += A.ell(cx, rimY, rx, ry, { w: 1.6 });
    b += A.ell(cx, rimY, rx - 5, ry - 3, { w: 1, op: .6, times: 1 });
    // 熱氣
    if(o.steam !== false){ b += A.steam(cx - 16, rimY - 22, 26, { ph: 0 }) + A.steam(cx + 4, rimY - 26, 32, { ph: 1.5 }) + A.steam(cx + 22, rimY - 20, 22, { ph: 3 }); }
    return A.svg(W, H, b, Object.assign({ label: { plain: "爸爸的稀飯", salty: "阿媽的鹹糜", sweet: "米糕糜" }[kind] }, o));
  };

  /* ---------- 茶壺、湯匙、小碟、杯 ---------- */
  A.teapot = (o = {}) => {
    A.seedFor("teapot");
    let b = "";
    b += A.ell(70, 78, 44, 34, { c: C.grey, w: 1.3 });
    b += A.arc(70, 46, 22, 6, 3.14, 6.28, { c: C.grey, w: 1.2, times: 2 });
    b += A.ell(70, 46, 22, 6, { c: C.grey, w: 1.1, times: 1 });
    b += A.ell(70, 36, 6, 4, { c: C.grey, w: 1.1 });
    b += A.line(70, 40, 70, 44, { c: C.grey });
    b += A.curve([[28, 72], [16, 66], [8, 50], [2, 44]], { c: C.grey, w: 1.3, times: 2 });
    b += A.curve([[30, 86], [18, 78], [10, 58], [6, 48]], { c: C.grey, w: 1.2 });
    b += A.arc(116, 76, 16, 20, -1.4, 1.4, { c: C.grey, w: 1.3, times: 2 });
    b += A.arc(70, 110, 30, 5, 0, 3.14, { c: C.grey, w: 1.1 });
    return A.svg(140, 120, b, Object.assign({ label: "茶壺" }, o));
  };
  A.spoon = (o = {}) => {
    A.seedFor("spoon");
    let b = A.ell(26, 20, 16, 11, { c: C.grey, w: 1.2 });
    b += A.curve([[40, 25], [70, 34], [100, 42], [118, 46]], { c: C.grey, w: 1.2, times: 2 });
    b += A.curve([[38, 18], [70, 30], [100, 38], [118, 41]], { c: C.grey, w: 1.1 });
    return A.svg(124, 54, b, Object.assign({ label: "湯匙" }, o));
  };
  A.dish = (o = {}) => { // 小碟醬菜（蔭瓜）
    A.seedFor("dish");
    let b = A.scribble(ellD(50, 30, 26, 9), [24, 20, 52, 20], { c: "#a8783c", gap: 2, op: .7 });
    b += A.ell(50, 34, 40, 13, { c: C.sageDark, w: 1.3 }) + A.ell(50, 33, 30, 9, { c: C.grey, w: .9, times: 1 });
    for(let i = 0; i < 4; i++) b += A.ell(38 + i * 8, 29 + J(2), 4, 3, { c: "#7d5527", w: 1, times: 1 });
    return A.svg(100, 56, b, Object.assign({ label: "醬菜小碟" }, o));
  };
  A.cup = (o = {}) => {
    A.seedFor("cup");
    let b = A.ell(30, 18, 20, 6, { c: C.grey, w: 1.2 });
    b += A.curve([[10, 18], [12, 40], [18, 52]], { c: C.grey, w: 1.2, times: 2 }) + A.curve([[50, 18], [48, 40], [42, 52]], { c: C.grey, w: 1.2, times: 2 });
    b += A.arc(30, 52, 12, 4, 0, 3.14, { c: C.grey, w: 1.1 });
    return A.svg(60, 60, b, Object.assign({ label: "茶杯" }, o));
  };
  A.table = (w = 600, o = {}) => {
    A.seedFor("table" + w);
    let b = A.line(4, 10, w - 4, 8, { c: C.brown, w: 1.6, times: 2 });
    for(let i = 0; i < 6; i++){ const y = 16 + i * 5 + J(1); b += A.line(10 + R() * 40, y, w - 10 - R() * 60, y + J(2), { c: C.wood, w: 1, op: .55 }); }
    return A.svg(w, 46, b, Object.assign({ size: false, cls: "table-art", label: "木桌" }, o));
  };

  /* ---------- 人物肖像（樸實手繪，不用大眼睛） ---------- */
  A.portrait = (who, o = {}) => {
    A.seedFor(who + "face");
    const W = 120, H = 140, cx = 60;
    let b = "";
    const cloth = { dad: "#9fae92", mom: "#d39a86", ama: "#d6b675" }[who];
    const clothLine = { dad: C.sageDark, mom: C.brick, ama: C.brown }[who];
    // 肩膀與衣服
    const shD = `M10,140 Q14,108 40,100 L80,100 Q106,108 110,140Z`;
    b += A.scribble(shD, [8, 96, 104, 46], { c: cloth, gap: 3, op: .6 });
    b += A.curve([[12, 139], [16, 112], [40, 101], [52, 98]], { c: clothLine, w: 1.4, times: 2 });
    b += A.curve([[108, 139], [104, 112], [80, 101], [68, 98]], { c: clothLine, w: 1.4, times: 2 });
    if(who === "dad"){ b += A.curve([[50, 99], [56, 110], [60, 104]], { c: clothLine }) + A.curve([[70, 99], [64, 110], [60, 104]], { c: clothLine }); }
    if(who === "ama"){ for(let i = 0; i < 3; i++) b += A.ell(60, 112 + i * 9, 1.8, 1.8, { c: clothLine, w: 1, times: 1 }); b += A.line(60, 104, 60, 140, { c: clothLine, w: 1 }); }
    // 脖子
    b += A.line(52, 86, 52, 99, { c: C.brown, w: 1.2 }) + A.line(68, 86, 68, 99, { c: C.brown, w: 1.2 });
    // 臉
    const faceD = ellD(cx, 62, 25, 30);
    b += A.scribble(faceD, [34, 30, 52, 64], { c: C.skin, gap: 3, op: .55, ang: 60 });
    // 頭髮
    if(who === "dad"){
      const hD = `M33,58 Q32,30 60,28 Q88,30 87,58 Q84,44 72,40 Q58,44 44,40 Q36,46 33,58Z`;
      b += A.scribble(hD, [30, 24, 60, 36], { c: "#4a3a2e", gap: 1.9, op: .85, ang: 70 });
      b += A.curve([[33, 58], [33, 36], [60, 27], [87, 36], [87, 58]], { c: C.dark, w: 1.3 });
    } else if(who === "mom"){
      const hD = `M30,86 Q24,40 60,28 Q96,40 90,86 Q86,70 85,56 Q76,40 60,42 Q44,44 36,56 Q34,72 30,86Z`;
      b += A.scribble(hD, [22, 24, 76, 64], { c: "#3f2f26", gap: 1.9, op: .85, ang: 75 });
      b += A.curve([[30, 86], [26, 50], [60, 27], [94, 50], [90, 86]], { c: C.dark, w: 1.3 });
    } else {
      const hD = `M34,58 Q32,32 60,29 Q88,32 86,58 Q82,44 60,40 Q40,44 34,58Z`;
      b += A.scribble(hD, [30, 26, 60, 34], { c: "#b8b2a8", gap: 2.1, op: .85, ang: 70 });
      b += A.scribble(ellD(60, 24, 11, 8), [48, 15, 24, 18], { c: "#a9a299", gap: 1.8, op: .85 });
      b += A.ell(60, 24, 11, 8, { c: C.grey, w: 1.2 });
      b += A.curve([[34, 58], [34, 36], [60, 29], [86, 36], [86, 58]], { c: C.grey, w: 1.3 });
    }
    // 臉輪廓、耳朵
    b += A.ell(cx, 62, 25, 30, { c: C.brown, w: 1.3, over: .15 });
    b += A.arc(34, 64, 4, 7, 1.6, 4.7, { c: C.brown, w: 1.1 }) + A.arc(86, 64, 4, 7, -1.5, 1.5, { c: C.brown, w: 1.1 });
    // 五官：小眼睛、短眉、鼻線、嘴
    const ey = 62;
    b += A.line(46, ey - 7, 54, ey - 8, { c: C.dark, w: 1.2 }) + A.line(66, ey - 8, 74, ey - 7, { c: C.dark, w: 1.2 });
    if(who === "ama"){ b += A.arc(50, ey, 4, 2, 3.4, 6.0, { c: C.dark, w: 1.2 }) + A.arc(70, ey, 4, 2, 3.4, 6.0, { c: C.dark, w: 1.2 }); b += A.line(42, ey + 2, 44, ey + 4, { c: C.brown, w: .8 }) + A.line(76, ey + 2, 78, ey + 4, { c: C.brown, w: .8 }); }
    else { b += A.ell(50, ey, 1.6, 1.3, { c: C.dark, w: 1.6, times: 1 }) + A.ell(70, ey, 1.6, 1.3, { c: C.dark, w: 1.6, times: 1 }); }
    if(who === "dad"){ b += A.ell(50, ey, 7, 5.5, { c: C.ink, w: 1, times: 1 }) + A.ell(70, ey, 7, 5.5, { c: C.ink, w: 1, times: 1 }) + A.line(57, ey, 63, ey, { c: C.ink, w: 1 }); }
    b += A.curve([[60, 64], [58, 72], [61, 74]], { c: C.brown, w: 1.1 });
    b += A.curve([[53, 81], [60, 83], [67, 81]], { c: C.brick, w: 1.3 });
    if(who !== "dad"){ b += A.scribble(ellD(45, 74, 5, 3), [40, 71, 10, 6], { c: C.blush, gap: 1.6, op: .4 }) + A.scribble(ellD(75, 74, 5, 3), [70, 71, 10, 6], { c: C.blush, gap: 1.6, op: .4 }); }
    return A.svg(W, H, b, Object.assign({ label: { dad: "爸爸", mom: "媽媽", ama: "阿媽" }[who] }, o));
  };

  /* ---------- 靜物（主畫面插圖） ---------- */
  A.stillLife = (o = {}) => {
    const parts = [
      `<g transform="translate(250,8) scale(.9)">${inner(A.teapot())}</g>`,
      `<g transform="translate(20,60)">${inner(A.bowl("plain"))}</g>`,
      `<g transform="translate(170,96)">${inner(A.bowl("salty"))}</g>`,
      `<g transform="translate(330,70)">${inner(A.bowl("sweet"))}</g>`,
      `<g transform="translate(70,214) rotate(-8)">${inner(A.spoon())}</g>`,
      `<g transform="translate(400,210)">${inner(A.dish())}</g>`,
      `<g transform="translate(470,40)">${inner(A.cup())}</g>`
    ];
    return `<svg class="art still" viewBox="0 0 540 270" role="img" aria-label="桌上的三碗粥、茶壺與湯匙" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
  };
  function inner(svg){ return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  A.inner = inner;

  /* ---------- 印章、手寫記號 ---------- */
  A.stamp = (text, o = {}) => {
    A.seedFor("stamp" + text);
    const c = o.c || C.brick;
    let b = A.ell(40, 40, 33, 33, { c, w: 2.4, over: .1 }) + A.ell(40, 40, 27, 27, { c, w: 1.2, times: 1, over: .05 });
    b += `<text x="40" y="${text.length > 1 ? 47 : 51}" text-anchor="middle" font-family="'LXGW WenKai TC',serif" font-size="${text.length > 2 ? 16 : text.length > 1 ? 21 : 30}" font-weight="700" fill="${c}">${text}</text>`;
    return A.svg(80, 80, b, Object.assign({ cls: "stamp", label: text, width: o.width || 64 }, o));
  };
  A.circleMark = (o = {}) => { A.seedFor("circle" + (o.k || "")); return A.svg(100, 60, A.ell(50, 30, 46, 25, { c: o.c || C.brick, w: 2, over: .5 }), Object.assign({ cls: "circlemark", size: false }, o)); };
  A.underline = (w = 200, o = {}) => { A.seedFor("ul" + w); return A.svg(w, 10, A.curve([[2, 6], [w * .3, 4], [w * .7, 7], [w - 2, 4]], { c: o.c || C.brick, w: 2, times: 2 }), Object.assign({ cls: "ul", size: false }, o)); };
  A.leaf = (o = {}) => { A.seedFor("leaf"); let b = A.curve([[10, 40], [20, 20], [40, 8]], { c: C.sageDark, w: 1.3 }); b += A.ell(28, 22, 12, 6, { c: C.sageDark, w: 1.1, times: 1 }); b += A.scribble(ellD(28, 22, 12, 6), [16, 16, 24, 12], { c: C.sage, gap: 2, op: .5 }); return A.svg(50, 50, b, Object.assign({ label: "" }, o)); };

  // 依名稱固定亂數，讓同一張圖每次畫出來一樣
  A.seedFor = key => { let h = 7; for(const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 2147483647; s = h || 7; };

  window.Art = A;
})();
