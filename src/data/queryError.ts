/**
 * Structured error shape shared by every data-fetching hook (useArtists, and future
 * useTracks/useAlbums/usePlaylists). Errors are values, never exceptions that escape a hook —
 * only a genuinely unexpected throw during normalization is a bug worth surfacing as an exception.
 */
export type QueryError = {
  kind: 'not_found' | 'constraint' | 'unknown';
  message: string;
};

const USER_FACING_MESSAGE: Record<QueryError['kind'], string> = {
  not_found: "Cet élément n'existe pas ou plus.",
  constraint: 'Cette action est impossible dans son état actuel.',
  unknown: "Une erreur inattendue s'est produite.",
};

/** Normalizes any thrown value into a QueryError. Call this at the single boundary where SQLite calls are awaited. */
export function toQueryError(cause: unknown): QueryError {
  const rawMessage = cause instanceof Error ? cause.message : String(cause);
  const kind: QueryError['kind'] = /constraint/i.test(rawMessage)
    ? 'constraint'
    : /no rows|not found/i.test(rawMessage)
      ? 'not_found'
      : 'unknown';
  return { kind, message: USER_FACING_MESSAGE[kind] };
}
