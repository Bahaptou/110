/** Domain shape for a track. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Track = {
  id: string;
  title: string;
  artistId: string;
  /** null when the track isn't in any album. A track belongs to at most one, always its artist's. */
  albumId: string | null;
  /** file:// URI into the app's persistent audio storage — see audioStorage.ts. Empty until a slice wires playback. */
  audioUri: string;
  /** file:// URI into persistent image storage, or '' to inherit the artist's cover. */
  imageUri: string;
  durationSeconds: number;
  isFavorite: boolean;
  createdAt: number;
};
