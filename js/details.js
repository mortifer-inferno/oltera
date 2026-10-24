// Destination details: click (or press Enter on) a country card to open a side panel with more about that country.
// Content comes from data.js (countries, details, visaBase, visaExtra), so editing that file updates the panel too.
(function () {
  const D = window.OLT;
  if (!D) return;
  D.details = D.details || {};
  const track = document.getElementById("track");
  if (!track) return;
  const cards = [...track.querySelectorAll(".cty")];
  if (!cards.length) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );

  // ---- build the panel once ----
  const root = document.createElement("div");
  root.className = "cd";
  root.id = "cd";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "cdT");
  root.innerHTML = `
    <div class="cd-bg"></div>
    <div class="cd-panel" tabindex="-1">
      <button type="button" class="cd-x" aria-label="Close details">×</button>
      <div class="cd-scroll" id="cdScroll">
        <div class="cd-hero" id="cdHero"></div>
        <div class="cd-body">
          <dl class="cd-facts" id="cdFacts"></dl>
          <section><h4>Why students choose it</h4><ul class="cd-list" id="cdHi"></ul></section>
          <section><h4>Popular fields</h4><ul class="cd-chips" id="cdFi"></ul></section>
          <section><h4>Good to know</h4><p id="cdTip"></p></section>
          <section><h4>Documents we help you prepare</h4><ul class="cd-list cd-docs" id="cdDocs"></ul></section>
          <p class="cd-note" id="cdNote"></p>
        </div>
      </div>
      <div class="cd-foot">
        <div class="cd-pn">
          <button type="button" id="cdPrev" aria-label="Previous country"></button>
          <button type="button" id="cdNext" aria-label="Next country"></button>
        </div>
        <button type="button" class="solid" id="cdGo"></button>
      </div>
    </div>`;
  document.body.append(root);
  const $ = (id) => document.getElementById(id);
  const panel = root.querySelector(".cd-panel");
  let cur = 0,
    opener = null,
    isOpen = false,
    closeTimer;

  function fill(i) {
    cur = i;
    const c = D.countries[i],
      d = D.details[c.n] || {};
    $("cdHero").innerHTML =
      (c.img
        ? `<img src="${esc(c.img)}" alt="" style="object-position:${esc(
            c.pos || "center"
          )}">`
        : `<div class="cd-ph"></div>`) +
      `<div class="cd-hero-t"><h3 id="cdT">${esc(c.n)}</h3><p>${esc(
        d.intro || c.note
      )}</p></div>`;
    $("cdFacts").innerHTML =
      `<div><dt>Typical IELTS</dt><dd>${esc(c.ielts)}</dd></div>` +
      `<div><dt>Intakes</dt><dd>${esc(c.intake)}</dd></div>`;
    $("cdHi").innerHTML = (d.highlights || [c.note])
      .map((h) => `<li>${esc(h)}</li>`)
      .join("");
    $("cdFi").innerHTML = (d.fields || [])
      .map((f) => `<li>${esc(f)}</li>`)
      .join("");
    root.querySelector("#cdFi").parentElement.hidden = !(
      d.fields && d.fields.length
    );
    $("cdTip").textContent =
      d.tip || "Requirements differ by university and course.";
    $("cdDocs").innerHTML = D.visaBase
      .concat(D.visaExtra[c.n] || [])
      .map((x) => `<li>${esc(x)}</li>`)
      .join("");
    $("cdNote").textContent = D.detailNote || "";
    const n = D.countries.length;
    $("cdPrev").textContent = D.countries[(i - 1 + n) % n].n;
    $("cdNext").textContent = D.countries[(i + 1) % n].n;
    $("cdGo").textContent = "Get free counselling for " + c.n;
    $("cdScroll").scrollTop = 0;
    window.oltTrack && window.oltTrack("destination", { country: c.n });
  }

  function open(i, from) {
    clearTimeout(closeTimer);
    opener = from || null;
    fill(i);
    if (!isOpen) {
      isOpen = true;
      root.hidden = false;
      document.body.style.overflow = "hidden";
      // next frame so the transition runs
      requestAnimationFrame(() =>
        requestAnimationFrame(() => root.classList.add("open"))
      );
      panel.focus({ preventScroll: true });
    }
  }
  function close(refocus = true) {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove("open");
    document.body.style.overflow = "";
    closeTimer = setTimeout(() => (root.hidden = true), RM ? 0 : 500);
    if (refocus && opener) opener.focus({ preventScroll: true });
  }
  function step(dir) {
    const n = D.countries.length,
      i = (cur + dir + n) % n;
    const body = $("cdScroll");
    if (RM) return fill(i);
    body.classList.add("swap");
    setTimeout(() => {
      fill(i);
      body.classList.remove("swap");
    }, 180);
  }

  // The destinations section is pinned by GSAP and clips its overflow. Focusing a card must never
  // let the browser scroll that clipped box sideways (it would knock the cards out of place).
  const dest = document.querySelector(".dest");
  if (dest)
    [dest, dest.firstElementChild].forEach((n) => {
      if (n)
        n.addEventListener("scroll", () => (n.scrollLeft = 0), {
          passive: true,
        });
    });

  // While the page is scrolling, the sliding cards pass under the mouse and keep triggering hover effects,
  // which looks like flicker. Pause card hovers during scrolling and for a moment after.
  let scrollT;
  addEventListener(
    "scroll",
    () => {
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(scrollT);
      scrollT = setTimeout(
        () => document.documentElement.classList.remove("is-scrolling"),
        140
      );
    },
    { passive: true }
  );

  // ---- previous / next arrows for the sideways card row ----
  const head = document.querySelector(".dest-head");
  if (head) {
    const nav = document.createElement("div");
    nav.className = "dest-arrows";
    nav.innerHTML =
      '<button type="button" aria-label="Scroll destinations left">‹</button><button type="button" aria-label="Scroll destinations right">›</button>';
    head.append(nav);
    const by = (d) =>
      track.scrollBy({
        left: d * (cards[0].offsetWidth + 24),
        behavior: RM ? "auto" : "smooth",
      });
    nav.children[0].onclick = () => by(-1);
    nav.children[1].onclick = () => by(1);
  }

  // ---- make the cards clickable ----
  cards.forEach((card, i) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `${D.countries[i].n}: view details`);
    card.classList.add("cty-click");
    const more = document.createElement("span");
    more.className = "cty-more";
    more.textContent = "View details";
    more.setAttribute("aria-hidden", "true");
    card.querySelector(".cty-b").append(more);
    card.addEventListener("mousedown", (e) => e.preventDefault()); // no focus-scroll on mouse click
    card.addEventListener("click", () => open(i, card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i, card);
      }
    });
  });

  // ---- controls ----
  root.querySelector(".cd-bg").addEventListener("click", () => close());
  root.querySelector(".cd-x").addEventListener("click", () => close());
  $("cdPrev").addEventListener("click", () => step(-1));
  $("cdNext").addEventListener("click", () => step(1));
  $("cdGo").addEventListener("click", () => {
    const name = D.countries[cur].n,
      sel = document.getElementById("c");
    close(false);
    if (sel) sel.value = name;
    const t = document.getElementById("counselling");
    setTimeout(() => t && t.scrollIntoView({ behavior: "smooth" }), 60);
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    } else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Tab") {
      // keep keyboard focus inside the panel
      const f = [
        ...panel.querySelectorAll(
          "button:not([disabled]),a[href],[tabindex='0']"
        ),
      ].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0],
        z = f[f.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === a || document.activeElement === panel)
      ) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    }
  });
})();
