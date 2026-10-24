// Restrained motion layer: soft fade-ups for intro text, and a staggered visa checklist.
// Sits inside matchMedia, so visitors who prefer reduced motion get none of it.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const $ = (s) => document.querySelector(s),
      $$ = (s) => [...document.querySelectorAll(s)];

    // intro paragraphs under headings ease in
    $$(".sub,.lead").forEach((el) =>
      gsap.from(el, {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      })
    );

    // visa checklist items ease in when the country changes
    const vl = $("#vlist");
    if (vl)
      new MutationObserver(() =>
        gsap.from(vl.children, {
          y: 12,
          opacity: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "transform,opacity",
        })
      ).observe(vl, { childList: true });
  });
})();
