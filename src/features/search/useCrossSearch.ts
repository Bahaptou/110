import { useMemo } from 'react';

import { useAlbums } from '../albums/useAlbums';
import { useArtists } from '../artists/useArtists';
import { resolveTrackCoverUri } from '../images/trackCover';
import { usePlaylists } from '../playlists/usePlaylists';
import { useSettings } from '../settings/SettingsProvider';
import { useAllTracks } from '../tracks/useAllTracks';
import { type Track } from '../tracks/types';
import { type CrossSearchResult, type SearchKind } from './CrossSearchResults';

type UseCrossSearchResult = {
  /** Matches from every kind except `own`, ready to hand to CrossSearchResults. */
  results: CrossSearchResult[];
  /** Matching tracks in display order — the queue a tapped track loops over. */
  tracks: Track[];
};

/**
 * Searches the whole library from any list screen's search bar. The screen passes its own kind so
 * that its grid keeps priority: those matches are excluded here rather than repeated underneath.
 */
export function useCrossSearch(query: string, own: SearchKind): UseCrossSearchResult {
  const { artists } = useArtists();
  const { albums } = useAlbums();
  const { playlists } = usePlaylists();
  const { tracks } = useAllTracks();
  const { preferArtistCover } = useSettings();

  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists]);
  const albumById = useMemo(() => new Map(albums.map((a) => [a.id, a])), [albums]);

  const matchingTracks = useMemo(() => {
    if (query.length === 0 || own === 'track') return [];
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, query, own]);

  const results = useMemo(() => {
    if (query.length === 0) return [];
    const matches: CrossSearchResult[] = [];

    if (own !== 'artist') {
      for (const artist of artists) {
        if (!artist.name.toLowerCase().includes(query)) continue;
        matches.push({
          kind: 'artist',
          id: artist.id,
          name: artist.name,
          subtitle: '',
          color: artist.color,
          imageUri: artist.imageUri,
        });
      }
    }

    if (own !== 'album') {
      for (const album of albums) {
        if (!album.name.toLowerCase().includes(query)) continue;
        matches.push({
          kind: 'album',
          id: album.id,
          name: album.name,
          subtitle: artistById.get(album.artistId)?.name ?? '',
          color: album.color,
          imageUri: album.imageUri,
        });
      }
    }

    if (own !== 'playlist') {
      for (const playlist of playlists) {
        if (!playlist.name.toLowerCase().includes(query)) continue;
        matches.push({
          kind: 'playlist',
          id: playlist.id,
          name: playlist.name,
          subtitle: '',
          color: playlist.color,
          imageUri: playlist.imageUri,
        });
      }
    }

    for (const track of matchingTracks) {
      const artist = artistById.get(track.artistId);
      const album = track.albumId === null ? undefined : albumById.get(track.albumId);
      matches.push({
        kind: 'track',
        id: track.id,
        name: track.title,
        subtitle: artist?.name ?? '',
        color: artist?.color ?? '#333',
        imageUri: resolveTrackCoverUri(
          track,
          { albumImageUri: album?.imageUri ?? '', artistImageUri: artist?.imageUri ?? '' },
          preferArtistCover
        ),
      });
    }

    return matches;
  }, [query, own, artists, albums, playlists, matchingTracks, artistById, albumById, preferArtistCover]);

  return { results, tracks: matchingTracks };
}
