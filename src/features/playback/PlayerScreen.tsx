import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlbums } from '../albums/useAlbums';
import { useArtists } from '../artists/useArtists';
import { Cover } from '../images/Cover';
import { resolveTrackCoverUri } from '../images/trackCover';
import { useSettings } from '../settings/SettingsProvider';
import { ChangeTrackPlaylistsScreen } from '../playlists/screens/ChangeTrackPlaylistsScreen';
import { ChangeTrackAlbumScreen } from '../tracks/screens/ChangeTrackAlbumScreen';
import { ChangeTrackArtistScreen } from '../tracks/screens/ChangeTrackArtistScreen';
import { TrackActionsSheet } from '../tracks/TrackActionsSheet';
import { useAllTracks } from '../tracks/useAllTracks';
import { RenameDialog } from '../../components/ui/RenameDialog';
import { usePickImage } from '../images/usePickImage';
import { usePlayback } from './PlaybackProvider';
import { SKIP_DISTANCE } from './swipeToSkip';

/**
 * Which "move this track elsewhere" screen is open on top of the player, if any. The player is a
 * modal mounted outside the navigators, so these screens are presented directly rather than pushed.
 * They're structurally typed (route/navigation.goBack only), which is what makes that possible.
 */
type EditingScreen = 'artist' | 'album' | 'playlists' | null;

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

type Props = {
  onClose: () => void;
};

/** Full-screen "now playing" view — opened from the MiniPlayer, closed by the back chevron. */
export function PlayerScreen({ onClose }: Props): React.JSX.Element | null {
  const {
    currentTrack: playingTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    autoAdvance,
    toggleAutoAdvance,
    stopIfPlaying,
  } = usePlayback();
  const { artists } = useArtists();
  const { albums } = useAlbums();
  const { preferArtistCover } = useSettings();
  const { tracks, rename, setImage, deleteTrack } = useAllTracks();
  const { pickImageWithPrompt } = usePickImage();
  const [showActions, setShowActions] = useState(false);
  const [editingScreen, setEditingScreen] = useState<EditingScreen>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const translateY = useSharedValue(0);

  // The Modal itself (see RootNavigator, animationType="slide") already animates the slide-down on
  // close — this gesture only needs to track the drag for live feedback and decide whether to call
  // onClose(). Animating translateY all the way to the bottom here too would play that slide twice.
  const panGesture = Gesture.Pan()
    // Only claims the gesture once the finger has clearly moved downward — a plain tap, or a
    // horizontal/upward drag, is left alone so buttons and the scrubber underneath still work.
    .activeOffsetY(15)
    .failOffsetY(-15)
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        translateY.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  // Swiping the cover skips, same as the mini player: right for previous, left for next. The
  // buttons underneath stay — this is a shortcut, not a replacement.
  const coverTranslateX = useSharedValue(0);
  const skipGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      coverTranslateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX <= -SKIP_DISTANCE) {
        runOnJS(playNext)();
      } else if (event.translationX >= SKIP_DISTANCE) {
        runOnJS(playPrevious)();
      }
      coverTranslateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: coverTranslateX.value }],
  }));

  if (!playingTrack) return null;

  // The provider holds the track as it was when playback started; edits made here (rename, artist,
  // cover) land in the database, so read the fresh row back rather than showing a stale copy.
  const currentTrack = tracks.find((t) => t.id === playingTrack.id) ?? playingTrack;

  const handleRename = () => {
    setShowActions(false);
    setRenameValue(currentTrack.title);
    setIsRenaming(true);
  };

  const submitRename = async () => {
    const result = await rename(currentTrack, renameValue);
    if (result.ok) setIsRenaming(false);
  };

  const handleChangeImage = async () => {
    setShowActions(false);
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setImage(currentTrack, imageUri);
  };

  const openEditingScreen = (screen: NonNullable<EditingScreen>) => {
    setShowActions(false);
    setEditingScreen(screen);
  };

  const closeEditingScreen = () => setEditingScreen(null);

  const handleDelete = () => {
    setShowActions(false);
    Alert.alert('Supprimer ce son ?', `« ${currentTrack.title} » sera supprimé définitivement.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          stopIfPlaying(currentTrack.id);
          void deleteTrack(currentTrack);
          // Nothing left to show once the playing track is gone.
          onClose();
        },
      },
    ]);
  };

  const artist = artists.find((a) => a.id === currentTrack.artistId);
  const index = queue.findIndex((t) => t.id === currentTrack.id);
  const hasPrevious = index > 0;
  const hasNext = index !== -1 && index < queue.length - 1;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={styles.backLabel}>‹ RÉDUIRE</Text>
              </Pressable>
              <Text style={styles.headerLabel}>EN LECTURE</Text>
              <Pressable style={styles.manageButton} onPress={() => setShowActions(true)} hitSlop={8}>
                <Text style={styles.manageGlyph}>⋯</Text>
              </Pressable>
            </View>

            <View style={styles.body}>
              <GestureDetector gesture={skipGesture}>
                <Animated.View style={coverAnimatedStyle}>
                  <Cover
                    imageUri={resolveTrackCoverUri(
                      currentTrack,
                      {
                        albumImageUri: albums.find((a) => a.id === currentTrack.albumId)?.imageUri ?? '',
                        artistImageUri: artist?.imageUri ?? '',
                      },
                      preferArtistCover
                    )}
                    color={artist?.color ?? '#111'}
                    fallbackText={artist?.name.slice(0, 2).toUpperCase() ?? '♪'}
                    size={260}
                    borderRadius={24}
                    fontSize={80}
                  />
                </Animated.View>
              </GestureDetector>

              <View style={styles.trackInfo}>
                <Text style={styles.title} numberOfLines={2}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist?.name ?? 'Artiste inconnu'}
                </Text>
              </View>

              <View style={styles.scrubberSection}>
                <Pressable
                  style={styles.scrubberTrack}
                  onPress={(event) => {
                    const width = event.nativeEvent.locationX;
                    // Rough tap-to-seek: proportion of a fixed-width bar rather than measuring the real layout.
                    seekTo(Math.max(0, (width / 280) * duration));
                  }}
                >
                  <View style={[styles.scrubberFill, { width: `${Math.min(100, progress * 100)}%` }]} />
                </Pressable>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
                  <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                <Pressable onPress={playPrevious} disabled={!hasPrevious} hitSlop={12}>
                  <Text style={[styles.controlGlyph, !hasPrevious && styles.controlGlyphDisabled]}>⏮</Text>
                </Pressable>
                <Pressable style={styles.playButton} onPress={togglePlayPause}>
                  <Text style={styles.playGlyph}>{isPlaying ? '❙❙' : '▶'}</Text>
                </Pressable>
                <Pressable onPress={playNext} disabled={!hasNext} hitSlop={12}>
                  <Text style={[styles.controlGlyph, !hasNext && styles.controlGlyphDisabled]}>⏭</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.autoAdvanceButton, autoAdvance && styles.autoAdvanceButtonActive]}
                onPress={toggleAutoAdvance}
                hitSlop={8}
              >
                <Text style={[styles.autoAdvanceGlyph, autoAdvance && styles.autoAdvanceGlyphActive]}>
                  {autoAdvance ? '➜' : '↻'}
                </Text>
                <Text style={[styles.autoAdvanceLabel, autoAdvance && styles.autoAdvanceLabelActive]}>
                  {autoAdvance ? 'LECTURE CONTINUE' : 'BOUCLE'}
                </Text>
              </Pressable>
            </View>

            <TrackActionsSheet
              visible={showActions}
              track={currentTrack}
              onClose={() => setShowActions(false)}
              onRename={handleRename}
              onChangeImage={handleChangeImage}
              onChangeArtist={() => openEditingScreen('artist')}
              onChangeAlbum={() => openEditingScreen('album')}
              onChangePlaylists={() => openEditingScreen('playlists')}
              onDelete={handleDelete}
            />

            {/* Presented rather than pushed: there's no navigator above the player to push onto. */}
            <Modal
              visible={editingScreen !== null}
              animationType="slide"
              onRequestClose={closeEditingScreen}
            >
              {editingScreen === 'artist' && (
                <ChangeTrackArtistScreen
                  route={{ params: { trackId: currentTrack.id } }}
                  navigation={{ goBack: closeEditingScreen }}
                />
              )}
              {editingScreen === 'album' && (
                <ChangeTrackAlbumScreen
                  route={{ params: { trackId: currentTrack.id } }}
                  navigation={{ goBack: closeEditingScreen }}
                />
              )}
              {editingScreen === 'playlists' && (
                <ChangeTrackPlaylistsScreen
                  route={{ params: { trackId: currentTrack.id } }}
                  navigation={{ goBack: closeEditingScreen }}
                />
              )}
            </Modal>

            <RenameDialog
              visible={isRenaming}
              title="RENOMMER LE MORCEAU"
              value={renameValue}
              onChangeValue={setRenameValue}
              onCancel={() => setIsRenaming(false)}
              onSubmit={submitRename}
            />
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 15, fontWeight: '700' },
  manageButton: { width: 70, alignItems: 'flex-end' },
  manageGlyph: { color: '#888', fontSize: 22, fontWeight: '700' },
  headerLabel: { color: '#888', fontSize: 11, letterSpacing: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 32 },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 24,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitials: { color: '#000', fontWeight: '700', fontSize: 80, opacity: 0.85 },
  trackInfo: { alignItems: 'center', gap: 6 },
  title: { color: '#fff', fontWeight: '700', fontSize: 22, textAlign: 'center' },
  artistName: { color: '#888', fontSize: 15 },
  scrubberSection: { width: 280, gap: 8 },
  scrubberTrack: { width: 280, height: 4, borderRadius: 2, backgroundColor: '#2a2a2a' },
  scrubberFill: { height: 4, borderRadius: 2, backgroundColor: '#E8001C' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel: { color: '#888', fontSize: 11 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  controlGlyph: { color: '#fff', fontSize: 26 },
  controlGlyphDisabled: { color: '#333' },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8001C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: { color: '#fff', fontSize: 22 },
  autoAdvanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3a3000',
    backgroundColor: '#1a1600',
  },
  autoAdvanceButtonActive: { borderColor: '#E8001C', backgroundColor: '#1a0508' },
  // Neither state is "off" — loop and continuous are two active modes, so both stay legible.
  autoAdvanceGlyph: { color: '#FFD600', fontSize: 15 },
  autoAdvanceGlyphActive: { color: '#E8001C' },
  autoAdvanceLabel: { color: '#FFD600', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  autoAdvanceLabelActive: { color: '#E8001C' },
});
