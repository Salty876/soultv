function normalizeListKind(end) {
  const mapping = {
    "most-popular": "popular",
    "most-favorite": "popular",
    "recent-added": "latest",
    "latest-completed": "latest",
    "top-airing": "airing",
  };

  return mapping[end] || end || "popular";
}

export async function getAnimeTitle(end) {
  const kind = normalizeListKind(end);
  const apiEndPoint = `/api/anime/list/${kind}/1`;

  const res = await fetch(apiEndPoint);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return (data.results || []).map((item) => ({
    ...item,
    sub: item.sub ?? item.totalEpisodes ?? item.episodes ?? null,
  }));
}

export async function getAnimeSearchResult(target) {
  const apiEndPoint = `/api/anime/list/search/1?q=${encodeURIComponent(target)}`;

  const res = await fetch(apiEndPoint);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
}

export async function fecthAnimeInfo(ID) {
  const apiEndPoint = `/api/anime/${encodeURIComponent(ID)}`;

  const res = await fetch(apiEndPoint);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
}

export async function fetchAnimeRecomendations(ID) {
  const apiEndPoint = `/api/anime/${encodeURIComponent(ID)}`;
  const res = await fetch(apiEndPoint);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.animeData?.recommendations || [];
}
