import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { readSetting, writeSetting } from './repository';

const PREFER_ARTIST_COVER_KEY = 'prefer_artist_cover';

type SettingsContextValue = {
  /**
   * When true, a track with no cover of its own shows its artist's image instead of its album's.
   * Never overrides the track's own image. Shared by every screen and persisted across restarts.
   */
  preferArtistCover: boolean;
  togglePreferArtistCover: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const db = useSQLiteContext();
  const [preferArtistCover, setPreferArtistCover] = useState(false);

  useEffect(() => {
    readSetting(db, PREFER_ARTIST_COVER_KEY).then((value) => {
      if (value !== null) setPreferArtistCover(value === 'true');
    });
  }, [db]);

  const togglePreferArtistCover = useCallback(() => {
    setPreferArtistCover((current) => {
      const next = !current;
      // Fire-and-forget: the UI already reflects `next`, and a failed write only costs the setting
      // reverting on the next restart.
      writeSetting(db, PREFER_ARTIST_COVER_KEY, String(next));
      return next;
    });
  }, [db]);

  const value = useMemo<SettingsContextValue>(
    () => ({ preferArtistCover, togglePreferArtistCover }),
    [preferArtistCover, togglePreferArtistCover]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
