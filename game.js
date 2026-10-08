const $ = (s) => document.querySelector(s);
const boardEl = $("#board"), scoresEl = $("#scores"), modal = $("#modal");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let teams = [];                 // { name, score, shield, skipPick }
let used = new Set();           // squares already played ("col-row")
let cardSquares = new Set();    // squares hiding a card
let ROUND = { categories: [], final: null };
const seen = new Set();         // clues revealed in earlier games
let picker = 0;                 // index of the team whose pick it is
let lastTarget = null;          // last team hit by a steal/freeze/swap
let halveUsed = false;          // the wheel's "Halve points" happens once per game
let level = GAME.level === "warmup" ? "warmup" : "challenge";
let timerId = null, typeId = null;
let escAllowed = false;         // Esc only backs out of a plain clue before the answer

// Cards
const CARDS = {
  steal:       { name: "Steal",            text: "If you get this clue right, take its points from any team you choose." },
  robinhood:   { name: "Robin Hood",       text: "First place gives 300 points to last place." },
  swap:        { name: "Swap Meet",        text: "Pick a team within 500 points of you. Get this clue right and you swap scores with them." },
  wager:       { name: "Everybody Wager",  text: "Every team bets on this clue. Right: win your bet. Wrong: lose it." },
  double:      { name: "Double or Nothing", text: "Right answers earn double. Wrong answers LOSE the clue's points." },
  shield:      { name: "Shield",           text: "You keep this. It blocks the next steal, swap, or freeze aimed at you." },
  freeze:      { name: "Freeze",           text: "Pick a team. They can't score on this clue." },
  bounty:      { name: "Bounty",           text: "If first place gets this wrong, every team that gets it right earns +200." },
  lightning:   { name: "Lightning Round",  text: "Three quick 100-point questions. 10 seconds each. Everyone plays." },
  syntaxerror: { name: "SyntaxError!",     text: "The board crashed! Every team loses 100, unless they yelled \"SyntaxError!\" first." },
  rubberduck:  { name: "Rubber Duck",      text: "After the answer, explain WHY it's right out loud for +100." },
  mystery:     { name: "Mystery Box",      text: "random.randint decides your prize: anywhere from -200 to +500." },
  wheel:       { name: "Mini Wheel",       text: "Spin the wheel!" }
};
const WHEEL = [
  { label: "+300", color: "#2c8a57" },
  { label: "−100", color: "#b8403b" },
  { label: "Steal 200", color: "#7a3fb0" },
  { label: "Shield", color: "#2a6fb8" },
  { label: "Everyone +100", color: "#c08a18" },
  { label: "Lose next pick", color: "#5b5f74" },
  { label: "+100", color: "#2c8a57" },
  { label: "Halve points", color: "#8e2f4f" }
];

// Small helpers
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escAttr(s) { return esc(s).replace(/"/g, "&quot;"); }
function fmt(s) { return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>"); }
function codeBlock(src) {
  return '<pre class="codeblock">' + String(src).split("\n").map((l) => '<span class="ln">' + (esc(l) || " ") + "</span>").join("") + "</pre>";
}
const nameOf = (i) => fmt(teams[i].name);
const secondsFor = (value) => (GAME.timer && GAME.timer[value]) || 20;
const bonusFor = (value) => Math.round(value * (GAME.pickerBonus || 0));

// Keeping look-alike clues off the same board
// A clue's "signature" is its meaningful code lines with spaces removed.
// Two clues clash if they share a line, or if one has a blank (___)
// that could be filled in to make the other's line.
function signature(clue) {
  const spans = (clue.q.match(/`([^`]+)`/g) || []).map((s) => s.slice(1, -1));
  if (clue.code) spans.push(...clue.code.split("\n"));
  return spans.map((s) => s.replace(/\s+/g, ""))
    .filter((s) => s.length >= 6 && /[\d"']/.test(s) && !s.startsWith("import"));
}
function blankRegex(s) {
  return new RegExp("^" + s.split("___").map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^,]+") + "$");
}
function clash(a, b) {
  for (const x of signature(a)) for (const y of signature(b)) {
    if (x.includes("___") && !y.includes("___") && blankRegex(x).test(y)) return true;
    if (y.includes("___") && !x.includes("___") && blankRegex(y).test(x)) return true;
    if (x === y && x.length >= 8) return true;
  }
  return false;
}

// Building a board
function poolFor(cat, value) {
  const lv = cat[level] || cat.challenge || cat.warmup;
  return (lv && lv[value]) || [];
}
function buildRound() {
  const all = GAME.categories;
  const count = Math.min(GAME.categoriesPerGame || all.length, all.length);
  const chosen = shuffle(all.map((_, i) => i)).slice(0, count).sort((a, b) => a - b);
  const onBoard = [];
  ROUND.categories = chosen.map((i) => {
    const cat = all[i];
    const clues = GAME.values.map((v) => {
      const pool = poolFor(cat, v);
      const ok = pool.filter((c) => !onBoard.some((o) => clash(c, o)));
      const fresh = ok.filter((c) => !seen.has(c.q + (c.code || "")));
      const clue = pick(fresh.length ? fresh : ok.length ? ok : pool);
      onBoard.push(clue);
      return clue;
    });
    return { name: cat.name, source: cat, clues };
  });
  const finals = GAME.finals || [GAME.final];
  const freshF = finals.filter((f) => !seen.has("FINAL:" + f.q + (f.code || "")));
  ROUND.final = pick(freshF.length ? freshF : finals);
}
function deckTotal() { return Object.values(GAME.cards || {}).reduce((a, b) => a + (b > 0 ? b : 0), 0); }
function addCardSquare() {
  if (!deckTotal()) return false;
  const open = [];
  ROUND.categories.forEach((_, c) => GAME.values.forEach((_, r) => {
    const k = c + "-" + r;
    if (!cardSquares.has(k) && !used.has(k)) open.push(k);
  }));
  if (!open.length) return false;
  cardSquares.add(pick(open));
  return true;
}
function removeCardSquare() {
  const unplayed = [...cardSquares].filter((k) => !used.has(k));
  if (!unplayed.length) return false;
  cardSquares.delete(pick(unplayed));
  return true;
}
function placeCards() {
  cardSquares = new Set();
  for (let i = 0; i < (GAME.cardsPerGame || 0); i++) if (!addCardSquare()) break;
}
function drawCardId() {
  let roll = Math.random() * deckTotal();
  for (const [id, w] of Object.entries(GAME.cards)) {
    if (w > 0 && CARDS[id]) { roll -= w; if (roll < 0) return id; }
  }
  return Object.keys(GAME.cards).find((id) => GAME.cards[id] > 0);
}

// Game setup
function newGame(keepNames) {
  const names = keepNames ? teams.map((t) => t.name) : [];
  teams = [];
  for (let i = 0; i < GAME.teamCount; i++) teams.push({ name: names[i] || "Team " + (i + 1), score: 0, shield: false, skipPick: false });
  used = new Set(); picker = 0; lastTarget = null; halveUsed = false;
  buildRound(); placeCards(); renderAll();
}
function renderAll() { renderBoard(); renderScores(); renderPick(); }

function renderBoard() {
  $("#title").textContent = GAME.title;
  document.title = GAME.title + ": Python Party Jeopardy";
  $("#catNum").textContent = ROUND.categories.length;
  $("#cardNum").textContent = cardSquares.size;
  $("#teamNum").textContent = teams.length;
  $("#levelBtn").textContent = "Level: " + (level === "warmup" ? "Warm-up" : "Challenge");
  boardEl.style.gridTemplateColumns = "repeat(" + ROUND.categories.length + ", 1fr)";
  boardEl.innerHTML = "";
  ROUND.categories.forEach((cat) => {
    const d = document.createElement("div");
    d.className = "cat"; d.textContent = cat.name; boardEl.appendChild(d);
  });
  GAME.values.forEach((val, r) => ROUND.categories.forEach((cat, c) => {
    const b = document.createElement("button");
    b.className = "tile"; b.textContent = val;
    b.disabled = used.has(c + "-" + r);
    b.setAttribute("aria-label", cat.name + " for " + val);
    b.onclick = () => openSquare(c, r);
    boardEl.appendChild(b);
  }));
}
function renderScores(bump) {
  const bumps = new Set([].concat(bump === undefined ? [] : bump));
  scoresEl.innerHTML = "";
  teams.forEach((t, i) => {
    const d = document.createElement("div");
    d.className = "team" + (i === picker ? " picking" : "");
    const badges = [t.shield ? "Shield" : "", t.skipPick ? "Skips pick" : ""].filter(Boolean).join(" · ");
    d.innerHTML =
      (badges ? '<div class="badges" title="' + (t.shield ? "Has a shield. " : "") + (t.skipPick ? "Skips next pick." : "") + '">' + badges + "</div>" : "") +
      '<input value="' + escAttr(t.name) + '" aria-label="Team name">' +
      '<div class="score' + (t.score < 0 ? " neg" : "") + (bumps.has(i) ? " bump" : "") + '">' + t.score + "</div>" +
      '<div class="adj"><button aria-label="Subtract 100">−100</button><button aria-label="Add 100">+100</button></div>';
    d.querySelector("input").oninput = (e) => { t.name = e.target.value; renderPick(); };
    const [minus, plus] = d.querySelectorAll(".adj button");
    minus.onclick = () => { t.score -= 100; renderScores(i); };
    plus.onclick = () => { t.score += 100; renderScores(i); };
    scoresEl.appendChild(d);
  });
  if (bumps.size) setTimeout(() => scoresEl.querySelectorAll(".bump").forEach((s) => s.classList.remove("bump")), 220);
}
function renderPick() { $("#pickName").textContent = (teams[picker] ? teams[picker].name : "") + " picks"; }
function advancePicker() {
  for (let n = 0; n < teams.length; n++) {
    picker = (picker + 1) % teams.length;
    if (teams[picker].skipPick) { teams[picker].skipPick = false; continue; }
    return;
  }
}

// Modal plumbing
function openModal(html) { stopTimer(); stopTyping(); modal._reveal = null; modal.innerHTML = html; modal.classList.add("open"); escAllowed = false; }
function closeModal() { stopTimer(); stopTyping(); modal.classList.remove("open"); modal.innerHTML = ""; escAllowed = false; }
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
function stopTyping() { if (typeId) { clearInterval(typeId); clearTimeout(typeId); typeId = null; } }
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 660; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch (e) { /* sound is optional */ }
}
// Timer with a +10s button. el = the countdown element.
function startTimer(el, seconds) {
  stopTimer();
  let t = seconds;
  const show = () => { el.textContent = t > 0 ? t : "Time!"; el.classList.toggle("low", t <= 5); };
  show();
  timerId = setInterval(() => { t--; show(); if (t <= 0) { stopTimer(); beep(); } }, 1000);
  el._add = (n) => { if (timerId) { t += n; show(); } else startTimer(el, n); };
}
// Types a line of code one character at a time, then calls done.
function typeCode(el, text, done) {
  stopTyping();
  if (REDUCED) { el.textContent = text; done && done(); return; }
  let i = 0;
  typeId = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) { stopTyping(); setTimeout(() => done && done(), 250); }
  }, 45);
}
function topBar(ctx, extra) {
  return '<div class="m-top"><div class="m-label">' + fmt(ctx.catName) + " for <b>" + ctx.value + "</b> · " + nameOf(ctx.picker) + " picks" +
    "</div>" + (extra || "") + "</div>";
}
// A screen with a message and one button.
function messageScreen(ctx, title, bodyHtml, btnText, next) {
  openModal(topBar(ctx) + '<div class="m-body"><div class="splash" style="font-size:clamp(40px,6vw,100px)">' + title + "</div>" +
    bodyHtml + '<div class="m-actions"><button class="btn primary" id="go">' + btnText + "</button></div></div>");
  $("#go").onclick = next; $("#go").focus();
}
// Let a team be chosen. opts: {title, text, eligible[], noneLabel}
function chooseTeam(ctx, opts, done) {
  const list = opts.eligible;
  openModal(topBar(ctx) + '<div class="m-body"><div class="splash" style="font-size:clamp(36px,5vw,84px)">' + opts.title + "</div>" +
    '<div class="hint">' + opts.text + "</div>" +
    (list.length ? '<div class="chips">' + list.map((i) => '<button class="chip target" data-i="' + i + '">' + nameOf(i) +
      "<small>" + teams[i].score + (teams[i].shield ? " · shield" : "") + "</small></button>").join("") + "</div>"
      : '<div class="hint">No team can be chosen right now.</div>') +
    '<div class="m-actions"><button class="btn" id="none">' + (opts.noneLabel || "Skip") + "</button></div></div>");
  modal.querySelectorAll(".chip").forEach((b) => (b.onclick = () => done(+b.dataset.i)));
  $("#none").onclick = () => done(null);
}
// Teams that can be targeted: never the picker, and not the last team targeted (if there's any other choice).
function targetable(filter) {
  let list = teams.map((_, i) => i).filter((i) => i !== picker && (!filter || filter(i)));
  const without = list.filter((i) => i !== lastTarget);
  return without.length ? without : list;
}
// If the team has a shield, it's used up and the attack is blocked.
function blockedByShield(i) {
  if (!teams[i].shield) return false;
  teams[i].shield = false; renderScores(); return true;
}
function leaders() {
  const top = Math.max(...teams.map((t) => t.score));
  const lead = teams.map((t, i) => i).filter((i) => teams[i].score === top);
  return lead.length === teams.length ? [] : lead;
}

// Opening a square
function openSquare(c, r) {
  const key = c + "-" + r;
  if (used.has(key)) return;
  const cat = ROUND.categories[c];
  const ctx = {
    key, c, r, value: GAME.values[r], clue: cat.clues[r], catName: cat.name, source: cat.source,
    picker, frozen: new Set(), wagers: null, double: false, bounty: false, steal: false, duck: false,
    mods: [], card: null, log: []
  };
  if (cardSquares.has(key)) drawCard(ctx); else showClue(ctx);
}

function drawCard(ctx) {
  const id = drawCardId(); ctx.card = id;
  const card = CARDS[id];
  openModal(topBar(ctx) + '<div class="m-body">' +
    '<div class="cardstage"><div class="card" id="card">' +
      '<div class="face back">deck</div>' +
      '<div class="face front"><div class="name">' + card.name +
      '</div><div class="text">' + fmt(card.text) + "</div></div>" +
    "</div></div>" +
    '<div class="m-actions"><button class="btn primary" id="go" disabled>Continue</button></div></div>');
  const go = $("#go");
  // Flip the card over after a short pause.
  setTimeout(() => {
    $("#card").classList.add("flipped");
    setTimeout(() => { go.disabled = false; go.focus(); }, REDUCED ? 0 : 700);
  }, REDUCED ? 0 : 400);
  go.onclick = () => resolveCard(ctx, id);
}

function resolveCard(ctx, id) {
  const p = ctx.picker, toClue = () => showClue(ctx);
  switch (id) {
    case "steal": ctx.steal = true; ctx.mods.push("Steal"); return toClue();
    case "double": ctx.double = true; ctx.mods.push("Double or Nothing"); return toClue();
    case "bounty": {
      ctx.bounty = true; ctx.bountyOn = leaders();
      ctx.mods.push(ctx.bountyOn.length ? "Bounty on " + ctx.bountyOn.map((i) => teams[i].name).join(" & ") : "Bounty (no leader yet)");
      return toClue();
    }
    case "rubberduck": ctx.duck = true; ctx.mods.push("Rubber Duck"); return toClue();
    case "shield":
      teams[p].shield = true; renderScores();
      return messageScreen(ctx, "Shield", '<div class="hint">' + nameOf(p) + " is protected from the next steal, swap, or freeze.</div>", "Show the clue", toClue);
    case "robinhood": {
      const lead = Math.max(...teams.map((t) => t.score)), low = Math.min(...teams.map((t) => t.score));
      if (lead === low) return messageScreen(ctx, "Robin Hood", '<div class="hint">Everyone is tied, so nobody gives anything.</div>', "Show the clue", toClue);
      const rich = teams.findIndex((t) => t.score === lead), poor = teams.findIndex((t) => t.score === low);
      const amt = Math.min(300, Math.max(teams[rich].score, 0));
      teams[rich].score -= amt; teams[poor].score += amt; renderScores([rich, poor]);
      return messageScreen(ctx, "Robin Hood", '<div class="hint">' + nameOf(rich) + " gives " + amt + " points to " + nameOf(poor) + ".</div>", "Show the clue", toClue);
    }
    case "swap": {
      const list = targetable((i) => Math.abs(teams[i].score - teams[p].score) <= 500);
      return chooseTeam(ctx, { title: "Swap Meet", text: nameOf(p) + " picks a team within 500 points. If " + nameOf(p) + " gets this clue right, the two teams swap scores.", eligible: list, noneLabel: "No swap" }, (i) => {
        if (i === null) return toClue();
        lastTarget = i;
        ctx.swapWith = i; ctx.mods.push("Swap with " + teams[i].name + " if right");
        toClue();
      });
    }
    case "freeze": {
      const list = targetable();
      return chooseTeam(ctx, { title: "Freeze", text: nameOf(p) + " picks a team that can't score on this clue.", eligible: list, noneLabel: "Don't freeze anyone" }, (i) => {
        if (i === null) return toClue();
        lastTarget = i;
        if (blockedByShield(i)) return messageScreen(ctx, "Blocked!", '<div class="hint">' + nameOf(i) + "'s shield blocked the freeze.</div>", "Show the clue", toClue);
        ctx.frozen.add(i); ctx.mods.push(teams[i].name + " frozen");
        toClue();
      });
    }
    case "wager": return wagerScreen(ctx, toClue);
    case "mystery": return mysteryScreen(ctx, toClue);
    case "syntaxerror": return syntaxScreen(ctx, toClue);
    case "wheel": return wheelScreen(ctx, toClue);
    case "lightning": return lightningRound(ctx);
    default: return toClue();
  }
}

function wagerScreen(ctx, next) {
  const max = (i) => Math.max(teams[i].score, ctx.value);
  openModal(topBar(ctx) + '<div class="m-body"><div class="splash" style="font-size:clamp(36px,5vw,84px)">Everybody Wager</div>' +
    '<div class="hint">Each team secretly writes a bet, then enter them here. You can bet up to your score, or up to ' + ctx.value + " if your score is lower.</div>" +
    '<div class="chips">' + teams.map((t, i) => '<label class="chip">' + nameOf(i) + "<small>max " + max(i) + '</small><input type="number" min="0" step="100" data-i="' + i + '" placeholder="0"></label>').join("") + "</div>" +
    '<div class="err" id="err"></div><div class="m-actions"><button class="btn primary" id="go">Lock bets and show the clue</button></div></div>');
  $("#go").onclick = () => {
    const w = [];
    for (const inp of modal.querySelectorAll(".chips input")) {
      const i = +inp.dataset.i, v = parseInt(inp.value || "0", 10);
      if (isNaN(v) || v < 0 || v > max(i)) { $("#err").textContent = teams[i].name + " can bet from 0 to " + max(i) + "."; return; }
      w[i] = v;
    }
    ctx.wagers = w; ctx.mods.push("Everybody Wager"); next();
  };
}

function mysteryScreen(ctx, next) {
  const p = ctx.picker, prize = (rand(8) - 2) * 100;   // random.randint(-2, 5) * 100
  openModal(topBar(ctx) + '<div class="m-body"><div class="splash" style="font-size:clamp(36px,5vw,84px)">Mystery Box</div>' +
    '<div class="splash" id="prize" style="visibility:hidden"></div>' +
    '<div class="m-actions"><button class="btn primary" id="go" disabled>Show the clue</button></div></div>');
  typeId = setTimeout(() => {
    const actual = prize < 0 ? -Math.min(-prize, Math.max(teams[p].score, 0)) : prize;
    teams[p].score += actual; renderScores(p);
    const el = $("#prize");
    el.textContent = (prize > 0 ? "+" : "") + prize;
    el.style.color = prize > 0 ? "var(--right)" : prize < 0 ? "var(--wrong)" : "var(--ink)";
    el.style.visibility = "visible";
    if (prize < 0 && actual !== prize) el.insertAdjacentHTML("afterend", '<div class="hint">Scores can\'t drop below 0 from a card, so ' + nameOf(p) + " loses " + (-actual) + ".</div>");
    $("#go").disabled = false; $("#go").focus();
  }, REDUCED ? 0 : 600);
  $("#go").onclick = next;
}

function syntaxScreen(ctx, next) {
  openModal(topBar(ctx) + '<div class="m-body"><div class="glitch">SyntaxError: board.py crashed</div>' +
    '<div class="hint">Every team loses 100 points. Tap the teams that yelled <b>"SyntaxError!"</b> first. They\'re safe.</div>' +
    '<div class="chips">' + teams.map((t, i) => '<button class="chip" data-i="' + i + '">' + nameOf(i) + "</button>").join("") + "</div>" +
    '<div class="m-actions"><button class="btn primary" id="go">Apply and show the clue</button></div></div>');
  modal.querySelectorAll(".chip").forEach((b) => (b.onclick = () => { b.classList.toggle("on"); }));
  $("#go").onclick = () => {
    const hit = [];
    modal.querySelectorAll(".chip").forEach((b) => {
      const i = +b.dataset.i;
      if (!b.classList.contains("on")) { teams[i].score -= Math.min(100, Math.max(teams[i].score, 0)); hit.push(i); }
    });
    renderScores(hit); next();
  };
}

function wheelScreen(ctx, next) {
  const segs = WHEEL.filter((s) => !(halveUsed && s.label === "Halve points"));
  const n = segs.length, slice = 360 / n;
  const grad = segs.map((s, k) => s.color + " " + k * slice + "deg " + (k + 1) * slice + "deg").join(", ");
  const labels = segs.map((s, k) => {
    const mid = k * slice + slice / 2;
    return '<div class="seg" style="transform:rotate(' + (mid - 90) + 'deg)"><span>' + esc(s.label) + "</span></div>";
  }).join("");
  openModal(topBar(ctx) + '<div class="m-body">' +
    '<div class="wheelwrap"><div class="pointer"></div><div class="wheel" id="wheel" style="background:conic-gradient(' + grad + ')">' + labels +
    '</div><div class="hub">SPIN</div></div><div class="hint" id="result" style="min-height:1.5em"></div>' +
    '<div class="m-actions"><button class="btn primary" id="go" disabled>Continue</button></div></div>');
  const k = rand(n), seg = segs[k];
  typeId = setTimeout(() => {
    const wheel = $("#wheel");
    const target = 360 * 6 + (360 - (k * slice + slice / 2)) + (Math.random() * 0.6 - 0.3) * slice;
    wheel.style.transform = "rotate(" + target + "deg)";
    typeId = setTimeout(() => applyWheel(ctx, seg.label, next), REDUCED ? 0 : 3500);
  }, REDUCED ? 0 : 300);
}
function applyWheel(ctx, label, next) {
  const p = ctx.picker, res = $("#result"), go = $("#go");
  const done = (msg) => { renderScores(); res.innerHTML = "<b>" + esc(label) + "</b>: " + msg; go.disabled = false; go.focus(); go.onclick = next; };
  switch (label) {
    case "+300": teams[p].score += 300; return done(nameOf(p) + " gains 300.");
    case "+100": teams[p].score += 100; return done(nameOf(p) + " gains 100.");
    case "−100": { const a = Math.min(100, Math.max(teams[p].score, 0)); teams[p].score -= a; return done(nameOf(p) + " loses " + a + "."); }
    case "Shield": teams[p].shield = true; return done(nameOf(p) + " gets a shield.");
    case "Everyone +100": teams.forEach((t) => (t.score += 100)); return done("Every team gains 100!");
    case "Lose next pick": teams[p].skipPick = true; return done(nameOf(p) + " skips their next turn to pick.");
    case "Halve points": { halveUsed = true; const a = Math.floor(Math.max(teams[p].score, 0) / 2); teams[p].score -= a; return done(nameOf(p) + " loses half their points (" + a + ")."); }
    case "Steal 200": {
      res.innerHTML = "<b>Steal 200</b>: " + nameOf(p) + " takes up to 200 points from another team.";
      go.disabled = false; go.textContent = "Choose a team to steal from"; go.focus();
      go.onclick = () => chooseTeam(ctx, { title: "Steal 200", text: nameOf(p) + " takes up to 200 points from any team.", eligible: targetable((i) => teams[i].score > 0), noneLabel: "Don't steal" }, (i) => {
        if (i === null) return next();
        lastTarget = i;
        if (blockedByShield(i)) return messageScreen(ctx, "Blocked!", '<div class="hint">' + nameOf(i) + "'s shield blocked the steal.</div>", "Show the clue", next);
        const a = Math.min(200, Math.max(teams[i].score, 0));
        teams[i].score -= a; teams[p].score += a; renderScores([p, i]);
        messageScreen(ctx, "Stolen!", '<div class="hint">' + nameOf(p) + " took " + a + " points from " + nameOf(i) + ".</div>", "Show the clue", next);
      });
      return;
    }
  }
}

// The clue: everyone answers
function showClue(ctx) {
  const clue = ctx.clue, secs = secondsFor(ctx.value);
  const mods = ctx.mods.length ? '<div class="mods">' + ctx.mods.map((m) => '<span class="mod">' + esc(m) + "</span>").join("") + "</div>" : "";
  openModal(topBar(ctx, '<div class="timer" id="timer"></div>') + mods +
    '<div class="m-body">' +
      '<div class="clue' + (clue.code ? " with-code" : "") + '">' + fmt(clue.q) + "</div>" +
      (clue.code ? codeBlock(clue.code) : "") +
      '<div id="ansSlot"></div><div id="awardSlot" style="width:100%;display:flex;justify-content:center"></div>' +
    "</div>" +
    '<div class="m-actions" id="actions">' +
      '<button class="btn" id="timerBtn">Start ' + secs + "s timer</button>" +
      '<button class="btn" id="addTime">+10s</button>' +
      '<button class="btn primary" id="revealBtn">Reveal answer</button>' +
      (ctx.card ? "" : '<button class="btn" id="backBtn">Back to board</button>') +
    "</div>");
  escAllowed = !ctx.card;
  $("#timerBtn").onclick = () => startTimer($("#timer"), secs);
  $("#addTime").onclick = () => { const t = $("#timer"); t._add ? t._add(10) : startTimer(t, 10); };
  if (!ctx.card) $("#backBtn").onclick = closeModal;
  $("#revealBtn").onclick = () => revealClue(ctx);
  modal._reveal = () => revealClue(ctx);
}

function revealClue(ctx) {
  if (ctx.revealed) return;
  ctx.revealed = true; escAllowed = false; modal._reveal = null;
  stopTimer(); $("#timer").textContent = "";
  const clue = ctx.clue;
  $("#ansSlot").innerHTML = '<div class="answer"><div class="a">' + fmt(clue.a) + "</div>" + (clue.note ? '<div class="note">' + fmt(clue.note) + "</div>" : "") + "</div>";
  $("#actions").innerHTML = '<button class="btn primary" id="awardBtn">Award points</button>';
  $("#awardSlot").innerHTML = '<div class="chips">' + teams.map((t, i) => {
    const frozen = ctx.frozen.has(i);
    const sub = frozen ? "frozen" : ctx.wagers ? "bet " + ctx.wagers[i] : i === ctx.picker ? "picker" : "tap if right";
    return '<button class="chip' + (frozen ? " frozen" : "") + '" data-i="' + i + '"' + (frozen ? " disabled" : "") + ">" + nameOf(i) + "<small>" + sub + "</small></button>";
  }).join("") + "</div>";
  modal.querySelectorAll(".chip:not(:disabled)").forEach((b) => (b.onclick = () => b.classList.toggle("on")));
  $("#awardBtn").onclick = () => {
    const right = new Set([...modal.querySelectorAll(".chip.on")].map((b) => +b.dataset.i));
    award(ctx, right);
  };
  $("#awardBtn").focus();
}

function award(ctx, right) {
  const v = ctx.value, p = ctx.picker, deltas = teams.map(() => 0), why = teams.map(() => []);
  teams.forEach((t, i) => {
    if (ctx.frozen.has(i)) { why[i].push("frozen"); return; }
    const ok = right.has(i);
    if (ctx.wagers) { deltas[i] += ok ? ctx.wagers[i] : -ctx.wagers[i]; if (ctx.wagers[i]) why[i].push("bet"); }
    else if (ok) { deltas[i] += ctx.double ? 2 * v : v; }
    else if (ctx.double) { deltas[i] -= v; why[i].push("double or nothing"); }
    if (ok && i === p && !ctx.wagers && bonusFor(v)) { deltas[i] += bonusFor(v); why[i].push("picker bonus"); }
  });
  if (ctx.bounty && ctx.bountyOn.length && ctx.bountyOn.some((i) => !right.has(i))) {
    right.forEach((i) => { if (!ctx.frozen.has(i) && !ctx.bountyOn.includes(i)) { deltas[i] += 200; why[i].push("bounty"); } });
  }
  const swapNote = [];
  if (ctx.swapWith != null) {
    const s = ctx.swapWith;
    if (!right.has(p) || ctx.frozen.has(p)) swapNote.push({ text: "No swap: " + nameOf(p) + " didn't get it right" });
    else if (blockedByShield(s)) swapNote.push({ text: nameOf(s) + "'s shield blocked the swap" });
    else {
      [teams[p].score, teams[s].score] = [teams[s].score, teams[p].score];
      swapNote.push({ text: nameOf(p) + " and " + nameOf(s) + " swapped scores" });
    }
  }
  teams.forEach((t, i) => (t.score += deltas[i]));
  renderScores(teams.map((_, i) => i).filter((i) => deltas[i] || (ctx.swapWith != null && (i === p || i === ctx.swapWith))));
  ctx.log = swapNote.concat(teams.map((t, i) => ({ i, d: deltas[i], why: why[i] })).filter((x) => x.d));
  afterAward(ctx, right);
}

function afterAward(ctx, right) {
  const p = ctx.picker;
  const steps = [];
  if (ctx.steal && right.has(p) && !ctx.frozen.has(p)) steps.push((next) => {
    chooseTeam(ctx, { title: "Steal", text: nameOf(p) + " got it right! Take up to " + ctx.value + " points from any team.", eligible: targetable((i) => teams[i].score > 0), noneLabel: "Don't steal" }, (i) => {
      if (i === null) return next();
      lastTarget = i;
      if (blockedByShield(i)) { ctx.log.push({ text: nameOf(i) + "'s shield blocked the steal" }); return next(); }
      const a = Math.min(ctx.value, Math.max(teams[i].score, 0));
      teams[i].score -= a; teams[p].score += a; renderScores([p, i]);
      ctx.log.push({ text: nameOf(p) + " stole " + a + " from " + nameOf(i) }); next();
    });
  });
  if (ctx.duck) steps.push((next) => {
    openModal(topBar(ctx) + '<div class="m-body"><div class="splash" style="font-size:clamp(40px,6vw,100px)">Rubber Duck</div>' +
      '<div class="hint">' + nameOf(p) + ", explain to the class WHY the answer is right. A good explanation earns +100.</div>" +
      '<div class="m-actions"><button class="btn" id="no">Not quite</button><button class="btn primary" id="yes">Nailed it (+100)</button></div></div>');
    $("#yes").onclick = () => { teams[p].score += 100; renderScores(p); ctx.log.push({ text: nameOf(p) + " +100 for the rubber duck" }); next(); };
    $("#no").onclick = next;
  });
  const run = () => (steps.length ? steps.shift()(run) : summary(ctx));
  run();
}

function summary(ctx) {
  const lines = ctx.log.map((x) => x.text ? "<li>" + x.text + "</li>" :
    '<li class="' + (x.d > 0 ? "plus" : "minus") + '">' + nameOf(x.i) + " " + (x.d > 0 ? "+" : "−") + Math.abs(x.d) +
    (x.why.length ? ' <small class="hint">(' + x.why.join(", ") + ")</small>" : "") + "</li>").join("");
  openModal(topBar(ctx) + '<div class="m-body">' +
    (lines ? '<ul class="result-list">' + lines + "</ul>" : '<div class="hint">No points changed this time.</div>') +
    '<div class="m-actions"><button class="btn primary" id="go">Back to board</button></div></div>');
  $("#go").onclick = () => finishSquare(ctx);
  $("#go").focus();
}

function finishSquare(ctx) {
  used.add(ctx.key);
  if (ctx.revealed) seen.add(ctx.clue.q + (ctx.clue.code || ""));
  advancePicker();
  closeModal(); renderAll();
}

// Lightning round: 3 quick questions instead of the clue
function lightningRound(ctx) {
  const onBoard = new Set(ROUND.categories.flatMap((c) => c.clues));
  const pool = [100, 200].flatMap((v) => poolFor(ctx.source, v)).filter((c) => !onBoard.has(c));
  const fresh = pool.filter((c) => !seen.has(c.q + (c.code || "")));
  const qs = shuffle(fresh.length >= 3 ? fresh : pool).slice(0, 3);
  ctx.log = [];
  const totals = teams.map(() => 0);
  let k = 0;
  const step = () => {
    if (k >= qs.length) {
      ctx.log = totals.map((d, i) => ({ i, d, why: ["lightning"] })).filter((x) => x.d);
      return summary(ctx);
    }
    const q = qs[k];
    openModal(topBar(ctx, '<div class="timer" id="timer"></div>') + '<div class="mods"><span class="mod">Lightning ' + (k + 1) + " of " + qs.length + "</span></div>" +
      '<div class="m-body"><div class="clue' + (q.code ? " with-code" : "") + '">' + fmt(q.q) + "</div>" + (q.code ? codeBlock(q.code) : "") +
      '<div id="ansSlot"></div><div id="awardSlot" style="width:100%;display:flex;justify-content:center"></div></div>' +
      '<div class="m-actions" id="actions"><button class="btn primary" id="revealBtn">Reveal answer</button></div>');
    startTimer($("#timer"), 10);
    const reveal = () => {
      modal._reveal = null; stopTimer(); $("#timer").textContent = "";
      seen.add(q.q + (q.code || ""));
      $("#ansSlot").innerHTML = '<div class="answer"><div class="a">' + fmt(q.a) + "</div></div>";
      $("#awardSlot").innerHTML = '<div class="chips">' + teams.map((t, i) => '<button class="chip" data-i="' + i + '">' + nameOf(i) + "<small>tap if right</small></button>").join("") + "</div>";
      modal.querySelectorAll(".chip").forEach((b) => (b.onclick = () => b.classList.toggle("on")));
      $("#actions").innerHTML = '<button class="btn primary" id="awardBtn">Award +100 and continue</button>';
      $("#awardBtn").onclick = () => {
        const hit = [];
        modal.querySelectorAll(".chip.on").forEach((b) => { const i = +b.dataset.i; teams[i].score += 100; totals[i] += 100; hit.push(i); });
        renderScores(hit); k++; step();
      };
    };
    $("#revealBtn").onclick = reveal; modal._reveal = reveal;
  };
  messageScreen(ctx, "Lightning Round", '<div class="hint">Three quick questions from ' + fmt(ctx.catName) + ". 10 seconds each. Every right team earns 100.</div>", "Start", step);
}

// Final Jeopardy
function startFinal() {
  if (used.size < ROUND.categories.length * GAME.values.length &&
      !confirm("Some squares haven't been played yet. Go to Final Jeopardy anyway?")) return;
  const f = ROUND.final;
  openModal('<div class="m-top"><div class="m-label">Final Jeopardy</div></div><div class="m-body">' +
    '<div class="splash" style="font-size:clamp(40px,7vw,120px)">' + fmt(f.category) + "</div>" +
    '<div class="hint">Each team secretly writes a bet, then enter them here. You can bet from 0 up to your score.</div>' +
    '<div class="chips">' + teams.map((t, i) => '<label class="chip">' + nameOf(i) + "<small>" + t.score + '</small><input type="number" min="0" step="100" data-i="' + i + '" placeholder="0"></label>').join("") + "</div>" +
    '<div class="err" id="fErr"></div><div class="m-actions"><button class="btn" id="fBack">Back to board</button><button class="btn primary" id="fGo">Lock bets and show the clue</button></div></div>');
  $("#fBack").onclick = closeModal;
  $("#fGo").onclick = () => {
    const w = [];
    for (const inp of modal.querySelectorAll(".chips input")) {
      const i = +inp.dataset.i, v = parseInt(inp.value || "0", 10), max = Math.max(teams[i].score, 0);
      if (isNaN(v) || v < 0 || v > max) { $("#fErr").textContent = teams[i].name + " can bet from 0 to " + max + "."; return; }
      w[i] = v;
    }
    finalClue(w);
  };
}
function finalClue(wagers) {
  const f = ROUND.final;
  openModal('<div class="m-top"><div class="m-label">Final Jeopardy · <b>' + fmt(f.category) + '</b></div><div class="timer" id="timer"></div></div>' +
    '<div class="m-body"><div class="clue' + (f.code ? " with-code" : "") + '">' + fmt(f.q) + "</div>" + (f.code ? codeBlock(f.code) : "") +
    '<div id="ansSlot"></div><div id="awardSlot" style="width:100%;display:flex;justify-content:center"></div></div>' +
    '<div class="m-actions" id="actions"><button class="btn" id="timerBtn">Start 60s timer</button><button class="btn primary" id="revealBtn">Reveal answer</button></div>');
  $("#timerBtn").onclick = () => startTimer($("#timer"), 60);
  const reveal = () => {
    modal._reveal = null; stopTimer(); $("#timer").textContent = "";
    seen.add("FINAL:" + f.q + (f.code || ""));
    $("#ansSlot").innerHTML = '<div class="answer"><div class="a">' + fmt(f.a) + "</div>" + (f.note ? '<div class="note">' + fmt(f.note) + "</div>" : "") + "</div>";
    $("#awardSlot").innerHTML = '<div class="chips">' + teams.map((t, i) => '<button class="chip" data-i="' + i + '">' + nameOf(i) + "<small>bet " + wagers[i] + "</small></button>").join("") + "</div>";
    modal.querySelectorAll(".chip").forEach((b) => (b.onclick = () => b.classList.toggle("on")));
    $("#actions").innerHTML = '<button class="btn primary" id="winBtn">Apply bets and show the winner</button>';
    $("#winBtn").onclick = () => {
      const right = new Set([...modal.querySelectorAll(".chip.on")].map((b) => +b.dataset.i));
      teams.forEach((t, i) => (t.score += right.has(i) ? wagers[i] : -wagers[i]));
      renderScores(); showWinner();
    };
  };
  $("#revealBtn").onclick = reveal; modal._reveal = reveal;
}
function showWinner() {
  const top = Math.max(...teams.map((t) => t.score));
  const winners = teams.filter((t) => t.score === top).map((t) => fmt(t.name));
  const ranked = teams.slice().sort((a, b) => b.score - a.score);
  openModal('<div class="m-body"><div class="hint">' + (winners.length > 1 ? "It's a tie!" : "And the winner is…") + "</div>" +
    '<div class="winner">' + winners.join(" & ") + '</div><div class="splash" style="font-size:clamp(40px,6vw,100px)">' + top + "</div>" +
    '<div class="hint">' + ranked.map((t, i) => (i + 1) + ". " + fmt(t.name) + " (" + t.score + ")").join("&nbsp;&nbsp; ") + "</div>" +
    '<div class="m-actions"><button class="btn" id="wBack">Back to board</button></div></div>');
  $("#wBack").onclick = closeModal;
}

// Header controls
$("#more").onclick = () => {
  if (teams.length >= 10) return;
  teams.push({ name: "Team " + (teams.length + 1), score: 0, shield: false, skipPick: false }); renderAll();
};
$("#fewer").onclick = () => {
  if (teams.length <= 2) return;
  teams.pop(); if (picker >= teams.length) picker = 0; if (lastTarget >= teams.length) lastTarget = null; renderAll();
};
$("#pickPrev").onclick = () => { picker = (picker - 1 + teams.length) % teams.length; renderAll(); };
$("#pickNext").onclick = () => { picker = (picker + 1) % teams.length; renderAll(); };
function rebuildBoard(msg) {
  if (used.size && !confirm(msg)) return false;
  used = new Set(); buildRound(); placeCards(); renderAll(); return true;
}
function setCategories(n) {
  if (n < 1 || n > GAME.categories.length) return;
  const old = GAME.categoriesPerGame;
  GAME.categoriesPerGame = n;
  if (!rebuildBoard("Changing the number of categories draws a new board. Scores are kept. Continue?")) GAME.categoriesPerGame = old;
}
$("#catMore").onclick = () => setCategories(ROUND.categories.length + 1);
$("#catFewer").onclick = () => setCategories(ROUND.categories.length - 1);
$("#cardMore").onclick = () => { if (addCardSquare()) { GAME.cardsPerGame = cardSquares.size; renderBoard(); } };
$("#cardFewer").onclick = () => { if (removeCardSquare()) { GAME.cardsPerGame = cardSquares.size; renderBoard(); } };
$("#levelBtn").onclick = () => {
  const old = level;
  level = level === "challenge" ? "warmup" : "challenge";
  if (!rebuildBoard("Switching the level draws a new board. Scores are kept. Continue?")) level = old;
};
$("#newGame").onclick = () => {
  if (confirm("Start a new game? Scores reset and a new set of questions is drawn. Team names stay.")) {
    GAME.teamCount = teams.length; newGame(true);
  }
};
$("#finalBtn").onclick = startFinal;

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  const tag = document.activeElement.tagName;
  if (e.key === "Escape" && escAllowed) closeModal();
  else if (e.key === " " && modal._reveal && tag !== "INPUT" && tag !== "BUTTON") { e.preventDefault(); modal._reveal(); }
});

newGame(false);