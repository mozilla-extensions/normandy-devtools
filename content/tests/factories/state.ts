import faker from "faker";

import { Environment } from "devtools/contexts/environment";
import Factory from "devtools/tests/factories";

export const environmentFactory = Factory.fromFields<Environment>({
  readOnlyUrl: "https://example.com/readonly",
  writeableUrl: "https://example.com/writeable",
  experimenterUrl: faker.random.arrayElement([
    undefined,
    "https://example.com/experimenter",
  ]),
  oidcClientId: faker.random.hexaDecimal(32),
  oidcDomain: "https://example.com/oidc",
});
