const slugify = require("slugify");

export const ConvertToSlug = (text) =>
  slugify(text, { lower: true, strict: true });

export const ConvertToSlugPreserveCase = (text) =>
  slugify(text, { lower: false, strict: true });

export const DecodeURI = (text) => decodeURI(text);

export const EncodeURI = (text) => encodeURI(text);
