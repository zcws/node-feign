import * as Nacos from "nacos";
import { getLogger } from "log4js";
import { FeignConfig, Mapping } from "./interface";
import { HttpModuleOptions, HttpService } from "@nestjs/axios";
import { Util } from "./util";
import { AxiosDefaults, AxiosResponse } from "axios";
import { URL } from "url";

type Service = {
  index: number;
  hosts: string[]
};

interface Instance {
  instanceId: string;
  ip: string;
  port: number;
  weight: number;
  healthy: boolean;
  enabled: boolean;
  ephemeral: boolean;
  clusterName: string;
  serviceName: string;
  metadata: { [key: string]: string };
  instanceHeartBeatInterval: number;
  ipDeleteTimeout: number;
  instanceIdGenerator: string;
  instanceHeartBeatTimeOut: number;
}

type HttpOptions = Omit<HttpModuleOptions, "data" | "params" | "url" | "method" | "baseURL">
const { NacosNamingClient } = Nacos as any;

export class FeignService {
  private client: typeof NacosNamingClient;
  private services = new Map<string, Service>();
  private logger = getLogger("FeignService");
  #prefix;

  constructor(private readonly config: FeignConfig, private readonly http: HttpService) {
    if (config.httpOptions?.prefix) {
      this.#prefix = config.httpOptions.prefix;
    }
  }

  async request<R>(mapping: Mapping, data: { [key: string]: unknown } = {}, options: HttpOptions = {}): Promise<AxiosResponse<R>> {
    const req: HttpModuleOptions = { ...options };
    req.baseURL = await this.getHost(mapping.name);
    if (mapping.method === "GET") {
      req.params = data;
    } else {
      req.data = data;
    }

    if (this.config.secretKey) {
      const nonce = Util.generateNonce();
      const timestamp = Date.now().toString();
      if (!req.headers) {
        req.headers = {};
      }

      req.headers.nonce = nonce;
      req.headers.timestamp = timestamp;
      const data = mapping.method === "GET" ? req.params : req.data;
      req.headers.signature = Util.signature({
        ...data,
        nonce,
        timestamp,
        secretKey: this.config.secretKey
      });
    }

    return this.http.axiosRef.request<unknown, AxiosResponse<R>>({
      ...req,
      url: mapping.url,
      method: mapping.method
    });
  }

  async do<R>(mapping: Mapping, data: { [key: string]: unknown } = {}, options: HttpOptions = {}): Promise<R> {
    const res = await this.request<R>(mapping, data, options);
    return res?.data;
  }

  /**
   * 初始化服务中心
   * */
  private async initNacos(): Promise<void> {
    if (!this.client) {
      if (!this.config.registry.logger) {
        this.config.registry.logger = this.logger;
      }

      this.client = new NacosNamingClient(this.config.registry);
      await this.client.ready();
    }
  }

  /**
   * 初始化服务
   * */
  private async initService(serviceName: string, groupName: string = "DEFAULT_GROUP"): Promise<void> {
    await this.initNacos();
    const instances: Instance[] = await this.client.getAllInstances(serviceName, groupName);
    this.setService(serviceName, instances);
    this.client.subscribe({ serviceName, groupName }, (info: Instance[]) => this.setService(serviceName, info));
  }

  /**
   * 获取服务节点地址
   * */
  private async getHost(name: string): Promise<string> {
    if (!this.services.has(name)) {
      await this.initService(name);
    }

    const sv = this.services.get(name);
    if (!sv?.hosts.length) {
      throw new Error(`没有可用的服务[${name}]节点。`);
    }

    sv.index = (sv.index + 1) % sv.hosts.length;
    return sv.hosts[sv.index];
  }

  /**
   * 保存服务节点地址信息
   * */
  private setService(name: string, instances: Instance[]): void {
    const hosts = instances.filter(x => x.enabled).map(x => {
      const url = new URL(`http://${x.ip}:${x.port}`);
      if (this.#prefix) {
        url.pathname = this.#prefix;
      }

      return url.toString();
    });
    this.services.set(name, { index: 0, hosts });
  }

  /**
   * 签名
   * */
  static signature(data: { [i: string]: unknown }): string {
    return Util.signature(data);
  }

  /**
   * 设置http默认选项
   * */
  setDefaultHttpOptions(options: AxiosDefaults & { prefix?: string }) {
    if (options.prefix) {
      this.#prefix = options.prefix;
      delete options.prefix;
    }

    this.http.axiosRef.defaults = options;
  }
}
