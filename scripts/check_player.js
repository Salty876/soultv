(async () => {
  try {
    const fetch = globalThis.fetch || (await import("node-fetch")).default;
    const res = await fetch(
      "https://gogoanime.by/one-punch-man-3-episode-2-english-subbed/",
    );
    const t = await res.text();
    const mod = await import("linkedom");
    const parseHTML = mod.parseHTML;
    const { document } = parseHTML(t);
    const scripts = Array.from(document.querySelectorAll("script"))
      .map((s) => s.textContent || "")
      .join("\n");
    const names = [
      "defaultType",
      "defaultEnc1",
      "defaultEnc2",
      "defaultEnc3",
      "defaultFeatureImage",
      "defaultSubtitleUrl",
      "defaultKey",
      "defaultPostId",
    ];
    for (const name of names) {
      const re = new RegExp(name + "\\s*=\\s*['\"]([^'\"]+)['\"]", "i");
      const m = scripts.match(re);
      console.log(name, m ? m[1].slice(0, 80) : null);
    }
  } catch (e) {
    console.error(e);
  }
})();
