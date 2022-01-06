import { createHash } from "crypto";

type Algorithm = "md5" | "sha1" | "sha256";

export class Util {
  static signature(params: { [i: string]: unknown }, algorithm: Algorithm = "sha256") {
    const str = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== "" && key !== "sign")
      .sort()
      .map(key => key + "=" + params[key])
      .join("&");
    return createHash(algorithm).update(str).digest("hex").toUpperCase();
  }


  static generateNonce(length = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    const maxPos = chars.length;
    while (length--) {
      str += chars[Math.random() * maxPos | 0];
    }

    return str;
  }
}
