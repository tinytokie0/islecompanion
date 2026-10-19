// Steam refuses to load inside the app preview's frame (X-Frame-Options), so
// the redirect must break out to the top window to open the Steam sign-in
// page properly.
export default function goSteam(url) {
  if (window.self !== window.top) {
    window.top.location.href = url;
  } else {
    window.location.href = url;
  }
}