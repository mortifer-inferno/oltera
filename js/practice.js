(function () {
  // ---- question bank: each set is one passage + 5 questions. Answer: 0 True, 1 False, 2 Not Given ----
  const BANK = [
    {
      p:
        "Urban gardens have spread across many cities in the last decade. Residents turn rooftops, car parks and unused lots into small farms. Supporters say the gardens give fresh food to neighbourhoods far from supermarkets and bring neighbours together. Critics point out that the yield is small compared with rural farms and that city soil can contain lead. Several councils now test soil for free and lend raised beds to groups who want to grow vegetables safely.",
      q: [
        ["Urban gardens have mostly appeared in the last decade.", 0],
        ["Gardens can supply food to areas far from supermarkets.", 0],
        ["City gardens produce more food than rural farms.", 1],
        ["City soil may contain lead.", 0],
        ["Councils charge residents to test soil.", 1],
        ["Most urban gardeners are retired people.", 2],
      ],
    },
    {
      p:
        "Sleep researchers have long known that teenagers tend to fall asleep later than children or adults. During adolescence the body clock shifts by about two hours, so many teenagers do not feel tired until close to midnight. Yet most secondary schools start before 8.30 a.m. In one region, a group of schools moved the start time to 10 a.m. Attendance rose and students reported feeling more alert in morning lessons. However, some parents said the later finish made it hard to arrange after-school sport and part-time jobs. The researchers have called for more trials before any national policy is considered.",
      q: [
        ["Teenagers' body clocks shift later during adolescence.", 0],
        ["Most secondary schools start after 8.30 a.m.", 1],
        ["Attendance improved after the schools changed their start time.", 0],
        ["Exam results rose sharply in the trial schools.", 2],
        ["All parents supported the later start.", 1],
        ["The researchers want a national policy introduced immediately.", 1],
      ],
    },
    {
      p:
        "Many European cities have invested in cycling infrastructure over the past twenty years. Copenhagen now has more than 390 kilometres of bike lanes, and around half of its residents cycle to work or school each day. Planners argue that cycling reduces traffic congestion and lowers air pollution. Some shop owners initially feared that removing parking spaces would cost them customers, but several studies have found that people on bicycles visit shops more often than drivers do. Cities in hotter climates have been slower to follow, partly because of concerns about arriving at work sweaty.",
      q: [
        ["Copenhagen has more than 390 kilometres of bike lanes.", 0],
        ["Shop owners were never worried about losing parking spaces.", 1],
        ["Studies suggest cyclists visit shops more often than drivers.", 0],
        ["Cycling lowers healthcare costs in cities.", 2],
        ["Hotter cities have adopted cycling faster than European cities.", 1],
        ["Planners say cycling can reduce air pollution.", 0],
      ],
    },
    {
      p:
        "Public libraries in many countries have changed from quiet places for borrowing books into community centres. Many now offer free internet access, language classes and workshops for job seekers. In a survey of 2,000 library users, 60 per cent said they visited mainly to use a computer or attend an event rather than to borrow books. Some councils have reduced opening hours to save money, which supporters say hurts the people who depend on these services most. A few libraries have started lending tools, musical instruments and even board games.",
      q: [
        ["Many libraries now provide free internet access.", 0],
        ["Most surveyed users came mainly to borrow books.", 1],
        ["The survey asked 2,000 people.", 0],
        ["Library membership has fallen over the last decade.", 2],
        ["Some councils have increased library opening hours.", 1],
        ["A few libraries lend items other than books.", 0],
      ],
    },
  ];
  const N = 5; // questions shown per test
  const O = ["True", "False", "Not Given"],
    band = (n) => [3.5, 4.5, 5.5, 6.5, 7.5, 8.5][n];

  // Fisher-Yates shuffle (returns a copy)
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // pick a random set, avoiding the one used last time on this device
  function pickSet() {
    let last = -1;
    try {
      const v = localStorage.getItem("oltera_set");
      if (v !== null && v !== "" && !isNaN(+v)) last = +v;
    } catch (e) {}
    const ids = BANK.map((_, i) => i).filter((i) => i !== last),
      i = ids[Math.floor(Math.random() * ids.length)];
    try {
      localStorage.setItem("oltera_set", i);
    } catch (e) {}
    return BANK[i];
  }

  let P = "",
    Q = [],
    tm,
    left = 300;
  const $ = (id) => document.getElementById(id),
    T = $("test"),
    R = $("res"),
    TM = $("timer");
  const fmt = (s) =>
    String(Math.floor(s / 60)).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0");
  function lastShow() {
    try {
      const v = JSON.parse(localStorage.getItem("oltera_last") || "null");
      $("last").textContent = v
        ? `Last result on this device: ${v.s}/5, band ${v.b} (${v.d})`
        : "";
    } catch (e) {}
  }
  function finish() {
    clearInterval(tm);
    let s = 0;
    Q.forEach((q, i) => {
      const c = T.querySelector(`input[name=q${i}]:checked`);
      T.querySelectorAll(".q")
        [i].querySelectorAll("label")
        [q[1]].classList.add("ok");
      if (c && +c.value === q[1]) s++;
    });
    T.querySelectorAll("input").forEach((i) => (i.disabled = true));
    R.textContent = `${s} out of 5. Estimated band ${band(
      s
    )}. Correct answers are highlighted.`;
    try {
      localStorage.setItem(
        "oltera_last",
        JSON.stringify({ s, b: band(s), d: new Date().toLocaleDateString() })
      );
    } catch (e) {}
    window.oltTrack &&
      window.oltTrack("test", { score: s, of: 5, band: band(s) });
    lastShow();
    $("mprog").textContent = "Finished";
    if (!$("again")) {
      const b = document.createElement("button");
      b.className = "solid";
      b.id = "again";
      b.type = "button";
      b.textContent = "Try another passage";
      b.onclick = begin;
      R.after(b);
    }
  }
  function begin() {
    const a = $("again");
    a && a.remove();
    R.textContent = "";
    left = 300;
    // new random passage and a random 5 of its questions, in random order, every time
    const set = pickSet();
    P = set.p;
    Q = shuffle(set.q).slice(0, N);
    T.innerHTML =
      `<p class="passage">${P}</p>` +
      Q.map(
        (q, i) =>
          `<div class="q"><p>${i + 1}. ${q[0]}</p><div class="opts">${O.map(
            (o, j) =>
              `<label><input type="radio" name="q${i}" value="${j}">${o}</label>`
          ).join("")}</div></div>`
      ).join("") +
      '<button class="solid" id="sub">Submit answers</button>';
    $("sub").onclick = finish;
    $("mprog").textContent = "Questions 1–5";
    TM.textContent = fmt(left);
    clearInterval(tm);
    tm = setInterval(() => {
      left--;
      TM.textContent = fmt(left);
      if (left <= 0) finish();
    }, 1000);
  }
  $("start").onclick = begin;
  lastShow();
  const E = $("essay"),
    W = $("wc"),
    C = $("checks");
  const rules = [
    ["At least 250 words", (t) => t.w >= 250],
    ["Three or more paragraphs", (t) => t.p >= 3],
    [
      "Linking words such as however, therefore, for example",
      (t) =>
        /\b(however|therefore|in addition|moreover|for example|on the other hand)\b/i.test(
          t.t
        ),
    ],
    [
      "Your own opinion, like “in my view”",
      (t) =>
        /\b(i believe|in my view|in my opinion|i think|i agree)\b/i.test(t.t),
    ],
    [
      "A closing paragraph that starts “In conclusion”",
      (t) => /in conclusion|to conclude|to sum up/i.test(t.t),
    ],
  ];
  function upd() {
    const t = E.value,
      w = (t.trim().match(/\S+/g) || []).length,
      p = t.split(/\n\s*\n/).filter((x) => x.trim()).length;
    W.textContent = `${w} words (aim for 250 or more)`;
    const o = { t, w, p };
    C.innerHTML = rules
      .map((r) => `<li class="${r[1](o) ? "on" : ""}">${r[0]}</li>`)
      .join("");
  }
  E.oninput = upd;
  upd();
})();
