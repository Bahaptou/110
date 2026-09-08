/** Domain shape for an album. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Album = {
  id: string;
  name: string;
  artistId: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the coloured tile. */
  imageUri: string;
  createdAt: number;
};
