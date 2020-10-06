import faker from "faker";

import Factory from "devtools/tests/factories";
import {
  FilterApiResponse,
  Extension,
  Action,
} from "devtools/types/normandyApi";

export const filtersApiResponseFactory = Factory.fromFields<
  FilterApiResponse,
  { countryCount: number; localeCount: number }
>({
  channels: [
    { key: "release", value: "Release" },
    { key: "beta", value: "Beta" },
    { key: "aurora", value: "Dev Edition" },
    { key: "nightly", value: "Nightly" },
  ],
  status: [
    { key: "enabled", value: "Enabled" },
    { key: "disabled", value: "Disabled" },
  ],
  countries: ({ countryCount = 10 }) => {
    const rv = [];
    while (rv.length < countryCount) {
      rv.push({
        key: faker.address.countryCode(),
        value: faker.address.country(),
      });
    }

    return rv;
  },
  locales: ({ localeCount = 10 }) => {
    const rv = [];
    while (rv.length < localeCount) {
      rv.push({
        key: faker.random.word(),
        value: faker.random.locale(),
      });
    }

    return rv;
  },
});

export const extensionFactory = Factory.fromFields<Extension>({
  id: faker.random.number,
  name: () => faker.lorem.slug(),
  xpi: faker.internet.url,
  extension_id: () => faker.lorem.slug(),
  hash: () => faker.random.alphaNumeric(),
  hash_algorithm: () => faker.random.word(),

  version: () => {
    const parts = [];
    while (parts.length < 3) {
      parts.push(faker.random.number());
    }

    return parts.join(".");
  },
});

export const actionFactory = Factory.fromFields<Action>({
  id: () => faker.random.number(),
  name: () => faker.random.word(),
});
