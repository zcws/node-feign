import * as Nacos from "nacos";
import { getLogger } from "log4js";
import { Mapping, NacosConfig } from "./interface";
import { HttpModuleOptions, HttpService } from "@nestjs/axios";

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
  private nacos: typeof NacosNamingClient;
  private services = new Map<string, Service>();
  private logger = getLogger("FeignService");

  constructor(private readonly nacosConfig: NacosConfig, private readonly http: HttpService) {
  }

  async do<T, R>(mapping: Mapping, data: { [key: string]: unknown } = {}, options: HttpOptions = {}): Promise<R> {
    const request: HttpModuleOptions = { ...options };
    request.baseURL = await this.getHost(mapping.name);
    if (mapping.method === "GET") {
      request.params = data;
    } else {
      request.data = data;
    }

    return this.http.axiosRef.request<T, R>({
      ...request,
      url: mapping.url,
      method: mapping.method
    });
  }

  /*
  * 初始化服务中心
  * */
  private async initNacos() {
    if (!this.nacos) {
      if (!this.nacosConfig.logger) {
        this.nacosConfig.logger = this.logger;
      }

      this.nacos = new NacosNamingClient(this.nacosConfig);
      await this.nacos.ready();
    }
  }

  /*
  * 初始化服务
  * */
  private async initService(serviceName: string, groupName: string = "DEFAULT_GROUP") {
    await this.initNacos();
    const instances: Instance[] = await this.nacos.getAllInstances(serviceName, groupName);
    this.setService(serviceName, instances);
    this.nacos.subscribe({ serviceName, groupName }, (info: Instance[]) => this.setService(serviceName, info));
  }

  /*
  * 获取服务节点地址
  * */
  private async getHost(name: string) {
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

  /*
  * 保存服务节点地址信息
  * */
  private setService(name: string, instances: Instance[]) {
    const hosts = instances.filter(x => x.enabled).map(x => `http://${x.ip}:${x.port}`);
    this.services.set(name, { index: 0, hosts });
  }
}
