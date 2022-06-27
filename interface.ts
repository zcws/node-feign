import { Logger } from "log4js";
import { HttpModuleOptions } from "@nestjs/axios";

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

export type FeignOptions = {
  secretKey?: string;
  registry: {
    logger?: Logger,
    namespace?: string,
    serverList: string | string[],
  },
  httpOptions?: HttpModuleOptions & { prefix?: string }
};

export type Mapping = {
  url: string;
  name: string;
  method: Method;
};
