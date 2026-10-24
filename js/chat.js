// Oltera assistant: floating chat that answers visitors' questions.
// Answers visitors' questions from the site's own content in data.js. No server needed.
(function () {
  const D = window.OLT;
  if (!D) return;
  const el = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x !== undefined) e.textContent = x;
    return e;
  };
  const PLANS = [
    [
      "Self-study",
      "₹999",
      "module drills, two mock tests a month and a progress record",
    ],
    [
      "Studio",
      "₹3,499",
      "everything in Self-study plus teacher-marked writing and a weekly speaking session",
    ],
    [
      "Intensive",
      "₹7,999",
      "daily live classes, speaking twice a week and help booking your test date",
    ],
  ];
  const HELLO =
    "Hi, I'm the Oltera assistant. Ask me about IELTS scores, countries, visas, plans or counselling.";
  const SUG = [
    "What IELTS score do I need?",
    "When should I start?",
    "What are your plans?",
    "What documents are needed for a visa?",
  ];

  // ---- build the widget ----
  const fab = el("button", "chat-fab", "Ask AI");
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "chat");
  fab.setAttribute("aria-label", "Open chat assistant");
  const box = el("div", "chat");
  box.id = "chat";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Oltera assistant");
  const head = el("div", "chat-h");
  head.append(el("b", "", "Ask Oltera"));
  const x = el("button", "chat-x", "×");
  x.setAttribute("aria-label", "Close chat");
  head.append(x);
  const log = el("div", "chat-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  const sug = el("div", "chat-sug");
  const form = el("form", "chat-f");
  const inp = el("input");
  inp.type = "text";
  inp.placeholder = "Type your question";
  inp.maxLength = 300;
  inp.setAttribute("aria-label", "Your question");
  inp.autocomplete = "off";
  const send = el("button", "chat-s", "Send");
  send.type = "submit";
  form.append(inp, send);
  box.append(head, log, sug, form);
  document.body.append(fab, box);

  function bubble(text, who, act) {
    const b = el("div", "m " + who);
    b.append(el("span", "", text));
    if (act) {
      const a = el("button", "chat-act", act.label);
      a.type = "button";
      a.onclick = act.fn;
      b.append(a);
    }
    log.append(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }
  const toForm = () => ({
    label: "Book free counselling",
    fn: () => {
      close();
      const t = document.getElementById("counselling");
      t && t.scrollIntoView({ behavior: "smooth" });
    },
  });

  // ---- answers from the site's own content (used when the AI server is not reachable) ----
  const stop = new Set(
    "a an the is are do does i you we my me to of for and or in on at it can how what when will with about your our be this that have has".split(
      " "
    )
  );
  const toks = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w && !stop.has(w));
  function local(q) {
    const t = q.toLowerCase(),
      w = toks(q);
    const cty = D.countries.find(
      (c) =>
        t.includes(c.n.toLowerCase()) ||
        (c.n === "United Kingdom" && /\b(uk|britain|england)\b/.test(t)) ||
        (c.n === "United States" && /\b(usa|us|america)\b/.test(t))
    );
    if (
      /^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t) &&
      w.length < 3
    )
      return { t: HELLO };
    if (/visa/.test(t)) {
      const items = D.visaBase.concat((cty && D.visaExtra[cty.n]) || []);
      return {
        t: `Main documents${cty ? " for " + cty.n : ""}: ${items.join(
          "; "
        )}. We check them with you before you file.${
          cty ? "" : " Tell me a country for its specific items."
        }`,
      };
    }
    if (/counsel|consult|book|contact|talk|call|email|phone/.test(t))
      return {
        t:
          "Your first counselling session is free. Fill in the form at the bottom of the page and we will email you a time to talk.",
        act: toForm(),
      };
    if (/\b(plan|plans|price|pricing|fee|fees|cost|how much|package)\b/.test(t))
      return {
        t:
          "IELTS plans: " +
          PLANS.map((p) => `${p[0]} ${p[1]} (${p[2]})`).join(". ") +
          ". These prices are placeholders until confirmed by the studio.",
      };
    const mod = Object.keys(D.mods).find((k) => t.includes(k.toLowerCase()));
    if (mod) return { t: `${mod}: ${D.mods[mod][0]}. ${D.mods[mod][1]}` };
    if (cty)
      return {
        t: `${cty.n}: typical IELTS ${cty.ielts}. Intakes: ${cty.intake}. ${cty.note} Requirements differ by university and course, so we confirm them for you.`,
      };
    let best = null,
      bs = 0;
    D.faqs.forEach((f) => {
      const qt = toks(f[0]),
        at = toks(f[1]);
      const s =
        w.filter((x) => qt.includes(x)).length * 2 +
        w.filter((x) => at.includes(x)).length;
      if (s > bs) {
        bs = s;
        best = f;
      }
    });
    if (best && bs >= 2) return { t: best[1] };
    return {
      t:
        "I'm not sure about that one, and I would rather not guess. A counsellor can answer it properly. Book a free session and we will reply with a time to talk.",
      act: toForm(),
    };
  }

  // ---- conversation ----
  const hist = [];
  let busy = false;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const scroll = () => {
    log.scrollTop = log.scrollHeight;
  };
  // animated "someone is typing" bubble
  function typingBubble() {
    const b = el("div", "m b typing"),
      d = el("span", "dots");
    d.innerHTML = "<i></i><i></i><i></i>";
    b.append(d);
    log.append(b);
    scroll();
    return b;
  }
  // the assistant's reply appears word by word, like it is being typed
  async function botSay(text, act) {
    const b = el("div", "m b"),
      sp = el("span");
    b.append(sp);
    log.append(b);
    if (RM) sp.textContent = text;
    else
      for (const part of text.split(/(\s+)/)) {
        sp.textContent += part;
        scroll();
        if (part.trim())
          await sleep(
            30 + Math.random() * 50 + (/[.,!?]$/.test(part) ? 140 : 0)
          );
      }
    if (act) {
      const a = el("button", "chat-act", act.label);
      a.type = "button";
      a.onclick = act.fn;
      b.append(a);
      scroll();
    }
  }
  async function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    sug.hidden = true;
    inp.value = "";
    send.disabled = true;
    bubble(q, "u");
    hist.push({ role: "user", content: q });
    const t0 = Date.now(),
      typing = typingBubble();
    let a, act;
    const l = local(q);
    a = l.t;
    act = l.act;
    // always "think" for a moment so the reply never appears instantly
    await sleep(
      Math.max(0, (RM ? 250 : 1000 + Math.random() * 900) - (Date.now() - t0))
    );
    typing.remove();
    await botSay(a, act);
    hist.push({ role: "assistant", content: a });
    busy = false;
    send.disabled = false;
    inp.focus();
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    ask(inp.value);
  };
  SUG.forEach((s) => {
    const b = el("button", "", s);
    b.type = "button";
    b.onclick = () => ask(s);
    sug.append(b);
  });

  sug.hidden = true;
  let first = true,
    isOpen = false;
  async function greet() {
    busy = true;
    send.disabled = true;
    const t = typingBubble();
    await sleep(RM ? 200 : 900);
    t.remove();
    await botSay(HELLO);
    sug.hidden = false;
    if (window.gsap && !RM)
      gsap.from(".chat-sug button", {
        y: 12,
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        stagger: 0.08,
        ease: "back.out(2)",
        clearProps: "transform,opacity",
      });
    busy = false;
    send.disabled = false;
    inp.focus({ preventScroll: true });
  }
  function open() {
    isOpen = true;
    if (window.gsap) gsap.killTweensOf(box);
    box.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    fab.setAttribute("aria-label", "Close chat assistant");
    if (window.gsap && !RM)
      gsap.fromTo(
        box,
        { y: 30, opacity: 0, scale: 0.94, transformOrigin: "100% 100%" },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.6)",
          clearProps: "transform,opacity",
        }
      );
    inp.focus({ preventScroll: true });
    if (first) {
      first = false;
      greet();
    }
  }
  function close() {
    isOpen = false;
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-label", "Open chat assistant");
    if (window.gsap && !RM)
      gsap.to(box, {
        y: 20,
        opacity: 0,
        scale: 0.95,
        transformOrigin: "100% 100%",
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (!isOpen) {
            box.hidden = true;
          }
          gsap.set(box, { clearProps: "transform,opacity" });
        },
      });
    else box.hidden = true;
  }
  fab.onclick = () => (isOpen ? close() : open());
  x.onclick = () => {
    close();
    fab.focus();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      close();
      fab.focus();
    }
  });
})();
