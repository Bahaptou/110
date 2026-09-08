import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cover } from '../images/Cover';
import { resolveTrackCoverUri } from '../images/trackCover';
import { useSettings } from '../settings/SettingsProvider';
import { type Track } from './types';

type Props = {
  track: Track;
  /** Colour and image of the track's artist, used when the track has no cover of its own. */
  artistColor: string;
  artistImageUri: string;
  /** Cover of the track's album, when it belongs to one. */
  albumImageUri?: string;
  isCurrent: boolean;
  isPlaying: boolean;
  /** Tapping the row (anywhere but the thumbnail) starts the track from the beginning. */
  onPlay: () => void;
  /** Tapping the thumbnail toggles play/pause instead, so a running track can be paused in place. */
  onTogglePlayPause: () => void;
  onToggleFavorite: () => void;
  onOpenActions: () => void;
};

function HeartIcon({ filled }: { filled: boolean }): React.JSX.Element {
  return <Text style={{ color: filled ? '#E8001C' : '#555', fontSize: 18 }}>{filled ? '♥' : '♡'}</Text>;
}

/** One track in a vertical list. Shared by the Tracks tab and the artist screen. */
export function TrackRow({
  track,
  artistColor,
  artistImageUri,
  albumImageUri = '',
  isCurrent,
  isPlaying,
  onPlay,
  onTogglePlayPause,
  onToggleFavorite,
  onOpenActions,
}: Props): React.JSX.Element {
  const { preferArtistCover } = useSettings();
  const coverUri = resolveTrackCoverUri(track, { albumImageUri, artistImageUri }, preferArtistCover);
  const showPauseGlyph = isCurrent && isPlaying;

  return (
    <Pressable style={styles.row} onPress={onPlay}>
      <Pressable onPress={onTogglePlayPause} hitSlop={6}>
        <View>
          <Cover
            imageUri={coverUri}
            color={artistColor}
            fallbackText=""
            size={44}
            borderRadius={12}
            fontSize={0}
          />
          {/* Overlay keeps the play/pause affordance visible whether or not there's a cover image. */}
          <View style={[styles.overlay, isCurrent && styles.overlayActive]}>
            <Text style={styles.overlayGlyph}>{showPauseGlyph ? '❙❙' : '▶'}</Text>
          </View>
        </View>
      </Pressable>

      <Text style={[styles.title, isCurrent && styles.titleActive]} numberOfLines={1}>
        {track.title}
      </Text>

      <Pressable onPress={onToggleFavorite} hitSlop={8}>
        <HeartIcon filled={track.isFavorite} />
      </Pressable>
      <Pressable onPress={onOpenActions} hitSlop={8}>
        <Text style={styles.moreGlyph}>⋯</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayActive: { backgroundColor: 'rgba(232,0,28,0.55)' },
  overlayGlyph: { color: '#fff', fontSize: 13 },
  title: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  titleActive: { color: '#E8001C' },
  moreGlyph: { color: '#888', fontSize: 18, fontWeight: '700' },
});
