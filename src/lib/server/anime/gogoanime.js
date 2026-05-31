import { parseHTML } from "linkedom";

const GOGO_BASE = "https://gogoanime.by";
const AFL_BASE = "https://www.animefillerlist.com";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function absoluteUrl(base, href) {
  if (!href) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function uniqueBy(list, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function textContent(node) {
  return node ? String(node.textContent || "").trim() : "";
}

async function fetchText(url, { timeoutMs = 20000, init = {} } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseEpisodeNumber(href, title) {
  const patterns = [
    /episode[-_/ ]?(\d+)/i,
    /ep[-_/ ]?(\d+)/i,
    /-(\d+)(?:[-_/]|$)/i,
  ];

  for (const pattern of patterns) {
    const match =
      String(href || "").match(pattern) || String(title || "").match(pattern);
    if (match) return Number(match[1]);
  }

  const titleMatch = String(title || "").match(/(\d+)/);
  return titleMatch ? Number(titleMatch[1]) : null;
}

function parseSeriesSlug(href) {
  const str = String(href || "");
  const match =
    str.match(/\/(?:series|category)\/([^/?#]+)/i) ||
    str.match(/\/([^/?#]+)\/?$/i);
  return match ? match[1] : null;
}

function collectLikelyEpisodeAnchors(document) {
  const anchors = Array.from(document.querySelectorAll("a"));
  return anchors.filter((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const normalizedHref = href.toLowerCase();
    return (
      normalizedHref.includes("episode") ||
      normalizedHref.includes("/series/") ||
      /\/\d+\//.test(normalizedHref)
    );
  });
}

function parseEpisodeList(document, sourceUrl) {
  const episodes = [];
  const seriesSlug = parseSeriesSlug(sourceUrl) || null;

  // Prefer anchors that include the series slug, are inside known episode containers,
  // or explicitly look like episode URLs.
  const anchors = Array.from(document.querySelectorAll("a[href]")).filter(
    (anchor) => {
      const href = anchor.getAttribute("href") || "";
      const lowerHref = href.toLowerCase();
      const inEpisodeContainer = !!anchor.closest(
        ".episode_related, .episodes, .listing, .episode-list, .last_episodes, #episode_page",
      );
      const looksLikeEpisode =
        /(episode[-_\/ ]?\d+|ep[-_\/ ]?\d+|\/watch\/|\/episode-\d+)/i.test(
          lowerHref,
        );

      if (seriesSlug && lowerHref.includes(seriesSlug.toLowerCase()))
        return true;
      if (inEpisodeContainer && looksLikeEpisode) return true;
      return false;
      return false;
    },
  );

  for (const anchor of anchors) {
    const href = anchor.getAttribute("href") || "";
    const id = absoluteUrl(sourceUrl, href);
    const title = textContent(anchor) || anchor.getAttribute("title") || "";
    const number = parseEpisodeNumber(href, title);
    if (!id || !number) continue;

    episodes.push({
      id,
      number,
      title: title || `Episode ${number}`,
    });
  }

  return uniqueBy(episodes, (item) => item.id)
    .sort((a, b) => b.number - a.number)
    .map((item) => ({
      ...item,
      watchUrl: item.id,
    }));
}

function parseMetadata(document) {
  const title =
    textContent(document.querySelector(".anime_info_body_bg h1")) ||
    textContent(document.querySelector(".anime_info_body h1")) ||
    textContent(document.querySelector("h1")) ||
    textContent(document.querySelector('[itemprop="name"]')) ||
    null;

  const imageNode =
    document.querySelector(".anime_info_body_bg img") ||
    document.querySelector(".anime_info_body img") ||
    document.querySelector('meta[property="og:image"]') ||
    document.querySelector('meta[name="twitter:image"]');

  let image = null;
  if (imageNode) {
    image = imageNode.getAttribute
      ? imageNode.getAttribute("src") ||
        imageNode.getAttribute("data-src") ||
        imageNode.getAttribute("content")
      : null;
  }

  const synopsisNode =
    document.querySelector(".anime_info_body_bg .description") ||
    document.querySelector(".anime_info_body_bg .type") ||
    document.querySelector(".anime_info_body p") ||
    document.querySelector(".entry-content p") ||
    document.querySelector('meta[name="description"]');

  let synopsis = null;
  if (synopsisNode) {
    synopsis = synopsisNode.getAttribute
      ? synopsisNode.getAttribute("content") || textContent(synopsisNode)
      : textContent(synopsisNode);
  }

  const bodyText = textContent(
    document.body || document.documentElement || null,
  ).replace(/\s+/g, " ");
  const infoText = textContent(
    document.querySelector(".anime_info_body_bg"),
  ).replace(/\s+/g, " ");

  const typeMatch =
    infoText.match(
      /\b(Type|Status):\s*(TV Show|TV Series|Movie|OVA|ONA|Special|Music)/i,
    ) ||
    bodyText.match(
      /\b(Type|Status):\s*(TV Show|TV Series|Movie|OVA|ONA|Special|Music)/i,
    );
  const statusMatch =
    infoText.match(/\bStatus:\s*(Ongoing|Completed|Upcoming|Unknown)/i) ||
    bodyText.match(/\bStatus:\s*(Ongoing|Completed|Upcoming|Unknown)/i);
  const premieredMatch =
    infoText.match(
      /\b(Premiered|Released on|Aired):\s*([^A-Z]+?)(?=\s+(?:Status|Type|Episodes|Genres|Summary)\b|$)/i,
    ) ||
    bodyText.match(
      /\b(Premiered|Released on|Aired):\s*([^A-Z]+?)(?=\s+(?:Status|Type|Episodes|Genres|Summary)\b|$)/i,
    );

  const synopsisMatch = synopsis
    ? synopsis.match(/Watch Anime\s+(.+?)\s+with English Sub/i) ||
      synopsis.match(/(.+?\.)\s/)
    : null;

  return {
    title,
    image,
    synopsis: synopsisMatch ? synopsisMatch[1].trim() : synopsis,
    type: typeMatch ? typeMatch[2].trim() : null,
    status: statusMatch ? statusMatch[1].trim() : null,
    premiered: premieredMatch ? premieredMatch[2].trim() : null,
  };
}

function parseRecommendations(document, sourceUrl) {
  const section = Array.from(document.querySelectorAll("a"))
    .filter((anchor) => {
      const href = anchor.getAttribute("href") || "";
      return href.includes("/series/") && textContent(anchor).length > 0;
    })
    .filter((anchor) => {
      const label = textContent(anchor).toLowerCase();
      return label.length > 2;
    });
  const cards = [];
  for (const anchor of section) {
    const href = anchor.getAttribute("href") || "";
    const title = textContent(anchor);
    const image =
      anchor.querySelector("img")?.getAttribute("src") ||
      anchor.querySelector("img")?.getAttribute("data-src") ||
      anchor
        .closest("article, li, div")
        ?.querySelector("img")
        ?.getAttribute("src") ||
      null;

    cards.push({
      id: parseSeriesSlug(href) || href,
      title,
      image: image ? absoluteUrl(sourceUrl, image) : null,
    });
  }

  return uniqueBy(cards, (item) => item.id).slice(0, 20);
}

function looksLikeGenericLink(title) {
  return /^(text mode|list mode|home|search|next|previous|view all|login|register|popular|latest|ongoing|completed|genre|status|type|order)$/i.test(
    String(title || "").trim(),
  );
}

function extractPossibleMediaUrls(document, sourceUrl) {
  const urls = [];
  const selectors = [
    "iframe[src]",
    "video[src]",
    "source[src]",
    "track[src]",
    "a[href]",
    "script",
  ];

  for (const selector of selectors) {
    for (const node of Array.from(document.querySelectorAll(selector))) {
      if (node.tagName === "SCRIPT") {
        const scriptText = node.textContent || "";
        const matches = scriptText.match(/https?:\/\/[^\s'"<>]+/g) || [];
        for (const match of matches) urls.push(match);
        continue;
      }

      const href = node.getAttribute("href") || node.getAttribute("src") || "";
      if (href) urls.push(absoluteUrl(sourceUrl, href) || href);
    }
  }

  return uniqueBy(urls, (value) => value).filter((value) => {
    const lower = value.toLowerCase();
    return (
      lower.includes(".m3u8") ||
      lower.includes("embed") ||
      lower.includes("stream") ||
      lower.includes("video") ||
      lower.includes("play") ||
      lower.includes(".mp4")
    );
  });
}

function parseSubtitles(document, sourceUrl) {
  const tracks = [];
  for (const track of Array.from(document.querySelectorAll("track[src]"))) {
    tracks.push({
      label:
        track.getAttribute("label") ||
        track.getAttribute("srclang") ||
        "subtitle",
      kind: track.getAttribute("kind") || "subtitles",
      url: absoluteUrl(sourceUrl, track.getAttribute("src") || ""),
    });
  }
  return uniqueBy(
    tracks.filter((track) => track.url),
    (item) => `${item.label}:${item.url}`,
  );
}

export async function scrapeAnimeDetail(id) {
  const encodedId = encodeURIComponent(String(id || "").trim());
  const candidateUrls = [
    `${GOGO_BASE}/category/${encodedId}`,
    `${GOGO_BASE}/series/${encodedId}`,
  ];

  let html = null;
  let sourceUrl = candidateUrls[0];
  for (const candidate of candidateUrls) {
    try {
      html = await fetchText(candidate);
      sourceUrl = candidate;
      break;
    } catch {
      // keep trying
    }
  }

  if (!html) {
    const searchHtml = await fetchText(
      `${GOGO_BASE}/search.html?keyword=${encodedId}`,
    );
    const { document } = parseHTML(searchHtml);
    const candidate = Array.from(
      document.querySelectorAll('a[href*="/series/"]'),
    ).find((anchor) =>
      textContent(anchor).toLowerCase().includes(String(id).toLowerCase()),
    );
    const href = candidate?.getAttribute("href");
    if (!href) {
      throw new Error(`anime_not_found:${id}`);
    }
    sourceUrl = absoluteUrl(GOGO_BASE, href);
    html = await fetchText(sourceUrl);
  }

  const { document } = parseHTML(html);
  const metadata = parseMetadata(document);
  let episodes = parseEpisodeList(document, sourceUrl);
  const seriesSlug = parseSeriesSlug(sourceUrl);

  // Fallback: if the page didn't expose a usable episode list, probe numbered episode URLs
  if ((!episodes || episodes.length < 3) && seriesSlug) {
    const probed = [];
    let consecutiveMisses = 0;
    const maxMisses = 20;
    const maxProbe = 500;
    for (let i = 1; i <= maxProbe; i++) {
      const candidate = `${GOGO_BASE}/${seriesSlug}-episode-${i}-english-subbed/`;
      try {
        await fetchText(candidate, { timeoutMs: 5000 });
        probed.push({
          id: candidate,
          number: i,
          title: `Episode ${i}`,
          watchUrl: candidate,
        });
        consecutiveMisses = 0;
      } catch (e) {
        consecutiveMisses++;
        if (consecutiveMisses >= maxMisses && probed.length > 0) break;
      }
    }

    if (probed.length) {
      episodes = uniqueBy(
        probed.concat(episodes || []),
        (item) => item.id,
      ).sort((a, b) => b.number - a.number);
    }
  }
  const recommendations = parseRecommendations(document, sourceUrl);

  return {
    source: "gogoanime.by",
    id: String(id),
    sourceUrl,
    ...metadata,
    episodes,
    totalEpisodes: episodes.length,
    recommendations,
    rawEpisodeCount: episodes.length,
  };
}

export async function scrapeEpisodeSources(episodeId) {
  const sourceUrl = String(episodeId || "").startsWith("http")
    ? String(episodeId)
    : `${GOGO_BASE}/${String(episodeId || "").replace(/^\//, "")}`;
  const html = await fetchText(sourceUrl);
  const { document } = parseHTML(html);

  // Try to detect the player construction used by the site (defaultType/defaultEnc1/...)
  // Search both raw HTML and script text to be robust against different encodings/minification
  const scripts =
    (html || "") +
    "\n" +
    Array.from(document.querySelectorAll("script"))
      .map((s) => s.textContent || "")
      .join("\n");

  const playerMatches = {};
  const re = (name) => new RegExp(`${name}\\s*=\\s*['\"]([^'\"]+)['\"]`, "i");
  for (const key of [
    "defaultType",
    "defaultEnc1",
    "defaultEnc2",
    "defaultEnc3",
    "defaultFeatureImage",
    "defaultSubtitleUrl",
    "defaultKey",
    "defaultPostId",
  ]) {
    const m = scripts.match(re(key));
    if (m) playerMatches[key] = m[1];
  }

  const sources = extractPossibleMediaUrls(document, sourceUrl).map(
    (url, index) => ({
      id: `source-${index + 1}`,
      label: `Source ${index + 1}`,
      url,
      type: url.toLowerCase().includes(".m3u8") ? "hls" : "embed",
    }),
  );

  // If the page builds the player via AJAX and assembles a querystring for player.php,
  // replicate that behavior to produce a working iframe URL with params.
  if (playerMatches.defaultType && playerMatches.defaultEnc1) {
    const data = {};
    data[playerMatches.defaultType] = playerMatches.defaultEnc1;
    if (playerMatches.defaultEnc2) data["url2"] = playerMatches.defaultEnc2;
    if (playerMatches.defaultEnc3) data["url3"] = playerMatches.defaultEnc3;
    if (playerMatches.defaultFeatureImage)
      data["feature_image"] = playerMatches.defaultFeatureImage;
    data["user_agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
    data["ref"] = new URL(sourceUrl).host.replace(/^www\./, "");
    if (playerMatches.defaultSubtitleUrl)
      data["subtitle"] = playerMatches.defaultSubtitleUrl;
    if (playerMatches.defaultKey) data["key"] = playerMatches.defaultKey;
    if (playerMatches.defaultPostId)
      data["postId"] = playerMatches.defaultPostId;

    const query = new URLSearchParams(data).toString();
    const playerSrc = `${GOGO_BASE}/wp-content/plugins/video-player/includes/player/player.php?${query}`;
    // Put this first so frontend sees a usable player URL
    sources.unshift({
      id: "player-iframe",
      label: "Player iframe",
      url: playerSrc,
      type: playerSrc.toLowerCase().includes(".m3u8") ? "hls" : "embed",
    });

    // Attempt to fetch the player iframe and extract direct media URLs (m3u8/mp4)
    try {
      const playerHtml = await fetchText(playerSrc, { timeoutMs: 8000 });
      const { document: pd } = parseHTML(playerHtml);
      const direct = extractPossibleMediaUrls(pd, playerSrc).map((u, i) => ({
        id: `player-direct-${i + 1}`,
        label: `Direct ${i + 1}`,
        url: u,
        type: u.toLowerCase().includes(".m3u8")
          ? "hls"
          : u.toLowerCase().includes(".mp4")
            ? "mp4"
            : "embed",
      }));
      for (const d of direct) {
        // prefer hls/mp4 entries before the iframe
        if (d.type === "hls" || d.type === "mp4") sources.unshift(d);
      }
    } catch (e) {
      // ignore player fetch failures
    }
  }

  return {
    source: "gogoanime.by",
    episodeId: String(episodeId),
    sourceUrl,
    sources,
    subtitles: parseSubtitles(document, sourceUrl),
  };
}

export async function scrapeGogoList(kind, page, searchQuery = "") {
  const aliasMap = {
    "most-popular": "popular",
    "most-favorite": "popular",
    "recent-added": "latest",
    "latest-completed": "latest",
    "top-airing": "airing",
  };
  const normalizedKind =
    aliasMap[String(kind || "popular").toLowerCase()] ||
    String(kind || "popular").toLowerCase();
  const normalizedPage = Number(page || 1) || 1;

  let url;
  if (normalizedKind === "search") {
    url = `${GOGO_BASE}/search.html?keyword=${encodeURIComponent(searchQuery)}&page=${normalizedPage}`;
  } else {
    const query = new URLSearchParams();
    if (normalizedKind === "airing" || normalizedKind === "schedule") {
      query.set("status", "Ongoing");
      query.set("type", "");
      query.set("order", "update");
    } else if (normalizedKind === "latest") {
      query.set("status", "");
      query.set("type", "");
      query.set("order", "update");
    } else {
      query.set("status", "");
      query.set("type", "");
      query.set(
        "order",
        normalizedKind === "popular" ? "popular" : normalizedKind,
      );
    }
    query.set("page", String(normalizedPage));
    url = `${GOGO_BASE}/series/?${query.toString()}`;
  }

  const html = await fetchText(url);
  const { document } = parseHTML(html);
  const items = [];

  for (const anchor of Array.from(
    document.querySelectorAll('a[href*="/series/"]'),
  )) {
    const href = anchor.getAttribute("href") || "";
    const id = parseSeriesSlug(href);
    const rawTitle = textContent(anchor);
    const titleLines = rawTitle
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title =
      anchor.querySelector("img")?.getAttribute("alt") ||
      anchor.getAttribute("title") ||
      titleLines[titleLines.length - 1] ||
      rawTitle;
    const hasImage = Boolean(
      anchor.querySelector("img")?.getAttribute("src") ||
      anchor.querySelector("img")?.getAttribute("data-src") ||
      anchor
        .closest("article, li, div")
        ?.querySelector("img")
        ?.getAttribute("src") ||
      anchor
        .closest("article, li, div")
        ?.querySelector("img")
        ?.getAttribute("data-src"),
    );
    if (!id || !title || looksLikeGenericLink(title) || !hasImage) continue;

    const img =
      anchor.querySelector("img")?.getAttribute("src") ||
      anchor
        .closest("article, li, div")
        ?.querySelector("img")
        ?.getAttribute("src") ||
      anchor.querySelector("img")?.getAttribute("data-src") ||
      null;

    items.push({
      id,
      title,
      image: img ? absoluteUrl(url, img) : null,
    });
  }

  const pagination = Array.from(document.querySelectorAll('a[href*="/page/"]'))
    .map((anchor) => {
      const href = anchor.getAttribute("href") || "";
      const match = href.match(/\/page\/(\d+)/i);
      return match ? Number(match[1]) : null;
    })
    .filter(Boolean);

  return {
    source: "gogoanime.by",
    kind: normalizedKind,
    page: normalizedPage,
    totalPages: pagination.length ? Math.max(...pagination) : 1,
    results: uniqueBy(items, (item) => item.id),
  };
}

export async function scrapeAnimeFillerList(title) {
  const slug = slugify(title);
  const candidates = [
    slug,
    slug.replace(/-season-\d+$/, ""),
    slug.replace(/-part-\d+$/, ""),
  ].filter(Boolean);

  for (const candidate of uniqueBy(candidates, (value) => value)) {
    const url = `${AFL_BASE}/shows/${candidate}`;
    try {
      const html = await fetchText(url);
      const { document } = parseHTML(html);
      const pageTitle = textContent(document.querySelector("h1"));
      if (!/filler list/i.test(pageTitle || "")) continue;

      const rows = Array.from(document.querySelectorAll("table tr"));
      const episodes = [];
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 3) continue;
        const number = Number(textContent(cells[0]));
        if (!number) continue;
        const episodeTitle = textContent(cells[1]);
        const status = textContent(cells[2]).toUpperCase();
        const date = cells[3] ? textContent(cells[3]) : null;

        episodes.push({
          number,
          title: episodeTitle,
          status,
          date,
          isFiller: status.includes("FILLER") && !status.includes("CANON"),
        });
      }

      return {
        source: "animefillerlist.com",
        url,
        title: pageTitle.replace(/\s+Filler List$/i, ""),
        episodes: episodes.sort((a, b) => a.number - b.number),
      };
    } catch {
      // keep trying the next slug
    }
  }

  return {
    source: "animefillerlist.com",
    url: null,
    title: String(title || ""),
    episodes: [],
  };
}
