import faker from "faker";

import { Factory } from "devtools/tests/factories/factory";

export class VersionFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "version",
      versions: [],
    };
  }

  postGeneration() {
    const versionSet = new Set();
    const { generateVersionsCount = 0 } = this.options;
    while (versionSet.size < generateVersionsCount) {
      versionSet.add(faker.random.number({ min: 40, max: 100 }));
    }

    this.data.versions = [...this.data.versions, ...Array.from(versionSet)];
  }
}

export class ChannelFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "channel",
      channels: [],
    };
  }

  postGeneration() {
    let { generateChannelsCount } = this.options;
    const channels = ["nightly", "aurora", "beta", "release"];
    let selectedChannels = [];

    while (generateChannelsCount && channels.length) {
      const randIndex = faker.random.number() % channels.length;
      const channel = channels.splice(randIndex, 1);
      selectedChannels = selectedChannels.concat(channel);
      generateChannelsCount--;
    }

    this.data.channels = [...this.data.channels, ...selectedChannels];
  }
}

export class CountryFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "country",
      countries: [],
    };
  }

  postGeneration() {
    const { generateCountriesCount } = this.options;
    const generatedCountries = [];

    for (let i = 0; i < generateCountriesCount; i++) {
      generatedCountries.push(faker.address.countryCode());
    }

    this.data.countries = [...this.data.countries, ...generatedCountries];
  }
}

export class LocaleFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "locale",
      locales: [],
    };
  }

  postGeneration() {
    const { generateLocalesCount } = this.options;
    const generatedLocales = [];

    for (let i = 0; i < generateLocalesCount; i++) {
      generatedLocales.push(faker.random.locale());
    }

    this.data.locales = [...this.data.locales, ...generatedLocales];
  }
}

export class BucketSampleFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "bucketSample",
      count: 0,
      input: [],
      start: 0,
      total: 10000,
    };
  }

  postGeneration() {
    const start = faker.random.number() % this.data.total;
    const count = this.data.total - start;
    const input = [`"${faker.random.word()}"`];
    this.data = { ...this.data, count, input, start };
  }
}

export class StableSampleFilterObjectFactory extends Factory {
  getFields() {
    return {
      type: "stableSample",
      rate: 0,
      input: [],
    };
  }

  postGeneration() {
    const input = [`"${faker.random.word()}"`];
    const rate = faker.finance.amount(0, 1, 2);
    this.data = { ...this.data, input, rate };
  }
}
