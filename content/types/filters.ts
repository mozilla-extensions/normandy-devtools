export type FilterObject =
  | BucketSampleFilterObject
  | StableSampleFilterObject
  | NamespaceSampleFilterObject
  | VersionFilterObject
  | ChannelFilterObject
  | CountryFilterObject
  | LocaleFilterObject;

export interface UnknownFilterObject {
  type: Exclude<string, FilterObject["type"]>;
  [key: string]: unknown;
}

export interface BucketSampleFilterObject {
  type: "bucketSample";
  input: Array<string | number>;
  start: number;
  count: number;
  total: number;
}

export interface StableSampleFilterObject {
  type: "stableSample";
  input: Array<string | number>;
  rate: number;
}

export interface NamespaceSampleFilterObject {
  type: "namespaceSample";
  namespace: string;
  start: number;
  count: number;
  auto?: boolean;
}

export interface VersionFilterObject {
  type: "version";
  versions: Array<number>;
}

export interface ChannelFilterObject {
  type: "channel";
  channels: Array<string>;
}

export interface CountryFilterObject {
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
