import { createHash } from "crypto";

export function signature(params) {
  const str = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== "" && key !== "sign")
    .sort()
    .map(key => key + "=" + params[key])
    .join("&");
  return createHash("md5").update(str).digest("hex").toUpperCase();
}


export function generateNonce(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  const maxPos = chars.length;
  while (length--) {
    str += chars[Math.random() * maxPos | 0];
  }

  return str;
}
