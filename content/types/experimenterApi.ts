interface Variant {
  slug: string;
  description: string;
}

export interface ExperimenterResponse {
  name: string;
  normandy_id: number;
  normandy_slug: string;
  proposed_start_date: number;
  proposed_duration: number;
  proposed_enrollment: number;
  public_description: string;
  start_date?: number;
  end_date?: number;
  variants: Variant[];
  status: string;
}
