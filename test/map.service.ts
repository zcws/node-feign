import { Injectable } from "@nestjs/common";
import { FeignService } from "../index";

@Injectable()
export class MapService {
  constructor(private readonly feign: FeignService) {
  }

  test() {
    return this.feign.do({ name: "node-bi", method: "GET", url: "test" });
  }
}
