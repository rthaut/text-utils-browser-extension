// Hex digests of the UTF-8 bytes of text, using the Web Crypto API.

import { MSG_ACTION_DIGEST, RequestDigest } from "scripts/helpers/messages";

export const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

/**
 * Hashes `text` locally with `crypto.subtle`.
 * @param {string} algorithm one of `ALGORITHMS`
 * @param {string} text
 * @returns {Promise<string>} lowercase hex digest
 */
export const digestLocally = async (algorithm, text) => {
  if (!ALGORITHMS.includes(algorithm)) {
    throw new TypeError(`Unsupported hash algorithm "${algorithm}"`);
  }

  const buffer = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(text),
  );

  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

/**
 * Hashes `text`. `crypto.subtle` only exists in secure contexts, so on a plain
 * http:// page the content script asks the background to do it instead.
 * @param {string} algorithm one of `ALGORITHMS`
 * @param {string} text
 * @returns {Promise<string>} lowercase hex digest
 */
export const digest = (algorithm, text) =>
  globalThis.crypto?.subtle
    ? digestLocally(algorithm, text)
    : RequestDigest(algorithm, text);

/**
 * Background `runtime.onMessage` listener that answers `RequestDigest()`.
 * @param {object} message
 * @returns {Promise<string>|undefined} the digest, or undefined for other messages
 */
export const OnDigestRequest = (message) => {
  if (message?.action !== MSG_ACTION_DIGEST) {
    return undefined;
  }

  const { algorithm, text } = message.data;
  return digestLocally(algorithm, text);
};
