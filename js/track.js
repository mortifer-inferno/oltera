// Records what a visitor selects (plan, mock test score, destination, visa country, finder, writing check)
// and sends it to the same Google Apps Script as the enquiry form, so the admin page can show it.
// No writing text, no chat messages and no personal details are recorded here. A random visitor id links
// activity to the enquiry if the visitor later fills in the form.
(function () {
  const D = window.OLT;
  let vid = "";
  try {
    vid = localStorage.getItem("oltera_vid") || "";
    if (!vid) {
      vid = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
      localStorage.setItem("oltera_vid", vid);
    }
  } catch (e) {
    vid = vid || "x" + Math.random().toString(36).slice(2, 9);
  }
  window.oltVid = vid;
  try {
    window.oltChosenPlan = localStorage.getItem("oltera_plan") || "";
  } catch (e) {
    window.oltChosenPlan = "";
  }
  window.oltTrack = function (type, data) {
    if (!D || !D.syncUrl) return;
    try {
      fetch(D.syncUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "event", vid, type, data: data || {} }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) {}
  };
  const later = {};
  const debounce = (k, ms, fn) => {
    clearTimeout(later[k]);
    later[k] = setTimeout(fn, ms);
  };
  const txt = (s) => (s && s.selectedOptions[0] ? s.selectedOptions[0].textContent.trim() : "");

  // plan chosen
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".pl a");
    if (!a) return;
    const h = a.closest(".pl").querySelector("h3");
    const plan = h ? h.textContent.trim() : "";
    if (!plan) return;
    window.oltChosenPlan = plan;
    try {
      localStorage.setItem("oltera_plan", plan);
    } catch (x) {}
    window.oltTrack("plan", { plan });
  });

  // visa country, finder, comparison, writing check
  document.addEventListener("change", (e) => {
    const id = e.target.id;
    if (id === "vc") window.oltTrack("visa", { country: txt(e.target) });
    if (id === "ff1" || id === "ff2")
      debounce("f", 900, () =>
        window.oltTrack("finder", { field: txt(document.getElementById("ff1")), band: txt(document.getElementById("ff2")) })
      );
    if (id === "ca" || id === "cb")
      debounce("c", 900, () =>
        window.oltTrack("compare", { a: txt(document.getElementById("ca")), b: txt(document.getElementById("cb")) })
      );
  });
  document.addEventListener("input", (e) => {
    if (e.target.id !== "essay") return;
    debounce("e", 4000, () => {
      const words = (e.target.value.trim().match(/\S+/g) || []).length;
      if (!words) return;
      const all = document.querySelectorAll("#checks li");
      window.oltTrack("essay", { words, met: document.querySelectorAll("#checks li.on").length, of: all.length });
    });
  });
})();