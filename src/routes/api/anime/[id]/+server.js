import { scrapeAnimeDetail } from "$lib/server/anime/gogoanime";

export async function GET({ params, url }) {
  const id = params.id || url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "missing id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const cacheKey = new Request(url.href);
  async function sendJSON(obj) {
    const headers = {
      "content-type": "application/json",
      "Cache-Control":
        "public, max-age=60, s-maxage=600, stale-while-revalidate=60",
    };
    const res = new Response(JSON.stringify(obj), { headers });
    try {
      if (typeof caches !== "undefined" && caches.default) {
        await caches.default.put(cacheKey, res.clone());
      }
    } catch (e) {
      // ignore cache errors
    }
    return res;
  }

  try {
    try {
      if (typeof caches !== "undefined" && caches.default) {
        const cached = await caches.default.match(cacheKey);
        if (cached) return cached;
      }
    } catch (e) {
      // ignore cache match errors
    }

    const animeData = await scrapeAnimeDetail(id);
    return await sendJSON({ animeData, mal: null });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "scrape_failed" }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
