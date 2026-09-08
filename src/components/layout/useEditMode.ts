import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

type UseEditModeResult = {
  isEditing: boolean;
  enter: () => void;
  exit: () => void;
};

/**
 * Shared "jiggle mode" state for grids that support long-press-to-delete (Artists, Albums). A screen
 * enters edit mode on long-press of any tile; every tile then jiggles and shows a delete badge until
 * the screen exits edit mode (tapping empty space, scrolling, or after a delete).
 *
 * While editing, a back gesture or the hardware back button only leaves edit mode — the same as
 * tapping a tile — rather than navigating away, since exiting the mode is what the user means.
 */
export function useEditMode(): UseEditModeResult {
  const [isEditing, setIsEditing] = useState(false);

  const enter = useCallback(() => setIsEditing(true), []);
  const exit = useCallback(() => setIsEditing(false), []);

  useEffect(() => {
    if (!isEditing) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setIsEditing(false);
      return true;
    });
    return () => subscription.remove();
  }, [isEditing]);

  return { isEditing, enter, exit };
}
