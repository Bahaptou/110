/** Domain shape for an artist. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Artist = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};
