// UTF-8 Base64 helpers built on btoa/atob, TextEncoder and TextDecoder.

const utf8Decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

const toByteString = (bytes) => {
  // String.fromCharCode() with too many arguments overflows the stack
  const chunkSize = 0x8000;
  let result = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    result += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return result;
};

const fromByteString = (byteString) =>
  Uint8Array.from(byteString, (char) => char.charCodeAt(0));

/**
 * Throws a URIError for text with unpaired surrogates, which have no UTF-8
 * encoding, instead of letting TextEncoder replace them with U+FFFD.
 * @param {string} text
 */
const assertWellFormed = (text) => {
  if (/\p{Cs}/u.test(text)) {
    throw new URIError("Text contains an unpaired surrogate");
  }
};

/**
 * Accepts both alphabets, ignores whitespace, and throws on any other
 * character outside the alphabet or on bad padding (same as atob).
 * @param {string} data
 * @returns {string} one character per byte
 */
const decodeToByteString = (data) =>
  atob(data.replace(/_/g, "/").replace(/-/g, "+"));

/**
 * @param {string} text
 * @returns {string} standard Base64 of the UTF-8 bytes of `text`
 */
export const encode = (text) => {
  assertWellFormed(text);
  return btoa(toByteString(new TextEncoder().encode(text)));
};

/**
 * @param {string} text
 * @returns {string} URL-safe Base64 (RFC 4648 section 5) without padding
 */
export const encodeURLSafe = (text) =>
  encode(text).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

/**
 * Decodes Base64 in either alphabet. Bytes that are not valid UTF-8 come
 * back as one Latin-1 character per byte.
 * @param {string} data
 * @returns {string}
 */
export const decode = (data) => {
  if (!data) {
    return data;
  }
  const byteString = decodeToByteString(data);
  try {
    return utf8Decoder.decode(fromByteString(byteString));
  } catch {
    return byteString;
  }
};

/**
 * Decodes URL-safe Base64, adding any missing padding first. Throws a
 * URIError if the bytes are not valid UTF-8.
 * @param {string} data
 * @returns {string}
 */
export const decodeURLSafe = (data) => {
  if (!data) {
    return data;
  }
  const padding = "===".slice(0, 3 - ((data.length + 3) % 4));
  const bytes = fromByteString(decodeToByteString(data + padding));
  try {
    return utf8Decoder.decode(bytes);
  } catch {
    throw new URIError("Decoded bytes are not valid UTF-8");
  }
};
