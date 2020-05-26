import faker from "faker";
import { Factory } from "./factory";

export class versionFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "version",
      versions: [],
    };
  }

  postGeneration() {
    const versionSet = new Set();
    const setTotal = faker.random.number({ min: 1, max: 10 });
    for (let i = 0; i < setTotal; i++) {
      versionSet.add(faker.random.number({ min: 40, max: 100 }));
    }

    this.data.versions = [...this.data.versions, ...Array.from(versionSet)];
  }
}

export class channelFilterObjectFactory extends Factory {
  getFields() {
    const channels = ["nightly", "aurora", "beta", "release"];
    return {
      type: "channel",
      channels: [faker.random.arrayElement(channels)],
    };
  }
}
