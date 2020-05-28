export const partitionFO = (filter_object) => {
  const KNOWN_FILTER_TYPES = [
    "channel",
    "version",
    "country",
    "locale",
    "bucketSample",
    "stableSample",
  ];

  return filter_object.reduce(
    ([knownFO, additionalFO], fo) => {
      if (fo && KNOWN_FILTER_TYPES.includes(fo.type)) {
        return [[...knownFO, fo], additionalFO];
      }

      return [knownFO, [...additionalFO, fo]];
    },
    [[], []],
  );
};
