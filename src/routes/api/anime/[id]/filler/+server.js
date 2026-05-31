import {
  scrapeAnimeDetail,
  scrapeAnimeFillerList,
} from "$lib/server/anime/gogoanime";

export async function GET({ params }) {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "missing id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const anime = await scrapeAnimeDetail(id);
    const fillerList = await scrapeAnimeFillerList(anime.title || id);
    const fillerMap = new Map(
      fillerList.episodes.map((episode) => [episode.number, episode]),
    );

    const episodes = anime.episodes.map((episode) => {
      const fillerEpisode = fillerMap.get(episode.number);
      return {
        ...episode,
        isFiller: fillerEpisode ? fillerEpisode.isFiller : null,
        fillerStatus: fillerEpisode ? fillerEpisode.status : null,
      };
    });

    return new Response(
      JSON.stringify({
        source: anime.source,
        id: anime.id,
        title: anime.title,
        fillerSource: fillerList.source,
        fillerUrl: fillerList.url,
        episodes,
      }),
      {
        headers: {
          "content-type": "application/json",
          "Cache-Control":
            "public, max-age=60, s-maxage=3600, stale-while-revalidate=300",
        },
      },
    );
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
