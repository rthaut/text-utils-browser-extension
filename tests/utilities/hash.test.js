import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import HashSHA1 from "../../utilities/HashSHA1";
import HashSHA256 from "../../utilities/HashSHA256";
import HashSHA384 from "../../utilities/HashSHA384";
import HashSHA512 from "../../utilities/HashSHA512";
import { OnDigestRequest, digestLocally } from "../../utilities/lib/hash";
import { MSG_ACTION_DIGEST } from "scripts/helpers/messages";

// "" and "abc" are the FIPS 180 test vectors; the last string checks UTF-8
// encoding and was hashed independently with Node's crypto.createHash()
const unicode = "héllo wörld 😀";
const vectors = {
  "SHA-1": [
    HashSHA1,
    {
      "": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
      abc: "a9993e364706816aba3e25717850c26c9cd0d89d",
      [unicode]: "84b2bb1e92c3f1f37786f3c621857ee3ac751294",
    },
  ],
  "SHA-256": [
    HashSHA256,
    {
      "": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      abc: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      [unicode]:
        "4d51765c5c512fcd71d5dfbb7bdf72e9ec2cb09bb2dfac7cdf3949fcd48f7613",
    },
  ],
  "SHA-384": [
    HashSHA384,
    {
      "": "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b",
      abc: "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
      [unicode]:
        "99e9a6a96072b57aaa79b6d41b11ddce750186de8361311699dd1bcfd3dbd4424b28a58a89808f68af6f93173786df55",
    },
  ],
  "SHA-512": [
    HashSHA512,
    {
      "": "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
      abc: "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
      [unicode]:
        "bafc2edfd35896c67744bffadc20e6f811002cfb0e2e8d32faa57390205a5d574fa4c0cf7a51104e4f5589de93436666796e56d5400f61cb22c5474e408ef2c4",
    },
  ],
};

describe.each(Object.entries(vectors))("%s", (algorithm, [utility, cases]) => {
  it.each(Object.entries(cases))("hashes %j", async (text, expected) => {
    await expect(utility(text)).resolves.toBe(expected);
  });
});

describe("digestLocally", () => {
  it("rejects algorithms the utilities don't offer", async () => {
    await expect(digestLocally("MD5", "abc")).rejects.toThrow(TypeError);
  });
});

describe("hashing without crypto.subtle", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    // plain http:// pages have no crypto.subtle
    vi.stubGlobal("crypto", {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks the background for the digest", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockResolvedValue(
      "from background",
    );

    await expect(HashSHA256("abc")).resolves.toBe("from background");
    expect(fakeBrowser.runtime.sendMessage).toHaveBeenCalledExactlyOnceWith({
      action: MSG_ACTION_DIGEST,
      data: { algorithm: "SHA-256", text: "abc" },
    });
  });
});

describe("OnDigestRequest", () => {
  it("answers digest requests", async () => {
    await expect(
      OnDigestRequest({
        action: MSG_ACTION_DIGEST,
        data: { algorithm: "SHA-1", text: "abc" },
      }),
    ).resolves.toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });

  it("ignores other messages", () => {
    expect(OnDigestRequest({ action: "Ping" })).toBeUndefined();
  });
});
