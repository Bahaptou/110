import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';

type IconProps = { active: boolean };

const ACTIVE_COLOR = '#E8001C';
const INACTIVE_COLOR = '#555';

export function ArtistsTabIcon({ active }: IconProps): React.JSX.Element {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
  );
}

export function TracksTabIcon({ active }: IconProps): React.JSX.Element {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Rect x={3} y={3} width={7} height={7} />
      <Rect x={14} y={3} width={7} height={7} />
      <Rect x={3} y={14} width={7} height={7} />
      <Rect x={14} y={14} width={7} height={7} />
    </Svg>
  );
}

export function AlbumsTabIcon({ active }: IconProps): React.JSX.Element {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={3} />
      <Line x1={12} y1={3} x2={12} y2={9} />
    </Svg>
  );
}

export function PlaylistsTabIcon({ active }: IconProps): React.JSX.Element {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Line x1={4} y1={6} x2={20} y2={6} />
      <Line x1={4} y1={12} x2={16} y2={12} />
      <Line x1={4} y1={18} x2={12} y2={18} />
      <Polygon points="18,14 23,17 18,20" fill={color} stroke="none" />
    </Svg>
  );
}

/** White mic glyph for the raised record button — always drawn on a solid red circle, never inactive-gray. */
export function RecordTabIcon(): React.JSX.Element {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
      <Rect x={9} y={2} width={6} height={12} rx={3} fill="#fff" stroke="none" />
      <Path d="M5 11a7 7 0 0 0 14 0" />
      <Path d="M12 18v3" />
    </Svg>
  );
}
