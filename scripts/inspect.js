import fetch from "node-fetch";
import { parseHTML } from "linkedom";

const url = "https://gogoanime.by/category/one-piece";

const res = await fetch(url);
const html = await res.text();
const { document } = parseHTML(html);

const selectors = [
  "#episode_page",
  ".episode_page",
  "#episode_related",
  ".episode_related",
  ".episode-list",
  ".episodes",
  ".episode_pagination",
  ".listing",
  ".episodes-list",
  ".items",
  "ul#episode_page",
];

for (const sel of selectors) {
  const el = document.querySelector(sel);
  console.log(sel, "=>", !!el);
}

const anchors = Array.from(document.querySelectorAll("a"));
const epAnchors = anchors.filter((a) => {
  const href = a.getAttribute("href") || "";
  const txt = (a.textContent || "").trim();
  return (
    /episode[-_/]|/i.test(href) &&
    (/ep\s*\d+/i.test(txt) ||
      /episode\s*\d+/i.test(txt) ||
      /episode-\d+/i.test(href) ||
      /-episode-\d+/i.test(href) ||
      /\/\d+\//.test(href))
  );
});

console.log("Total anchors:", anchors.length);
console.log("Episode-like anchors (sample 20):");
for (let i = 0; i < Math.min(20, epAnchors.length); i++) {
  const a = epAnchors[i];
  console.log(
    "-",
    (a.textContent || "").trim().slice(0, 80).replace(/\s+/g, " "),
    "->",
    a.getAttribute("href"),
  );
}

// Try specific id-based episode list
const epList =
  document.querySelector("#episode_page") ||
  document.querySelector(".episode_page") ||
  document.querySelector("#episode_related") ||
  document.querySelector(".episode_related");
console.log("epList found:", !!epList);
if (epList) {
  const lis = Array.from(epList.querySelectorAll("li a"));
  console.log("epList anchors:", lis.length);
  for (let i = 0; i < Math.min(10, lis.length); i++) {
    const a = lis[i];
    console.log(
      " *",
      (a.textContent || "").trim().slice(0, 80).replace(/\s+/g, " "),
      "->",
      a.getAttribute("href"),
    );
  }
}

// Search raw HTML for common ajax endpoints/data attributes
const raw = html;
const patterns = [
  "load-list-episode",
  "load_episodes",
  "episode_page",
  "data-id",
  "data-episode",
  "episode-list",
  "ajax",
];
for (const p of patterns) {
  const idx = raw.indexOf(p);
  if (idx !== -1) {
    console.log(
      `\nPATTERN ${p} FOUND AT ${idx}:\n`,
      raw.slice(Math.max(0, idx - 200), idx + 200),
    );
  }
}

// Look for ajax actions in inline scripts
const actionRe = /action\s*[:=]\s*['\"]([^'\"]*load[^'\"]*)['\"]/gi;
let am;
while ((am = actionRe.exec(raw))) {
  console.log("\nFound ajax action:", am[1]);
}

// Find numeric data-id occurrences
const dataIdRe = /data-id=\"(\d+)\"/g;
let did;
while ((did = dataIdRe.exec(raw))) {
  console.log("Found data-id numeric:", did[1]);
}

// search for common post id attributes
const postPatterns = [
  "post_id",
  "post-id",
  "data-post",
  "data-post-id",
  "movie_id",
  "data-movie-id",
  "series_id",
];
for (const p of postPatterns) {
  const i = raw.indexOf(p);
  if (i !== -1)
    console.log(
      "\nFOUND " + p + " at",
      i,
      "\n",
      raw.slice(Math.max(0, i - 100), i + 100),
    );
}
