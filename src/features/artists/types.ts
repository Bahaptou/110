/** Domain shape for an artist. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Artist = {
  id: string;
  name: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the coloured initials tile. */
  imageUri: string;
  createdAt: number;
};
