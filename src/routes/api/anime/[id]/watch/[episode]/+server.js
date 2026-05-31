import { scrapeEpisodeSources } from "$lib/server/anime/gogoanime";

export async function GET({ params }) {
  const episode = params.episode;
  if (!episode) {
    return new Response(JSON.stringify({ error: "missing episode" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const data = await scrapeEpisodeSources(episode);
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
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
