// Caching reverse-proxy in front of the two Apps Script sheet endpoints.
//
// Why this exists: the client (ProjectList.tsx) caches sheet data in
// localStorage, but that cache is per-browser. A room full of students
// loading the site for the first time within the same minute all miss
// their own cache at once and each fire a direct Apps Script request -
// Apps Script's simultaneous-execution quota is low enough that a real
// classroom-sized burst can trip it. This Worker sits in front of both
// endpoints so many concurrent visitors share one upstream fetch instead
// of each triggering their own.
//
// Routes:
//   GET /marketplace -> Project Marketplace sheet JSON
//   GET /responses   -> Form Responses sheet JSON

const UPSTREAMS = {
  "/marketplace":
    "https://script.google.com/macros/s/AKfycbxG4-7e9v5UernBNrKy8Iv_HvGuIDCDzwmQuokKlgDaLZ9dXo94WEsP2Kp-1Qc3jJB9Xw/exec",
  "/responses":
    "https://script.google.com/macros/s/AKfycbxHMdinYiTJ4gHDpe7hL6AxjFJWU-U_PFoFdrwAg3j4n6OYIQg-XeVHIea1Es9QOacOLg/exec",
};

// How often each sheet actually gets re-fetched from Apps Script,
// regardless of how many visitors ask in between. Independent of the
// client's own localStorage TTL (currently 10 min in ProjectList.tsx) -
// this just needs to be short enough that edits to the sheets show up
// promptly, and long enough to actually absorb a traffic burst.
const CACHE_TTL_SECONDS = 300;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, _env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const upstream = UPSTREAMS[url.pathname];
    if (!upstream) {
      return withCors(
        new Response(JSON.stringify({ error: "Unknown route" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        })
      );
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);

    const cached = await cache.match(cacheKey);
    if (cached) {
      return withCors(cached);
    }

    const upstreamResponse = await fetch(upstream, { redirect: "follow" });
    if (!upstreamResponse.ok) {
      return withCors(
        new Response(
          JSON.stringify({
            error: "Upstream fetch failed",
            status: upstreamResponse.status,
          }),
          { status: 502, headers: { "content-type": "application/json" } }
        )
      );
    }

    const body = await upstreamResponse.text();
    const response = new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return withCors(response);
  },
};
