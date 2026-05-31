(async () => {
  try {
    const mod = await import("../src/lib/server/anime/gogoanime.js");
    const url =
      "https://gogoanime.by/one-punch-man-3-episode-2-english-subbed/";
    // replicate detection logic to debug why scrapeEpisodeSources didn't pick up player params
    const fetch = globalThis.fetch || (await import("node-fetch")).default;
    const raw = await fetch(url).then((r) => r.text());
    const { parseHTML } = await import("linkedom");
    const { document } = parseHTML(raw);
    const scripts =
      raw +
      "\n" +
      Array.from(document.querySelectorAll("script"))
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
    const found = {};
    for (const name of names) {
      const re = new RegExp(name + "\\s*=\\s*['\"]([^'\"]+)['\"]", "i");
      const m = scripts.match(re);
      found[name] = m ? m[1] : null;
    }
    console.log("DETECTED:", JSON.stringify(found, null, 2));
    const res = await mod.scrapeEpisodeSources(url);
    console.log("SCRAPER OUTPUT:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
