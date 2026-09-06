import { useCallback, useState } from 'react';

type UseEditModeResult = {
  isEditing: boolean;
  enter: () => void;
  exit: () => void;
};

/**
 * Shared "jiggle mode" state for grids that support long-press-to-delete (Artists now, Tracks/Albums/
 * Playlists later). A screen enters edit mode on long-press of any tile; every tile then jiggles and
 * shows a delete badge until the screen exits edit mode (tapping empty space, or after a delete).
 */
export function useEditMode(): UseEditModeResult {
  const [isEditing, setIsEditing] = useState(false);

  const enter = useCallback(() => setIsEditing(true), []);
  const exit = useCallback(() => setIsEditing(false), []);

  return { isEditing, enter, exit };
}
