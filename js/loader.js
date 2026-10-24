// Intro loader: the emblem draws itself, the name appears, then the curtain lifts.
// Shown on every visit and every reload. Plain JS + CSS, so it does not depend on GSAP.
(function () {
  const root = document.documentElement,
    el = document.getElementById("loader");
  const announce = () => {
    window.__ldDone = true;
    document.dispatchEvent(new Event("oltera:reveal"));
  };
  if (!el) {
    window.__ldDone = true;
    return;
  }
  if (!root.classList.contains("has-loader")) {
    el.remove();
    window.__ldDone = true;
    return;
  }
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches,
    MIN = RM ? 500 : 1900, // shortest time the loader stays up (ms)
    MAX = 6000, // never block the site longer than this
    t0 = performance.now();
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    el.classList.add("ld-out");
    announce(); // page content starts its entrance as the curtain lifts
    setTimeout(
      () => {
        root.classList.remove("has-loader");
        el.remove();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      },
      RM ? 0 : 1000
    );
  }
  function ready() {
    setTimeout(finish, Math.max(0, MIN - (performance.now() - t0)));
  }
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready);
  setTimeout(finish, MAX);
})();
