import faker from "faker";

import Factory, { GeneratedField } from "devtools/tests/factories";
import * as filterTypes from "devtools/types/filters";
import { assert } from "devtools/utils/helpers";

export const versionFoFactory = Factory.fromFields<
  filterTypes.VersionFilterObject,
  { generateVersionsCount: number }
>({
  type: "version",
  versions: ({ generateVersionsCount }) => {
    const versionSet: Set<number> = new Set();
    while (versionSet.size < generateVersionsCount) {
      versionSet.add(faker.random.number({ min: 40, max: 100 }));
    }

    return Array.from(versionSet);
  },
});

export const channelFoFactory = Factory.fromFields<
  filterTypes.ChannelFilterObject,
  { generateChannelsCount: number }
>({
  type: "channel",
  channels: ({ generateChannelsCount = 1 }): Array<string> => {
    const channels = ["nightly", "aurora", "beta", "release"];
    if (generateChannelsCount > channels.length) {
      throw new Error(
        `Can't generate a channel filter with more than ${channels.length} channels`,
      );
    }

    let selectedChannels = [];

    while (generateChannelsCount && channels.length) {
      const randIndex = Math.floor(Math.random() * channels.length);
      const channel = channels.splice(randIndex, 1);
      selectedChannels = selectedChannels.concat(channel);
      generateChannelsCount--;
    }

    return selectedChannels;
  },
});

export const countryFoFactory = Factory.fromFields<
  filterTypes.CountryFilterObject,
  { generateCountriesCount: number }
>({
  type: "country",
  countries: ({ generateCountriesCount = 1 }): Array<string> => {
    const countries = [];
    while (countries.length < generateCountriesCount) {
      countries.push(faker.address.countryCode());
    }

    return countries;
  },
});

export const localeFoFactory = Factory.fromFields<
  filterTypes.LocaleFilterObject,
  { generateLocalesCount: number }
>({
  type: "locale",
  locales: ({ generateLocalesCount = 1 }): Array<string> => {
    const locales = [];
    while (locales.length < generateLocalesCount) {
      locales.push(faker.random.locale());
    }

    return locales;
  },
});

const inputFieldGenerator: GeneratedField<
  unknown,
  Array<string>,
  { generateInputLength: number }
> = {
  generator({ generateInputLength = 2 } = {}): Array<string> {
    assert(generateInputLength >= 1, "Must have at least one input");
    const rv = ["normandy.userId"];
    while (rv.length < generateInputLength - 1) {
      rv.push(`"${faker.random.word()}"`);
    }

    return rv;
  },
};

export const bucketSampleFoFactory = Factory.fromFields<
  filterTypes.BucketSampleFilterObject
>({
  type: "bucketSample",
  start: {
    dependencies: ["total"],
    generator: (_options, { total }): number => faker.random.number(total),
  },
  count: {
    dependencies: ["total"],
    generator: (_options, { total }): number => faker.random.number(total),
  },
  total: 10000,
  input: inputFieldGenerator,
});

export const stableSampleFoFactory = Factory.fromFields<
  filterTypes.StableSampleFilterObject
>({
  type: "stableSample",
  rate: () => faker.random.number({ min: 0, max: 1, precision: 0.001 }),
  input: inputFieldGenerator,
});

const factoriesByType = {
  version: versionFoFactory,
  channel: channelFoFactory,
  country: countryFoFactory,
  locale: localeFoFactory,
  bucketSample: bucketSampleFoFactory,
  stableSample: stableSampleFoFactory,
};

export const filterObjectFactory = new Factory<filterTypes.FilterObject>(
  (partial = {}, options = {}) => {
    const type =
      partial.type ?? faker.random.arrayElement(Object.keys(factoriesByType));
    const factory = factoriesByType[type];
    if (!factory) {
      throw new Error(
        `Don't know how to make a filter object of type ${type}"`,
      );
    }

    return factory.build(partial, options);
  },
);
