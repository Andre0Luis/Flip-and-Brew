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
      <LinearGradient id={`${p}gGalaxy`} x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0" stopColor="#6A4CC8" />
        <Stop offset="0.5" stopColor="#2A1A5E" />
        <Stop offset="1" stopColor="#0B0620" />
      </LinearGradient>
      <LinearGradient id={`${p}gSaturn`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#F4C58A" />
        <Stop offset="0.5" stopColor="#D27A32" />
        <Stop offset="1" stopColor="#8A4418" />
      </LinearGradient>
      <LinearGradient id={`${p}gNebula`} x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0" stopColor="#E05AA8" />
        <Stop offset="0.55" stopColor="#6A3AA8" />
        <Stop offset="1" stopColor="#1E5A7A" />
      </LinearGradient>
      <LinearGradient id={`${p}gPalm`} x1="0" x2="1" y1="0" y2="0">
        <Stop offset="0" stopColor="#3FAE75" />
        <Stop offset="0.5" stopColor="#0A7A47" />
        <Stop offset="1" stopColor="#04512E" />
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

function StoicCup({ band, fill, plain, emblem }: { band: string; fill?: number; plain?: boolean; emblem?: 'peak' | 'moon' | 'star' | boolean }) {
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
      {(emblem === true || emblem === 'peak') && <Path d="M44 76L54 62L60 70L68 58L78 76Z" fill="#F1F5F8" opacity={0.92} />}
      {emblem === 'moon' && <Moon x={58} y={68} s={0.9} />}
      {emblem === 'star' && <Star x={60} y={68} s={0.95} />}
      <Ellipse cx={60} cy={50} rx={34} ry={9} fill="#F7F0E5" stroke={plain ? '#CDBDA6' : '#D7A040'} strokeWidth={plain ? 1 : 1.4} />
      <Surface cx={60} cy={51} rx={29} ry={7} crx={22} cry={4.6} fill={fill} />
    </>
  );
}

function Moon({ x = 60, y = 66, s = 1 }: { x?: number; y?: number; s?: number }) {
  return <Path d={`M${x} ${y - 10 * s}A${10 * s} ${10 * s} 0 1 0 ${x + 9 * s} ${y + 6 * s}A${8 * s} ${8 * s} 0 1 1 ${x} ${y - 10 * s}Z`} fill="#F4E7C1" opacity={0.95} />;
}

function Star({ x = 60, y = 66, s = 1 }: { x?: number; y?: number; s?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = (i % 2 === 0 ? 9 : 4) * s;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
  });
  return <Path d={`M${pts.join('L')}Z`} fill="#F4E7C1" opacity={0.95} />;
}

const STARS: [number, number, number][] = [[38, 52, 1.2], [48, 78, 0.9], [56, 58, 1], [66, 84, 1.3], [74, 54, 0.9], [80, 72, 1.1], [44, 92, 0.8], [62, 70, 0.8], [70, 94, 0.9]];
function Stars({ n = 9 }: { n?: number }) {
  return (
    <>
      {STARS.slice(0, n).map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#F4F0FF" opacity={0.9} />
      ))}
    </>
  );
}

function GalaxyDecor() {
  return (
    <>
      <Path d="M58 70C72 58 84 72 68 82C54 90 40 74 54 63" stroke="#D8CCFF" strokeWidth={2} opacity={0.65} {...line} />
      <Ellipse cx={58} cy={70} rx={4} ry={3} fill="#F4F0FF" opacity={0.9} />
      <Stars />
    </>
  );
}

function SaturnDecor() {
  return (
    <>
      <Path d="M30 78C46 66 72 64 86 70" stroke="#FBE9C7" strokeWidth={5} fill="none" opacity={0.85} />
      <Path d="M30 79C46 67 72 65 86 71" stroke="#8A4418" strokeWidth={1.2} fill="none" opacity={0.6} />
      <Path d="M30 54H86M30 90H86" stroke="#FBE9C7" strokeWidth={1.4} opacity={0.35} />
    </>
  );
}

function EclipseDecor() {
  return (
    <>
      <Circle cx={58} cy={70} r={20} fill="#F4E7C1" opacity={0.18} />
      <Circle cx={58} cy={70} r={15} fill="#F4E7C1" opacity={0.35} />
      <Circle cx={58} cy={70} r={12} fill="#0B0910" stroke="#F6E9C9" strokeWidth={1.6} />
      <Stars n={5} />
    </>
  );
}

function NebulaDecor() {
  return (
    <>
      <Circle cx={50} cy={64} r={14} fill="#FFB3DD" opacity={0.28} />
      <Circle cx={70} cy={80} r={16} fill="#7FD6E8" opacity={0.25} />
      <Stars />
    </>
  );
}

/** Faixas horizontais para canecas de time: cada cor ocupa um intervalo de altura. */
function HBands({ bands }: { bands: [string, number, number][] }) {
  return (
    <>
      {bands.map(([color, y, h], i) => (
        <Rect key={i} x={28} y={y} width={60} height={h} fill={color} />
      ))}
    </>
  );
}

function VStripes({ color, top = 40, bottom = 102 }: { color: string; top?: number; bottom?: number }) {
  return (
    <>
      {[34, 50, 66, 82].map((x) => (
        <Rect key={x} x={x} y={top} width={8} height={bottom - top} fill={color} />
      ))}
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
  const p = useContext(PrefixContext);
  return (
    <>
      <Defs>
        <ClipPath id={`${p}mugclip`}>
          <Path d="M30 40H86V90C86 97 80 100 72 100H44C36 100 30 97 30 90Z" />
        </ClipPath>
      </Defs>
      <Ellipse cx={58} cy={102} rx={40} ry={7} fill={u('gShadow')} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={handle} strokeWidth={9} {...line} />
      <Path d="M86 52C108 50 108 84 86 84" stroke={u(grad)} strokeWidth={6} {...line} />
      <Path d="M30 40H86V90C86 97 80 100 72 100H44C36 100 30 97 30 90Z" fill={u(grad)} />
      {decor && <G clipPath={`url(#${p}mugclip)`}>{decor}</G>}
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

/** Copo de vidro reto, como o copo americano. `band` desenha uma faixa; `gold` põe um fio dourado no aro. */
function Americano({ fill, band, gold, small }: { fill?: number; band?: string; gold?: boolean; small?: boolean }) {
  const u = useU();
  const p = useContext(PrefixContext);
  const f = fill === undefined ? 1 : clamp01(fill);
  const top = small ? 60 : 44;
  const bottom = small ? 100 : 101;
  const level = bottom - (bottom - top - 6) * f;
  const w = small ? 14 : 22;
  const body = `M${58 - w - 2} ${top}H${58 + w + 2}L${58 + w - 3} ${bottom - 3}Q${58 + w - 3.5} ${bottom} ${58 + w - 7} ${bottom}H${58 - w + 7}Q${58 - w + 3.5} ${bottom} ${58 - w + 3} ${bottom - 3}Z`;
  return (
    <>
      <Defs>
        <ClipPath id={`${p}glvl`}>
          <Rect x={20} y={level} width={80} height={bottom - level + 1} />
        </ClipPath>
        <ClipPath id={`${p}gbody`}>
          <Path d={body} />
        </ClipPath>
      </Defs>
      <Ellipse cx={58} cy={bottom + 3} rx={w + 12} ry={5} fill={u('gShadow')} />
      <G clipPath={`url(#${p}gbody)`}>
        <G clipPath={`url(#${p}glvl)`}>
          <Rect x={20} y={top} width={80} height={bottom - top} fill={u('gCofV')} />
          <Rect x={20} y={level} width={80} height={3} fill="#8A5A36" opacity={0.7} />
        </G>
        {band && <Rect x={20} y={top + (bottom - top) * 0.38} width={80} height={9} fill={band} opacity={0.92} />}
      </G>
      <Path d={body} fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Ellipse cx={58} cy={top} rx={w + 2} ry={3.4} fill="none" stroke={gold ? '#D7A040' : '#A89886'} strokeWidth={gold ? 2 : 1.4} />
      <Path d={`M${58 - w + 3} ${top + 8}L${58 - w + 6} ${bottom - 12}`} stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
    </>
  );
}

/** Caneca de vidro com alça (estilo café irlandês) ou xícara de parede dupla. */
function GlassMug({ fill, double }: { fill?: number; double?: boolean }) {
  const u = useU();
  const p = useContext(PrefixContext);
  const f = fill === undefined ? 1 : clamp01(fill);
  const top = 40;
  const bottom = 99;
  const level = bottom - (bottom - top - 5) * f;
  const body = 'M32 40H84L81 93Q80.5 99 75 99H41Q35.5 99 35 93Z';
  return (
    <>
      <Defs>
        <ClipPath id={`${p}mlvl`}>
          <Rect x={20} y={level} width={80} height={bottom - level + 1} />
        </ClipPath>
        <ClipPath id={`${p}mbody`}>
          <Path d={body} />
        </ClipPath>
      </Defs>
      <Ellipse cx={58} cy={103} rx={34} ry={5} fill={u('gShadow')} />
      <Path d="M82 50C102 48 102 82 80 82" stroke="#A89886" strokeWidth={6} {...line} />
      <Path d="M82 50C102 48 102 82 80 82" stroke={u('gGlass')} strokeWidth={4} {...line} />
      <G clipPath={`url(#${p}mbody)`}>
        <G clipPath={`url(#${p}mlvl)`}>
          <Rect x={20} y={top} width={80} height={bottom - top} fill={u('gCofV')} />
          <Rect x={20} y={level} width={80} height={3} fill="#E9D3B5" opacity={0.85} />
        </G>
      </G>
      <Path d={body} fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      {double && <Path d="M38 46H78L76 90Q75.6 94 72 94H44Q40.4 94 40 90Z" fill="none" stroke="#A89886" strokeWidth={1} opacity={0.8} />}
      <Ellipse cx={58} cy={40} rx={26} ry={3.4} fill="none" stroke="#A89886" strokeWidth={1.4} />
      <Path d="M39 48L41 86" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
    </>
  );
}

function Bowl({ fill }: { fill?: number }) {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={102} rx={42} ry={6} fill={u('gShadow')} />
      <Path d="M18 62C10 62 10 76 22 76" stroke="#B9A78F" strokeWidth={7} {...line} />
      <Path d="M102 62C110 62 110 76 98 76" stroke="#B9A78F" strokeWidth={7} {...line} />
      <Path d="M18 56H102C102 84 86 98 60 98C34 98 18 84 18 56Z" fill={u('gPorc')} />
      <Path d="M26 64C28 78 38 88 48 91" stroke="#fff" strokeWidth={3} opacity={0.7} {...line} />
      <Ellipse cx={60} cy={56} rx={42} ry={10} fill="#F7F0E5" stroke="#CDBDA6" strokeWidth={1} />
      <Surface cx={60} cy={57} rx={36} ry={7.6} crx={28} cry={5} fill={fill} />
    </>
  );
}

function PaperCup() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={104} rx={30} ry={5} fill={u('gShadow')} />
      <Path d="M36 38H80L74 100Q73.6 103 70 103H46Q42.4 103 42 100Z" fill="#F4EDE0" />
      <Path d="M38.4 62H77.6L75.2 86H40.8Z" fill="#7A4A26" />
      <Path d="M43 66L45 82" stroke="#fff" strokeWidth={2.4} opacity={0.35} {...line} />
      <Rect x={32} y={30} width={52} height={9} rx={4} fill="#3A2A22" />
      <Rect x={40} y={26} width={36} height={6} rx={3} fill="#4A362B" />
    </>
  );
}

function Tumbler() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={106} rx={28} ry={5} fill={u('gShadow')} />
      <Path d="M40 36H76L73 98Q72.6 104 67 104H49Q43.4 104 43 98Z" fill={u('gMetal')} />
      <Rect x={44} y={58} width={28} height={16} rx={2} fill="#2A1D16" opacity={0.85} />
      <Path d="M44 42L46 94" stroke="#fff" strokeWidth={2.6} opacity={0.55} {...line} />
      <Rect x={37} y={26} width={42} height={12} rx={5} fill="#2A1D16" />
      <Rect x={50} y={20} width={16} height={7} rx={3} fill="#3A2A22" />
    </>
  );
}

function Capsule() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={38} ry={5} fill={u('gShadow')} />
      <Rect x={74} y={20} width={16} height={60} rx={6} fill="#8FB4C8" opacity={0.85} />
      <Rect x={30} y={14} width={50} height={72} rx={10} fill="#2A2523" />
      <Rect x={36} y={22} width={38} height={12} rx={4} fill="#4A423E" />
      <Circle cx={62} cy={28} r={3} fill="#E9A23B" />
      <Rect x={42} y={46} width={26} height={10} rx={3} fill="#6A5F58" />
      <Rect x={50} y={56} width={10} height={9} rx={1} fill="#1A1614" />
      <Path d="M55 65V80" stroke="#7A4527" strokeWidth={2.4} />
      <Rect x={26} y={86} width={58} height={8} rx={3} fill="#3A3330" />
      <Path d="M43 80H67L65 91Q64.6 93 62 93H48Q45.4 93 45 91Z" fill={u('gPorc')} />
      <Ellipse cx={55} cy={80.6} rx={11} ry={2} fill="#4B2815" />
      <Rect x={26} y={94} width={58} height={12} rx={3} fill="#1F1B19" />
    </>
  );
}

function EspressoMachine() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={110} rx={44} ry={5} fill={u('gShadow')} />
      <Rect x={14} y={20} width={92} height={62} rx={7} fill={u('gMetal')} />
      <Rect x={14} y={14} width={92} height={10} rx={4} fill="#3A3330" />
      <Circle cx={36} cy={38} r={8} fill="#2A2523" stroke="#C9C2B6" strokeWidth={2} />
      <Path d="M36 38L40 33" stroke="#E9A23B" strokeWidth={1.6} />
      <Circle cx={60} cy={38} r={5} fill="#3A3330" />
      <Circle cx={80} cy={38} r={5} fill="#3A3330" />
      <Rect x={44} y={50} width={32} height={9} rx={3} fill="#2A2523" />
      <Rect x={52} y={59} width={16} height={6} rx={2} fill="#1A1614" />
      <Path d="M76 55L98 55" stroke="#2A1D16" strokeWidth={5} {...line} />
      <Path d="M60 65V78" stroke="#7A4527" strokeWidth={2.4} />
      <Rect x={14} y={82} width={92} height={7} rx={3} fill="#3A3330" />
      <Path d="M48 88H72L70 102Q69.6 105 66 105H54Q50.4 105 50 102Z" fill={u('gPorc')} />
      <Ellipse cx={60} cy={88.6} rx={12} ry={2.2} fill="#4B2815" />
    </>
  );
}

function DripMaker() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={110} rx={42} ry={5} fill={u('gShadow')} />
      <Rect x={74} y={12} width={22} height={90} rx={5} fill="#2A2523" />
      <Rect x={20} y={12} width={62} height={20} rx={6} fill="#2A2523" />
      <Path d="M30 32H66L60 46H36Z" fill={u('gWood')} />
      <Rect x={20} y={96} width={76} height={10} rx={4} fill="#1F1B19" />
      <Path d="M28 56H68L66 94Q65.6 97 62 97H34Q30.4 97 30 94Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M29.4 72H66.6L65.4 94Q65 96 62 96H34Q31 96 30.6 94Z" fill={u('gCofV')} />
      <Path d="M68 62C80 60 80 80 67 80" stroke="#2A2523" strokeWidth={5} {...line} />
      <Rect x={44} y={46} width={4} height={8} fill="#7A4527" />
      <Circle cx={88} cy={24} r={3} fill="#E9A23B" />
    </>
  );
}

function ColdBrew() {
  const u = useU();
  return (
    <>
      <Ellipse cx={58} cy={108} rx={36} ry={5} fill={u('gShadow')} />
      <Path d="M36 30H80V100Q80 104 76 104H40Q36 104 36 100Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M37.4 52H78.6V100Q78.6 102.6 76 102.6H40Q37.4 102.6 37.4 100Z" fill={u('gCofV')} />
      <Circle cx={50} cy={62} r={2} fill="#fff" opacity={0.4} />
      <Circle cx={64} cy={78} r={2.6} fill="#fff" opacity={0.3} />
      <Circle cx={56} cy={90} r={1.6} fill="#fff" opacity={0.4} />
      <Rect x={74} y={96} width={14} height={4} rx={1.5} fill={u('gMetal')} />
      <Rect x={32} y={22} width={52} height={10} rx={3} fill="#3A3330" />
      <Path d="M42 36L44 96" stroke="#fff" strokeWidth={3} opacity={0.6} {...line} />
      <Path d="M44 100L40 106M72 100L76 106" stroke="#B8E0F0" strokeWidth={2} opacity={0.0} />
    </>
  );
}

function Phin() {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={36} ry={5} fill={u('gShadow')} />
      <Path d="M32 66H88L84 100Q83.6 104 79 104H41Q36.4 104 36 100Z" fill={u('gGlass')} stroke="#A89886" strokeWidth={1.4} />
      <Path d="M34 90H86L84 100Q83.6 102.6 79 102.6H41Q36.4 102.6 36 100Z" fill={u('gCofV')} />
      <Circle cx={60} cy={76} r={1.8} fill="#4B2815" />
      <Path d="M60 78V88" stroke="#4B2815" strokeWidth={1.4} />
      <Rect x={22} y={60} width={76} height={6} rx={2} fill={u('gMetal')} />
      <Path d="M30 60H90L84 40H36Z" fill={u('gMetal')} />
      <Rect x={34} y={32} width={52} height={8} rx={3} fill={u('gMetal')} />
      <Rect x={54} y={22} width={12} height={10} rx={3} fill="#8F887C" />
    </>
  );
}

/** Pacote de café. A cor e os pontinhos mostram a categoria: quanto mais pontos, melhor o café. */
function BeanBag({ body, label, accent, tier, seal }: { body: string; label: string; accent: string; tier: number; seal?: boolean }) {
  const u = useU();
  return (
    <>
      <Ellipse cx={60} cy={108} rx={34} ry={5} fill={u('gShadow')} />
      <Path d="M34 28H86L90 100Q90.4 105 85 105H35Q29.6 105 30 100Z" fill={body} />
      <Path d="M34 28H86L87 36H33Z" fill={accent} opacity={0.9} />
      <Path d="M34 28L38 24L42 28L46 24L50 28L54 24L58 28L62 24L66 28L70 24L74 28L78 24L82 28L86 28" stroke={accent} strokeWidth={2.2} fill="none" />
      <Rect x={40} y={46} width={40} height={44} rx={4} fill={label} />
      <Ellipse cx={60} cy={62} rx={8} ry={11} fill="#4B2815" transform="rotate(25 60 62)" />
      <Path d="M56 52Q62 62 64 72" stroke={label} strokeWidth={1.6} fill="none" />
      {seal && <Circle cx={80} cy={50} r={8} fill="#D7A040" />}
      {seal && <Star x={80} y={50} s={0.9} />}
      {Array.from({ length: tier }, (_, i) => (
        <Circle key={i} cx={60 + (i - (tier - 1) / 2) * 7} cy={84} r={2.2} fill={accent} />
      ))}
      <Path d="M36 40L39 98" stroke="#fff" strokeWidth={2.6} opacity={0.22} {...line} />
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
    case 'peak': body = <StoicCup band="#3B4A5A" plain fill={fill} emblem="peak" />; break;
    case 'americano': body = <Americano fill={fill} />; break;
    case 'irish': body = <GlassMug fill={fill} />; break;
    case 'double': body = <Americano fill={fill} small gold />; break;
    case 'bowl': body = <Bowl fill={fill} />; break;
    case 'paper': body = <PaperCup />; break;
    case 'travel': body = <Tumbler />; break;
    case 'night-moon': body = <StoicCup band="#1E2A4A" plain fill={fill} emblem="moon" />; break;
    case 'night-star': body = <Mug grad="gMugE" rim="#3B4A6B" handle="#0C0A09" fill={fill} decor={<Star x={58} y={70} s={1.2} />} />; break;
    case 'night-comet': body = <Americano fill={fill} band="#1E2A4A" />; break;
    case 'bot-americano': body = <Americano fill={fill} band="#B3262B" />; break;
    case 'bot-xicara': body = <StoicCup band="#B3262B" plain fill={fill} />; break;
    case 'bot-esmaltada': body = <Mug grad="gEnamel" rim="#B3262B" handle="#B3262B" fill={fill} decor={<CampSpeckles />} />; break;
    case 'gold-cup': body = <StoicCup band="#C99A2E" fill={fill} />; break;
    case 'gold-mug': body = <Mug grad="gGold" rim="#F6DC93" handle="#A26A1C" fill={fill} />; break;
    case 'gold-glass': body = <Americano fill={fill} gold band="#D7A040" />; break;
    case 'pack-extraforte': body = <BeanBag body="#7A1F1A" label="#F1E4CF" accent="#E9A23B" tier={1} />; break;
    case 'pack-tradicional': body = <BeanBag body="#8A5A36" label="#F1E4CF" accent="#F3D9B0" tier={2} />; break;
    case 'pack-superior': body = <BeanBag body="#3F6B4F" label="#F1E4CF" accent="#CFE3C8" tier={3} />; break;
    case 'pack-gourmet': body = <BeanBag body="#1E1815" label="#EFE2C8" accent="#D7A040" tier={4} />; break;
    case 'pack-especial': body = <BeanBag body="#F1E4CF" label="#FFFFFF" accent="#C99A2E" tier={5} seal />; break;
    case 'uni-galaxy': body = <Mug grad="gGalaxy" rim="#8E78E6" handle="#1A0F40" fill={fill} decor={<GalaxyDecor />} />; break;
    case 'uni-saturn': body = <Mug grad="gSaturn" rim="#F8D9AA" handle="#7A3A12" fill={fill} decor={<SaturnDecor />} />; break;
    case 'uni-eclipse': body = <Mug grad="gMugE" rim="#6C655F" handle="#0C0A09" fill={fill} decor={<EclipseDecor />} />; break;
    case 'uni-nebula': body = <Mug grad="gNebula" rim="#F2A6D2" handle="#2A1A5E" fill={fill} decor={<NebulaDecor />} />; break;
    case 'club-cor': body = <Mug grad="gMugE" rim="#FFFFFF" handle="#111111" fill={fill} decor={<HBands bands={[['#FFFFFF', 60, 10], ['#FFFFFF', 76, 3]]} />} />; break;
    case 'club-spfc': body = <Mug grad="gEnamel" rim="#D2232A" handle="#D2232A" fill={fill} decor={<HBands bands={[['#D2232A', 40, 20], ['#111111', 76, 26]]} />} />; break;
    case 'club-pal': body = <Mug grad="gPalm" rim="#FFFFFF" handle="#04512E" fill={fill} decor={<HBands bands={[['#FFFFFF', 66, 4]]} />} />; break;
    case 'club-san': body = <Mug grad="gEnamel" rim="#111111" handle="#111111" fill={fill} decor={<HBands bands={[['#111111', 62, 8], ['#111111', 74, 3]]} />} />; break;
    case 'club-fla': body = <Mug grad="gMugE" rim="#D2232A" handle="#D2232A" fill={fill} decor={<HBands bands={[['#D2232A', 46, 10], ['#D2232A', 66, 10], ['#D2232A', 86, 12]]} />} />; break;
    case 'club-xv': body = <Mug grad="gMugE" rim="#FFFFFF" handle="#111111" fill={fill} decor={<VStripes color="#FFFFFF" />} />; break;
    case 'capsule': body = <Capsule />; break;
    case 'espresso': body = <EspressoMachine />; break;
    case 'drip': body = <DripMaker />; break;
    case 'coldbrew': body = <ColdBrew />; break;
    case 'phin': body = <Phin />; break;
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
