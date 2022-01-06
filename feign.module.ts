import { DynamicModule, Module } from "@nestjs/common";
import { FeignService } from "./feign.service";
import { HttpModule, HttpService } from "@nestjs/axios";
import { FeignConfig } from "./interface";

@Module({})
export class FeignModule {
  static forRoot(config: FeignConfig): DynamicModule {
    const provider = {
      inject: [HttpService],
      provide: FeignService,
      useFactory(http: HttpService) {
        return new FeignService(config, http);
      }
    };
    return {
      module: FeignModule,
      imports: [
        HttpModule.register({
          timeout: 5000,
          ...config.httpOptions
        })
      ],
      providers: [provider],
      exports: [provider]
    };
  }
}

