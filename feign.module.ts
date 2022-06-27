import { DynamicModule, FactoryProvider, Module } from "@nestjs/common";
import { FeignService } from "./feign.service";
import { HttpModule, HttpService } from "@nestjs/axios";
import { FeignOptions } from "./interface";

const OptionsProvider = "FeignOptionsProvider";

type FeignAsyncOptions = Omit<FactoryProvider<FeignOptions>, "scope" | "provide">

@Module({})
export class FeignModule {
  static forRoot(opt: FeignOptions): DynamicModule {
    const provider = {
      inject: [HttpService],
      provide: FeignService,
      useFactory(http: HttpService) {
        return new FeignService(opt, http);
      }
    };
    return {
      module: FeignModule,
      imports: [
        HttpModule.register({
          timeout: 5000,
          responseType: "json",
          ...opt.httpOptions
        })
      ],
      providers: [provider],
      exports: [provider]
    };
  }

  static forRootAsync(opt: FeignAsyncOptions): DynamicModule {
    const provider = {
      ...opt,
      provide: OptionsProvider
    };
    const feignProvider: FactoryProvider<FeignService> = {
      provide: FeignService,
      inject: [HttpService, OptionsProvider],
      useFactory(http: HttpService, opt: FeignOptions) {
        return new FeignService(opt, http);
      }
    };
    return {
      module: FeignModule,
      imports: [
        HttpModule.registerAsync({
          inject: [OptionsProvider],
          extraProviders: [provider],
          useFactory(opt: FeignOptions) {
            return {
              timeout: 5000,
              responseType: "json",
              ...opt.httpOptions
            };
          }
        })
      ],
      providers: [provider, feignProvider],
      exports: [feignProvider]
    };
  }

  test() {
    return;
  }
}

