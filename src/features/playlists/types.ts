/** Domain shape for a playlist. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Playlist = {
  id: string;
  name: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the coloured tile. */
  imageUri: string;
  createdAt: number;
};
