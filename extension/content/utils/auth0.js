/**
 * Normalizes the shape of the error object returned by Auth0.
 *
 * @param err  The error object returned by Auth0
 * @returns {Object}
 */
export function normalizeErrorObject(err) {
  const errObj = {};
  errObj.code = err.error || err.code || err.error_code || err.status || null;
  errObj.description =
    err.errorDescription ||
    err.error_description ||
    err.description ||
    err.error ||
    err.details ||
    err.err ||
    null;
  return errObj;
}

/**
 * Generate a random string to use as a nonce.
 *
 * Sourced from:
 * https://auth0.com/docs/api-auth/tutorials/nonce#generate-a-cryptographically-random-nonce
 *
 * @param {number} length  The length of the generated string.
 * @returns {string}
 */
export function generateNonce(length) {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~";
  let result = "";

  while (length > 0) {
    const bytes = new Uint8Array(16);
    const random = window.crypto.getRandomValues(bytes);

    random.forEach(function (c) {
      if (length === 0) {
        return;
      }

      if (c < charset.length) {
        result += charset[c];
        length--;
      }
    });
  }

  return result;
}
