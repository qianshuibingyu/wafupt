/**
 * Cloudflare Pages — extensionless URLs + legacy resource redirects + custom 404.
 */
const LEGACY_REDIRECTS = {
  "/resource/technology-twentyone": "/resource/invisible-lock-line",
  "/resource/technology-twentyone.html": "/resource/invisible-lock-line",
  "/resource/technology-twenty": "/resource/invisible-lock-guide",
  "/resource/technology-twenty.html": "/resource/invisible-lock-guide",
  "/resource/technology-nineteen": "/resource/rental-invisible-lock",
  "/resource/technology-nineteen.html": "/resource/rental-invisible-lock",
  "/resource/technology-eighteen": "/resource/invisible-battery-life",
  "/resource/technology-eighteen.html": "/resource/invisible-battery-life",
  "/resource/technology-seventeen": "/resource/invisible-lock-troubleshooting",
  "/resource/technology-seventeen.html": "/resource/invisible-lock-troubleshooting",
  "/resource/technology-sixteen": "/resource/anti_pry-invisible-lock",
  "/resource/technology-sixteen.html": "/resource/anti_pry-invisible-lock",
  "/resource/technology-fifteen": "/resource/invisible-supply-chain",
  "/resource/technology-fifteen.html": "/resource/invisible-supply-chain",
  "/resource/technology-fourteen": "/resource/bulk-invisible-lock",
  "/resource/technology-fourteen.html": "/resource/bulk-invisible-lock",
  "/resource/technology-thirteen": "/resource/invisible-lock-ODM",
  "/resource/technology-thirteen.html": "/resource/invisible-lock-ODM",
  "/resource/technology-twelve": "/resource/invisible-lock-tech",
  "/resource/technology-twelve.html": "/resource/invisible-lock-tech",
  "/resource/b2b-invisible-lock-compatibility-deployment": "/resource/b2b-invisible-lock-compatibility-challenges",
  "/resource/b2b-invisible-lock-compatibility-deployment.html": "/resource/b2b-invisible-lock-compatibility-challenges",
};

async function serve404(context, request, url) {
  const notFoundRequest = new Request(new URL("/404.html", url.origin), request);
  const assetResponse = await context.env.ASSETS.fetch(notFoundRequest);

  if (assetResponse.status !== 200) {
    return context.next();
  }

  let html = await assetResponse.text();
  if (!/<base\s/i.test(html)) {
    html = html.replace("<head>", '<head>\n    <base href="/">');
  }

  const headers = new Headers(assetResponse.headers);
  headers.set("content-type", "text/html; charset=UTF-8");
  headers.delete("content-length");

  return new Response(html, { status: 404, headers });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let { pathname } = url;

  const legacyTarget = LEGACY_REDIRECTS[pathname];
  if (legacyTarget) {
    return Response.redirect(new URL(legacyTarget + url.search, url.origin), 301);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const withoutSlash = pathname.slice(0, -1);
    return Response.redirect(new URL(withoutSlash + url.search, url.origin), 301);
  }

  if (/\.html$/i.test(pathname) && !/^\/google[a-z0-9]+\.html$/i.test(pathname)) {
    const withoutExt = pathname.slice(0, -5);
    const target = withoutExt === "" || withoutExt === "/index" ? "/" : withoutExt;
    return Response.redirect(new URL(target + url.search, url.origin), 301);
  }

  if (pathname !== "/" && /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return context.next();
  }

  if (pathname === "/404") {
    return serve404(context, context.request, url);
  }

  const htmlPath =
    pathname === "/" || pathname === ""
      ? "/index.html"
      : `${pathname.replace(/\/$/, "")}.html`;

  const htmlRequest = new Request(new URL(htmlPath, url.origin), context.request);
  const response = await context.env.ASSETS.fetch(htmlRequest);

  if (response.status === 200) {
    return response;
  }

  return serve404(context, context.request, url);
}
