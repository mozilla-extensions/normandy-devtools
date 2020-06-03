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
    const setTotal = this.options;
    for (let i = 0; i < setTotal; i++) {
      versionSet.add(faker.random.number({ min: 40, max: 100 }));
    }

    this.data.versions = [...this.data.versions, ...Array.from(versionSet)];
  }
}

export class channelFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "channel",
      channels: [],
    };
  }

  postGeneration() {
    let { generateChannelsCount } = this.options;
    const channels = ["nightly", "aurora", "beta", "release"];
    const selectedChannels = [];

    while (generateChannelsCount || channels.length) {
      const randIndex = faker.random.number % channels.length;
      const channel = channels.splice(randIndex, 1);
      selectedChannels.push(channel);
      generateChannelsCount--;
    }
  }
}
