export interface FilterApiResponse {
  status: Array<FilterChoice>;
  channels: Array<FilterChoice>;
  countries: Array<FilterChoice>;
  locales: Array<FilterChoice>;
}

export interface FilterChoice {
  key: string;
  value: string;
}

export interface Extension {
  id: number;
  name: string;
  xpi: string;
  extension_id: string;
  version: string;
  hash: string;
  hash_algorithm: string;
}

export interface Action {
  id: number;
  name: string;
}

export type RecipeListQuery = Partial<{
  text: string;
  ordering: string;
  enabled: boolean;
  action: string;
}>;
