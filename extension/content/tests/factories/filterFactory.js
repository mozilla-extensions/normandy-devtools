import faker from "faker";

import { Factory, Field } from "devtools/tests/factories/factory";

export class FiltersFactory extends Factory {
  getFields() {
    return {
      channels: Channels,
      countries: [],
      locales: [],
    };
  }

  postGeneration() {
    const { generateCountriesCount, generateLocalesCount } = this.options;
    this.generateCountries(generateCountriesCount);
    this.generateLocales(generateLocalesCount);
  }

  generateCountries(numOfCountries) {
    const countries = [];
    for (let i = 0; i < numOfCountries; i++) {
      countries.push(CountryFactory.build());
    }

    this.data.countries = [...this.data.countries, ...countries];
  }

  generateLocales(numOfLocales) {
    const locales = [];
    for (let i = 0; i < numOfLocales; i++) {
      locales.push(LocalFactory.build());
    }

    this.data.locales = [...this.data.locales, ...locales];
  }
}

export class CountryFactory extends Factory {
  getFields() {
    return {
      key: new Field(faker.address.country),
      value: new Field(faker.address.countryCode),
    };
  }
}

export class LocalFactory extends Factory {
  getFields() {
    return {
      key: new Field(faker.random.word),
      value: new Field(faker.random.locale),
    };
  }
}

export class ExtensionFactory extends Factory {
  getFields() {
    return {
      id: new Field(faker.random.number),
      name: new Field(faker.lorem.slug),
      xpi: new Field(faker.internet.url),
      extension_id: new Field(faker.lorem.slug),
      version: new Field(faker.random.word),
      hash: new Field(faker.random.alphaNumeric),
      hash_algorithm: new Field(faker.random.word),
    };
  }
}

export const ActionsResponse = () => {
  const actionNames = [
    "show-heartbeat",
    "opt-out-study",
    "preference-experiment",
    "console-log",
  ];
  const actionResults = actionNames.map((action, index) => {
    return { id: index + 1, name: action };
  });

  return actionResults;
};

const Channels = [
  {
    key: "aurora",
    value: "Developer Edition",
  },
  {
    key: "beta",
    value: "Beta",
  },
  {
    key: "nightly",
    value: "Nightly",
  },
  {
    key: "release",
    value: "Release",
  },
];
