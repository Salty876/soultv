import { scrapeGogoList } from "$lib/server/anime/gogoanime";

export async function GET({ params, url }) {
  const kind = params.kind || "popular";
  const page = Number(params.page || 1) || 1;
  const query =
    url.searchParams.get("q") || url.searchParams.get("query") || "";

  try {
    const data = await scrapeGogoList(kind, page, query);
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "Cache-Control":
          "public, max-age=60, s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "scrape_failed" }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
