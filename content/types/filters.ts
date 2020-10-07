export type FilterObject = { type: string };

export interface BucketSampleFilterObject extends FilterObject {
  type: "bucketSample";
  input: Array<string>;
  start: number;
  count: number;
  total: number;
}

export interface StableSampleFilterObject extends FilterObject {
  type: "stableSample";
  input: Array<string>;
  rate: number;
}

export interface NamespaceSampleFilterObject extends FilterObject {
  type: "namespaceSample";
  namespace: string;
  start: number;
  count: number;
  total: number;
}

export interface VersionFilterObject extends FilterObject {
  type: "version";
  versions: Array<number>;
}

export interface ChannelFilterObject extends FilterObject {
  type: "channel";
  channels: Array<string>;
}

export interface CountryFilterObject extends FilterObject {
  type: "country";
  countries: Array<string>;
}

export interface LocaleFilterObject {
  type: "locale";
  locales: Array<string>;
}

export type SampleFilterObject =
  | BucketSampleFilterObject
  | StableSampleFilterObject
  | NamespaceSampleFilterObject;
