// CloudFront Function (runtime cloudfront-js-2.0), viewer request, on the default cache behaviour.
// SPA fallback: a path whose last segment has no file extension is an app route and gets
// /index.html; real files (assets, healthz.json, icons) pass through, so a missing file stays a
// 403/404 instead of becoming 200 HTML. The runtime calls `handler`; nothing imports it.
/* exported handler */
function handler(event) {
  const request = event.request;
  const lastSegment = request.uri.slice(request.uri.lastIndexOf('/') + 1);
  if (!lastSegment.includes('.')) {
    request.uri = '/index.html';
  }
  return request;
}
