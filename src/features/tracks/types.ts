/** Domain shape for a track. Derived from `db/schema.ts` — do not duplicate fields ad hoc. */
export type Track = {
  id: string;
  title: string;
  artistId: string;
  /** file:// URI into the app's persistent audio storage — see audioStorage.ts. Empty until a slice wires playback. */
  audioUri: string;
  durationSeconds: number;
  isFavorite: boolean;
  createdAt: number;
};
