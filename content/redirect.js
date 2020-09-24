const urlParams = new URLSearchParams(window.location.search);
const r = urlParams.get("r") ?? "";

const protocolMatch = r.match(/^(ext|web)\+normandy:\/\/(?<uri>.*)$/);

if (!protocolMatch) {
  window.location.href = "/index.html";
} else {
  const { uri } = protocolMatch.groups;
  const loginMatch = uri.match(/^login(?<hash>#.*)?$/);
  if (loginMatch) {
    window.location.href = `/login.html${loginMatch.groups.hash}`;
  } else {
    window.location.href = `/index.html#/${uri}`;
  }
}
