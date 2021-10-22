import { assert } from "chai";
import { FeignModule } from "../index";
import { Test } from "@nestjs/testing";
import { MapService } from "./map.service";


describe("test", () => {
  let service: MapService;
  before(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FeignModule.forRoot({
          namespace: process.env.namespace,
          serverList: process.env.serverList
        }, { timeout: 3000 })
      ],
      controllers: [MapService]
    }).compile();

    service = module.get<MapService>(MapService);
  });
  it("list", async () => {
    const a = await service.test();
    console.log(a);
    assert.ok("1");
  });
});
