// Extra sections built from data.js: services, 12-month plan, country finder and a country comparison.
// Injected after #why. Loads before main.js so the generic heading reveals pick these sections up too.
(function () {
  const D = window.OLT,
    anchor = document.getElementById("why");
  if (!D || !D.services || !anchor) return;
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // field categories used by the finder (matched against each country's popular fields in data.js)
  const CATS = [
    ["Engineering", /engineer/i],
    [
      "Business and finance",
      /business|management|finance|economics|accounting/i,
    ],
    ["Computer science and IT", /computer|\bdata\b|\bIT\b|technology/i],
    [
      "Health and life sciences",
      /health|nursing|medicine|pharma|life science|dentistry/i,
    ],
    [
      "Design, arts and architecture",
      /design|arts|architecture|fashion|media|music/i,
    ],
    ["Hospitality and tourism", /hospitality|tourism/i],
    [
      "Education, law and humanities",
      /education|law|humanities|social|languages/i,
    ],
  ];
  const BANDS = [
    ["", "Not taken yet"],
    ["5.5", "5.5"],
    ["6", "6.0"],
    ["6.5", "6.5"],
    ["7", "7.0 or above"],
  ];
  const names = D.countries
    .map((c, i) => `<option value="${i}">${esc(c.n)}</option>`)
    .join("");

  anchor.insertAdjacentHTML(
    "afterend",
    `<section class="svc" id="services"><div class="w"><h2>Everything you need, in one place</h2>
<p class="sub">From the first conversation to your first week abroad.</p>
<div class="svcg">${D.services
      .map(
        (s, i) =>
          `<article class="sv"><small>${String(i + 1).padStart(
            2,
            "0"
          )}</small><div><h3>${esc(s[0])}</h3><p>${esc(
            s[1]
          )}</p></div></article>`
      )
      .join("")}</div></div></section>
<section class="plan" id="plan"><div class="w"><h2>Your 12-month plan</h2>
<p class="lead">Most students start 9 to 12 months before their intake. This is how the year usually runs.</p>
<ol class="pgrid"><span class="pline"></span>${D.plan
      .map(
        (p) =>
          `<li><small>${esc(p[0])}</small><h3>${esc(p[1])}</h3><p>${esc(
            p[2]
          )}</p></li>`
      )
      .join("")}</ol><p class="pnote">${esc(
      D.planNote || ""
    )}</p></div></section>
<section class="find" id="finder"><div class="w"><h2>Find your country</h2>
<p class="sub">Pick a field and your IELTS band. We show the countries on our list that fit, using the typical scores on this page. Requirements differ by university, so we confirm them for you.</p>
<div class="ff"><p><label class="l" for="ff1">Field of study</label><select id="ff1">${CATS.map(
      (c, i) => `<option value="${i}">${c[0]}</option>`
    ).join("")}</select></p>
<p><label class="l" for="ff2">Your IELTS band</label><select id="ff2">${BANDS.map(
      (b) => `<option value="${b[0]}">${b[1]}</option>`
    ).join("")}</select></p></div>
<p class="fcount" id="fcount" aria-live="polite"></p><div class="fres" id="fres"></div>
<h3 class="cmp-h">Compare two countries</h3>
<div class="ff"><p><label class="l" for="ca">First country</label><select id="ca">${names}</select></p>
<p><label class="l" for="cb">Second country</label><select id="cb">${names}</select></p></div>
<div class="cmpw"><table class="cmp" id="cmp"></table></div></div></section>`
  );

  const $ = (id) => document.getElementById(id),
    pop = (el) => {
      if (!RM && window.gsap)
        gsap.from(el.children, {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
    };

  // ---- collapse the three sections behind a "Show more" bar ----
  const more = document.createElement("section");
  more.className = "fmore";
  more.id = "more";
  more.innerHTML =
    '<div class="w"><div class="fmore-bar"><div><h2>More ways we help</h2><p class="sub">Services, a 12-month plan, a country finder and a country comparison.</p></div><button type="button" class="solid" id="moreBtn" aria-expanded="false" aria-controls="moreBody">Show more</button></div></div><div class="fmore-body" id="moreBody" hidden></div>';
  $("services").before(more);
  const body = $("moreBody"),
    btn = $("moreBtn"),
    refresh = () => window.ScrollTrigger && ScrollTrigger.refresh(),
    g = window.gsap && !RM;
  ["services", "plan", "finder"].forEach((id) => body.append($(id)));
  let isOpen = false;
  btn.onclick = () => {
    isOpen = !isOpen;
    btn.textContent = isOpen ? "Show less" : "Show more";
    btn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      body.hidden = false;
      if (g) {
        gsap.fromTo(
          body,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.7,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(body, { clearProps: "height,opacity" });
              refresh();
            },
          }
        );
        gsap.from(".sv,.pgrid li,.find .ff,.cmpw", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.04,
          delay: 0.2,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });
      } else refresh();
    } else {
      more.scrollIntoView({
        behavior: RM ? "auto" : "smooth",
        block: "center",
      });
      if (g)
        gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            body.hidden = true;
            gsap.set(body, { clearProps: "height,opacity" });
            refresh();
          },
        });
      else {
        body.hidden = true;
        refresh();
      }
    }
  };

  // ---- finder ----
  function find() {
    const cat = CATS[+$("ff1").value],
      band = $("ff2").value === "" ? null : parseFloat($("ff2").value),
      hits = [];
    D.countries.forEach((c, i) => {
      const fl = ((D.details[c.n] || {}).fields || []).filter((f) =>
        cat[1].test(f)
      );
      if (fl.length && (band === null || band >= parseFloat(c.ielts)))
        hits.push({ c, i, fl });
    });
    $("fcount").textContent = hits.length
      ? `${hits.length} of ${D.countries.length} countries fit.`
      : "";
    $("fres").innerHTML = hits.length
      ? hits
          .map(
            (h) =>
              `<article class="fr"><h4>${esc(
                h.c.n
              )}</h4><dl><dt>Typical IELTS</dt><dd>${esc(
                h.c.ielts
              )}</dd><dt>Intakes</dt><dd>${esc(h.c.intake)}</dd></dl><p>${esc(
                h.fl.slice(0, 2).join(" · ")
              )}</p><button type="button" class="btn" data-i="${
                h.i
              }">View details</button></article>`
          )
          .join("")
      : '<p class="none">No country on our list fits both choices. Try another field or a different band, or book a free counselling session to look at other routes.</p>';
    pop($("fres"));
  }
  $("ff1").onchange = $("ff2").onchange = find;
  $("fres").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"),
      card = b && document.querySelectorAll("#track .cty")[+b.dataset.i];
    if (card) card.click();
  });
  find();

  // ---- compare ----
  $("ca").value = 0;
  $("cb").value = Math.min(2, D.countries.length - 1);
  function compare() {
    const a = D.countries[+$("ca").value],
      b = D.countries[+$("cb").value],
      da = D.details[a.n] || {},
      db = D.details[b.n] || {},
      row = (l, x, y) =>
        `<tr><th scope="row">${l}</th><td>${esc(x || "")}</td><td>${esc(
          y || ""
        )}</td></tr>`;
    $("cmp").innerHTML =
      `<thead><tr><th></th><th scope="col">${esc(
        a.n
      )}</th><th scope="col">${esc(b.n)}</th></tr></thead><tbody>` +
      row("Typical IELTS", a.ielts, b.ielts) +
      row("Intakes", a.intake, b.intake) +
      row(
        "Popular fields",
        (da.fields || []).join(", "),
        (db.fields || []).join(", ")
      ) +
      row("Good to know", da.tip, db.tip) +
      "</tbody>";
    if (!RM && window.gsap)
      gsap.from("#cmp tbody tr", {
        y: 12,
        opacity: 0,
        duration: 0.4,
        stagger: 0.07,
        clearProps: "transform,opacity",
      });
  }
  $("ca").onchange = $("cb").onchange = compare;
  compare();

  // ---- scroll animation ----
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const once = (t, s = "top 85%") => ({ trigger: t, start: s, once: true });
    gsap.fromTo(
      ".pline",
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".pgrid",
          start: "top 75%",
          end: "bottom 60%",
          scrub: true,
        },
      }
    );
  });
})();
