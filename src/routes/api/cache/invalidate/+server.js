// Simple cache invalidation endpoint
// POST body JSON options:
// - { "url": "/api/anime/one-piece" }
// - { "type": "anime", "id": "one-piece" }
// Optional secret protection: set environment variable CACHE_SECRET and include same value in request JSON as `secret`.

export async function POST({ request, url }) {
  try {
    const body = (await request.json().catch(() => ({}))) || {};
    const provided =
      body.secret ||
      url.searchParams.get("secret") ||
      request.headers.get("x-cache-secret");
    const secret = process.env.CACHE_SECRET;
    if (secret && provided !== secret) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }

    let target = body.url;
    if (!target && body.type === "anime" && body.id)
      target = `/api/anime/${body.id}`;
    if (!target)
      return new Response(JSON.stringify({ error: "missing target" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const full = new URL(target, url).href;
    const cacheKey = new Request(full);

    if (typeof caches !== "undefined" && caches.default) {
      const deleted = await caches.default.delete(cacheKey);
      return new Response(JSON.stringify({ deleted }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Local/dev fallback: respond that cache is not available
    return new Response(
      JSON.stringify({
        deleted: false,
        note: "no cache available in this environment",
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
