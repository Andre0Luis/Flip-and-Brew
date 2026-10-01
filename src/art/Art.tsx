import React, { createContext, useContext, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

type Props = { id: string; size?: number };

// Cada instância de SVG recebe um prefixo próprio. Na web, ids repetidos fazem o navegador usar o gradiente
// de outro SVG (às vezes oculto) e a ilustração perde as cores.
const PrefixContext = createContext('');
function useU() {
  const p = useContext(PrefixContext);
  return (id: string) => `url(#${p}${id})`;
}

function Grads() {
  const p = useContext(PrefixContext);
  return (
    <Defs>
      <LinearGradient id={`${p}gPorc`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.45" stopColor="#F1E8DB" />
        <Stop offset="1" stopColor="#CDBDA6" />
      </LinearGradient>
      <LinearGradient id={`${p}gMugA`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#E0A465" />
        <Stop offset="0.5" stopColor="#B8782E" />
        <Stop offset="1" stopColor="#7C4A1F" />
      </LinearGradient>
      <LinearGradient id={`${p}gMugB`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#7FA0A0" />
        <Stop offset="0.5" stopColor="#4F7474" />
        <Stop offset="1" stopColor="#2F4B4B" />
      </LinearGradient>
      <LinearGradient id={`${p}gMetal`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#F4F1EC" />
        <Stop offset="0.3" stopColor="#C9C2B6" />
        <Stop offset="0.6" stopColor="#8F887C" />
        <Stop offset="0.85" stopColor="#C4BDB1" />
        <Stop offset="1" stopColor="#9A9387" />
      </LinearGradient>
      <LinearGradient id={`${p}gWood`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#A8703F" />
        <Stop offset="0.5" stopColor="#7A4A26" />
        <Stop offset="1" stopColor="#4E2E16" />
      </LinearGradient>
      <LinearGradient id={`${p}gGlass`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
        <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity={0.18} />
        <Stop offset="0.75" stopColor="#FFFFFF" stopOpacity={0.12} />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.55} />
      </LinearGradient>
      <LinearGradient id={`${p}gCofV`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#7A4527" />
        <Stop offset="0.5" stopColor="#4B2815" />
        <Stop offset="1" stopColor="#2C170C" />
      </LinearGradient>
      <LinearGradient id={`${p}gGold`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F6DC93" />
        <Stop offset="0.55" stopColor="#D7A040" />
        <Stop offset="1" stopColor="#A26A1C" />
      </LinearGradient>
      <RadialGradient id={`${p}gCof`} cx="0.4" cy="0.35" r="0.8">
        <Stop offset="0" stopColor="#8E5532" />
        <Stop offset="0.6" stopColor="#4E2A16" />
        <Stop offset="1" stopColor="#2B160B" />
      </RadialGradient>
      <RadialGradient id={`${p}gCrema`} cx="0.4" cy="0.4" r="0.7">
        <Stop offset="0" stopColor="#D9A56C" />
        <Stop offset="1" stopColor="#8F5A33" />
      </RadialGradient>
      <RadialGradient id={`${p}gShadow`} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#2B1A12" stopOpacity={0.38} />
        <Stop offset="1" stopColor="#2B1A12" stopOpacity={0} />
      </RadialGradient>
    </Defs>
  );
}

const line = { fill: 'none', strokeLinecap: 'round' as const };

function Cup() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={100} rx={46} ry={8} fill={u('gShadow')} />
      <Path d="M82 58C101 54 103 80 83 82" stroke="#B9A78F" strokeWidth={9} {...line} />
      <Path d="M82 58C101 54 103 80 83 82" stroke={u('gPorc')} strokeWidth={6} {...line} />
      <Ellipse cx={60} cy={93} rx={44} ry={9} fill="#C9B9A2" />
      <Ellipse cx={60} cy={91} rx={44} ry={9} fill={u('gPorc')} />
      <Ellipse cx={60} cy={90} rx={30} ry={5.5} fill="#D9CBB6" opacity={0.7} />
      <Path d="M26 50H94C94 78 82 91 60 91C38 91 26 78 26 50Z" fill={u('gPorc')} />
      <Path d="M32 58C33 71 40 81 49 85" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Ellipse cx={60} cy={50} rx={34} ry={9} fill="#F7F0E5" stroke="#CDBDA6" strokeWidth={1} />
      <Ellipse cx={60} cy={51} rx={29} ry={7} fill={u('gCof')} />
      <Ellipse cx={60} cy={51.5} rx={22} ry={4.6} fill={u('gCrema')} opacity={0.8} />
      <Path d="M44 50c6-2 11-1 15 0" stroke="#fff" strokeWidth={1.5} opacity={0.35} {...line} />
    </>
  );
}

function Mug({ grad, rim }: { grad: string; rim: string }) {
  const u = useU();
  const handleDark = grad === 'gMugA' ? '#6B3F1A' : '#243C3C';
  return (
    <>
      <Ellipse cx={58} cy={102} rx={40} ry={7} fill={u('gShadow')} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={handleDark} strokeWidth={9} {...line} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={u(grad)} strokeWidth={6} {...line} />
      <Path d="M30 40H86V90C86 97 80 100 72 100H44C36 100 30 97 30 90Z" fill={u(grad)} />
      <Rect x={36} y={48} width={5} height={44} rx={2.5} fill="#fff" opacity={0.3} />
      <Ellipse cx={58} cy={40} rx={28} ry={7} fill={rim} />
      <Ellipse cx={58} cy={41} rx={24} ry={5.2} fill={u('gCof')} />
      <Ellipse cx={58} cy={41.5} rx={17} ry={3.2} fill={u('gCrema')} opacity={0.75} />
    </>
  );
}

function Glass() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={102} rx={34} ry={6} fill={u('gShadow')} />
      <Path d="M38.6 70H77.4L76.1 94Q76 98 72 98H44Q40 98 39.9 94Z" fill={u('gCofV')} />
      <Path d="M37.1 44H78.9L77.4 70H38.6Z" fill="#CFA070" />
      <Path d="M36.4 32H79.6L78.9 44H37.1Z" fill="#F4E7D1" />
      <Ellipse cx={58} cy={32} rx={21.6} ry={3.2} fill="#FBF3E4" />
      <Path d="M36 28H80L76 94Q76 99 72 99H44Q40 99 40 94Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Ellipse cx={58} cy={28} rx={22} ry={3.4} fill="none" stroke="#A89886" strokeWidth={1.4} />
      <Path d="M41 36L44 88" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
    </>
  );
}

function Tiny() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={100} rx={38} ry={7} fill={u('gShadow')} />
      <Path d="M86 70C98 67 98 84 85 85" stroke="#B9A78F" strokeWidth={8} {...line} />
      <Path d="M86 70C98 67 98 84 85 85" stroke={u('gPorc')} strokeWidth={5} {...line} />
      <Ellipse cx={60} cy={94} rx={36} ry={7} fill="#C9B9A2" />
      <Ellipse cx={60} cy={92.5} rx={36} ry={7} fill={u('gPorc')} />
      <Path d="M34 64H86C86 82 76 93 60 93C44 93 34 82 34 64Z" fill={u('gPorc')} />
      <Ellipse cx={60} cy={64} rx={26} ry={7} fill="#F7F0E5" stroke="#CDBDA6" strokeWidth={1} />
      <Ellipse cx={60} cy={65} rx={22} ry={5.2} fill={u('gCof')} />
      <Ellipse cx={60} cy={65.5} rx={16} ry={3.2} fill={u('gCrema')} opacity={0.8} />
      <Path d="M40 72C41 80 46 86 51 88" stroke="#fff" strokeWidth={2.5} opacity={0.7} {...line} />
    </>
  );
}

function Pourover() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={106} rx={38} ry={6} fill={u('gShadow')} />
      <Path d="M38 64Q36 64 36 68L40 102Q40.5 106 45 106H75Q79.5 106 80 102L84 68Q84 64 82 64Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M37.4 82H82.6L80 102Q79.5 104.5 75 104.5H45Q40.5 104.5 40 102Z" fill={u('gCofV')} />
      <Path d="M40 70L43 98" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Path d="M26 30H94L72 64H48Z" fill={u('gMugA')} />
      <Path d="M40 34L52 62M52 33L58 62M68 33L62 62M80 34L68 62" stroke="#6B3F1A" strokeWidth={1.3} opacity={0.35} />
      <Rect x={46} y={62} width={28} height={4} rx={2} fill="#7C4A1F" />
      <Ellipse cx={60} cy={30} rx={34} ry={6} fill="#E9BE88" />
      <Ellipse cx={60} cy={31} rx={29.5} ry={4.5} fill="#3B2212" />
      <Ellipse cx={60} cy={31} rx={22} ry={3} fill="#6A3E22" />
      <Circle cx={60} cy={72} r={2} fill="#4B2815" />
      <Path d="M26 30L18 26" stroke="#B8782E" strokeWidth={4} {...line} />
    </>
  );
}

function Press() {
  const u = useU();
  return (
    <>
      <Ellipse cx={56} cy={108} rx={38} ry={6} fill={u('gShadow')} />
      <Path d="M78 46C100 44 100 88 78 90" stroke="#1F1612" strokeWidth={8} {...line} />
      <Rect x={54} y={8} width={5} height={26} rx={2} fill={u('gMetal')} />
      <Circle cx={56.5} cy={9} r={7} fill="#2A1D16" />
      <Circle cx={54} cy={7} r={2.2} fill="#fff" opacity={0.35} />
      <Path d="M34 36H78V98Q78 102 74 102H38Q34 102 34 98Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M35.5 60H76.5V98Q76.5 100.5 74 100.5H38Q35.5 100.5 35.5 98Z" fill={u('gCofV')} />
      <Rect x={35.5} y={56} width={41} height={5} rx={1.5} fill={u('gMetal')} />
      <Path d="M39 42V92" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Rect x={31} y={28} width={50} height={9} rx={3} fill={u('gMetal')} />
      <Rect x={31} y={95} width={50} height={11} rx={3} fill={u('gMetal')} />
    </>
  );
}

function Moka() {
  const u = useU();
  return (
    <>
      <Ellipse cx={56} cy={108} rx={34} ry={6} fill={u('gShadow')} />
      <Path d="M80 30H98Q106 30 106 38L103 58Q102 64 96 64H82V57H96L98 38H80Z" fill="#1F1612" />
      <Path d="M38 14H74L77 24H35Z" fill={u('gMetal')} />
      <Circle cx={56} cy={11} r={5} fill="#2A1D16" />
      <Circle cx={54.5} cy={9.5} r={1.6} fill="#fff" opacity={0.4} />
      <Path d="M37 24H75L83 58H29Z" fill={u('gMetal')} />
      <Path d="M37 24L33 58M47 24L45 58M56 24V58M65 24L67 58M75 24L79 58" stroke="#6F695F" strokeWidth={1} opacity={0.5} />
      <Path d="M37 24L28 20L35 29" fill={u('gMetal')} />
      <Rect x={29} y={57} width={54} height={7} rx={2} fill="#6F695F" />
      <Path d="M31 64H81L77 104H35Z" fill={u('gMetal')} />
      <Path d="M31 64L35 104M43 64L44 104M56 64V104M69 64L68 104M81 64L77 104" stroke="#6F695F" strokeWidth={1} opacity={0.5} />
      <Path d="M40 28L36 55" stroke="#fff" strokeWidth={3} opacity={0.6} {...line} />
      <Path d="M40 70L38 100" stroke="#fff" strokeWidth={3} opacity={0.5} {...line} />
    </>
  );
}

function Chemex() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={106} rx={38} ry={6} fill={u('gShadow')} />
      <Path d="M40.9 82H79.1L88.5 100H31.5Z" fill={u('gCofV')} />
      <Path d="M33 12H87L66 54V58L91 104H29L54 58V54Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M38 16H82L62 50H58Z" fill="#F7F0E1" opacity={0.92} />
      <Path d="M52 40H68L62 50H58Z" fill="#6A3E22" />
      <Path d="M40 20L56 56L38 98" stroke="#fff" strokeWidth={2.5} opacity={0.6} {...line} />
      <Path d="M48 50H72Q74 50 74 52V62Q74 64 72 64H48Q46 64 46 62V52Q46 50 48 50Z" fill={u('gWood')} />
      <Path d="M46 57H74" stroke="#2A1D16" strokeWidth={2} />
      <Path d="M52 52V62" stroke="#fff" strokeWidth={2} opacity={0.25} {...line} />
    </>
  );
}

export function Art({ id, size = 96 }: Props) {
  let body: React.ReactNode;
  switch (id) {
    case 'cup': body = <Cup />; break;
    case 'mug': body = <Mug grad="gMugA" rim="#E7B67C" />; break;
    case 'mugb': body = <Mug grad="gMugB" rim="#9BB8B8" />; break;
    case 'glass': body = <Glass />; break;
    case 'tiny': body = <Tiny />; break;
    case 'v60': body = <Pourover />; break;
    case 'press': body = <Press />; break;
    case 'moka': body = <Moka />; break;
    case 'chemex': body = <Chemex />; break;
    default: body = <Cup />;
  }
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <PrefixContext.Provider value={prefix}>
      <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityRole="image">
        <Grads />
        <G>{body}</G>
      </Svg>
    </PrefixContext.Provider>
  );
}

export function Coin({ size = 20 }: { size?: number }) {
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <PrefixContext.Provider value={prefix}>
      <CoinSvg size={size} />
    </PrefixContext.Provider>
  );
}

function CoinSvg({ size }: { size: number }) {
  const u = useU();
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityRole="image">
      <Grads />
      <Circle cx={48} cy={48} r={32} fill="#8A5A14" />
      <Circle cx={48} cy={46} r={32} fill={u('gGold')} />
      <Circle cx={48} cy={46} r={25} fill="none" stroke="#9B6416" strokeWidth={2} opacity={0.7} />
      <Path d="M41 33c-9 7-9 20 0 26M55 33c9 7 9 20 0 26M48 30v32" stroke="#8A5A14" strokeWidth={3.5} {...line} />
      <Path d="M26 36a26 26 0 0 1 14-12" stroke="#FFF3C9" strokeWidth={3} opacity={0.8} {...line} />
    </Svg>
  );
}

export { Grads, ClipPath };
