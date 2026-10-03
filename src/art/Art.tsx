import React, { createContext, useContext, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

type Props = { id: string; size?: number; /** 0 a 1: o quanto a xícara está cheia. Sem valor, aparece cheia. */ fill?: number };

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
      <LinearGradient id={`${p}gMugC`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#9DB07A" />
        <Stop offset="0.5" stopColor="#6B7F4A" />
        <Stop offset="1" stopColor="#445530" />
      </LinearGradient>
      <LinearGradient id={`${p}gMugD`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#E0957A" />
        <Stop offset="0.5" stopColor="#BC5E3F" />
        <Stop offset="1" stopColor="#85391F" />
      </LinearGradient>
      <LinearGradient id={`${p}gMugE`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#4A4541" />
        <Stop offset="0.5" stopColor="#2A2623" />
        <Stop offset="1" stopColor="#151210" />
      </LinearGradient>
      <LinearGradient id={`${p}gEnamel`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.6" stopColor="#EEF1F0" />
        <Stop offset="1" stopColor="#C8CFCD" />
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

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Superfície do café na abertura da xícara. Sem `fill` (ou cheia), é o desenho de sempre.
 * Com `fill`, o café sobe: a elipse de café desliza de baixo para dentro da abertura e é recortada por ela.
 */
function Surface({ cx, cy, rx, ry, crx, cry, fill }: { cx: number; cy: number; rx: number; ry: number; crx: number; cry: number; fill?: number }) {
  const u = useU();
  const p = useContext(PrefixContext);
  if (fill === undefined || fill >= 1) {
    return (
      <>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u('gCof')} />
        <Ellipse cx={cx} cy={cy + 0.5} rx={crx} ry={cry} fill={u('gCrema')} opacity={0.8} />
      </>
    );
  }
  const f = clamp01(fill);
  const shift = (1 - f) * 2 * ry;
  return (
    <>
      <Defs>
        <ClipPath id={`${p}surf`}>
          <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </ClipPath>
      </Defs>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#E4D6C0" />
      <G clipPath={`url(#${p}surf)`}>
        <Ellipse cx={cx} cy={cy + shift} rx={rx} ry={ry} fill={u('gCof')} />
        <Ellipse cx={cx} cy={cy + shift + 0.5} rx={crx} ry={cry} fill={u('gCrema')} opacity={0.8 * clamp01((f - 0.6) / 0.4)} />
      </G>
    </>
  );
}

function Cup({ fill }: { fill?: number }) {
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
      <Surface cx={60} cy={51} rx={29} ry={7} crx={22} cry={4.6} fill={fill} />
      <Path d="M44 50c6-2 11-1 15 0" stroke="#fff" strokeWidth={1.5} opacity={0.35} {...line} />
    </>
  );
}

function StoicCup({ band, fill, plain, emblem }: { band: string; fill?: number; plain?: boolean; emblem?: boolean }) {
  const u = useU();
  const p = useContext(PrefixContext);
  return (
    <>
      <Defs>
        <ClipPath id={`${p}body`}>
          <Path d="M26 50H94C94 78 82 91 60 91C38 91 26 78 26 50Z" />
        </ClipPath>
      </Defs>
      <Ellipse cx={60} cy={100} rx={46} ry={8} fill={u('gShadow')} />
      <Path d="M82 58C101 54 103 80 83 82" stroke="#B9A78F" strokeWidth={9} {...line} />
      <Path d="M82 58C101 54 103 80 83 82" stroke={u('gPorc')} strokeWidth={6} {...line} />
      <Ellipse cx={60} cy={93} rx={44} ry={9} fill="#C9B9A2" />
      <Ellipse cx={60} cy={91} rx={44} ry={9} fill={u('gPorc')} />
      <Ellipse cx={60} cy={90} rx={30} ry={5.5} fill="#D9CBB6" opacity={0.7} />
      <Path d="M26 50H94C94 78 82 91 60 91C38 91 26 78 26 50Z" fill={u('gPorc')} />
      <G clipPath={`url(#${p}body)`}>
        <Rect x={20} y={61} width={80} height={9} fill={band} />
        <Rect x={20} y={61} width={80} height={9} fill={u('gPorc')} opacity={0.18} />
        {!plain && <Rect x={20} y={59.5} width={80} height={1.6} fill="#D7A040" />}
        {!plain && <Rect x={20} y={70} width={80} height={1.6} fill="#D7A040" />}
      </G>
      <Path d="M32 56C33 71 40 81 49 85" stroke="#fff" strokeWidth={3} opacity={0.55} {...line} />
      {emblem && <Path d="M44 76L54 62L60 70L68 58L78 76Z" fill="#F1F5F8" opacity={0.92} />}
      <Ellipse cx={60} cy={50} rx={34} ry={9} fill="#F7F0E5" stroke={plain ? '#CDBDA6' : '#D7A040'} strokeWidth={plain ? 1 : 1.4} />
      <Surface cx={60} cy={51} rx={29} ry={7} crx={22} cry={4.6} fill={fill} />
    </>
  );
}

function CampSpeckles() {
  return (
    <>
      {[[40, 56], [52, 66], [64, 52], [74, 70], [46, 82], [68, 88], [58, 76], [78, 58]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.1} fill="#2A3A4A" opacity={0.55} />
      ))}
    </>
  );
}

function Peak({ x }: { x: number }) {
  return <Path d={`M${40 + x} 88L${55 + x} 60L${63 + x} 74L${70 + x} 64L${80 + x} 88Z`} fill="#E8EEF2" opacity={0.9} />;
}

function Mug({ grad, rim, handle, fill, decor }: { grad: string; rim: string; handle: string; fill?: number; decor?: React.ReactNode }) {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={102} rx={40} ry={7} fill={u('gShadow')} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={handle} strokeWidth={9} {...line} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={u(grad)} strokeWidth={6} {...line} />
      <Path d="M30 40H86V90C86 97 80 100 72 100H44C36 100 30 97 30 90Z" fill={u(grad)} />
      {decor}
      <Rect x={36} y={48} width={5} height={44} rx={2.5} fill="#fff" opacity={0.3} />
      <Ellipse cx={58} cy={40} rx={28} ry={7} fill={rim} />
      <Surface cx={58} cy={41} rx={24} ry={5.2} crx={17} cry={3.2} fill={fill} />
    </>
  );
}

function Glass({ fill }: { fill?: number }) {
  const u = useU();
  const p = useContext(PrefixContext);
  const f = fill === undefined ? 1 : clamp01(fill);
  const top = 99 - 71 * f; // as camadas do latte aparecem de baixo para cima
  return (
    <>
      <Defs>
        <ClipPath id={`${p}lvl`}>
          <Rect x={30} y={top} width={56} height={100 - top} />
        </ClipPath>
      </Defs>
      <Ellipse cx={58} cy={102} rx={34} ry={6} fill={u('gShadow')} />
      <G clipPath={`url(#${p}lvl)`}>
        <Path d="M38.6 70H77.4L76.1 94Q76 98 72 98H44Q40 98 39.9 94Z" fill={u('gCofV')} />
        <Path d="M37.1 44H78.9L77.4 70H38.6Z" fill="#CFA070" />
        <Path d="M36.4 32H79.6L78.9 44H37.1Z" fill="#F4E7D1" />
        <Ellipse cx={58} cy={32} rx={21.6} ry={3.2} fill="#FBF3E4" />
      </G>
      <Path d="M36 28H80L76 94Q76 99 72 99H44Q40 99 40 94Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Ellipse cx={58} cy={28} rx={22} ry={3.4} fill="none" stroke="#A89886" strokeWidth={1.4} />
      <Path d="M41 36L44 88" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
    </>
  );
}

function Tiny({ fill }: { fill?: number }) {
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
      <Surface cx={60} cy={65} rx={22} ry={5.2} crx={16} cry={3.2} fill={fill} />
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

function Aeropress() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={36} ry={5} fill={u('gShadow')} />
      <Path d="M36 74H84L81.5 102Q81 106 76.5 106H43.5Q39 106 38.5 102Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M38 88H82L80.6 102Q80.2 104.6 76.5 104.6H43.5Q39.8 104.6 39.4 102Z" fill={u('gCofV')} />
      <Path d="M41 80L43 98" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Rect x={46} y={30} width={28} height={46} rx={2.5} fill="#5A544E" />
      <Rect x={50} y={34} width={4} height={38} rx={2} fill="#fff" opacity={0.2} />
      <Path d="M62 42H72M62 52H72M62 62H72" stroke="#fff" strokeWidth={1.2} opacity={0.45} />
      <Rect x={39} y={68} width={42} height={7} rx={2.5} fill="#3E3A36" />
      <Rect x={50} y={12} width={20} height={26} rx={2} fill="#8A8076" />
      <Rect x={44} y={7} width={32} height={7} rx={3} fill="#3E3A36" />
    </>
  );
}

function Melitta() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={38} ry={5} fill={u('gShadow')} />
      <Path d="M38 70Q36 70 36 74L40 102Q40.5 106 45 106H75Q79.5 106 80 102L84 74Q84 70 82 70Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M37.4 88H82.6L80 102Q79.5 104.5 75 104.5H45Q40.5 104.5 40 102Z" fill={u('gCofV')} />
      <Path d="M40 76L43 98" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Path d="M24 30H96L78 62H42Z" fill={u('gPorc')} stroke="#CDBDA6" strokeWidth={1} />
      <Path d="M36 36L48 60M50 35L55 60M70 35L65 60M84 36L72 60" stroke="#CDBDA6" strokeWidth={1.3} opacity={0.7} />
      <Rect x={44} y={62} width={32} height={9} rx={2} fill={u('gPorc')} stroke="#CDBDA6" strokeWidth={1} />
      <Ellipse cx={60} cy={30} rx={36} ry={6} fill="#F7F0E5" stroke="#CDBDA6" strokeWidth={1} />
      <Ellipse cx={60} cy={31} rx={30} ry={4.6} fill="#3B2212" />
      <Ellipse cx={60} cy={31} rx={22} ry={3} fill="#6A3E22" />
      <Path d="M24 33C12 33 12 49 25 49" stroke="#CDBDA6" strokeWidth={5} {...line} />
    </>
  );
}

function Siphon() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={108} rx={40} ry={5} fill={u('gShadow')} />
      <Rect x={90} y={10} width={5} height={96} rx={2} fill={u('gWood')} />
      <Rect x={32} y={102} width={66} height={6} rx={2.5} fill={u('gWood')} />
      <Rect x={74} y={30} width={18} height={4} rx={2} fill={u('gMetal')} />
      <Path d="M44 14H74V44Q74 52 66 52H52Q44 52 44 44Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M45.4 28H72.6V43.5Q72.6 50.6 66 50.6H52Q45.4 50.6 45.4 43.5Z" fill={u('gCofV')} />
      <Ellipse cx={59} cy={28} rx={13.6} ry={2.6} fill="#6A3E22" />
      <Rect x={56} y={50} width={6} height={22} fill={u('gGlass')} stroke="#A89886" strokeWidth={1.2} />
      <Circle cx={59} cy={84} r={21} fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M39 86H79A20 20 0 0 1 59 103A20 20 0 0 1 39 86Z" fill={u('gCofV')} />
      <Path d="M46 76C47 70 51 66 56 65" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Ellipse cx={59} cy={102} rx={9} ry={2.2} fill="#E9A23B" />
    </>
  );
}

function Turkish() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={106} rx={38} ry={5} fill={u('gShadow')} />
      <Path d="M84 62L112 44" stroke="#3A2515" strokeWidth={7} {...line} />
      <Path d="M84 62L112 44" stroke={u('gWood')} strokeWidth={4.5} {...line} />
      <Path d="M44 38H76L82 52H38Z" fill={u('gGold')} />
      <Path d="M44 38L33 33L40 46Z" fill={u('gGold')} />
      <Path d="M38 50H82L90 92Q91 103 80 103H40Q29 103 30 92Z" fill={u('gGold')} />
      <Path d="M36 58C34 72 36 86 42 96" stroke="#fff" strokeWidth={3} opacity={0.5} {...line} />
      <Rect x={34} y={68} width={52} height={4} fill="#8E5A14" opacity={0.45} />
      <Ellipse cx={60} cy={38} rx={16} ry={3.6} fill={u('gCofV')} />
      <Ellipse cx={60} cy={38.5} rx={11} ry={2.2} fill={u('gCrema')} opacity={0.8} />
      <Ellipse cx={60} cy={38} rx={16} ry={3.6} fill="none" stroke="#A26A1C" strokeWidth={1} />
    </>
  );
}

function Cloth() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={40} ry={5} fill={u('gShadow')} />
      <Rect x={94} y={14} width={6} height={94} rx={2} fill={u('gWood')} />
      <Rect x={26} y={104} width={76} height={5} rx={2} fill={u('gWood')} />
      <Rect x={48} y={16} width={50} height={6} rx={3} fill={u('gWood')} />
      <Path d="M32 24H68V28Q68 31 65 31H35Q32 31 32 28Z" fill="none" />
      <Ellipse cx={50} cy={30} rx={20} ry={4.4} fill="none" stroke={u('gWood')} strokeWidth={4} />
      <Path d="M31 30Q31 60 50 76Q69 60 69 30Z" fill="#EADFC8" stroke="#CDBDA6" strokeWidth={1} />
      <Path d="M36 50Q38 66 50 76Q62 66 64 50Q50 56 36 50Z" fill="#7A4A26" opacity={0.55} />
      <Path d="M36 38L46 66M50 38V68M64 38L54 66" stroke="#CDBDA6" strokeWidth={1} opacity={0.6} />
      <Ellipse cx={50} cy={30} rx={18} ry={3} fill="#3B2212" opacity={0.85} />
      <Circle cx={50} cy={82} r={1.8} fill="#4B2815" />
      <Path d="M32 90H68L66 104Q65.6 106 63 106H37Q34.4 106 34 104Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M33.6 98H66.4L65.4 104Q65.2 105 63 105H37Q34.8 105 34.6 104Z" fill={u('gCofV')} />
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

export function Art({ id, size = 96, fill }: Props) {
  let body: React.ReactNode;
  switch (id) {
    case 'cup': body = <Cup fill={fill} />; break;
    case 'stoic-ep': body = <StoicCup band="#3F5F4A" fill={fill} />; break;
    case 'stoic-sq': body = <StoicCup band="#7A2E3A" fill={fill} />; break;
    case 'stoic-ma': body = <StoicCup band="#2E4A6B" fill={fill} />; break;
    case 'mug': body = <Mug grad="gMugA" rim="#E7B67C" handle="#6B3F1A" fill={fill} />; break;
    case 'mugb': body = <Mug grad="gMugB" rim="#9BB8B8" handle="#243C3C" fill={fill} />; break;
    case 'mugg': body = <Mug grad="gMugC" rim="#B7C79A" handle="#33401F" fill={fill} />; break;
    case 'mugr': body = <Mug grad="gMugD" rim="#EBB099" handle="#6E2E16" fill={fill} />; break;
    case 'mugk': body = <Mug grad="gMugE" rim="#6C655F" handle="#0C0A09" fill={fill} />; break;
    case 'camp': body = <Mug grad="gEnamel" rim="#2F5D9B" handle="#2F5D9B" fill={fill} decor={<CampSpeckles />} />; break;
    case 'summit': body = <Mug grad="gMugE" rim="#6C655F" handle="#0C0A09" fill={fill} decor={<Peak x={0} />} />; break;
    case 'cupb': body = <StoicCup band="#2F5D9B" plain fill={fill} />; break;
    case 'cupg': body = <StoicCup band="#6B7A3A" plain fill={fill} />; break;
    case 'cupo': body = <StoicCup band="#C98A2B" plain fill={fill} />; break;
    case 'peak': body = <StoicCup band="#3B4A5A" plain fill={fill} emblem />; break;
    case 'glass': body = <Glass fill={fill} />; break;
    case 'tiny': body = <Tiny fill={fill} />; break;
    case 'v60': body = <Pourover />; break;
    case 'press': body = <Press />; break;
    case 'moka': body = <Moka />; break;
    case 'aeropress': body = <Aeropress />; break;
    case 'melitta': body = <Melitta />; break;
    case 'siphon': body = <Siphon />; break;
    case 'turkish': body = <Turkish />; break;
    case 'cloth': body = <Cloth />; break;
    case 'chemex': body = <Chemex />; break;
    default: body = <Cup fill={fill} />;
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
