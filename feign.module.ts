import { DynamicModule, HttpModuleOptions, Module } from "@nestjs/common";
import { FeignService } from "./feign.service";
import { HttpModule, HttpService } from "@nestjs/axios";
import { NacosConfig } from "./interface";

@Module({})
export class FeignModule {
  static forRoot(nacos: NacosConfig, config: HttpModuleOptions = {}): DynamicModule {
    const provider = {
      inject: [HttpService],
      provide: "FeignService",
      useFactory(http: HttpService) {
        return new FeignService(nacos, http);
      }
    };
    return {
      module: FeignModule,
      imports: [
        HttpModule.register({
          ...config,
          timeout: 5000
        })
      ],
      providers: [provider],
      exports: [provider]
    };
  }
}

