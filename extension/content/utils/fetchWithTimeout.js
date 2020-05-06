export default function fetchWithTimeout(url, options = {}, duration = 5000) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, duration);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response;
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        throw new Error("Response timed out");
      } else {
        clearTimeout(timeout);
      }

      throw new Error(error.message);
    });
}
