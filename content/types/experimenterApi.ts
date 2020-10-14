interface Variant {
  slug: string;
  description: string;
}

export interface ExperimenterResponse {
  name: string;
  normandy_id: number;
  proposed_start_date: number;
  proposed_duration: number;
  public_description: string;
  start_date?: number;
  end_date?: number;
  variants: Variant[];
}
