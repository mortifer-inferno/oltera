(function () {
  const D = window.OLT,
    $ = (id) => document.getElementById(id);
  // ---- the Oltera emblem as reusable markup (rectangle, circle, diamond, centre circle) ----
  const EMB =
    '<rect x="1" y="1" width="262" height="212" rx="5" pathLength="1"/><circle cx="132" cy="107" r="106" pathLength="1"/><path class="dm" d="M132 1 L238 107 L132 213 L26 107 Z" pathLength="1"/><circle class="ci" cx="132" cy="107" r="37" pathLength="1"/><path d="M1 107 H26 M238 107 H263" pathLength="1"/>';
  const logo = (c) =>
    `<svg class="lg ${
      c || ""
    }" viewBox="0 0 264 214" aria-hidden="true" focusable="false">${EMB}</svg>`;
  // ---- build content from data.js ----
  $("stats").innerHTML = D.stats
    .map(
      (s) =>
        `<div><b data-to="${s[0]}" data-suf="${s[1]}">${s[0].toLocaleString()}${
          s[1]
        }</b><span>${s[2]}</span></div>`
    )
    .join("");
  {
    const A = D.about,
      P = (ps) =>
        ps
          .map((p) => `<p${p.length < 70 ? ' class="em"' : ""}>${p}</p>`)
          .join("");
    $("storyT").textContent = A.story.title;
    $("storyQ").textContent = A.story.quote;
    $("storyB").innerHTML = P(A.story.paras);
    $("goalT").textContent = A.goal.title;
    $("goalL").innerHTML = A.goal.lead.map((l) => `<p>${l}</p>`).join("");
    $("goalB").innerHTML = P(A.goal.paras);
    $("aboutTag").textContent = A.tag;
  }
  {
    const set = D.countries
      .map((c) => `<span>${c.n}</span><i>${logo("mq-lg")}</i>`)
      .join("");
    const mq = document.createElement("section");
    mq.className = "mq";
    mq.setAttribute("aria-hidden", "true");
    mq.innerHTML = `<div class="mq-in"><div class="mq-set">${set}</div><div class="mq-set dup">${set}</div></div>`;
    $("about").before(mq);
  }
  $("track").innerHTML = D.countries
    .map(
      (c) =>
        `<article class="cty">${
          c.img
            ? `<img class="cty-img" src="${
                c.img
              }" alt="" style="position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;object-position:${
                c.pos || "center"
              }">`
            : `<div class="cty-img ph" style="position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;background:#3a3a3a"></div>`
        }${logo("cty-lg")}<div class="cty-b"><div><h3>${c.n}</h3><p>${
          c.note
        }</p></div><dl><dt>Typical IELTS</dt><dd>${
          c.ielts
        }</dd><dt>Intakes</dt><dd>${c.intake}</dd></dl></div></article>`
    )
    .join("");
  $("track")
    .querySelectorAll("img.cty-img")
    .forEach(
      (i) =>
        (i.onerror = () => {
          const p = document.createElement("div");
          p.className = "cty-img ph";
          p.style.cssText =
            "position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;background:#3a3a3a";
          i.replaceWith(p);
        })
    );
  $("whyList").innerHTML = D.why
    .map((w) => `<div class="wrow"><h3>${w[0]}</h3><p>${w[1]}</p></div>`)
    .join("");
  $("steps").innerHTML =
    '<span class="fill"></span>' +
    D.steps.map((s) => `<li>${s[0]}<small>${s[1]}</small></li>`).join("");
  $("sgrid").innerHTML = D.stories
    .map((s) => `<blockquote>${s[0]}<cite>${s[1]}</cite></blockquote>`)
    .join("");
  const names = D.countries.map((c) => c.n),
    opt = names.map((n) => `<option>${n}</option>`).join("");
  $("vc").innerHTML = opt;
  $("c").innerHTML = '<option value="">Not sure yet</option>' + opt;
  function visa() {
    const items = D.visaBase.concat(D.visaExtra[$("vc").value] || []);
    $("vlist").innerHTML = items
      .map(
        (i) => `<li tabindex="0" role="checkbox" aria-checked="false">${i}</li>`
      )
      .join("");
    $("vlist")
      .querySelectorAll("li")
      .forEach((li) => {
        const t = () => {
          const on = li.classList.toggle("on");
          li.setAttribute("aria-checked", on);
        };
        li.onclick = t;
        li.onkeydown = (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            t();
          }
        };
      });
  }
  $("vc").onchange = visa;
  visa();
  const acc = (box, rows, cls, head, body) => {
    rows.forEach((r, i) => {
      const d = document.createElement("div");
      d.className = cls;
      d.innerHTML = head(r, i) + body(r, i);
      const b = d.firstChild,
        m = d.lastChild;
      b.onclick = () => {
        const o = m.hidden;
        m.hidden = !o;
        b.setAttribute("aria-expanded", o);
      };
      box.appendChild(d);
    });
  };
  acc(
    $("mods"),
    Object.entries(D.mods),
    "mrow",
    ([k, v], i) =>
      `<button aria-expanded="${
        i == 0
      }"><span class="nm">${k}</span><span class="tt">${v[0]}</span></button>`,
    ([k, v], i) =>
      `<div class="more" ${i ? "hidden" : ""}><p>${v[1]}</p><ul>${v[2]
        .map((x) => `<li>${x}</li>`)
        .join("")}</ul></div>`
  );
  acc(
    $("faqs"),
    D.faqs,
    "frow",
    (f, i) => `<button aria-expanded="${i == 0}">${f[0]}</button>`,
    (f, i) => `<p ${i ? "hidden" : ""}>${f[1]}</p>`
  );

  // ---- OLTERA logo: on hover the letters turn into shapes, then change back by themselves ----
  (function () {
    const b = document.querySelector(".brand"),
      t = b.textContent.trim();
    let busy = false,
      timer;
    b.setAttribute("aria-label", t);
    b.innerHTML = [...t]
      .map(
        (c, k) =>
          `<span class="ch s${
            k % 6
          }" style="--i:${k}" aria-hidden="true"><i>${c}</i></span>`
      )
      .join("");
    b.insertAdjacentHTML("afterbegin", logo("nav-lg"));
    const go = () => {
      if (busy) return;
      busy = true;
      b.classList.add("morph");
      clearTimeout(timer);
      timer = setTimeout(() => {
        b.classList.remove("morph");
        setTimeout(() => (busy = false), 900);
      }, 1200);
    };
    b.addEventListener("mouseenter", go);
    b.addEventListener("focus", go);
    b.addEventListener("touchstart", go, { passive: true });
  })();

  // ---- logo placements: watermarks, dividers and a footer mark ----
  $("about").insertAdjacentHTML("beforeend", logo("wm wm-about"));
  document
    .querySelector(".dest")
    .insertAdjacentHTML("beforeend", logo("wm wm-dest"));
  document
    .querySelector(".mock")
    .insertAdjacentHTML("beforeend", logo("wm wm-mock"));
  $("counselling").insertAdjacentHTML("beforeend", logo("wm wm-join"));
  const divider = () =>
    `<div class="ldiv" aria-hidden="true"><i></i>${logo()}<i></i></div>`;
  $("visa").insertAdjacentHTML("beforebegin", divider());
  $("faq").insertAdjacentHTML("beforebegin", divider());
  document
    .querySelector("footer b")
    .insertAdjacentHTML("afterbegin", logo("ft-lg"));

  // ---- navigation: top bar with country dropdown, active-section highlight, hide on scroll down ----
  const nav = $("nav"),
    burger = $("burger"),
    links = $("links");
  const L = [
    ["About", "#about"],
    ["Destinations", "#destinations"],
    ["IELTS", "#ielts"],
    ["Tracker", "#tracker"],
    ["Visa", "#visa"],
    ["Stories", "#stories"],
    ["FAQ", "#faq"],
  ];
  links.innerHTML =
    "<ul>" +
    L.map(
      (l, i) =>
        `<li${i == 1 ? ' class="hasdd"' : ""}><a href="${l[1]}">${l[0]}</a>${
          i == 1
            ? '<div class="dd">' +
              D.countries
                .map((c, j) => `<button data-go="${j}">${c.n}</button>`)
                .join("") +
              "</div>"
            : ""
        }</li>`
    ).join("") +
    "</ul>";
  let destST = null,
    isOpen = false;
  function jump(el) {
    const g = el.dataset.go,
      href = el.getAttribute && el.getAttribute("href");
    if (g !== undefined) {
      const card = $("track").children[g];
      if (destST) {
        const dist = $("track").scrollWidth - innerWidth + 60,
          f = Math.min(1, Math.max(0, (card.offsetLeft - 28) / dist));
        scrollTo({
          top: destST.start + f * (destST.end - destST.start),
          behavior: "instant",
        });
      } else
        card.scrollIntoView({
          behavior: "instant",
          inline: "center",
          block: "center",
        });
    } else if (href && href !== "#")
      document.querySelector(href).scrollIntoView({ behavior: "instant" });
  }
  function setMenu(on) {
    isOpen = on;
    nav.classList.toggle("open", on);
    burger.setAttribute("aria-expanded", on);
    burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
    document.body.style.overflow = on ? "hidden" : "";
  }
  burger.onclick = () => setMenu(!isOpen);
  links.querySelectorAll("a,button").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        jump(el);
        setMenu(false);
      })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      setMenu(false);
      burger.focus();
    }
  });
  addEventListener("resize", () => {
    if (innerWidth > 1020 && isOpen) setMenu(false);
  });
  function setActive(id) {
    links
      .querySelectorAll("a")
      .forEach((a) =>
        a.classList.toggle("on", a.getAttribute("href") === "#" + id)
      );
  }
  addEventListener(
    "scroll",
    () => {
      const p =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
      nav.style.setProperty("--p", Math.min(1, p));
    },
    { passive: true }
  );

  // ---- enquiry form: sent straight to the Google Apps Script set in data.js (D.syncUrl). No server needed. ----
  $("go").onclick = async () => {
    const n = $("n").value.trim(),
      e = $("e").value.trim(),
      c = $("c").value,
      m = $("msg"),
      btn = $("go");
    if (!n) {
      m.textContent = "Enter your name.";
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(e)) {
      m.textContent = "Enter a valid email, like name@example.com.";
      return;
    }
    const keep = () => {
      try {
        localStorage.setItem("oltera_enquiry", JSON.stringify({ n, e, c }));
      } catch (y) {}
    };
    if (!D.syncUrl) {
      keep();
      m.textContent =
        "Booking is not connected yet, so your details are saved on this device only.";
      return;
    }
    btn.disabled = true;
    m.textContent = "Sending...";
    try {
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      const r = await fetch(D.syncUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "enquiry",
          name: n,
          email: e,
          country: c,
          vid: window.oltVid || "",
          plan: window.oltChosenPlan || "",
        }),
      });
      const j = await r.json();
      if (!j.ok) throw 0;
      m.textContent = `Thank you. We will email ${e} with a time to talk.`;
    } catch (y) {
      keep();
      m.textContent =
        "We could not send your details. Please check your connection and try again.";
    }
    btn.disabled = false;
  };

  // ---- GSAP scroll animation ----
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const NAMES = {
    home: "Home",
    about: "About",
    destinations: "Destinations",
    why: "Why Oltera",
    ielts: "IELTS",
    tracker: "Offer tracker",
    visa: "Visa",
    stories: "Stories",
    faq: "Questions",
    counselling: "Counselling",
  };
  Object.keys(NAMES).forEach((id) =>
    ScrollTrigger.create({
      trigger: "#" + id,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (t) => t.isActive && setActive(id),
    })
  );
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // headline: words rise out of a mask
    const h = $("h1");
    h.innerHTML = h.textContent
      .split(" ")
      .map((w) => `<span class="ww"><i>${w}</i></span>`)
      .join(" ");
    // One intro timeline. It is built paused (so everything starts hidden under the loader) and plays
    // the moment the loader's curtain starts to lift, however long the page took to load.
    const intro = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out" },
    });
    const whenReady = (fn) =>
      window.__ldDone
        ? fn()
        : document.addEventListener("oltera:reveal", fn, { once: true });
    intro
      .from(
        "#h1 i",
        { yPercent: 110, duration: 1, stagger: 0.12, ease: "power4.out" },
        0.25
      )
      .from(
        ".hero p,.hero .row",
        {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          clearProps: "transform,opacity",
        },
        0.8
      )
      .from(
        ".nav #links a,.nav .cta",
        {
          y: -24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.07,
          clearProps: "transform,opacity",
        },
        0.5
      );
    // ---- logo animation helpers ----
    // draw: the outline traces itself. live: the diamond turns a quarter inside the circle, the centre circle pulses, then it rests.
    const draw = (svg, vars) =>
      gsap.fromTo(
        svg.children,
        { strokeDashoffset: 1 },
        Object.assign(
          {
            strokeDashoffset: 0,
            duration: 1.4,
            stagger: 0.16,
            ease: "power2.inOut",
          },
          vars
        )
      );
    const live = (svg, delay = 2, gap = 3.5) => {
      const dm = svg.querySelector(".dm"),
        ci = svg.querySelector(".ci");
      if (!dm) return;
      const tl = gsap
        .timeline({ repeat: -1, repeatDelay: gap, delay, paused: true })
        .to(dm, {
          rotation: 90,
          svgOrigin: "132 107",
          duration: 1.6,
          ease: "power3.inOut",
        })
        .to(
          ci,
          {
            scale: 1.2,
            svgOrigin: "132 107",
            duration: 0.45,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          0.5
        );
      // pause the loop while its logo is off screen (there are dozens of them on the page)
      ScrollTrigger.create({
        trigger: svg,
        start: "top bottom",
        end: "bottom top",
        onToggle: (st) => tl.paused(!st.isActive),
      });
      return tl;
    };
    // hero logo: nothing is pinned and the page never waits on the scroll wheel.
    // After the loader the outline traces itself, OLTERA rises letter by letter, then the sub-line fades in.
    const hero = document.querySelector(".hero"),
      hl = document.querySelector(".hero-logo");
    if (hl) {
      const wb = document.querySelector(".lock b");
      if (wb) {
        wb.setAttribute("aria-label", wb.textContent);
        wb.innerHTML = [...wb.textContent]
          .map((c) => `<i aria-hidden="true">${c}</i>`)
          .join("");
      }
      intro
        .add(draw(hl, { duration: 1.3, stagger: 0.14 }), 0.3)
        .fromTo(
          ".lock b i",
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.5,
            clearProps: "transform,opacity",
          },
          1.3
        )
        .fromTo(
          ".lock span",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, clearProps: "opacity" },
          1.9
        )
        .add(() => live(hl, 0.8, 3.5), 2.2);
      // soft pointer parallax, only on devices with a mouse, kept small
      const hx = gsap.quickTo(hl, "x", { duration: 0.9, ease: "power3" }),
        hy = gsap.quickTo(hl, "y", { duration: 0.9, ease: "power3" });
      if (matchMedia("(hover:hover)").matches) {
        hero.addEventListener("pointermove", (e) => {
          const r = hero.getBoundingClientRect();
          hx((e.clientX / r.width - 0.5) * 14);
          hy((e.clientY / r.height - 0.5) * 10);
        });
        hero.addEventListener("pointerleave", () => {
          hx(0);
          hy(0);
        });
      }
    }
    // scroll cue: loops gently, then fades as soon as the visitor scrolls
    gsap.fromTo(
      ".scue i",
      { scaleY: 0, transformOrigin: "50% 0" },
      {
        scaleY: 1,
        duration: 1.3,
        repeat: -1,
        repeatDelay: 0.3,
        ease: "power2.inOut",
      }
    );
    gsap.to(".scue", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=160",
        scrub: true,
      },
    });
    // counters
    document.querySelectorAll("[data-to]").forEach((el) => {
      const o = { v: 0 },
        to = +el.dataset.to;
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(o, {
            v: to,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () =>
              (el.textContent =
                Math.round(o.v).toLocaleString() + el.dataset.suf),
          }),
      });
    });
    // destinations: pinned horizontal scroll on desktop (GSAP slides the cards sideways as you scroll down).
    // The "pin" class switches the CSS from native scrolling to this mode, so if GSAP never loads the cards still scroll normally.
    gsap.matchMedia().add("(min-width: 801px)", () => {
      const dest = document.querySelector(".dest"),
        t = $("track"),
        dist = () => t.scrollWidth - innerWidth + 60;
      dest.classList.add("pin");
      destST = gsap.to(t, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".dest",
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      }).scrollTrigger;
      return () => {
        dest.classList.remove("pin");
        destST = null;
      };
    });
    // generic reveals
    gsap.utils.toArray(".wrow,.mrow,.frow,.sgrid blockquote,h2").forEach((el) =>
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      })
    );
    // offer tracker: line fills as you scroll, steps light up
    const lis = [...document.querySelectorAll(".steps li")];
    gsap.to(".steps .fill", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".steps",
        start: "top 65%",
        end: "bottom 65%",
        scrub: true,
      },
    });
    lis.forEach((li) =>
      ScrollTrigger.create({
        trigger: li,
        start: "top 65%",
        onEnter: () => li.classList.add("on"),
        onLeaveBack: () => li.classList.remove("on"),
      })
    );
    // ---- extra animations ----
    const once = (trigger, start = "top 88%") => ({
      trigger,
      start,
      once: true,
    });
    // stats rise in one after another
    gsap.from(".stats .w>div", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.14,
      ease: "power3.out",
      scrollTrigger: once(".stats", "top 85%"),
    });
    // about: lead sentence lights up word by word as you scroll
    const al = document.querySelector(".about .al");
    if (al) {
      al.innerHTML = al.textContent
        .split(" ")
        .map((w) => `<span class="aw">${w}</span>`)
        .join(" ");
      gsap.fromTo(
        ".aw",
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: al,
            start: "top 82%",
            end: "bottom 50%",
            scrub: true,
          },
        }
      );
      gsap.utils.toArray(".ab-r").forEach((r) =>
        gsap.from(r.querySelectorAll("p"), {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: once(r),
        })
      );
    }
    // goal: lead statement lights up word by word, same as the story quote
    const gl = document.querySelector(".goal-l");
    if (gl) {
      gl.querySelectorAll("p").forEach(
        (p) =>
          (p.innerHTML = p.textContent
            .split(" ")
            .map((w) => `<span class="gw">${w}</span>`)
            .join(" "))
      );
      gsap.fromTo(
        ".gw",
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: gl,
            start: "top 82%",
            end: "bottom 50%",
            scrub: true,
          },
        }
      );
    }
    gsap.from(".about .tag", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: once(".about .tag", "top 92%"),
    });
    // why Oltera: headings slide in from the left
    gsap.utils.toArray(".wrow h3").forEach((h) =>
      gsap.from(h, {
        x: -60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: once(h, "top 90%"),
      })
    );
    // IELTS: mock test box and writing area pop in
    gsap.from(".tbox", {
      y: 60,
      scale: 0.96,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: once(".tbox", "top 90%"),
    });
    gsap.from(".checks li", {
      x: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: once(".write .checks", "top 85%"),
    });
    // plan rows slide in alternately from left and right
    gsap.utils.toArray(".pl").forEach((p, i) =>
      gsap.from(p, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: once(p),
      })
    );
    // tracker steps slide in as the line reaches them
    lis.forEach((li) =>
      gsap.from(li, {
        x: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: once(li, "top 85%"),
      })
    );
    // enquiry form fields and footer
    gsap.from("#f p,#f button", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      clearProps: "transform,opacity",
      scrollTrigger: once("#f", "top 88%"),
    });
    gsap.from("footer .w", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: once("footer", "top 98%"),
    });
    // ---- even more animations ----
    // country ticker scrolls sideways and speeds up when you scroll the page
    const mqIn = document.querySelector(".mq-in");
    if (mqIn) {
      const loop = gsap.to(mqIn, {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
      ScrollTrigger.create({
        onUpdate: (s) =>
          loop.timeScale(1 + Math.min(8, Math.abs(s.getVelocity()) / 250)),
      });
    }
    // accordion answers ease open
    document.querySelectorAll(".more,.frow p").forEach((el) =>
      new MutationObserver(() => {
        if (!el.hidden)
          gsap.from(el, {
            opacity: 0,
            y: -14,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
          });
      }).observe(el, { attributes: true, attributeFilter: ["hidden"] })
    );
    // mock test timer pulses every second in the last 30 seconds
    const tmEl = $("timer");
    new MutationObserver(() => {
      const p = tmEl.textContent.split(":").map(Number);
      if (p[0] === 0 && p[1] > 0 && p[1] <= 30)
        gsap.fromTo(
          tmEl,
          { scale: 1.18, transformOrigin: "right center" },
          { scale: 1, duration: 0.4, ease: "back.out(3)" }
        );
    }).observe(tmEl, { childList: true, characterData: true, subtree: true });
    // ---- logo animations across the site ----
    // nav mark: draws on load, and the diamond turns when you hover the brand
    const nl = document.querySelector(".nav-lg");
    if (nl) {
      intro.add(draw(nl, { duration: 1.1 }), 0.5);
      const ndm = nl.querySelector(".dm");
      document.querySelector(".brand").addEventListener("mouseenter", () =>
        gsap.to(ndm, {
          rotation: "+=90",
          svgOrigin: "132 107",
          duration: 0.8,
          ease: "power3.inOut",
          overwrite: "auto",
        })
      );
    }
    // country ticker: each separator is a small emblem whose diamond turns in turn
    document
      .querySelectorAll(".mq .lg")
      .forEach((el, i) => live(el, (i % 12) * 0.35, 2.5));
    // destination cards: corner emblem pops in with the section and turns on hover
    gsap.set(".cty-lg", { opacity: 0 });
    ScrollTrigger.create({
      trigger: ".dest",
      start: "top 70%",
      once: true,
      onEnter: () =>
        gsap.to(".cty-lg", {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "back.out(2)",
        }),
    });
    document.querySelectorAll(".cty").forEach((card) => {
      const d = card.querySelector(".cty-lg .dm");
      if (d)
        card.addEventListener("mouseenter", () =>
          gsap.to(d, {
            rotation: "+=90",
            svgOrigin: "132 107",
            duration: 0.9,
            ease: "power3.inOut",
            overwrite: "auto",
          })
        );
    });
    // big watermarks draw themselves as their section scrolls in, tilt slowly, and keep turning their diamond
    gsap.utils.toArray(".wm").forEach((w) => {
      const par = w.parentElement;
      gsap.fromTo(
        w.children,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          stagger: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: par,
            start: "top 80%",
            end: "top 15%",
            scrub: 1,
          },
        }
      );
      gsap.fromTo(
        w,
        { rotation: -6 },
        {
          rotation: 6,
          ease: "none",
          scrollTrigger: {
            trigger: par,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      live(w, 1, 2);
    });
    // dividers: the line grows out from the emblem, which draws itself
    gsap.set(".ldiv .lg>*,.ft-lg>*", { strokeDashoffset: 1 });
    gsap.set(".ldiv i", { scaleX: 0 });
    gsap.utils.toArray(".ldiv").forEach((d) => {
      const lg = d.querySelector(".lg");
      gsap
        .timeline({ scrollTrigger: once(d, "top 88%") })
        .to(d.querySelectorAll("i"), {
          scaleX: 1,
          duration: 1.1,
          ease: "power3.out",
        })
        .add(() => draw(lg, { duration: 1.1, stagger: 0.12 }), 0.1)
        .add(() => live(lg, 1.5, 3.5));
    });
    // footer mark
    const fl = document.querySelector(".ft-lg");
    if (fl)
      ScrollTrigger.create({
        trigger: "footer",
        start: "top 98%",
        once: true,
        onEnter: () => {
          draw(fl, { duration: 1.2 });
          live(fl, 2.5, 3.5);
        },
      });
    whenReady(() => intro.play());
    return () => {};
  });
  // without animation, light every tracker step
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    document
      .querySelectorAll(".steps li")
      .forEach((l) => l.classList.add("on"));
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
