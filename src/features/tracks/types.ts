/** Domain shape for a track. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Track = {
  id: string;
  title: string;
  artistId: string;
  isFavorite: boolean;
  createdAt: number;
};
