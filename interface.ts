import { Logger } from "log4js";

export type Method =
  | "get" | "GET"
  | "delete" | "DELETE"
  | "head" | "HEAD"
  | "options" | "OPTIONS"
  | "post" | "POST"
  | "put" | "PUT"
  | "patch" | "PATCH"
  | "purge" | "PURGE"
  | "link" | "LINK"
  | "unlink" | "UNLINK";

export type NacosConfig = {
  logger?: Logger,
  namespace?: string,
  serverList: string | string[]
};

export type Mapping = {
  url: string;
  name: string;
  method: Method;
};
