export interface BucketSampleFilterObject {
  type: "bucketSample";
  input: Array<string>;
  start: number;
  count: number;
  total: number;
}

export interface StableSampleFilterObject {
  type: "stableSample";
  input: Array<string>;
  rate: number;
}

export interface NamespaceSampleFilterObject {
  type: "namespaceSample";
  namespace: string;
  start: number;
  count: number;
  total: number;
}
