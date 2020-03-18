const urlParams = new URLSearchParams(window.location.search);
const r = urlParams.get("r");

if (!r || !r.startsWith("ext+normandy://")) {
  window.location = "/content.html";
} else {
  const uri = r.substring(15);
  if (uri.match(/^login(#.*)?$/)) {
    window.location = `/login.html${uri.substring(5)}`;
  } else {
    window.location = `/content.html#/${uri}`;
  }
}
