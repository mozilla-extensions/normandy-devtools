import { ActionArguments } from "devtools/types/arguments";
import { Revision } from "devtools/types/recipes";

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

export type ExperimenterRecipePreview<T = ActionArguments> = Omit<
  Revision<T>,
  "action"
> & {
  action_name: string;
};
