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

export type FeignConfig = {
  secretKey?: string;
  registry: {
    logger?: Logger,
    namespace?: string,
    serverList: string | string[],
  },
  httpOptions?: HttpModuleOptions
};

export type Mapping = {
  url: string;
  name: string;
  method: Method;
};
