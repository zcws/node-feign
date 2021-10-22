## 简介

  node-feign用于远程调用http服务的客户端工具，支持调用nacos中注册的远程http服务。

## 安装

```
yarn add node-feign
```

## 使用
```
// user.module.ts
import { Module } from "@nestjs/common";
import { FeignModule } from "./feign.module";
import { UserController } from "./user.controller";

@Module({
  imports: [
    FeignModule.forRoot({
      namespace: "xxx",
      serverList: "xxx"
    }, {
      timeout: 3000
    })
  ],
  controllers: [UserController]
})
export class UserModule {

}


// user.service.ts
@Controller("users")
export class UserController {
  constructor(private readonly feign: FeignService) {
  }

  @Get()
 async getList(){
   const options = {
      name: "node-map",
      method: "GET",
      url:"/list"
   };
   return this.feign.do(options);
  }
}
```
